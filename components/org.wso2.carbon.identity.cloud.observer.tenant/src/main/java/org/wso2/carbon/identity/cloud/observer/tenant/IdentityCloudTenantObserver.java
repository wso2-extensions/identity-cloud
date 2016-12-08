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
package org.wso2.carbon.identity.cloud.observer.tenant;

import org.apache.axis2.context.ConfigurationContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.identity.cloud.observer.tenant.internal.IdentityCloudTenantObserverServiceComponent;
import org.wso2.carbon.identity.oauth2.util.OAuth2Util;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.utils.AbstractAxis2ConfigurationContextObserver;

/**
 * Initialize missing resources for tenants.
 */
public class IdentityCloudTenantObserver extends AbstractAxis2ConfigurationContextObserver {

    public static final String SCOPE_RESOURCE_PATH = "/oidc";
    private static final Log log = LogFactory.getLog(IdentityCloudTenantObserver.class);

    @Override
    public void createdConfigurationContext(ConfigurationContext configContext) {

        int tenantId = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId();
        initOIDCScopes(tenantId);
    }

    private void initOIDCScopes(int tenantId) {

        try {
            Registry registry = IdentityCloudTenantObserverServiceComponent.getRegistryService()
                    .getConfigSystemRegistry(tenantId);

            if (!registry.resourceExists(SCOPE_RESOURCE_PATH)) {
                OAuth2Util.initiateOIDCScopes(tenantId);
            }
        } catch (RegistryException e) {
            log.error("Error while verifying registry collection for " + SCOPE_RESOURCE_PATH, e);
        }
    }
}
