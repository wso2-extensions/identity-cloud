
var appManagementClient = function(){

    var log = new Log();

    function Publisher(config){
      this.config = config;
    }

    Publisher.prototype.init = function (oauthApp) {

    };

    Publisher.prototype.addApp = function (application) {

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

    function updateLifeCycleStatus(appId, newStatus, endpoint){

      post(
             endpoint + 'apps/webapp/change-lifecycle?appId=' + appId + '&action=' + newStatus,
             '',
             {
              'Content-Type' : 'application/json',
              'WSO2-Identity-User' : session.get("user")
             }
          );

    }

    return {Publisher : Publisher};

}
