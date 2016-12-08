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

package org.wso2.carbon.identity.cloud.listener.claim.onprem.cache;

import org.wso2.carbon.identity.application.common.cache.BaseCache;

/**
 * Cache for caching domain name with a single reference.
 */
public class ClaimDomainCache extends BaseCache<ClaimDomainCacheKey, ClaimDomainCacheEntry> {

    private static final String SESSION_DATA_CACHE_NAME = "WSClaimAttributeCache";

    private static volatile ClaimDomainCache instance;

    private ClaimDomainCache() {
        super(SESSION_DATA_CACHE_NAME);
    }

    public static ClaimDomainCache getInstance() {
        if (instance == null) {
            synchronized (ClaimDomainCache.class) {
                if (instance == null) {
                    instance = new ClaimDomainCache();
                }
            }
        }
        return instance;
    }
}
