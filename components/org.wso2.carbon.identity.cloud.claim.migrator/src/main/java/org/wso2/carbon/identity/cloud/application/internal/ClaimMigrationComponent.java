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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


package org.wso2.carbon.identity.cloud.application.internal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.identity.application.mgt.listener.ApplicationMgtListener;
import org.wso2.carbon.identity.cloud.application.listener.ClaimMigrationListener;

/**
* @scr.component name="identity.cloud.claim.migration.component" immediate="true"
*/
public class ClaimMigrationComponent {


    private static final Log log = LogFactory.getLog(ClaimMigrationComponent.class);
    private static BundleContext bundleContext;

    protected void activate(ComponentContext context) {

        try {
            bundleContext = context.getBundleContext();
            bundleContext.registerService(ApplicationMgtListener.class.getName(), new ClaimMigrationListener(), null);
            if (log.isDebugEnabled()) {
                log.info("ClaimMigrationComponent bundle is activated");
            }
        } catch (Throwable e) {
            log.error("ClaimMigrationComponent bundle activation Failed", e);
        }
    }

    protected void deactivate(ComponentContext context) {

        if (log.isDebugEnabled()) {
            log.info("ClaimMigrationComponent bundle is deactivated");
        }
    }
}
