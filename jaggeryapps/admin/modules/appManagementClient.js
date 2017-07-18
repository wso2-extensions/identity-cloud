var appManagementClient = function () {

    var log = new Log("AppManagementHttpClient : ");
    var appMHttpClients = Packages.org.wso2.carbon.identity.cloud.web.jaggery.clients.MutualSSLHttpClient;
    var appMHttpClientObjs = new appMHttpClients();
    var httpHeaders = Packages.org.wso2.carbon.identity.cloud.web.jaggery.clients.HttpHeaders;
    var httpHeadersObj = new httpHeaders();

    var WSO2IdentiryUser = "WSO2-Identity-User";
    var ContentType = "Content-Type";
    var ApplicationJson = "application/json";

    var AuthUser = session.get("user");

    function Publisher(config) {
        this.config = config;
    }

    Publisher.prototype.init = function (oauthApp) {

    };

    Publisher.prototype.addApp = function (application) {
        try {
            cleanupAppData(application);
            var endPoint = this.config.publisher.endpoint + 'apps/webapp';
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            var response = appMHttpClientObjs.doPost(endPoint, httpHeadersObj, stringify(application));
            var parsedResponse = JSON.parse(response);

            // Publish the app so that it will be available in the store.
            updateLifeCycleStatus(parsedResponse.AppId, 'Submit%20for%20Review', this.config.publisher.endpoint);
            updateLifeCycleStatus(parsedResponse.AppId, 'Approve', this.config.publisher.endpoint);
            updateLifeCycleStatus(parsedResponse.AppId, 'Publish', this.config.publisher.endpoint);
        } catch (e) {
            log.error(e.message);
        }
    };

    Publisher.prototype.updateApp = function (application) {
        try {
            cleanupAppData(application);
            var endPoint = this.config.publisher.endpoint + 'apps/webapp/id/' + application.id;
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            // AppM backend do not sent a response for this API call.
            var response = appMHttpClientObjs.doPut(endPoint, httpHeadersObj, stringify(application));
        } catch (e) {
            log.error(e.message);
        }
    };

    Publisher.prototype.deleteApp = function (applicationName, appVersion) {
        try {
            var appId = getAppIdByName(applicationName, appVersion, this.config.publisher.endpoint);
            if (appId == "") {
                //This code block will execute when user only register the SP and when App details are not saved
                log.debug("Application details not available for app: " + applicationName + " with version:"
                    + appVersion);

                return;
            }

            var endPoint = this.config.publisher.endpoint + 'apps/webapp/id/' + appId;
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            // AppM backend do not sent a response for this API call.
            var response = appMHttpClientObjs.doDelete(endPoint, httpHeadersObj);
        } catch (e) {
            log.error(e.message);
        }
    };

    Publisher.prototype.getApp = function (appName, appVersion) {
        var parsedResponse;
        try {
            var appId = getAppIdByName(appName, appVersion, this.config.publisher.endpoint);
            if (appId == "") {
                //This code block will execute when user only register the SP and when App details are not saved
                log.debug("Application details not available for app: " + applicationName + " with version:"
                    + appVersion);
                return;
            }

            var endPoint = this.config.publisher.endpoint + 'apps/webapp/id/' + appId;
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            var response = appMHttpClientObjs.doGet(endPoint, httpHeadersObj);
            parsedResponse = JSON.parse(response);
        } catch (e) {
            log.error(e.message);
        }
        return parsedResponse;
    };

    Publisher.prototype.getAllTags = function () {
        var parsedResponse;
        try {
            var endPoint = this.config.publisher.endpoint + 'apps/webapp/tags';
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);

            var response = appMHttpClientObjs.doGet(endPoint, httpHeadersObj);
            var parsedResponse = JSON.parse(response);
        } catch (e) {
            log.error(e.message);
        }
        return parsedResponse;
    };

    function getAppIdByName(appName, appVersion, endpoint) {
        var parsedResponse;
        try {
            var endPoint = endpoint + 'apps/webapp/name/' + appName + '/version/' + appVersion + '/uuid';
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            var response = appMHttpClientObjs.doGet(endPoint, httpHeadersObj);
            parsedResponse = JSON.parse(response);
            return parsedResponse.id;
        } catch (e) {
            log.error(e.message);
            return "";
        }
    };

    Publisher.prototype.uploadImage = function (file) {
        var payload = {
            "file": file
        };

        var xhr = new XMLHttpRequest();
        var tokenEndpoint = this.config.publisher.endpoint + 'apps/static-contents?appType=webapp';
        xhr.open("POST", tokenEndpoint);
        var authSet = AuthUser;
        xhr.setRequestHeader(WSO2IdentiryUser, authSet);
        xhr.setRequestHeader(ContentType, "multipart/form-data");
        xhr.send(payload);
    };


    function updateLifeCycleStatus(appId, newStatus, endpoint) {
        try {
            var endPoint = endpoint + 'apps/webapp/change-lifecycle?appId=' + appId + '&action=' + newStatus;
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            var response = appMHttpClientObjs.doPost(endPoint, httpHeadersObj, stringify(application));
            var parsedResponse = JSON.parse(response);
        } catch (e) {
            log.error(e.message);
        }
    }

    Publisher.prototype.getRoles = function () {
        var parsedResponse;
        try {
            var endPoint = this.config.publisher.endpoint + 'roles';
            httpHeadersObj.addHeader(WSO2IdentiryUser, AuthUser);
            httpHeadersObj.addHeader(ContentType, ApplicationJson);

            var response = appMHttpClientObjs.doGet(endPoint, httpHeadersObj);
            parsedResponse = JSON.parse(response);
        } catch (e) {
            log.error(e.message);
        }
        return parsedResponse;
    };

    function cleanupAppData(application) {
        // Remove meta information from description.
        // HACK : Replacing with a space since the registry converts spaces in to null values.
        application.description = application.description.replace("custom]", ' ');
    }

    return {Publisher: Publisher};
}
