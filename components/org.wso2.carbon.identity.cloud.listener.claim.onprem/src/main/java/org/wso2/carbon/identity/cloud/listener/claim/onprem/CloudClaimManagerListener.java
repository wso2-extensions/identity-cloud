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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.identity.cloud.listener.claim.onprem;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethodBase;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.core.util.KeyStoreManager;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.cache.ClaimDomainCache;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.cache.ClaimDomainCacheEntry;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.cache.ClaimDomainCacheKey;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.exception.ClaimManagerListenerException;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.internal.ClaimListenerComponentHolder;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.security.DefaultJWTGenerator;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.security.SecurityTokenBuilder;
import org.wso2.carbon.identity.cloud.listener.claim.onprem.util.EndpointUtil;
import org.wso2.carbon.identity.core.util.IdentityTenantUtil;
import org.wso2.carbon.user.api.ClaimManager;
import org.wso2.carbon.user.api.ClaimMapping;
import org.wso2.carbon.user.api.RealmConfiguration;
import org.wso2.carbon.user.api.UserStoreException;
import org.wso2.carbon.user.core.UserStoreManager;
import org.wso2.carbon.user.core.common.AbstractClaimManagerListener;
import org.wso2.carbon.utils.multitenancy.MultitenantConstants;

import java.io.IOException;
import java.security.Key;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


/**
 * Custom claim manager listener for secondary userstores.
 */
public class CloudClaimManagerListener extends AbstractClaimManagerListener {
    private static Log log = LogFactory.getLog(CloudClaimManagerListener.class);
    private int tenantId;
    private static final String ENDPOINT = "EndPointURL";
    private HttpClient httpClient;
    private static Map<Integer, Key> privateKeys = new ConcurrentHashMap<>();
    private ClaimManager claimManager;
    private UserStoreManager secondaryUserStoreManager;

    @Override
    public boolean getAttributeName(String domainName, String claimURI)
            throws org.wso2.carbon.user.core.UserStoreException {
        ClaimDomainCacheEntry cacheEntry = getClaimAttributeFromCache(domainName);

        if (cacheEntry == null) {
            try {
                tenantId = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId();
                secondaryUserStoreManager =  ((UserStoreManager) (ClaimListenerComponentHolder.getInstance()
                        .getRealmService().getTenantUserRealm(tenantId).getUserStoreManager()))
                        .getSecondaryUserStoreManager();

                if (secondaryUserStoreManager != null) {
                    claimManager = secondaryUserStoreManager.getClaimManager();
                    ClaimMapping[] claimMappings = claimManager.getAllClaimMappings();
                    GetMethod getMethod = new GetMethod(EndpointUtil.getClaimAttributeRetrievalEndpoint(getHostName()));

                    if (this.httpClient == null) {
                        this.httpClient = new HttpClient();
                    }

                    setAuthorizationHeader(getMethod);
                    int response = httpClient.executeMethod(getMethod);
                    if (response == HttpStatus.SC_OK) {
                        String respStr = new String(getMethod.getResponseBody());
                        JSONObject resultObj = new JSONObject(respStr);
                        for (ClaimMapping claimMapping :
                                claimMappings) {
                            String uri = claimMapping.getClaim().getClaimUri();
                            try {
                                String attribute = (String) resultObj.get(uri);
                                if (attribute != null && !attribute.isEmpty()) {
                                    addClaimAttributeToCache(domainName, attribute);
                                    updatePersistenceClaimMapping(domainName, claimMapping, attribute);
                                }
                            } catch (JSONException e) {
                                if (log.isDebugEnabled()) {
                                    log.debug("Claim mapping of " + uri +
                                            " not found for secondary userstore of tenant " + tenantId);
                                }
                            }
                        }
                    }
                }

            } catch (IOException | JSONException | ClaimManagerListenerException | UserStoreException e) {
                throw new org.wso2.carbon.user.core.UserStoreException(
                        "Error occurred while calling backed to claim attribute " +
                                "retrieval for tenantId - [" + this.tenantId + "]");
            }
        }

        return true;
    }

    private void updatePersistenceClaimMapping(
            String domainName, ClaimMapping claimMapping, String attribute)
            throws org.wso2.carbon.user.api.UserStoreException {

        if (attribute != claimMapping.getMappedAttribute(domainName)) {
            claimMapping.getMappedAttributes().put(domainName, attribute);
            claimManager.updateClaimMapping(claimMapping);
        }
    }


    private ClaimDomainCacheEntry getClaimAttributeFromCache(String claimURI) {

        ClaimDomainCacheKey cacheKey = new ClaimDomainCacheKey(claimURI);
        return ClaimDomainCache.getInstance().getValueFromCache(cacheKey);
    }

    private String getHostName() throws ClaimManagerListenerException {
        RealmConfiguration realmConfig = secondaryUserStoreManager.getRealmConfiguration();
        return realmConfig.getUserStoreProperty(ENDPOINT);
    }

    protected void setAuthorizationHeader(HttpMethodBase request) throws ClaimManagerListenerException {

        String token;
        SecurityTokenBuilder securityTokenBuilder = new DefaultJWTGenerator();
        token = securityTokenBuilder.buildSecurityToken(getTenantPrivateKey(tenantId));
        request.addRequestHeader("Authorization", "Bearer " + token);
    }

    private void addClaimAttributeToCache(String claimURI, String attributeID) {

        ClaimDomainCacheKey cacheKey = new ClaimDomainCacheKey(claimURI);
        ClaimDomainCacheEntry cacheEntry = new ClaimDomainCacheEntry();
        cacheEntry.setDomainReference(attributeID);
        ClaimDomainCache.getInstance().addToCache(cacheKey, cacheEntry);
    }

    private Key getTenantPrivateKey(int tenantId) throws ClaimManagerListenerException {

        Key privateKey;
        String tenantDomain = IdentityTenantUtil.getTenantDomain(tenantId);

        if (!(privateKeys.containsKey(tenantId))) {
            KeyStoreManager tenantKSM = KeyStoreManager.getInstance(tenantId);

            if (!tenantDomain.equals(MultitenantConstants.SUPER_TENANT_DOMAIN_NAME)) {
                String ksName = tenantDomain.trim().replace(".", "-");
                String jksName = ksName + ".jks";
                privateKey = tenantKSM.getPrivateKey(jksName, tenantDomain);

            } else {
                try {
                    privateKey = tenantKSM.getDefaultPrivateKey();
                } catch (Exception e) {
                    throw new ClaimManagerListenerException("Error while obtaining private key for super tenant", e);
                }
            }
            privateKeys.put(tenantId, privateKey);
        } else {
            privateKey = privateKeys.get(tenantId);
        }
        return privateKey;
    }
}
