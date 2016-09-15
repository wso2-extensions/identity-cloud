function drawUpdatePage() {
    if (appdata != null) {
        $('#spName').val(appdata.applicationName);
        $('#oldSPName').val(appdata.applicationName);
        var spDescription = appdata.description;
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
                }
            }
        }
        if (spDescription.indexOf(']') > -1) {
            spDescription = spDescription.split(']') [1];
        }
        $('#sp-description').val(spDescription);
        $('#spType').val(sptype);
        if (sptype == CUSTOM_SP) {
            $('#gw-config-section').show();
        }
        preDrawClaimConfig();
        var samlsp;
        if (appdata != null && appdata.inboundAuthenticationConfig != null && appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs != null) {
            if (appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs.constructor !== Array) {
                appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs = [appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs];
            }
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

function preDrawUpdatePage(appName) {
    $.ajax({
        url: "/dashboard/serviceproviders/getsp/" + appName,
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName + "&spName=" + appName,
        success: function (data) {
            appdata = $.parseJSON(data).return;
            drawUpdatePage();
        },
        error: function (e) {
            message({
                content: 'Error occurred while loading values for the grid.', type: 'error', cbk: function () {
                }
            });
        }
    });

}

function updateSP() {
    $('#number_of_claimmappings').val(document.getElementById("claimMappingAddTable").rows.length);
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

function updateCustomSP() {
//    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/edit_finish.jag";
    var str = "/dashboard/serviceproviders/custom/controllers/custom/edit_finish";
    var parameters = '&' + $("#addServiceProvider").serialize();

    var gatewayProperties = JSON.stringify({
                                               "skipGateway": $('#skipgateway').is(':checked'),
                                               "appContext": $('#gw-app-context').val(),
                                               "appUrl": $('#gw-app-url').val()
                                           });

    var storeProperties = JSON.stringify({
                                             "appDisplayName": $('#store-app-name').val(),
                                             "appStoreUrl": $('#store-app-url').val(),
                                             "tags": $('#store-app-tags').val(),
                                             "visibility": $('#store-app-visibility').val()
                                         });

    if ($('#isEditOauthSP').val() == "true") {
        parameters = parameters + "&consumerID=" + $('#consumerID').val() + "&consumerSecret=" + $('#consumerSecret').val();
    }
    parameters = parameters + "&passiveSTSRealm=" + $('#passiveSTSRealm').val() + "&passiveSTSWReply=" + $('#passiveSTSWReply').val();
    $.ajax({
        url: str,
        type: "POST",
               data: $('#claimConfigForm').serialize() + "&oldSPName=" + $('#oldSPName').val() + "&spName="
                     + $('#spName').val() + "&spType=" + $('#spType').val() + "&spDesc=" + $('#spType').val() + ']'
                     + $('#sp-description').val() + parameters + "&profileConfiguration=default" + "&cookie=" + cookie
                     + "&user=" + userName + "&gatewayProperties=" + gatewayProperties + "&storeProperties="
                     + storeProperties,
    })
        .done(function (data) {
//            window.location.href = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders";
            window.location.href = "/dashboard/serviceproviders";
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

function validateSPName() {
    var spName = $("input[id='spName']").val();
    if (spName.length == 0) {
        alert('Error occured. PLease provide the message box properly. Dev Issue');
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
    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/oauthConfigHandler.jag";
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
    console.log('######################## saveOauthConfig');
//    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/oauthConfigHandler";
    var str = "/dashboard/serviceproviders/custom/controllers/custom/oauthConfigHandler";
    $.ajax({
        url: str,
        type: "POST",
        data: $("#addAppForm").serialize() + "&action=addOauthConfig" + "&spType=" + $('#spType').val() + "&appName=" + appdata.applicationName + "&isEditSP="+$('#isEditOauthSP').val()+"&cookie=" + cookie + "&user=" + userName,
    })
        .done(function (data) {
            //message({content:'Successfully saved changes to the profile',type:'info', cbk:function(){} });
            $('#addAppForm').hide();
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

function uploadFile(file){
    $('#metadataFileName').val(file.value);

    var formData = new FormData();
    formData.append('file', $('input[type=file]')[0].files[0]);
    formData.append('cookie',cookie);
    formData.append('userName', userName);
    formData.append('clientAction','addSPConfigByMetadata');
    formData.append('spName',$('#oldSPName').val());
    formData.append('spType',$('#spType').val())


//    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/samlSSOConfigClient";
    var str = "/dashboard/serviceproviders/custom/controllers/custom/samlSSOConfigClient";
    $.ajax({
        url: str,
        type: 'POST',
        data: formData,
        success: function (data) {
            location.reload();
        },
        contentType: false,
        processData: false
    }).done(function (data) {

    })
        .fail(function () {
            message({
                content: 'Error while loading configurations from metadata', type: 'error', cbk: function () {
                }
            });

        })
        .always(function () {
            console.log('completed');
        });
}