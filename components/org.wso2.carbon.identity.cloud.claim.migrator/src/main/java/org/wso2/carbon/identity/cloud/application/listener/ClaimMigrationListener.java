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

package org.wso2.carbon.identity.cloud.application.listener;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.claim.mgt.ClaimManagementException;
import org.wso2.carbon.claim.mgt.ClaimManagerHandler;
import org.wso2.carbon.identity.application.common.IdentityApplicationManagementException;
import org.wso2.carbon.identity.application.common.model.ServiceProvider;
import org.wso2.carbon.identity.application.mgt.listener.AbstractApplicationMgtListener;
import org.wso2.carbon.user.api.Claim;
import org.wso2.carbon.user.api.ClaimMapping;

import java.util.ArrayList;
import java.util.List;

/**
 * Creates the needed claims for well known app types in already created tenants.
 * Newly created tenants will always have these claims since the claims are configured in repository/conf/claim-config.xml.
 */
public class ClaimMigrationListener extends AbstractApplicationMgtListener {

    private static final Log log = LogFactory.getLog(ClaimMigrationListener.class);
    public static final String WSO2_CLAIM_DIALECT_URI = "http://wso2.org/claims";

    @Override
    public int getDefaultOrderId() {
        return 0;
    }

    @Override
    public boolean doPreCreateApplication(ServiceProvider serviceProvider, String tenantDomain, String userName)
            throws IdentityApplicationManagementException {
        addCustomClaimsForWellKnownServiceProviders(serviceProvider);
        return true;
    }

    private void addCustomClaimsForWellKnownServiceProviders(ServiceProvider serviceProvider) {

        ClaimManagerHandler handler = ClaimManagerHandler.getInstance();
        List<ClaimMapping> claimMappings = getClaimMappings(serviceProvider);

        if(claimMappings != null){
            for(ClaimMapping claimMapping : claimMappings){
                try {
                    // Create the claim if it doesn't exist.
                    if(handler.getClaimMapping(claimMapping.getClaim().getClaimUri()) == null){
                        handler.addNewClaimMapping(claimMapping);
                    }
                } catch (ClaimManagementException e) {
                    log.error(String.format("Something went wrong while trying to add '%s' claim. The claim might " +
                            "not have been added.", claimMapping.getClaim().getClaimUri()), e);
                }
            }
        }
    }

    private List<ClaimMapping> getClaimMappings(ServiceProvider serviceProvider) {

        if("AWS]".equalsIgnoreCase(serviceProvider.getDescription())){
            return getAWSClaimMappings();
        }else if("NetSuite]".equalsIgnoreCase(serviceProvider.getDescription())){
            return getNetSuiteClaimMappings();
        }

        return null;
    }

    private List<ClaimMapping> getAWSClaimMappings(){

        List<ClaimMapping> awsClaimMappings = new ArrayList<ClaimMapping>();

        Claim awsRoleClaim = new Claim();
        awsRoleClaim.setDisplayTag("AWS SSO Role");
        awsRoleClaim.setClaimUri("http://wso2.org/claims/awsrole");
        awsRoleClaim.setDialectURI(WSO2_CLAIM_DIALECT_URI);
        awsRoleClaim.setDescription("Read about AWS SAML SSO and \"https://aws.amazon.com/SAML/Attributes/Role\" " +
                "attribute for more details.");
        awsRoleClaim.setDisplayOrder(0);
        awsRoleClaim.setSupportedByDefault(false);
        awsRoleClaim.setRequired(false);
        awsRoleClaim.setReadOnly(false);

        ClaimMapping awsRoleClaimMapping = new ClaimMapping();
        awsRoleClaimMapping.setClaim(awsRoleClaim);
        awsRoleClaimMapping.setMappedAttribute("nickName");

        awsClaimMappings.add(awsRoleClaimMapping);

        return awsClaimMappings;
    }

    private List<ClaimMapping> getNetSuiteClaimMappings(){

        List<ClaimMapping> netSuiteClaimMappings = new ArrayList<ClaimMapping>();

        Claim accountClaim = new Claim();
        accountClaim.setDisplayTag("NetSuite Account ID");
        accountClaim.setClaimUri("http://wso2.org/claims/netsuiteaccount");
        accountClaim.setDialectURI(WSO2_CLAIM_DIALECT_URI);
        accountClaim.setDescription("ID of the NetSuite account.");
        accountClaim.setDisplayOrder(0);
        accountClaim.setSupportedByDefault(false);
        accountClaim.setRequired(false);
        accountClaim.setReadOnly(false);

        ClaimMapping accountClaimMapping = new ClaimMapping();
        accountClaimMapping.setClaim(accountClaim);
        accountClaimMapping.setMappedAttribute("displayName");

        netSuiteClaimMappings.add(accountClaimMapping);

        return netSuiteClaimMappings;
    }
}
