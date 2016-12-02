/*
*  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
package org.wso2.carbon.identity.user.store.jdbc.sample;

public final class JDBCQueryConstants {

    public final static String USER_AUTHENTICATE_QUERY = "SELECT * FROM UM_SAMPLE_USERS WHERE UM_USERNAME=? AND " +
            "UM_PASSWORD=? AND UM_TENANTID=?";
    public final static String USER_EXIT_CHECK_QUERY = "SELECT UM_USERNAME FROM UM_SAMPLE_USERS WHERE UM_USERNAME=? " +
            "AND UM_TENANTID=?";
    public final static String USER_LIST_QUERY = "SELECT * FROM UM_SAMPLE_USERS WHERE UM_TENANTID=?";

    public final static String USER_INSERT_QUERY = "INSERT INTO UM_SAMPLE_USERS (UM_USERNAME,UM_PASSWORD,UM_TENANTID) " +
            "VALUES (?,?,?)";
    public final static String GET_USER_ATTRIBUTES_QUERY = "SELECT * FROM UM_SAMPLE_USERS WHERE UM_USERNAME = ? AND " +
            "UM_TENANTID=?";
    public final static String USER_DELETE_QUERY = "DELETE FROM UM_SAMPLE_USERS WHERE UM_USERNAME=? AND UM_TENANTID=?";

}
