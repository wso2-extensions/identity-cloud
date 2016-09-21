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
    //todo: use correct tenantId,tenantDomain,app version
    var tenantDomain = "carbon.super";
    var tenantId =  "-1234";
    var appName = $("#spName").val();
    var version = "1.0";
    var transport = "http";
    var context = $("#gw-app-context").val();

    if (context != "") {
        if (context.charAt(0) != '/') {
            context = '/' + context;
        }
    }

    var saml2SsoIssuer = null;
    if (tenantId != '-1234') {
        saml2SsoIssuer = appName + "-" + tenantDomain + "-" + version;
    } else {
        saml2SsoIssuer = appName + "-" + version;
    }
    $('#issuer').val(saml2SsoIssuer);

    var ssoEnabled = true; //todo: read from config
    if (ssoEnabled) {
        $('#enableResponseSignature').prop('checked', true);
    } else {
        $('#enableResponseSignature').prop('checked', false);
    }

    var acsUrl = getACSURL(context, version, tenantDomain, transport);
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







