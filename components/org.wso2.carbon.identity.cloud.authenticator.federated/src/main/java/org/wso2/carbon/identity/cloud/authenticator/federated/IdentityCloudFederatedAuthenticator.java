/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.identity.cloud.authenticator.federated;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.base.MultitenantConstants;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.identity.application.authentication.framework.AbstractApplicationAuthenticator;
import org.wso2.carbon.identity.application.authentication.framework.FederatedApplicationAuthenticator;
import org.wso2.carbon.identity.application.authentication.framework.config.ConfigurationFacade;
import org.wso2.carbon.identity.application.authentication.framework.context.AuthenticationContext;
import org.wso2.carbon.identity.application.authentication.framework.exception.AuthenticationFailedException;
import org.wso2.carbon.identity.application.authentication.framework.exception.InvalidCredentialsException;
import org.wso2.carbon.identity.application.authentication.framework.model.AuthenticatedUser;
import org.wso2.carbon.identity.application.authentication.framework.util.FrameworkUtils;
import org.wso2.carbon.identity.application.authenticator.basicauth.BasicAuthenticatorConstants;
import org.wso2.carbon.identity.application.common.model.ClaimMapping;
import org.wso2.carbon.identity.application.common.model.User;
import org.wso2.carbon.identity.base.IdentityRuntimeException;
import org.wso2.carbon.identity.cloud.authenticator.federated.internal.IdentityCloudAuthenticatorServiceComponent;
import org.wso2.carbon.identity.core.model.IdentityErrorMsgContext;
import org.wso2.carbon.identity.core.util.IdentityCoreConstants;
import org.wso2.carbon.identity.core.util.IdentityTenantUtil;
import org.wso2.carbon.identity.core.util.IdentityUtil;
import org.wso2.carbon.user.api.UserRealm;
import org.wso2.carbon.user.core.UserCoreConstants;
import org.wso2.carbon.user.core.UserStoreException;
import org.wso2.carbon.user.core.UserStoreManager;
import org.wso2.carbon.user.core.claim.Claim;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Username Password based custom authenticator for cloud user portal.
 */
public class IdentityCloudFederatedAuthenticator extends AbstractApplicationAuthenticator implements
        FederatedApplicationAuthenticator {

    private static final long serialVersionUID = 3029547239918021790L;
    private static final Log log = LogFactory.getLog(IdentityCloudFederatedAuthenticator.class);

    protected void initiateAuthenticationRequest(HttpServletRequest request, HttpServletResponse response,
                                                 AuthenticationContext context) throws AuthenticationFailedException {

        String tenantDomain = context.getTenantDomain();
        if (StringUtils.isNotBlank(tenantDomain) && !MultitenantConstants.SUPER_TENANT_DOMAIN_NAME.equals
                (tenantDomain)) {
            String queryParams = context.getContextIdIncludedQueryParams();
            if (StringUtils.isNotBlank(queryParams)) {
                context.setContextIdIncludedQueryParams(queryParams.concat(IdentityCloudFederatedAuthenticatorConstants
                        .TENANT_DOMAIN_PARAM + tenantDomain));
            }
        }

        Map<String, String> parameterMap = getAuthenticatorConfig().getParameterMap();
        String showAuthFailureReason = null;
        if (parameterMap != null) {
            showAuthFailureReason = parameterMap.get("showAuthFailureReason");
            if (log.isDebugEnabled()) {
                log.debug("showAuthFailureReason has been set as : " + showAuthFailureReason);
            }
        }

        String loginPage = ConfigurationFacade.getInstance().getAuthenticationEndpointURL();
        String retryPage = ConfigurationFacade.getInstance().getAuthenticationEndpointRetryURL();
        String queryParams = context.getContextIdIncludedQueryParams();

        try {
            String retryParam = "";

            if (context.isRetrying()) {
                retryParam = "&authFailure=true&authFailureMsg=login.fail.message";
            }

            if (context.getProperty("UserTenantDomainMismatch") != null &&
                    (Boolean) context.getProperty("UserTenantDomainMismatch")) {
                retryParam = "&authFailure=true&authFailureMsg=user.tenant.domain.mismatch.message";
                context.setProperty("UserTenantDomainMismatch", false);
            }

            IdentityErrorMsgContext errorContext = IdentityUtil.getIdentityErrorMsg();
            IdentityUtil.clearIdentityErrorMsg();

            if (showAuthFailureReason != null && "true".equals(showAuthFailureReason)) {
                if (errorContext != null) {
                    if (log.isDebugEnabled()) {
                        log.debug("Identity error message context is not null");
                    }

                    String errorCode = errorContext.getErrorCode();
                    int remainingAttempts = errorContext.getMaximumLoginAttempts() - errorContext
                            .getFailedLoginAttempts();

                    if (log.isDebugEnabled()) {
                        log.debug("errorCode : " + errorCode);
                        log.debug("username : " + request.getParameter(BasicAuthenticatorConstants.USER_NAME));
                        log.debug("remainingAttempts : " + remainingAttempts);
                    }

                    if (errorCode.equals(UserCoreConstants.ErrorCode.INVALID_CREDENTIAL)) {
                        retryParam = retryParam + BasicAuthenticatorConstants.ERROR_CODE + errorCode
                                + BasicAuthenticatorConstants.FAILED_USERNAME + URLEncoder.encode(request
                                .getParameter(BasicAuthenticatorConstants.USER_NAME), BasicAuthenticatorConstants.UTF_8)
                                + "&remainingAttempts=" + remainingAttempts;
                        response.sendRedirect(loginPage + ("?" + queryParams) + BasicAuthenticatorConstants
                                .AUTHENTICATORS + getName() + ":" + BasicAuthenticatorConstants.LOCAL + retryParam);
                    } else if (errorCode.equals(UserCoreConstants.ErrorCode.USER_IS_LOCKED)) {
                        String redirectURL = retryPage;
                        if (remainingAttempts == 0) {
                            redirectURL = redirectURL + ("?" + queryParams) + BasicAuthenticatorConstants.ERROR_CODE
                                    + errorCode + BasicAuthenticatorConstants.FAILED_USERNAME +
                                    URLEncoder.encode(request.getParameter(BasicAuthenticatorConstants.USER_NAME),
                                            BasicAuthenticatorConstants.UTF_8) +
                                    "&remainingAttempts=0";
                        } else {
                            redirectURL = redirectURL + ("?" + queryParams) + BasicAuthenticatorConstants.ERROR_CODE
                                    + errorCode + BasicAuthenticatorConstants.FAILED_USERNAME +
                                    URLEncoder.encode(request.getParameter(BasicAuthenticatorConstants.USER_NAME),
                                            BasicAuthenticatorConstants.UTF_8);
                        }
                        response.sendRedirect(redirectURL);

                    } else if (errorCode.equals(UserCoreConstants.ErrorCode.USER_DOES_NOT_EXIST)) {
                        retryParam = retryParam + BasicAuthenticatorConstants.ERROR_CODE + errorCode
                                + BasicAuthenticatorConstants.FAILED_USERNAME + URLEncoder.encode(request
                                .getParameter(BasicAuthenticatorConstants.USER_NAME), BasicAuthenticatorConstants
                                .UTF_8);
                        response.sendRedirect(loginPage + ("?" + queryParams) + BasicAuthenticatorConstants
                                .AUTHENTICATORS + getName() + ":" + BasicAuthenticatorConstants.LOCAL + retryParam);
                    } else if (errorCode.equals(IdentityCoreConstants.USER_ACCOUNT_DISABLED_ERROR_CODE)) {
                        retryParam = retryParam + BasicAuthenticatorConstants.ERROR_CODE + errorCode
                                + BasicAuthenticatorConstants.FAILED_USERNAME + URLEncoder.encode(request
                                .getParameter(BasicAuthenticatorConstants.USER_NAME), BasicAuthenticatorConstants
                                .UTF_8);
                        response.sendRedirect(loginPage + ("?" + queryParams) + BasicAuthenticatorConstants
                                .AUTHENTICATORS + getName() + ":" + BasicAuthenticatorConstants.LOCAL + retryParam);
                    }
                } else {
                    response.sendRedirect(loginPage + ("?" + queryParams) + BasicAuthenticatorConstants
                            .AUTHENTICATORS + getName() + ":" + BasicAuthenticatorConstants.LOCAL + retryParam);
                }
            } else {
                String errorCode = errorContext != null ? errorContext.getErrorCode() : null;
                if (errorCode != null && errorCode.equals(UserCoreConstants.ErrorCode.USER_IS_LOCKED)) {
                    String redirectURL = retryPage;
                    redirectURL = redirectURL + ("?" + queryParams) + BasicAuthenticatorConstants.FAILED_USERNAME +
                            URLEncoder.encode(request.getParameter( BasicAuthenticatorConstants.USER_NAME),
                                    BasicAuthenticatorConstants.UTF_8);
                    response.sendRedirect(redirectURL);

                } else {
                    response.sendRedirect(loginPage + ("?" + queryParams) + BasicAuthenticatorConstants
                            .AUTHENTICATORS + getName() + ":" + BasicAuthenticatorConstants.LOCAL + retryParam);
                }
            }


        } catch (IOException e) {
            throw new AuthenticationFailedException(e.getMessage(), e);
        }
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
                    isAuthenticated = userStoreManager.authenticate(UserCoreConstants
                            .PRIMARY_DEFAULT_DOMAIN_NAME + UserCoreConstants.DOMAIN_SEPARATOR + tenantAwareUsername,
                            password);
                }
            } else {
                throw new AuthenticationFailedException("Cannot find the user realm for the given tenant: " +
                        tenantId, User.getUserFromUserName(username));
            }
        } catch (IdentityRuntimeException e) {
            if (log.isDebugEnabled()) {
                log.debug("FederatedAuthentication failed while trying to get the tenant ID of the user " + username, e);
            }
            throw new AuthenticationFailedException(e.getMessage(), User.getUserFromUserName(username), e);
        } catch (org.wso2.carbon.user.api.UserStoreException e) {
            if (log.isDebugEnabled()) {
                log.debug("FederatedAuthentication failed while trying to authenticate", e);
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
            authProperties = new HashMap<>();
            context.setProperties(authProperties);
        }

        //TODO: user tenant domain has to be an attribute in the AuthenticationContext
        authProperties.put("user-tenant-domain", tenantDomain);

        username = FrameworkUtils.prependUserStoreDomainToName(username);

        context.setSubject(AuthenticatedUser.createLocalAuthenticatedUserFromSubjectIdentifier(username));

        String tenantAwareUsername = MultitenantUtils.getTenantAwareUsername(username);
        try {
            int tenantId = IdentityTenantUtil.getTenantIdOfUser(username);
            PrivilegedCarbonContext.startTenantFlow();
            PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantId(tenantId, true);
            Claim[] userClaimValues = userStoreManager.getUserClaimValues(tenantAwareUsername, "default");
            Map<ClaimMapping, String> claims = new HashMap<>();
            for (Claim userClaim : userClaimValues) {
                claims.put(ClaimMapping.build(userClaim.getClaimUri(), userClaim.getClaimUri(), null,
                        false), userClaim.getValue());
                if (log.isDebugEnabled()) {
                    log.debug("retrieving claims for user : " + username + " claim uri : " + userClaim.getClaimUri());
                }
            }
            context.getSubject().setUserAttributes(claims);
        } catch (UserStoreException e) {
            log.warn("Error while retrieving claims for user : " + username);
            if (log.isDebugEnabled()){
                log.debug("Error while retrieving claims for user : " + username, e);
            }
        } finally {
            PrivilegedCarbonContext.endTenantFlow();
        }
    }

    @Override
    public String getFriendlyName() {
        return IdentityCloudFederatedAuthenticatorConstants.AUTHENTICATOR_FRIENDLY_NAME;
    }

    @Override
    public boolean canHandle(HttpServletRequest httpServletRequest) {
        String userName = httpServletRequest.getParameter(BasicAuthenticatorConstants.USER_NAME);
        String password = httpServletRequest.getParameter(BasicAuthenticatorConstants.PASSWORD);
        if (userName != null && password != null) {
            return true;
        }
        return false;
    }

    @Override
    public String getContextIdentifier(HttpServletRequest httpServletRequest) {
        return null;
    }

    @Override
    public String getName() {
        return IdentityCloudFederatedAuthenticatorConstants.AUTHENTICATOR_NAME;
    }

    @Override
    protected boolean retryAuthenticationEnabled() {
        return true;
    }
}