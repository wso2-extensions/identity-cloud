/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.carbon.identity.cloud.authenticator.local;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.base.MultitenantConstants;
import org.wso2.carbon.identity.application.authentication.framework.context.AuthenticationContext;
import org.wso2.carbon.identity.application.authentication.framework.exception.AuthenticationFailedException;
import org.wso2.carbon.identity.application.authentication.framework.exception.InvalidCredentialsException;
import org.wso2.carbon.identity.application.authentication.framework.model.AuthenticatedUser;
import org.wso2.carbon.identity.application.authentication.framework.util.FrameworkUtils;
import org.wso2.carbon.identity.application.authenticator.basicauth.BasicAuthenticator;
import org.wso2.carbon.identity.application.authenticator.basicauth.BasicAuthenticatorConstants;
import org.wso2.carbon.identity.application.common.model.User;
import org.wso2.carbon.identity.base.IdentityRuntimeException;
import org.wso2.carbon.identity.cloud.authenticator.local.internal.IdentityCloudAuthenticatorServiceComponent;
import org.wso2.carbon.identity.core.util.IdentityTenantUtil;
import org.wso2.carbon.user.api.UserRealm;
import org.wso2.carbon.user.core.UserStoreException;
import org.wso2.carbon.user.core.UserStoreManager;
import org.wso2.carbon.user.core.util.UserCoreUtil;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Username Password based custom authenticator for cloud user portal.
 */
public class IdentityCloudBasicAuthenticator extends BasicAuthenticator {

    private static final long serialVersionUID = 4345354156955223654L;
    private static final Log log = LogFactory.getLog(IdentityCloudBasicAuthenticator.class);

    private static String getConvertedUsername(String username) {
        return username.replace(IdentityCloudBasicAuthenticatorConstants.AT_CHARACTER,
                IdentityCloudBasicAuthenticatorConstants.AT_REPLACE_CHARACTER);
    }

    private static String getFullQualifiedUsername(String tenantAwareUsername, String tenantDomain) {
        return tenantAwareUsername + IdentityCloudBasicAuthenticatorConstants.AT_CHARACTER + tenantDomain;
    }

    protected void initiateAuthenticationRequest(HttpServletRequest request, HttpServletResponse response,
                                                 AuthenticationContext context) throws AuthenticationFailedException {

        String tenantDomain = context.getTenantDomain();
        if (StringUtils.isNotBlank(tenantDomain) && !MultitenantConstants.SUPER_TENANT_DOMAIN_NAME.equals
                (tenantDomain)) {
            String queryParams = context.getContextIdIncludedQueryParams();
            if (StringUtils.isNotBlank(queryParams)) {
                context.setContextIdIncludedQueryParams(queryParams.concat(IdentityCloudBasicAuthenticatorConstants
                        .TENANT_DOMAIN_PARAM + tenantDomain));
            }
        }

        super.initiateAuthenticationRequest(request, response, context);
    }

    @Override
    protected void processAuthenticationResponse(HttpServletRequest request, HttpServletResponse response,
                                                 AuthenticationContext context) throws AuthenticationFailedException {

        String username = request.getParameter(BasicAuthenticatorConstants.USER_NAME);
        String password = request.getParameter(BasicAuthenticatorConstants.PASSWORD);

        boolean isAuthenticated = false;
        UserStoreManager userStoreManager;
        // Check the authentication
        try {
            int tenantId = IdentityTenantUtil.getTenantIdOfUser(username);
            UserRealm userRealm = IdentityCloudAuthenticatorServiceComponent.getRealmService().getTenantUserRealm
                    (tenantId);
            if (userRealm != null) {
                String tenantAwareUsername = MultitenantUtils.getTenantAwareUsername(username);
                userStoreManager = (UserStoreManager) userRealm.getUserStoreManager();
                UserStoreManager secondaryUserStoreManager = userStoreManager.getSecondaryUserStoreManager();
                if (secondaryUserStoreManager != null) {
                    // If tenant has configured a secondary user store, first authenticate user from it.
                    isAuthenticated = secondaryUserStoreManager.authenticate(tenantAwareUsername, password);
                }

                if (!isAuthenticated) {
                    // If user is not authenticated from secondary user store, then authenticate starting from primary
                    // user store.
                    // In primary email username is kept converting '@' characters with '.' character.
                    // Therefore, reconstruct username with the conversion.
                    tenantAwareUsername = getConvertedUsername(tenantAwareUsername);
                    username = getFullQualifiedUsername(tenantAwareUsername, MultitenantUtils.getTenantDomain
                            (username));
                    isAuthenticated = userStoreManager.authenticate(tenantAwareUsername, password);
                }
            } else {
                throw new AuthenticationFailedException("Cannot find the user realm for the given tenant: " +
                        tenantId, User.getUserFromUserName(username));
            }
        } catch (IdentityRuntimeException e) {
            if (log.isDebugEnabled()) {
                log.debug("BasicAuthentication failed while trying to get the tenant ID of the user " + username, e);
            }
            throw new AuthenticationFailedException(e.getMessage(), User.getUserFromUserName(username), e);
        } catch (org.wso2.carbon.user.api.UserStoreException e) {
            if (log.isDebugEnabled()) {
                log.debug("BasicAuthentication failed while trying to authenticate", e);
            }
            throw new AuthenticationFailedException(e.getMessage(), User.getUserFromUserName(username), e);
        }

        if (!isAuthenticated) {
            if (log.isDebugEnabled()) {
                log.debug("User authentication failed due to invalid credentials");
            }

            throw new InvalidCredentialsException("User authentication failed due to invalid credentials", User
                    .getUserFromUserName(username));
        }

        Map<String, Object> authProperties = context.getProperties();
        String tenantDomain = MultitenantUtils.getTenantDomain(username);

        if (authProperties == null) {
            authProperties = new HashMap<String, Object>();
            context.setProperties(authProperties);
        }

        //TODO: user tenant domain has to be an attribute in the AuthenticationContext
        authProperties.put("user-tenant-domain", tenantDomain);

        username = FrameworkUtils.prependUserStoreDomainToName(username);

        if (getAuthenticatorConfig().getParameterMap() != null) {
            String userNameUri = getAuthenticatorConfig().getParameterMap().get("UserNameAttributeClaimUri");
            if (userNameUri != null && userNameUri.trim().length() > 0) {
                boolean multipleAttributeEnable;
                String domain = UserCoreUtil.getDomainFromThreadLocal();
                if (domain != null && domain.trim().length() > 0) {
                    multipleAttributeEnable = Boolean.parseBoolean(userStoreManager.getSecondaryUserStoreManager
                            (domain).
                            getRealmConfiguration().getUserStoreProperty("MultipleAttributeEnable"));
                } else {
                    multipleAttributeEnable = Boolean.parseBoolean(userStoreManager.
                            getRealmConfiguration().getUserStoreProperty("MultipleAttributeEnable"));
                }
                if (multipleAttributeEnable) {
                    try {
                        if (log.isDebugEnabled()) {
                            log.debug("Searching for UserNameAttribute value for user " + username + " for claim uri " +
                                    ": " + userNameUri);
                        }
                        String usernameValue = userStoreManager.
                                getUserClaimValue(MultitenantUtils.getTenantAwareUsername(username), userNameUri, null);
                        if (usernameValue != null && usernameValue.trim().length() > 0) {
                            tenantDomain = MultitenantUtils.getTenantDomain(username);
                            usernameValue = FrameworkUtils.prependUserStoreDomainToName(usernameValue);
                            username = usernameValue + "@" + tenantDomain;
                            if (log.isDebugEnabled()) {
                                log.debug("UserNameAttribute is found for user. Value is :  " + username);
                            }
                        }
                    } catch (UserStoreException e) {
                        //ignore  but log in debug
                        if (log.isDebugEnabled()) {
                            log.debug("Error while retrieving UserNameAttribute for user : " + username, e);
                        }
                    }
                } else {
                    if (log.isDebugEnabled()) {
                        log.debug("MultipleAttribute is not enabled for user store domain : " + domain + " " +
                                "Therefore UserNameAttribute is not retrieved");
                    }
                }
            }
        }
        context.setSubject(AuthenticatedUser.createLocalAuthenticatedUserFromSubjectIdentifier(username));
        String rememberMe = request.getParameter("chkRemember");

        if (rememberMe != null && "on".equals(rememberMe)) {
            context.setRememberMe(true);
        }
    }

    @Override
    public String getFriendlyName() {
        return IdentityCloudBasicAuthenticatorConstants.AUTHENTICATOR_FRIENDLY_NAME;
    }

    @Override
    public String getName() {
        return IdentityCloudBasicAuthenticatorConstants.AUTHENTICATOR_NAME;
    }
}