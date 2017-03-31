/*
 *   Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

package org.wso2.carbon.identity.cloud.userstore.server;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.tomcat.jdbc.pool.PoolProperties;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.identity.cloud.userstore.server.messaging.JMSConnectionException;
import org.wso2.carbon.identity.cloud.userstore.server.messaging.JMSConnectionFactory;
import org.wso2.carbon.identity.cloud.userstore.server.util.DatabaseUtil;
import org.wso2.carbon.identity.user.store.outbound.model.AccessToken;
import org.wso2.carbon.identity.user.store.outbound.model.UserOperation;


import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import javax.jms.Connection;
import javax.jms.DeliveryMode;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.MessageProducer;
import javax.jms.ObjectMessage;
import javax.sql.DataSource;
import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/server/{token}/")
public class OnpremServerEndpoint implements MessageListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(OnpremServerEndpoint.class);
//    private Map<String, Queue<Session>> sessions = new HashMap<>();
    private Map<String, Session> sessions = new HashMap<>();
    protected DataSource jdbcds = null;
    private final static String QUEUE_NAME_REQUEST = "requestQueue";
    private final static String QUEUE_NAME_RESPONSE = "responseQueue";
    private boolean transacted = false;
    private MessageConsumer requestConsumer;

    public OnpremServerEndpoint() {
        LOGGER.info("############## OnPremise managed server started.");
        Thread loop = new Thread(new Runnable() {

            public void run() {
                startListeningNextOperation();
            }
        });
        loop.start();
    }

    //TODO consider concurrency
    private void addSession(String tenant, Session session) {

//        Queue<Session> tenantSessions = sessions.get(tenant);
//        if (tenantSessions == null) {
//            Queue<Session> tenantSession = new LinkedList<>();
//            tenantSession.add(session);
//            sessions.put(tenant, tenantSessions);
//        } else {
//            sessions.get(tenant).add(session);
//        }
        sessions.put(tenant, session);
    }

    private void removeSession(String tenant, Session session) {

//        Queue<Session> tenantSessions = sessions.get(tenant);
//        if (tenantSessions == null) {
//            Queue<Session> tenantSession = new LinkedList<>();
//            tenantSession.add(session);
//            sessions.put(tenant, tenantSessions);
//        } else {
//            sessions.get(tenant).add(session);
//        }

        sessions.remove(tenant);
    }

    //TODO consider concurrency
    private Session getSession(String tenant) {

//        Session session = sessions.get(tenant).poll();
//        sessions.get(tenant).add(session);
//        return session;
        return sessions.get(tenant);
    }

    public void startListeningNextOperation() {

        ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory("tcp://localhost:61616");
        Connection connection;
        try {
            connection = connectionFactory.createConnection();
            connection.start();
            javax.jms.Session session = connection.createSession(transacted, javax.jms.Session.AUTO_ACKNOWLEDGE);
            Destination adminQueue = session.createQueue(QUEUE_NAME_REQUEST);

            requestConsumer = session.createConsumer(adminQueue);
            requestConsumer.setMessageListener(this);

        } catch (JMSException e) {
            LOGGER.error("Error occurred while listening message.", e);
        }
    }

    @Override
    public void onMessage(final Message request) {
        try {

            UserOperation userOperation = (UserOperation) ((ObjectMessage) request).getObject();
            System.out.println("Received request message: " + userOperation.getRequestData());
            processOperation(userOperation);
        } catch (JMSException e) {
            e.printStackTrace();
        }
    }

    protected java.sql.Connection getDBConnection() throws SQLException {
        java.sql.Connection dbConnection = getJDBCDataSource().getConnection();
        dbConnection.setAutoCommit(false);
        if (dbConnection.getTransactionIsolation() != java.sql.Connection.TRANSACTION_READ_COMMITTED) {
            dbConnection.setTransactionIsolation(java.sql.Connection.TRANSACTION_READ_COMMITTED);
        }
        return dbConnection;
    }

    private DataSource getJDBCDataSource() {
        if (jdbcds == null) {
            jdbcds = loadUserStoreSpacificDataSoruce();
        }
        return jdbcds;
    }

    private DataSource loadUserStoreSpacificDataSoruce() {
        PoolProperties poolProperties = new PoolProperties();
        poolProperties.setDriverClassName("com.mysql.jdbc.Driver");
        poolProperties.setUrl("jdbc:mysql://localhost:3306/sampleuserstoredb");
        poolProperties.setUsername("root");
        poolProperties.setPassword("root");

        return new org.apache.tomcat.jdbc.pool.DataSource(poolProperties);

    }

    public void processOperation(UserOperation userOperation) {
        LOGGER.info("############ : Processing record for tenant : " + userOperation.getTenant());
        Thread loop = new Thread(new Runnable() {

            public void run() {
                try {
                    getSession(userOperation.getTenant()).getBasicRemote()
                            .sendText(convertToJson(userOperation));//TODO change tenant
                } catch (IOException ex) {
                    LOGGER.error("Error occurred while sending messaging to client", ex);
                }
            }
        });
        loop.start();
    }

    private String convertToJson(UserOperation userOperation) {

        return String
                .format("{correlationId : '%s', requestType : '%s', requestData : %s}",
                        userOperation.getCorrelationId(),
                        userOperation.getRequestType(), userOperation.getRequestData());
    }

    private void processResponse(String tenant, String message) {

        LOGGER.info("############# Got response from Agent : " + message);

        JMSConnectionFactory connectionFactory = new JMSConnectionFactory();
        Connection connection = null;
        MessageProducer producer;
        try {
            connectionFactory.createActiveMQConnectionFactory();
            connection = connectionFactory.createConnection();
            connectionFactory.start(connection);
            javax.jms.Session session = connectionFactory.createSession(connection);
            Destination responseQueue = connectionFactory.createQueueDestination(session, QUEUE_NAME_RESPONSE);
            producer = connectionFactory.createMessageProducer(session, responseQueue, DeliveryMode.NON_PERSISTENT);

            JSONObject resultObj = new JSONObject(message);
            String responseData = (String) resultObj.get("responseData");
            String correlationId = (String) resultObj.get("correlationId");

            UserOperation requestOperation = new UserOperation();
            requestOperation.setCorrelationId(correlationId);
            requestOperation.setResponseData(responseData);

            ObjectMessage requestMessage = session.createObjectMessage();
            requestMessage.setObject(requestOperation);
            requestMessage.setJMSCorrelationID(correlationId);
            producer.send(requestMessage);

        } catch (JMSException e) {
            LOGGER.error("Error occurred while sending message", e);
        } catch (JSONException e) {
            LOGGER.error("Error occurred while reading json payload", e);
        } catch (JMSConnectionException e) {
            LOGGER.error("Error occurred while sending message", e);
        } finally {
            try {
                connectionFactory.closeConnection(connection);
            } catch (JMSConnectionException e) {
                LOGGER.error("Error occurred while closing JMS connection", e);
            }
        }

    }

    private AccessToken validateAccessToken(String accessToken) {
        java.sql.Connection dbConnection = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        try {
            dbConnection = getDBConnection();
            prepStmt = dbConnection.prepareStatement(
                    "SELECT UM_TOKEN, UM_TENANT FROM UM_ACCESS_TOKEN WHERE UM_TOKEN = ? AND UM_STATUS = ?");
            prepStmt.setString(1, accessToken);
            prepStmt.setString(2, "A");
            resultSet = prepStmt.executeQuery();

            if (resultSet.next()) {
                AccessToken token = new AccessToken();
                token.setAccessToken(resultSet.getString("UM_TOKEN"));
                token.setTenant(resultSet.getString("UM_TENANT"));
                return token;
            }
        } catch (SQLException e) {
            String errorMessage = "Error occurred while getting reading data";
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug(errorMessage, e);
            }
        } finally {
            DatabaseUtil.closeAllConnections(dbConnection, resultSet, prepStmt);
        }
        return null;
    }

    @OnOpen
    public void onOpen(@PathParam("token") String token, Session session) {

        AccessToken accessToken = validateAccessToken(token);
        if (accessToken == null) {
            try {
                LOGGER.error("Closing session due to send invalid access token.");
                session.close();
            } catch (IOException e) {
                LOGGER.error("Error occurred while closing session.");
            }
        }
        addSession(accessToken.getTenant(), session);
        String msg = accessToken.getTenant() + " connected to server";
        LOGGER.info(msg);
    }

    @OnMessage
    public void onTextMessage(@PathParam("tenant") String tenant, String text, Session session) throws IOException {
        String msg = tenant + " : " + text;
        LOGGER.info("Received Text : " + text + " from  " + tenant + session.getId());

        Thread loop = new Thread(new Runnable() {

            public void run() {
                processResponse(tenant, text);
            }
        });
        loop.start();
    }

    @OnMessage
    public void onBinaryMessage(byte[] bytes, Session session) {
        LOGGER.info("Reading binary Message");
        LOGGER.info(bytes.toString());
    }

    @OnClose
    public void onClose(@PathParam("tenant") String tenant, CloseReason closeReason, Session session) {
        LOGGER.info("Connection is closed with status code : " + closeReason.getCloseCode().getCode()
                + " On reason " + closeReason.getReasonPhrase());
        sessions.remove(session);
        String msg = tenant + " left the chat";
    }

    @OnError
    public void onError(Throwable throwable, Session session) {
        LOGGER.error("Error found in method : " + throwable.toString());
    }

}
