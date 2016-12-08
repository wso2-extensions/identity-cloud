
var appManagementClient = function(){

    var log = new Log();

    function Publisher(config){
      this.config = config;
    }

    Publisher.prototype.init = function (oauthApp) {

    };

    Publisher.prototype.addApp = function (application) {

      cleanupAppData(application);

      // Call the ReST API to persist the app
      var result = post(
                          this.config.publisher.endpoint + 'apps/webapp',
                          JSON.stringify(application),
                          {
                           'Content-Type' : 'application/json',
                           'WSO2-Identity-User' : session.get("user")
                          },
                          'json'
                        );

      // Publish the app so that it will be available in the store.
      updateLifeCycleStatus(result.data.AppId, 'Submit%20for%20Review', this.config.publisher.endpoint);
      updateLifeCycleStatus(result.data.AppId, 'Approve', this.config.publisher.endpoint);
      updateLifeCycleStatus(result.data.AppId, 'Publish', this.config.publisher.endpoint);

    };

    Publisher.prototype.updateApp = function (application) {

      cleanupAppData(application);

        // Call the ReST API to persist the app
         put(
            this.config.publisher.endpoint + 'apps/webapp/id/'+application.id,
            JSON.stringify(application),
            {
                'WSO2-Identity-User' : session.get("user"),
                'Content-Type': 'application/json'
            },
            'json'
        );
    };

    Publisher.prototype.deleteApp = function (applicationName, appVersion) {
        var appId = getAppIdByName(applicationName, appVersion, this.config.publisher.endpoint);
        if (appId == "") {
            //This code block will execute when user only register the SP and when App details are not saved
            log.debug("Application details not available for app: " + applicationName + " with version:"
                      + appVersion);

            return;
        }

        del(
            this.config.publisher.endpoint + 'apps/webapp/id/' + appId, '',
            {
                'WSO2-Identity-User' : session.get("user"),
                'Content-Type': 'application/json'
            }
        );
    };

    Publisher.prototype.getApp = function (appName, appVersion) {
        var appId = getAppIdByName(appName, appVersion, this.config.publisher.endpoint);
        if (appId == "") {
            //This code block will execute when user only register the SP and when App details are not saved
            log.debug("Application details not available for app: " + applicationName + " with version:"
                      + appVersion);
            return;
        }

        var result = get(
            this.config.publisher.endpoint + 'apps/webapp/id/' + appId, '',
            {
                'WSO2-Identity-User' : session.get("user"),
                'Content-Type': 'application/json'
            }, 'json'
        );
        return result.data;

    };

    Publisher.prototype.getAllTags = function () {
        var result = get(
            this.config.publisher.endpoint + 'apps/webapp/tags', '',
            {
                'WSO2-Identity-User': session.get("user")
            }, 'json'
        );
        return result.data;
    };

    function getAppIdByName(appName, appVersion, endpoint) {
        var result = get(
            endpoint + 'apps/webapp/name/' + appName + '/version/' + appVersion + '/uuid', '',
            {
                'WSO2-Identity-User' : session.get("user"),
                'Content-Type': 'application/json'
            }, 'json'
        );
        return result.data.id;
    };

    Publisher.prototype.uploadImage = function (file) {
        var payload = {
            "file": file
        };

        var xhr = new XMLHttpRequest();
        var tokenEndpoint = this.config.publisher.endpoint + 'apps/static-contents?appType=webapp';
        xhr.open("POST", tokenEndpoint);
        var authSet = session.get("user");
        xhr.setRequestHeader("WSO2-Identity-User", authSet);
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.send(payload);
    };


    function updateLifeCycleStatus(appId, newStatus, endpoint){

      post(
             endpoint + 'apps/webapp/change-lifecycle?appId=' + appId + '&action=' + newStatus,
             '',
             {
              'WSO2-Identity-User' : session.get("user"),
              'Content-Type' : 'application/json'
             }
          );

    }

    Publisher.prototype.getRoles = function () {
        var result = get(
            this.config.publisher.endpoint + 'roles', '',
            {
                'WSO2-Identity-User': session.get("user"),
                'Content-Type': 'application/json'
            }, 'json'
        );
        return result.data;

    };

    function cleanupAppData(application){
      // Remove meta information from description.
      application.description = application.description.replace("custom]", '');
    }

    return {Publisher : Publisher};

}
