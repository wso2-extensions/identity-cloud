var inboundAuthType,appType = null;
var messageContainer = "<div class='alert' role='alert'><span class='alert-content'></span></div>";
function drawSPDetails() {
    if (appdata != null) {
        $('#spName').val(appdata.applicationName);
        $('#oldSPName').val(appdata.applicationName);
        var spDescription = appdata.description;
        var sptype = getAppType(appdata);
        if (spDescription.indexOf(']') > -1) {
            spDescription = spDescription.split(']') [1];
        }
        $('#sp-description').val(spDescription);
        $('#spType').val(sptype);
        if (sptype == CUSTOM_SP) {
            $('#gw-config-section').show();
        } else {
            $('#skipgateway').prop('checked', true);
        }
        preDrawClaimConfig();
        var samlsp;
        if (appdata != null && appdata.inboundAuthenticationConfig != null && appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs != null) {
            if (appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs.constructor !== Array) {
                appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs = [appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs];
            }
            // drop down selection (inbound security drop down selection)
            inboundAuthType = appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs[0].inboundAuthType;
            for (var i in appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs) {
                var inboundConfig = appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs[i];
                if (inboundConfig.inboundAuthType == PASSIVE_STS && inboundConfig.inboundAuthKey.length > 0) {
                    $('#passiveSTSRealm').val(inboundConfig.inboundAuthKey);
                    if (inboundConfig.properties != null && inboundConfig.properties.constructor !== Array) {
                        inboundConfig.properties = [inboundConfig.properties];
                    }
                    for (var i in inboundConfig.properties) {
                        var property = inboundConfig.properties[i];
                        if (property.name == PASSIVE_STS_REPLY) {
                            $('#passiveSTSWReply').val(property.value);
                            break;
                        }
                    }
                } else if (inboundConfig.inboundAuthType == SAML_SSO) {
                    if (inboundConfig.properties != null && inboundConfig.properties.constructor !== Array) {
                        inboundConfig.properties = [inboundConfig.properties];
                    }
                    for (var i in inboundConfig.properties) {
                        var property = inboundConfig.properties[i];
                        if (property.name == WELLKNOWN_APPLICATION_TYPE && property.value == sptype) {
                            samlsp = inboundConfig;
                            break;
                        }
                    }
                }
            }
        }
        preDrawSAMLConfigPage(samlsp);
        if (sptype == CUSTOM_SP) {
            preDrawOAuthConfigPage();
            $('#oauthPanel').show();
            $('#wsfedPanel').show();
        }
    }
}

function drawAppDetails(data) {
    if ($('#skipgateway').is(':checked')) {
        $("#gw-config input").val("");
        $("#gw-config").hide();
        if ($("#enableIdPInitSSO").is(':checked')) {
            $('#store-app-url').val(samlClient.storeUrl);
        } else {
            $("#store-app-url-sec").show();
            if (data != null && data.appUrL != null) {
                $('#store-app-url').val(data.appUrL);
            }
        }
    } else {
        $("#gw-config").show();
        if (data != null) {
            $('#gw-app-context').val(data.context);
            $("#gw-app-context").attr('disabled','disabled');
            $('#gw-app-url').val(data.appUrL);
            $('#store-app-url').val(data.appUrL);
        }
    }

    if (data != null) {
        //store properties
        $('#store-app-name').val(data.displayName);
        $('#store-app-thumbnail-url').val(data.thumbnailUrl);
        $('#store-app-banner-url').val(data.banner);

        var tags = data.tags;

        if(tags){
            $("#store-app-tags").val(data.tags).trigger("change");
        }

        if (data.visibleRoles.toString().trim() != "") {
            var existingRoles = data.visibleRoles.toString().split(",");
            for (var i = 0; i < existingRoles.length; i++) {
                var role = existingRoles[i];
                $("#store-app-visibility").val(role).trigger("change");
            }
        }
    }

    //Set Id for existing apps, if it's new App id will be ""
    var id;
    if (data == null) {
        id = "";
    } else {
        id = data.id;
        $("#sp-img-thumb").attr('src',data.thumbnailUrl);
    }
    $('#app-id').val(id);
    // add images to edit view

    if (appType == CUSTOM_SP) {
        if (data && data.skipGateway == "false") {
            var storeAppType = getStoreAppType(data);
            $("#skipgateway").prop('checked', false);
            $("#skipgateway").hide();
            $("#custom-app-dropdown").click();
            $("#security-type").hide();
            if (storeAppType == APP_PROXY_TYPE) {
                //proxy type
                $('#storeAppType').val(APP_PROXY_TYPE);
                $("#custom-app-dropdown #proxytype").click();
                $("#gw-config-section").show();
                $("#gatewayconfig").attr('class', '');
                $("#gw-config-section").find('.panel-heading').remove();
                $("#claim_dialect_custom").hide().closest('label').hide();
            } else {
                //shortcut type
                $('#storeAppType').val(APP_SHORTCUT_TYPE);
                $("#custom-app-dropdown #shortcut").click();
                $("#security-type").hide();
                $("#security-accordion").hide();
                $("#gw-config-section").hide();
            }
        } else {
            //Agent type
            $('#storeAppType').val(APP_AGENT_TYPE);
            $("#custom-app-dropdown").click();
            $("#custom-app-dropdown #agenttype").click();

            $("#skipgateway").prop('checked', true);
            $("#gw-config-section").hide();
            $("#security-type").show();

            var timeout = setInterval(function () {
                // drop down selection (inbound security drop down selection)
                if (inboundAuthType === "samlssocloud") {
                    $("#custom-security-dropdown").click();
                    $("#SAML2WebLink").click();
                } else if (inboundAuthType === "oauth2") {
                    $("#custom-security-dropdown").click();
                    $("#oAuthOPenIdLink").click();

                } else if (inboundAuthType === "passivests") {
                    $("#custom-security-dropdown").click();
                    $("#wsFedLink").click();

                }
                clearTimeout(timeout);
            }, APP_DETAIL_TIMEOUT);

        }
    }else{
        $('#storeAppType').val(WELL_KNOWN_APP);
    }
}

function preDrawUpdatePage(appName) {
    preDrawSPDetails(appName);
    preDrawAppDetails(appName);
}

function renderCustomPage(data) {
    if (data) {
        appType = getAppType(data);
        //setting store name as app name
        var storeName = $("#store-app-name");
        if (!$(storeName).val()) {
            $(storeName).val(data.applicationName);

        }
    }

    if (appStatus == "new") {
        $("#breadcrumb-sec").html('<i class="fw fw-security" ></i> <span class="hidden-xs">Identity Cloud&nbsp;</span> / Applications / Custom Application / Add');
    }

    if (appType) {
        switch (appType) {
            case CUSTOM_SP:
                $("#app-name").text(data.applicationName);
                $("#app-desc-name").text(appType);
                $("#sp-img").attr('src', resolveImageIcon(appType));
                hideAllCustomFields();

                $("#customConfig").show();
                $("#sso-drop-down").removeClass('hide');
                $("#btn-advance-setting").removeClass('hide');
                var dropdown = $("#custom-app-dropdown");
                dropdown.show();
                $("#custom-apptype-content").append(dropdown);
                setCustomImage(data.applicationName);

                if(data.applicationName == APP_NAME1 || data.applicationName == APP_NAME2) {
                    disableForm();
                    showGotoStoreMsg();
                }
                break;

            default:
                var clonex = $("#samlconfig").clone();
                $("#samlconfig").remove();
                clonex.removeClass("panel-collapse collapse");
                $("#dynamic-sso-config").html(clonex).show();
                $("#security-accordion").hide();
                $("#storeconfig").removeClass("panel-collapse collapse");
                $("#span-head-security").removeClass("clickable");
                $("#up-icon").removeClass("fw fw-up");
                $("#storeconfig-header").remove();
                //remove more details in samal sso web configurations
                //$("#samal-dynamic-hide").hide();
                $("#sso-thumb").hide();
                $("#sso-banner").hide();
                $("#sso-config-label").show();

                $("#app-name").text(data.applicationName);
                $("#app-desc-name").text(appType);
                $("#sp-img").attr('src', resolveImageIcon(appType));

                // show dropdown for upload file/manual config
                var dropdown = $("#sso-drop-down");
                dropdown.show();
                $("#addServiceProvider").prepend(dropdown);
                break;
        }
    }
}

function setCustomImage(appName) {
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/apps/getApp",
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName + "&spName=" + appName,
        async: true,
        success: function (data) {
            if (data != null) {
                var result = JSON.parse(data);
                if (result != null && result.thumbnailUrl != undefined) {
                    var link = "/user-portal/storage/webapp/" + result.id + '/' + result.thumbnailUrl;
                    $('#sp-img-thumb').attr('src', link);
                    $('#sp-img').attr('src', link);
                }
            }
        },
        error: function (e) {
        }
    });
}

function hideAllCustomFields() {
    $("#gw-config-section").hide();
    $("#security-accordion").hide();
    // keep expand store config
    $("#storeconfig").removeClass("panel-collapse collapse");
    $("#storeconfig-header").remove();
}

function resolveImageIcon(type) {
    var spimage = null;
    if (type == CUSTOM_SP) {
        spimage = '../images/is/custom.png';
    } else if (type == CONCUR_SP) {
        spimage = '../images/is/concur.png';
    } else if (type == GOTOMEETING_SP) {
        spimage = '../images/is/gotomeeting.png';
    } else if (type == NETSUIT_SP) {
        spimage = '../images/is/netsuit.png';
    } else if (type == ZUORA_SP) {
        spimage = '../images/is/zuora.png';
    } else if (type == SALESFORCE_SP) {
        spimage = '../images/is/salesforce.png';
    } else if (type == AMAZON_SP) {
        spimage = '../images/is/aws.png';
    } else {
        spimage = '../images/is/custom.png';
    }
    return spimage;
}

function capitalizeFirstLetter(str) {
    var formattedType = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
    return formattedType;
}

function preDrawSPDetails(appName){
    $.ajax({
        async: false,
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/getsp/" + appName,
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName + "&spName=" + appName,
        success: function (data) {
            var resp = $.parseJSON(data);

            if (resp.success == false) {
                if (typeof resp.reLogin != 'undefined' && resp.reLogin == true) {
                    window.top.location.href = window.location.protocol + '//' + serverUrl + '/' + ADMIN_PORTAL_NAME + '/logout.jag';
                } else {
                    if (resp.message != null && resp.message.length > 0) {
                        message({
                            content: resp.message, type: 'error', cbk: function () {
                            }
                        });
                    } else {
                        message({
                            content: 'Error occurred while loading values for the grid.',
                            type: 'error',
                            cbk: function () {
                            }
                        });
                    }
                }
            } else {
                appdata = resp.return;
                drawSPDetails();
                renderCustomPage(appdata);
            }
        },
        error: function (e) {
            message({
                content: 'Error occurred while loading values for the grid.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function preDrawAppDetails(appName){
    $.ajax({
               async: false,
               url: "/" + ADMIN_PORTAL_NAME + "/apps/getApp/" + appName,
               type: "GET",
               data: "&cookie=" + cookie + "&user=" + userName + "&spName=" + appName,
               contentType: "multipart/form-data",
               success: function (data) {
                   drawAppDetails(JSON.parse(data));
               },
               error: function (e) {
                   message({
                               content: 'Error occurred while loading values for the grid.',
                               type: 'error',
                               cbk: function () {
                               }
                           });
               }
           });
}

function updateSP() {
   // $('#number_of_claimmappings').val(document.getElementById("claimMappingAddTable").rows.length);
    var element = "<div class=\"modal fade\" id=\"messageModal\">\n" +
        "  <div class=\"modal-dialog\">\n" +
        "    <div class=\"modal-content\">\n" +
        "      <div class=\"modal-header\">\n" +
        "        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n" +
        "        <h3 class=\"modal-title\">Modal title</h4>\n" +
        "      </div>\n" +
        "      <div class=\"modal-body\">\n" +
        "        <p>One fine body&hellip;</p>\n" +
        "      </div>\n" +
        "      <div class=\"modal-footer\">\n" +
        "      </div>\n" +
        "    </div>\n" +
        "  </div>\n" +
        "</div>";
    $("#message").append(element);
    validateSPName(false);
}

function updateCustomSP(file) {
//    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/edit_finish.jag";
    if(file != null && file.value != null && file.value.length > 0){
        $('#metadataFileName').val(file.value);
    }
    var str = "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/edit_finish";
    var visibleRoles = null;
    var roles = $('#store-app-visibility').select2('data');
    for (var i = 0; i < roles.length; i++) {
        if (visibleRoles == null) {
            visibleRoles = roles[i].text;
        } else {
            visibleRoles = visibleRoles + "," + roles[i].text;
        }
    }

    var gatewayProperties = JSON.stringify({
                                               "skipGateway": $('#skipgateway').is(':checked'),
                                               "appContext": $('#gw-app-context').val(),
                                               "appUrl": $('#gw-app-url').val()
                                           });

    var storeProperties = JSON.stringify({
                                             "appDisplayName": $('#store-app-name').val(),
                                             "appStoreUrl": $('#store-app-url').val(),
                                             "tags": getTags(),
                                             "visibleRoles": visibleRoles,
                                             "id": $('#app-id').val()
                                         });

    var thumbnailUrl = $('#store-app-thumbnail-url').val();
    var thumbnailFile;
    if ($('#store-app-thumbnail').val() != "") {
        thumbnailFile = $('#store-app-thumbnail')[0].files[0];
    }

    var bannerUrl = $('#store-app-banner-url').val();
    var bannerFile;
    if ($('#store-app-banner').val() != "") {
        bannerFile = $('#store-app-banner')[0].files[0];
    }

    var selected = $("#custom-app-dropdown .dropdown-toggle").text().trim();
    if(selected.trim() == "Proxy".trim()){
        $('#storeAppType').val(APP_PROXY_TYPE);
        $('#enableDefaultAttributeProfileHidden').val(true);
        $('#enableAttributeProfile').prop("checked",true);
        $('#enableAttributeProfile').val(true);
        $('#enableDefaultAttributeProfile').prop("checked",true);
        $('#enableDefaultAttributeProfile').val(true);
        $("#subject_claim_uri").val('');
    } else if(selected.trim() == "Shortcut".trim()){
        $('#storeAppType').val(APP_SHORTCUT_TYPE);
    } else if(selected.trim() == "Agent".trim()){
        $('#storeAppType').val(APP_AGENT_TYPE);
    }
    // getting default acs
    var acsUrls = $("#assertionConsumerURLsTableBody .radio-group");
    var defaultAssertionConsumerURL = null;
    for (var j=0; j< acsUrls.length;j++) {
            if ($(acsUrls[j]).is(':checked')) {
                defaultAssertionConsumerURL = $($("#acsUrl_" + j).find("td")[1]).html();
                break;
            }
    }

    var formData = new FormData();

    formData.append('oldSPName', $('#oldSPName').val());
    formData.append('spName', $('#spName').val());
    formData.append('spType', $('#spType').val());
    formData.append('spDesc', $('#spType').val() + ']' + $('#sp-description').val());
    formData.append('storeAppType', $('#storeAppType').val());

    formData.append('hiddenFields',$('#hiddenFields').val());
    formData.append('enableResponseSignature',$('#enableResponseSignature').val());
    formData.append('issuer',$('#issuer').val());
    formData.append('hiddenIssuer',$('#hiddenIssuer').val());
    formData.append('assertionConsumerURLTxt',$('#assertionConsumerURLTxt').val());
    formData.append('assertionConsumerURLs',$('#assertionConsumerURLs').val());
    formData.append('defaultAssertionConsumerURL',defaultAssertionConsumerURL);
    formData.append('nameIdFormat',$('#nameIdFormat').val());
    formData.append('alias',$('#alias').val());
    formData.append('signingAlgorithm',$('#signingAlgorithm').val());
    formData.append('digestAlgorithm',$('#digestAlgorithm').val());
    formData.append('enableDefaultAttributeProfileHidden',$('#enableDefaultAttributeProfileHidden').val());
    formData.append('audiencePropertyCounter',$('#audiencePropertyCounter').val());
    formData.append('audienceURLs',$('#audienceURLs').val());
    formData.append('recipientPropertyCounter',$('#recipientPropertyCounter').val());
    formData.append('receipientURLs',$('#receipientURLs').val());
    formData.append('idpSLOURLs',$('#idpSLOURLs').val());
    formData.append('attributeConsumingServiceIndex',$('#attributeConsumingServiceIndex').val());
    formData.append('publicCertificate',$('publicCertificate').val());
    if(file != null && file.value != null && file.value.length > 0){
        formData.append('metadataFileName',$('#metadataFileName').val());
        formData.append('metadata', $('input[type=file]')[0].files[0]);
    }

    var checkBoxArr= $("#addServiceProvider input:checkbox");
    for(var checkbox in checkBoxArr){
        formData.append(checkBoxArr[checkbox].id,checkBoxArr[checkbox].value);
    }
 
    var claimData = {};
    var claimDataAry = [];
    var count, claimObj;
    claimData.localClaimDialect = $("#claim_dialect_wso2").is(":checked");
    if (claimData.localClaimDialect) {
        count = parseInt($("#localClaimTableTableBody tr").length);
        for (i = 1; i < count; i++) {
            claimObj = {};
            claimObj.claimUri = $($("#localClaimTableTableBody tr")[i]).find('.idpClaim')[0].value;
            claimObj.claimName = $($("#localClaimTableTableBody tr")[i]).find('.idpClaim')[0].value;
            claimDataAry.push(claimObj);
        }
    } else {
        count = parseInt($("#customClaimTableTableBody tr").length) ;
        for (i = 1; i < count; i++) {
            claimObj = {};
            claimObj.claimUri = $($("#customClaimTableTableBody tr")[i]).find('.idpClaim')[0].value;
            claimObj.claimName = $($("#customClaimTableTableBody tr")[i]).find('.spClaim')[0].value;
            claimDataAry.push(claimObj);
        }
    }
    claimData.data = claimDataAry;
    claimData.count = count;
    claimData.subjectClaim = $("#subject-claim-url").val();
    formData.append('claimConfiguration', JSON.stringify(claimData));


    if ($('#isEditOauthSP').val() == "true") {
        formData.append('consumerID', $('#consumerID').val());
        formData.append('consumerSecret', $('#consumerSecret').val());
    }

    formData.append('passiveSTSRealm', $('#passiveSTSRealm').val());
    formData.append('passiveSTSWReply', $('#passiveSTSWReply').val());
    formData.append('profileConfiguration', 'default');
    formData.append('cookie', cookie);
    formData.append('user', userName);
    formData.append('gatewayProperties', gatewayProperties);
    formData.append('storeProperties', storeProperties);
    formData.append('thumbnailFile', thumbnailFile);
    formData.append('thumbnailUrl', thumbnailUrl);
    formData.append('bannerFile', bannerFile);
    formData.append('bannerUrl', bannerUrl);
    
    $.ajax({
        url: str,
        type: "POST",
        contentType:false,
               processData: false,
               data: formData
    })
        .done(function (data) {
            if($('#metadataFileName').val().length > 0) {
                window.location.href = "/" + ADMIN_PORTAL_NAME + "/serviceprovider/" + $('#spName').val();
            }else{
                window.location.href = "/" + ADMIN_PORTAL_NAME + "/serviceproviders";
            }
        })
        .fail(function () {
            message({
                content: 'Error while updating Profile', type: 'error', cbk: function () {
                }
            });

            $('.connectionStatus').append($(messageContainer).addClass('alert-error').hide()
                .fadeIn('fast').delay(2000).fadeOut('fast'));
            $('.connectionStatus').find('.alert-content').text('Error while updating Profile');

        })
        .always(function () {
            console.log('completed');
        });
}

function getTags(){

    var tags = $("#store-app-tags").val();

    var commaSeperatedTags = "";

    if(tags && tags.length > 0){
      for(var i = 0; i < tags.length; i++){
        commaSeperatedTags = commaSeperatedTags + tags[i] + ",";
      }
    }

    // Remove trailing ',' character.
    if(commaSeperatedTags.length > 0){
      commaSeperatedTags = commaSeperatedTags.substring(0, commaSeperatedTags.length - 1);
    }

    return commaSeperatedTags;
}

function validateSPName() {
    var spName = $("input[id='spName']").val();
    if (spName.length == 0) {
        message({
            content: 'Please provide Service Provider ID', type: 'error', cbk: function () {
            }
        });
        return false;
    } else {
        updateCustomSP();
    }
}

function getRequestParameter(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace(
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function( m, key, value ) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if ( param ) {
        return vars[param] ? vars[param] : null;
    }
    return vars;
}

function showSamlForm(){
    $('#samlConfigBtn').hide();
    $('#addServiceProvider').show();
}

/**
 * Claim Configuration related
 */
function showOauthForm() {
    $('#oauthAttrIndexForm').hide();
    $('#oauthConfigBtn').hide();
    $('#addAppForm').show();
}

function cancelOauthForm() {
    $('#addAppForm').hide();
    if ($('#isEditOauthSP').val() == 'true') {
        $('#oauthAttrIndexForm').show();
        $('#oauthConfigBtn').hide();
    } else {
        $('#oauthAttrIndexForm').hide();
        $('#oauthConfigBtn').show();

    }
}

function deleteOauthConfig() {
    var str = PROXY_CONTEXT_PATH + "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/oauthConfigHandler.jag";
    $.ajax({
        url: str,
        type: "POST",
        data: "&cookie=" + cookie + "&user=" + userName + "&spType=" + $('#spType').val() + "&appName=" + appdata.applicationName + "&clientID=" + $('#consumerID').val() + "&action=removeOauthConfig",
    })
        .done(function (data) {
            //reloadGrid();
            //message({content:'Successfully saved changes to the profile',type:'info', cbk:function(){} });
            preDrawUpdatePage(appdata.applicationName);
        })
        .fail(function () {
            message({
                content: 'Error while updating Profile', type: 'error', cbk: function () {
                }
            });

        })
        .always(function () {
            console.log('completed');
        });
}

function saveOauthConfig(){
//    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/oauthConfigHandler";
    var str = "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/oauthConfigHandler";
    $.ajax({
        url: str,
        type: "POST",
        data: $("#addAppForm").serialize() + "&action=addOauthConfig" + "&spType=" + $('#spType').val() + "&appName=" + appdata.applicationName + "&isEditSP="+$('#isEditOauthSP').val()+"&cookie=" + cookie + "&user=" + userName,
    })
        .done(function (data) {
            //message({content:'Successfully saved changes to the profile',type:'info', cbk:function(){} });
            preDrawUpdatePage(appdata.applicationName);
        })
        .fail(function () {
            message({
                content: 'Error while updating Profile', type: 'error', cbk: function () {
                }
            });

        })
        .always(function () {
            console.log('completed');
        });

}

$(document).ready(function () {
    $("#store-app-visibility").select2({
        data: getRoles(),
        multiple: true,
        allowClear: true,
        placeholder: 'Type in a user role',
        width: '100%',
        theme: "classic"
    });

    $("#store-app-tags").select2({
        tags:true,
        data:getAllTags(),
        tokenSeparators: [',', ' '],
        width: '100%',
        theme: "classic"
    });

});

function checkhttps(url){
    var urlregex = getPattern("https-url");
    return urlregex.test(url);
}
function checkhttp(url){
    var urlregex = getPattern("http-url");
    return urlregex.test(url);
}

var showWarning = false;
var showedOnce = false;
$(document).on('keypress','#callback',function() {
    var messageContainer = "<label class='' for='callback' role='alert'>" +
        "<span class='alert-content'></span></label>";
    var callback = $(this).val();

    showWarning = checkhttp(callback);
    if (!showedOnce && showWarning) {
        $('.callbackStatus').html($(messageContainer).addClass('warning'));
        $('.callbackStatus').find('.alert-content')
            .text('Your connection is not secure. Use https.');
        showedOnce = true;
    } else if (checkhttps(callback)) {
        $('.callbackStatus').html('');
        showedOnce = false;
    }
});
function getRoles() {
    var apiPath = "/admin/apps/getRoles";
    var roles;
    $.ajax({
               url: apiPath,
               type: 'GET',
               async: false,
               success: function (data) {
                   roles = JSON.parse(data);
               }
           });
    return roles
}

function getAllTags() {
    var apiPath = "/admin/apps/getTags";
    var tags;
    $.ajax({
               url: apiPath,
               type: 'GET',
               async: false,
               success: function (data) {
                   tags = JSON.parse(data);
               }
           });

    var tagNames = [];
    if(tags){
      for(var i = 0; i < tags.length; i++){
        tagNames.push(tags[i].name);
      }
    }
    return tagNames;
}

function getAppType(appdata){
    var sptype = CUSTOM_SP;
    var spProperties = appdata.spProperties;
    if(spProperties != null) {
        if (spProperties.constructor !== Array) {
            spProperties = [spProperties];
        }
        for (var i in spProperties) {
            var property = spProperties[i];
            if (property.name == WELLKNOWN_APPLICATION_TYPE && property.value != null && property.value.length > 0) {
                sptype = property.value;
                break;
            }
        }
    }
    return sptype;
}

function getStoreAppType(data){
    var customProperties = data.customProperties;
    if (customProperties != null && customProperties.constructor !== Array){
        customProperties = [customProperties];
    }
    for(var prop in customProperties){
        var property = customProperties[prop];
        if(property.name == STORE_APP_TYPE){
            return property.value;
        }
    }
    return APP_AGENT_TYPE;
}

function disableForm(){
    $('.app-edit-form').find('input, textarea, button, select, a').attr('disabled','disabled');
}

function showGotoStoreMsg() {
    var gotoStoreMsg = $(
        '<div class="message message-info">'+
            '<span><i class="icon fw fw-warning"></i>You can test SSO on sample applications by visiting the <a href="'+USER_PORTAL_LINK+'" target="_blank" class="link-underline">user portal</a> with ' +
            '<a href="../directories/sampleusers" target="_blank" class="link-underline">sample user credentials</a> on a private browser window or by signing out.</span>'+
        '</div>');

    $("#goto-store-msg").html( gotoStoreMsg);
}

function advanceSettings() {
    if ($("#advanced-settings").is(":visible")) {
        $("#advanced-settings").slideToggle(1000);
        $("#btn-advance-setting").html('<i class="fw fw-down"></i> Show Advance Settings');
    } else {
        $("#advanced-settings").slideToggle(1000);
        $("#btn-advance-setting").html('<i class="fw fw-up"></i>&nbsp;&nbsp;Hide Advance Settings');
    }
}
