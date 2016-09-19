function preDrawGatewayConfig() {}

$(document).ready(function() {
    $("#skipgateway").change(function () {
        if (this.checked) {
            $("#gw-config input").val("");
            $("#gw-config").hide();
            if(!$("#enableIdPInitSSO").is(':checked')) {
                $("#store-app-url-sec").show();
            }
        } else {
            $("#gw-config").show();
        }
    });

    //Backend URL provided/removed to gateway
    $("#gw-app-url").focusout(function(){
        var backendURL = this.value;
        if(backendURL != "") {
            //backendURL the app url section in store config
            $("#store-app-url-sec").hide();
        } else {
            $("#store-app-url-sec").show();
        }
    });

});

