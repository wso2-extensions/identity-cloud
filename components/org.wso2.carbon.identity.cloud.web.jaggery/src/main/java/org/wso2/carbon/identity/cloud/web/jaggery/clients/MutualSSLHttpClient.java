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

package org.wso2.carbon.identity.cloud.web.jaggery.clients;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.*;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.wso2.carbon.base.ServerConfiguration;

import javax.net.ssl.SSLContext;
import java.io.*;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.Map;

public class MutualSSLHttpClient {

    private static final Log log = LogFactory.getLog(MutualSSLHttpClient.class);
    org.apache.http.client.HttpClient httpClient = null;
    private static String ApplicationJson = "application/json";
    private static String keyStoreType = "JKS";
    private static String SecurityKeyStoreLocation = "Security.KeyStore.Location";
    private static String SecurityKeyStorePassword = "Security.KeyStore.Password";
    private static String SecurityKeyStoreKeyPassword = "Security.KeyStore.KeyPassword";
    private static String SecurityTrustStoreLocation = "Security.TrustStore.Location";
    private static String SecurityTrustStorePassword = "Security.TrustStore.Password";

    public MutualSSLHttpClient() {
        String filePath = null;
        try {
            final KeyStore keyStore = KeyStore.getInstance(keyStoreType);
            filePath = ServerConfiguration.getInstance()
                    .getFirstProperty(SecurityKeyStoreLocation);
            InputStream keystoreInput = new FileInputStream(new File(filePath));
            keyStore.load(keystoreInput, ServerConfiguration.getInstance()
                    .getFirstProperty(SecurityKeyStorePassword).toCharArray());

            final KeyStore trustStore = KeyStore.getInstance(keyStoreType);
            filePath = ServerConfiguration.getInstance()
                    .getFirstProperty(SecurityTrustStoreLocation);
            InputStream truststoreInput = new FileInputStream(new File(filePath));
            trustStore.load(truststoreInput, ServerConfiguration.getInstance()
                    .getFirstProperty(SecurityTrustStorePassword).toCharArray());

            SSLContext sslcontext = SSLContexts.custom()
                    .loadTrustMaterial(trustStore)
                    .loadKeyMaterial(keyStore, ServerConfiguration.getInstance()
                            .getFirstProperty(SecurityKeyStorePassword).toCharArray())
                    .build();

            SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(sslcontext);
            httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
        } catch (KeyStoreException e) {
            log.error("Error while instantiating key store for key store type : " + keyStoreType, e);
        } catch (FileNotFoundException e) {
            log.error("File not found in the given path : " + filePath, e);
        } catch (IOException e) {
            log.error("Error while loading the key store in the given path : " + filePath, e);
        } catch (CertificateException e) {
            log.error("Certificate error in the key store : " + filePath, e);
        } catch (NoSuchAlgorithmException e) {
            log.error("Algorithm error in the key store : " + filePath, e);
        } catch (UnrecoverableKeyException e) {
            log.error("Error while creating the SSLContext", e);
        } catch (KeyManagementException e) {
            log.error("Error while creating the SSLContext", e);
        }
    }

    public String doGet(String endPoint, HttpHeaders headers) {
        HttpGet getMethod = new HttpGet(endPoint);
        String responseString = doHttpMethod(getMethod, headers);
        return responseString;
    }

    public String doPost(String endPoint, HttpHeaders headers, String jsonContent) {
        String responseString = null;
        try {
            StringEntity inputMappings = new StringEntity(jsonContent);
            inputMappings.setContentType(ApplicationJson);
            HttpPost postMethod = new HttpPost(endPoint);
            postMethod.setEntity(inputMappings);
            responseString = doHttpMethod(postMethod, headers);
        } catch (UnsupportedEncodingException e) {
            log.error("Error while creating payload for http request. Payload : " + jsonContent, e);
        }
        return responseString;
    }

    public String doPut(String endPoint, HttpHeaders headers, String jsonContent) {
        String responseString = null;
        try {
            StringEntity inputMappings  = new StringEntity(jsonContent);
            inputMappings.setContentType(ApplicationJson);
            HttpPut putMethod = new HttpPut(endPoint);
            putMethod.setEntity(inputMappings);
            responseString = doHttpMethod(putMethod, headers);
        } catch (UnsupportedEncodingException e) {
            log.error("Error while creating payload for http request. Payload : " + jsonContent, e);
        }
        return responseString;
    }

    public String doDelete(String endPoint, HttpHeaders headers) {
        HttpDelete deleteMethod = new HttpDelete(endPoint);
        String responseString = doHttpMethod(deleteMethod, headers);
        return responseString;
    }

    private String doHttpMethod(HttpRequestBase httpMethod, HttpHeaders headers) {
        String responseString = null;
        try {
            for (Map.Entry<String, String> entry : headers.getHeaderMap().entrySet()) {
                httpMethod.addHeader(entry.getKey(), entry.getValue());
            }

            HttpResponse closeableHttpResponse = httpClient.execute(httpMethod);
            HttpEntity entity = closeableHttpResponse.getEntity();
            responseString = EntityUtils.toString(entity, "UTF-8");
        } catch (IOException e) {
            log.error("Error while executing the http method " + httpMethod.getMethod()
                    + ". Endpoint : " + httpMethod.getURI(), e);
        }
        return responseString;
    }
}