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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.CarbonConstants;
import org.wso2.carbon.user.api.Properties;
import org.wso2.carbon.user.api.Property;
import org.wso2.carbon.user.core.UserCoreConstants;
import org.wso2.carbon.user.core.UserRealm;
import org.wso2.carbon.user.core.UserStoreException;
import org.wso2.carbon.user.core.claim.ClaimManager;
import org.wso2.carbon.user.core.jdbc.JDBCUserStoreConstants;
import org.wso2.carbon.user.core.jdbc.JDBCUserStoreManager;
import org.wso2.carbon.user.core.profile.ProfileConfigurationManager;
import org.wso2.carbon.user.core.util.DatabaseUtil;
import org.wso2.carbon.user.core.util.UserCoreUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLTimeoutException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * JDBC User store manager to work with Sample SSO apps in Identity Cloud
 */
public class CloudSampleJDBCUserStoreManager extends JDBCUserStoreManager {

    private static Log log = LogFactory.getLog(CloudSampleJDBCUserStoreManager.class);
    private static final String EVERYONE_ROLE = "Internal/everyone";

    public CloudSampleJDBCUserStoreManager() {

    }

    public CloudSampleJDBCUserStoreManager(org.wso2.carbon.user.api.RealmConfiguration realmConfig,
            Map<String, Object> properties,
            ClaimManager claimManager,
            ProfileConfigurationManager profileManager,
            UserRealm realm, Integer tenantId)
            throws UserStoreException {

        super(realmConfig, properties, claimManager, profileManager, realm, tenantId, false);
        this.realmConfig = realmConfig;
        this.tenantId = tenantId;
        this.userRealm = realm;
    }

    @Override
    public void doAddUser(String userName, Object credential, String[] roleList,
            Map<String, String> claims, String profileName, boolean requirePasswordChange)
            throws UserStoreException {

        persistUser(userName, credential, roleList, claims, profileName, requirePasswordChange);

    }

    /*
     * This method persists the user information in the database.
     */
    protected void persistUser(String userName, Object credential, String[] roleList,
            Map<String, String> claims, String profileName, boolean requirePasswordChange)
            throws UserStoreException {

        Connection dbConnection;
        String password = (String) credential;
        try {
            dbConnection = getDBConnection();
        } catch (SQLException e) {
            String errorMessage = "Error occurred while getting DB connection";
            if (log.isDebugEnabled()) {
                log.debug(errorMessage, e);
            }
            throw new UserStoreException(errorMessage, e);
        }
        try {
            String sqlStmt1 = JDBCQueryConstants.USER_INSERT_QUERY;
            this.updateStringValuesToDatabase(dbConnection, sqlStmt1, userName, password, tenantId);
            dbConnection.commit();
        } catch (Exception e) {
            try {
                dbConnection.rollback();
            } catch (SQLException e1) {
                String errorMessage = "Error while rollback in add user operation for user : " + userName;
                if (log.isDebugEnabled()) {
                    log.debug(errorMessage, e1);
                }
                throw new UserStoreException(errorMessage, e1);
            }
            String errorMessage = "Error while persisting user : " + userName;
            if (log.isDebugEnabled()) {
                log.debug(errorMessage, e);
            }
            throw new UserStoreException(errorMessage, e);
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection);
        }
    }

    private void updateStringValuesToDatabase(Connection dbConnection, String sqlStmt,
            Object... params) throws UserStoreException {
        PreparedStatement prepStmt = null;
        boolean localConnection = false;
        try {
            if (dbConnection == null) {
                localConnection = true;
                dbConnection = getDBConnection();
            }
            prepStmt = dbConnection.prepareStatement(sqlStmt);
            if (params != null && params.length > 0) {
                for (int i = 0; i < params.length; i++) {
                    Object param = params[i];
                    if (param == null) {
                        throw new UserStoreException("Invalid data provided");
                    } else if (param instanceof String) {
                        prepStmt.setString(i + 1, (String) param);
                    } else if (param instanceof Integer) {
                        prepStmt.setInt(i + 1, (Integer) param);
                    } else if (param instanceof Date) {
                        // Timestamp timestamp = new Timestamp(((Date) param).getTime());
                        // prepStmt.setTimestamp(i + 1, timestamp);
                        prepStmt.setTimestamp(i + 1, new Timestamp(System.currentTimeMillis()));
                    } else if (param instanceof Boolean) {
                        prepStmt.setBoolean(i + 1, (Boolean) param);
                    }
                }
            }
            int count = prepStmt.executeUpdate();

            if (log.isDebugEnabled()) {
                if (count == 0) {
                    log.debug("No rows were updated");
                }
                log.debug("Executed query is " + sqlStmt + " and number of updated rows :: "
                        + count);
            }

            if (localConnection) {
                dbConnection.commit();
            }
        } catch (SQLException e) {
            String msg = "Error occurred while updating string values to database.";
            if (log.isDebugEnabled()) {
                log.debug(msg, e);
            }
            throw new UserStoreException(msg, e);
        } finally {
            if (localConnection) {
                DatabaseUtil.closeAllConnections(dbConnection);
            }
            DatabaseUtil.closeAllConnections(null, prepStmt);
        }
    }

    @Override
    public boolean doCheckExistingUser(String userName) throws UserStoreException {
        return isExistingUser(userName);
    }

    @Override
    public boolean isExistingUser(String userName) throws UserStoreException {

        Connection dbConnection = null;
        ResultSet rs = null;
        PreparedStatement prepStmt = null;
        String sqlstmt;
        boolean isExist = false;

        try {
            dbConnection = getDBConnection();
            dbConnection.setAutoCommit(false);

            sqlstmt = JDBCQueryConstants.USER_EXIT_CHECK_QUERY;

            if (log.isDebugEnabled()) {
                log.debug(sqlstmt);
            }

            prepStmt = dbConnection.prepareStatement(sqlstmt);
            prepStmt.setString(1, userName);
            prepStmt.setInt(2, tenantId);

            rs = prepStmt.executeQuery();

            if (rs.next() == true) {
                isExist = true;
            }
        } catch (SQLException e) {
            String msg = "Error occurred while retrieving user info for user : " + userName;
            if (log.isDebugEnabled()) {
                log.debug(msg, e);
            }
            throw new UserStoreException("Check User information Failure", e);
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection, rs, prepStmt);
        }

        return isExist;
    }

    @Override
    public boolean doAuthenticate(String userName, Object credential) throws UserStoreException {
        if (log.isDebugEnabled()) {
            log.debug("Processing authentication with sample for tenantId  - [" + this.tenantId + "]");
        }
        if (!checkUserNameValid(userName)) {
            return false;
        }

        if (!checkUserPasswordValid(credential)) {
            return false;
        }

        if (UserCoreUtil.isRegistryAnnonymousUser(userName)) {
            log.error("Anonymous user trying to login");
            return false;
        }

        Connection dbConnection = null;
        ResultSet rs = null;
        PreparedStatement prepStmt = null;
        String sqlstmt;
        boolean isAuthed = false;

        try {
            dbConnection = getDBConnection();
            dbConnection.setAutoCommit(false);

            sqlstmt = JDBCQueryConstants.USER_AUTHENTICATE_QUERY;

            if (log.isDebugEnabled()) {
                log.debug(sqlstmt);
            }

            prepStmt = dbConnection.prepareStatement(sqlstmt);
            prepStmt.setString(1, userName);
            prepStmt.setString(2, (String) credential);
            prepStmt.setInt(3, tenantId);

            rs = prepStmt.executeQuery();

            if (rs.next()) {
                isAuthed = true;
            }
        } catch (SQLException e) {
            String msg = "Error occurred while retrieving user authentication info for user : " + userName;
            if (log.isDebugEnabled()) {
                log.debug(msg, e);
            }
            throw new UserStoreException("Authentication Failure", e);
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection, rs, prepStmt);
        }

        if (log.isDebugEnabled()) {
            log.debug("User " + userName + " login attempt. Login success :: " + isAuthed);
        }

        return isAuthed;
    }

    public Properties getDefaultUserStoreProperties() {

        Properties properties = new Properties();
        properties.setMandatoryProperties(JDBCUserStoreConstants.JDBC_UM_MANDATORY_PROPERTIES.toArray
                (new Property[JDBCUserStoreConstants.JDBC_UM_MANDATORY_PROPERTIES.size()]));
        return properties;
    }

    public Date getPasswordExpirationTime(String userName) throws UserStoreException {
        return null;
    }

    @Override
    public String[] doListUsers(String filter, int maxItemLimit) throws UserStoreException {

        String[] users = new String[0];
        Connection dbConnection = null;
        String sqlStmt;
        PreparedStatement prepStmt = null;
        ResultSet rs = null;

        try {

            List<String> lst = new LinkedList<>();
            dbConnection = getDBConnection();
            if (dbConnection == null) {
                throw new UserStoreException("null connection");
            }
            sqlStmt = JDBCQueryConstants.USER_LIST_QUERY;
            prepStmt = dbConnection.prepareStatement(sqlStmt);
            prepStmt.setInt(1, tenantId);

            try {
                rs = prepStmt.executeQuery();
            } catch (SQLException e) {
                if (e instanceof SQLTimeoutException) {
                    log.error("The cause might be a time out. Hence ignored", e);
                    return users;
                }
                String errorMessage =
                        "Error while fetching users according to filter : " + filter + " & max Item limit " +
                                ": " + maxItemLimit;
                if (log.isDebugEnabled()) {
                    log.debug(errorMessage, e);
                }
                throw new UserStoreException(errorMessage, e);
            }

            while (rs.next()) {

                String name = rs.getString(1);
                if (CarbonConstants.REGISTRY_ANONNYMOUS_USERNAME.equals(name)) {
                    continue;
                }
                String domain = realmConfig
                        .getUserStoreProperty(UserCoreConstants.RealmConfig.PROPERTY_DOMAIN_NAME);
                name = UserCoreUtil.addDomainToName(name, domain);
                name += "/" + rs.getString(2);
                lst.add(name);
            }
            rs.close();

            if (lst.size() > 0) {
                users = lst.toArray(new String[lst.size()]);
            }
            Arrays.sort(users);
        } catch (SQLException e) {
            String msg = "Error occurred while retrieving users for filter : " + filter + " & max Item limit : " +
                    maxItemLimit;
            if (log.isDebugEnabled()) {
                log.debug(msg, e);
            }
            throw new UserStoreException(msg, e);
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection, rs, prepStmt);
        }
        return users;
    }

    @Override
    public String[] getRoleListOfUser(String userName) throws UserStoreException {

        return new String[] { EVERYONE_ROLE };
    }

    @Override
    public String[] doGetRoleNames(String filter, int maxItemLimit) throws UserStoreException {
        return new String[0];
    }

    @Override
    public Map<String, String> getUserPropertyValues(String userName, String[] propertyNames,
            String profileName) throws UserStoreException {

        if (profileName == null) {
            profileName = UserCoreConstants.DEFAULT_PROFILE;
        }
        Connection dbConnection = null;
        String sqlStmt;
        PreparedStatement prepStmt = null;
        ResultSet rs = null;
        String[] propertyNamesSorted = propertyNames.clone();
        Arrays.sort(propertyNamesSorted);
        Map<String, String> map = new HashMap<>();
        try {
            dbConnection = getDBConnection();
            sqlStmt = JDBCQueryConstants.GET_USER_ATTRIBUTES_QUERY;

            prepStmt = dbConnection.prepareStatement(sqlStmt);
            prepStmt.setString(1, userName);
            prepStmt.setInt(2, tenantId);

            rs = prepStmt.executeQuery();
            if (rs.next()) {
                String password = rs.getString(2);
                String creationDate = rs.getString(4);
                map.put("password", password);
                map.put("creationdate", creationDate);
            }

            return map;
        } catch (SQLException e) {
            String errorMessage =
                    "Error Occurred while getting property values for user : " + userName + " & profile name : " +
                            profileName;
            if (log.isDebugEnabled()) {
                log.debug(errorMessage, e);
            }
            throw new UserStoreException(errorMessage, e);
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection, rs, prepStmt);
        }
    }

    @Override
    public void doDeleteUser(String userName) throws UserStoreException {

        Connection dbConnection;
        try {
            dbConnection = getDBConnection();
        } catch (SQLException e) {
            String errorMessage = "Error occurred while getting DB connection";
            if (log.isDebugEnabled()) {
                log.debug(errorMessage, e);
            }
            throw new UserStoreException(errorMessage, e);
        }
        try {
            String sqlStmt = JDBCQueryConstants.USER_DELETE_QUERY;
            this.updateStringValuesToDatabase(dbConnection, sqlStmt, userName, tenantId);
            dbConnection.commit();
        } catch (Exception e) {
            try {
                dbConnection.rollback();
            } catch (SQLException e1) {
                String errorMessage = "Error while rollback in delete user operation for user : " + userName;
                if (log.isDebugEnabled()) {
                    log.debug(errorMessage, e1);
                }
                throw new UserStoreException(errorMessage, e1);
            }
            String errorMessage = "Error while deleting user : " + userName;
            if (log.isDebugEnabled()) {
                log.debug(errorMessage, e);
            }
            throw new UserStoreException(errorMessage, e);
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection);
        }

    }
}