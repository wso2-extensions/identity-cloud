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

package org.wso2.carbon.identity.cloud.web.jaggery.filters;

public class SessionFilterConstants {

    public static final String SESSION_ATTRIBUTE_NAME_USER = "user";
    public static final String LOGIN_PAGE_URL = "/login.jag";

    public static class URLWhiteList {
        public static final String LOGIN_PAGE = "/login.jag";
        public static final String ERROR_PAGE = "/error";
        public static final String ACS_PAGE = "/acs";
        public static final String SAML_REQUEST_PAGE = "/samlsso.jag";
    }
}
