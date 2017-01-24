function preDrawGatewayConfig() {}

$(document).ready(function() {
    $("#skipgateway").change(function () {
        if (this.checked) {
            $("#gw-config input").val("");
            $("#gw-config").hide();
            if(!$("#enableIdPInitSSO").is(':checked')) {
                $("#store-app-url-sec").show();
            }
            //clear gw related properties
            resetSAML2SSOConfigurations();
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

    $("#gw-app-context").focusout(function () {
        resetSAML2SSOConfigurations();
        if ($("#gw-app-context").val().trim() != "") {
            setSAML2SSOConfigurations();
        }
    });

});

//Set gateway
function setSAML2SSOConfigurations() {
    //todo: use correct app version and transport
    var appName = $("#spName").val();
    var appVersion = "1.0";
    var transport = "https";

    var context = $("#gw-app-context").val();

    var saml2SsoIssuer = populateIssuerName(appName, appVersion);
    $('#issuer').val(saml2SsoIssuer);

    $('#enableResponseSignature').prop('checked', true);

    disableResponseSignature($('#enableResponseSignature')[0]);

    var acsUrl = getACSURL(context, appVersion, transport);
    $('#assertionConsumerURLTxt').val(acsUrl);
    onClickAddACRUrl();

    //set audience restrictions
    $('#enableAudienceRestriction').prop('checked', true);
    disableAudienceRestriction($('#enableAudienceRestriction')[0]);
    $('#audience').val("carbonServer");
    addAudienceFunc();
}

function resetSAML2SSOConfigurations() {
    $('#issuer').val("");
    $('#enableResponseSignature').prop('checked', false);
    disableResponseSignature($('#enableResponseSignature')[0]);
    $('#assertionConsumerURLTxt').val("");
    $('#defaultAssertionConsumerURL').val("");
    $('#assertionConsumerURLsTable').remove();

    //remove audience restrictions
    $('#enableAudienceRestriction').prop('checked', false);
    $('#audience').val("");
    disableAudienceRestriction($('#enableAudienceRestriction')[0]);
    var propertyCount = $("#audiencePropertyCounter").val();
    for (var c = 0; c < propertyCount; c++) {
        removeAudience(c);
    }
}
