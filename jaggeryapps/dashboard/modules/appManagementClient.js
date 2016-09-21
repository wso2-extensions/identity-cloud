
var appManagementClient = function(){

    var log = new Log();

    function Publisher(config){
      this.config = config;
    }

    Publisher.prototype.init = function (oauthApp) {

      var accessToken = session.get('app-management.accessToken');

      if(!accessToken){

        var oauthAppCredentials = {};

        if(!oauthApp){
          var oauthAppToBeAdded = {
                                    callbackUrl: this.config.clientRegistration.callbackUrl,
                                    clientName: this.config.clientRegistration.clientName,
                                    tokenScope: this.config.clientRegistration.tokenScope,
                                    owner: this.config.clientRegistration.owner,
                                    grantType: this.config.clientRegistration.grantType,
                                    saasApp: this.config.clientRegistration.saasApp
                                  };
          oauthAppCredentials = registerOAuthApp(this.config.clientRegistration, oauthAppToBeAdded);

        }else{
          var inboundConfigs = oauthApp.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs;
          for(var i = 0; i < inboundConfigs.length; i++){
            if(inboundConfigs[i].inboundAuthType === 'oauth2'){
              oauthAppCredentials.clientId = inboundConfigs[i].inboundAuthKey;
              oauthAppCredentials.clientSecret = inboundConfigs[i].properties['value'];
              break;
            }
          }
        }

        accessToken = getAccessToken(oauthAppCredentials);
        session.put('app-management.accessToken', accessToken);

      }

      this.accessToken  = accessToken;
    };

    Publisher.prototype.addApp = function (application) {

      // Call the ReST API to persist the app
      var result = post(
                          this.config.publisher.endpoint + 'apps/webapp',
                          JSON.stringify(application),
                          {
                           'Authorization' : 'Bearer ' + this.accessToken.access_token,
                           'Content-Type' : 'application/json'
                          },
                          'json'
                        );

      // Publish the app so that it will be available in the store.
      updateLifeCycleStatus(result.data.AppId, 'Submit%20for%20Review', this.config.publisher.endpoint, this.accessToken.access_token);
      updateLifeCycleStatus(result.data.AppId, 'Approve', this.config.publisher.endpoint, this.accessToken.access_token);
      updateLifeCycleStatus(result.data.AppId, 'Publish', this.config.publisher.endpoint, this.accessToken.access_token);

    };

    function registerOAuthApp(clientRegistrationConfig, oauthApp) {

      var authorizationHeaderValue = 'Basic ' + base64Encode(clientRegistrationConfig.username + ":" + clientRegistrationConfig.password);

      var result = post(
                          clientRegistrationConfig.endpoint,
                          JSON.stringify(oauthApp),
                          {
                           'Authorization' : authorizationHeaderValue,
                           'Content-Type' : 'application/json'
                          },
                          'json'
                        );

      return result.data;
    }

    function getAccessToken(oauthApp){

      var payload = 'username=admin&password=admin&grant_type=password&scope=appm:read appm:create appm:update appm:publish';
      var tokenAPIEndpoint = 'http://127.0.0.1:9763/oauth2/token';

      var authorizationHeaderValue = 'Basic ' + base64Encode(oauthApp.clientId + ":" + oauthApp.clientSecret);

      var result = post(
                          tokenAPIEndpoint,
                          payload,
                          {
                           'Authorization' : authorizationHeaderValue,
                           'Content-Type' : 'application/x-www-form-urlencoded'
                          },
                          'json'
                        );

      return result.data;
    }

    function base64Encode(text){
      var javaStringObject = new java.lang.String(text);
      var encodedBytes = org.apache.commons.codec.binary.Base64.encodeBase64(javaStringObject.getBytes("UTF-8"));
      return new java.lang.String(encodedBytes);
    }

    function updateLifeCycleStatus(appId, newStatus, endpoint, accessToken){

      post(
             endpoint + 'apps/webapp/change-lifecycle?appId=' + appId + '&action=' + newStatus,
             '',
             {
              'Authorization' : 'Bearer ' + accessToken,
              'Content-Type' : 'application/json'
             }
          );

    }

    return {Publisher : Publisher};

}
