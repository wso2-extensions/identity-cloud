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

package org.wso2.carbon.identity.cloud.observer.tenant.internal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.identity.cloud.observer.tenant.IdentityCloudTenantObserver;
import org.wso2.carbon.registry.core.service.RegistryService;
import org.wso2.carbon.utils.Axis2ConfigurationContextObserver;

/**
 * Identity Cloud Tenant Observer Component
 *
 * @scr.component name="org,wso2.carbon.identity.cloud.observer.tenant.component" immediate="true"
 * @scr.reference name="registry.service"
 * interface="org.wso2.carbon.registry.core.service.RegistryService" cardinality="1..1"
 * policy="dynamic" bind="setRegistryService" unbind="unsetRegistryService"
 **/
public class IdentityCloudTenantObserverServiceComponent {

    private static final Log log = LogFactory.getLog(IdentityCloudTenantObserverServiceComponent.class);

    private static RegistryService registryService;

    protected void activate(ComponentContext componentContext) {

        try {
            if (log.isDebugEnabled()) {
                log.debug("IdentityCloudTenantObserver component activated");
            }
            BundleContext bundleContext = componentContext.getBundleContext();

            //Register Tenant service creator to deploy tenant specific common synapse configurations
            IdentityCloudTenantObserver listener = new IdentityCloudTenantObserver();
            bundleContext.registerService(Axis2ConfigurationContextObserver.class.getName(), listener, null);
        } catch (Throwable e) {
            log.error("IdentityCloudTenantObserver bundle activation Failed", e);
        }
    }

    protected void deactivate(ComponentContext componentContext) {

        if (log.isDebugEnabled()) {
            log.debug("Deactivating IdentityCloudTenantObserver component");
        }
    }

    protected void setRegistryService(RegistryService registryService) {

        if (log.isDebugEnabled()) {
            log.debug("Setting the Registry Service");
        }
        IdentityCloudTenantObserverServiceComponent.registryService = registryService;
    }

    protected void unsetRegistryService(RegistryService registryService) {

        if (log.isDebugEnabled()) {
            log.debug("UnSetting the Registry Service");
        }
        IdentityCloudTenantObserverServiceComponent.registryService = null;
    }

    public static RegistryService getRegistryService() {
        return registryService;
    }
}
