function preDrawOAuthConfigPage() {
    var clientID = "";
    var clientSecret = "";
    var isEditSP = false;
    if (appdata != null && appdata.inboundAuthenticationConfig != null
        && appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs != null) {
        for (var i in appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs) {
            var inboundConfig = appdata.inboundAuthenticationConfig.inboundAuthenticationRequestConfigs[i];
            if (inboundConfig.inboundAuthType == "oauth2" && inboundConfig.inboundAuthKey.length > 0) {
                clientID = inboundConfig.inboundAuthKey;
                if (inboundConfig.properties.constructor !== Array) {
                    var arr = [];
                    arr[0] = inboundConfig.properties;
                    inboundConfig.properties = arr;
                }
                for (var prop in inboundConfig.properties) {
                    if (inboundConfig.properties[prop].name == 'oauthConsumerSecret') {
                        clientSecret = inboundConfig.properties[prop].value;
                    }
                }
                isEditSP = true;
            }
        }
    }
    //+ "&appName=" + json.return.applicationName + "&clientID=" + clientID,
    $('#isEditOauthSP').val(isEditSP);
    if (isEditSP) {
        $('#oauthAttrIndexForm').show();
        $('#oauthConfigBtn').hide();
        $('#oauthRgsterBtn').hide();
        $('#oauthUpdtBtn').show();
        $.ajax({
            url: "/dashboard/serviceproviders/custom/controllers/custom/oauthConfigHandler.jag",
            type: "GET",
            data: "&cookie=" + cookie + "&user=" + userName + "&appName=" + appdata.applicationName + "&clientID=" + clientID + "&action=getOAuthConfigs",
            success: function (data) {
                oauthClient = $.parseJSON(data);
                allowedGrantTypes = oauthClient.grantTypes;
                drawOAuthEditPage();
            },
            error: function (e) {
                message({
                    content: 'Error occurred while getting the service provider configuration.',
                    type: 'error',
                    cbk: function () {
                    }
                });
            }
        });
    } else {
        $('#oauthAttrIndexForm').hide();
        $('#oauthConfigBtn').show();
        $('#oauthRgsterBtn').show();
        $('#oauthUpdtBtn').hide();
        $.ajax({
            url: "/dashboard/serviceproviders/custom/controllers/custom/oauthConfigHandler.jag",
            type: "GET",
            data: "&cookie=" + cookie + "&user=" + userName + "&action=getOAuthConfigs",
            success: function (data) {
                oauthClient = $.parseJSON(data);
                allowedGrantTypes = oauthClient.grantTypes;
                drawOAuthConfigPage();
            },
            error: function (e) {
                message({
                    content: 'Error occurred while getting the service provider configuration.',
                    type: 'error',
                    cbk: function () {
                    }
                });
            }
        });
    }
}

function drawOAuthConfigPage() {
    var page = "";
    var applicationSPName = appdata.applicationName;
    if (applicationSPName != null && applicationSPName.length > 0) {
        $('#application').val(applicationSPName);
        $('#application').hide();
    } else {
        $('#application').show();
        $('#appnamehid').show();
    }
    var versionRow = '<label for="oauthVersion">OAuth Version' +
        '<span class="required">*</span>' +
        '</label>' +
        '<div class="">' +
        '<label class="radio-inline">'+
        '<input id="oauthVersion10a" type="radio" value="OAuth-1.0a" name="oauthVersion"> 1.0a' +
        '</label>' +
        '<label class="radio-inline">' +
        '<input id="oauthVersion20" type="radio" checked="" value="OAuth-2.0" name="oauthVersion"> 2.0' +
        '</label>'+
        '</div>';
    $('#versionRow').empty();
    $('#versionRow').append(versionRow);
    var grantRow = '<label for="grantTypes">Allowed Grant Types </label>' +
        '<div>';
    if ($.inArray('authorization_code', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_code" name="grant_code" value="authorization_code" checked="checked" onclick="toggleCallback()"/>Code</label></div>';
    }
    if ($.inArray('implicit', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_implicit" name="grant_implicit" value="implicit" checked="checked" onclick="toggleCallback()"/>Implicit</label></div>';
    }
    if ($.inArray('password', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_password" name="grant_password" value="password" checked="checked"/>Password</lable></div>';
    }
    if ($.inArray('client_credentials', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_client" name="grant_client" value="client_credentials" checked="checked"/>Client Credential</label></div>';
    }
    if ($.inArray('refresh_token', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_refresh" name="grant_refresh" value="refresh_token" checked="checked"/>Refresh Token</label></div>';
    }
    if ($.inArray('urn:ietf:params:oauth:grant-type:saml1-bearer', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_saml1" name="grant_saml1" value="urn:ietf:params:oauth:grant-type:saml1-bearer" checked="checked"/>SAML1</label></div>';
    }
    if ($.inArray('urn:ietf:params:oauth:grant-type:saml2-bearer', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_saml2" name="grant_saml2" value="urn:ietf:params:oauth:grant-type:saml2-bearer" checked="checked"/>SAML2</label></div>';
    }
    if ($.inArray('iwa:ntlm', allowedGrantTypes) > 0) {
        grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_ntlm" name="grant_ntlm" value="iwa:ntlm" checked="checked"/>IWA-NTLM</label></div>';
    }

    grantRow = grantRow + '</div>';
    $('#grant_row').empty();
    $('#grant_row').append(grantRow);
    if (oauthClient.isPKCESupportEnabled == 'true') {
        $('#pkce_enable').show();
        $('#pkce_support_plain').show();
    }
    $('#oauthRgsterBtn').show();
    $('#addAppForm').hide();
    $('#oauthUpdtBtn').hide();
    $('#oauthHiddenFields').empty();
//TODO : check the following condition if needed for cancel button
//
//        <%
//
//        boolean applicationComponentFound = CarbonUIUtil.isContextRegistered(config, "/application/");
//    if (applicationComponentFound) {
//    %>
//    <input type="button" class="button"
//        onclick="javascript:location.href='../application/configure-service-provider.jsp?spName=<%=Encode.forUriComponent(applicationSPName)%>'"
//        value="<fmt:message key='cancel'/>"/>
//            <% } else { %>
//
//    <input type="button" class="button"
//        onclick="javascript:location.href='index.jsp?region=region1&item=oauth_menu&ordinal=0'"
//        value="<fmt:message key='cancel'/>"/>
//            <%} %>
//</td>
//    </tr>
//    </tbody>
//    </table>
//
//    </form>
//    </div>
//    </div>

    jQuery(document).ready(function () {
        //on load adjust the form based on the current settings
        adjustForm();
        $(jQuery("#addAppForm input")).change(adjustForm);
    })

}

function drawOAuthEditPage() {
    var VERSION_2 = 'OAuth-2.0';
    var VERSION_1 = 'OAuth-1.0a';
    var app = oauthClient.app;
    var applicationSPName = appdata.applicationName;
    var codeGrant = false;
    var implicitGrant = false;
    var passowrdGrant = false;
    var clientCredGrant = false;
    var refreshGrant = false;
    var samlGrant1 = false;
    var samlGrant2 = false;
    var ntlmGrant = false;
    if (VERSION_2 == app.OAuthVersion) {
        var grants = app.grantTypes;
        if (grants != null) {
            codeGrant = grants.indexOf("authorization_code") > -1 ? true : false;
            implicitGrant = grants.indexOf("implicit") > -1 ? true : false;
            passowrdGrant = grants.indexOf("password") > -1 ? true : false;
            clientCredGrant = grants.indexOf("client_credentials") > -1 ? true : false;
            refreshGrant = grants.indexOf("refresh_token") > -1 ? true : false;
            samlGrant1 = grants.indexOf("urn:ietf:params:oauth:grant-type:saml1-bearer") > -1 ? true : false;
            samlGrant2 = grants.indexOf("urn:ietf:params:oauth:grant-type:saml2-bearer") > -1 ? true : false;
            ntlmGrant = grants.indexOf("iwa:ntlm") > -1 ? true : false;
        }
    }
    var hiddenFields = '<input id="consumerkey" name="consumerkey" type="hidden" />'+
        '<input id="consumersecret" name="consumersecret" type="hidden" />'+
        '<input id="oauthVersion" name="oauthVersion" type="hidden" />';
    $('#oauthHiddenFields').empty();
    $('#oauthHiddenFields').append(hiddenFields);
    $('#consumerID').val(app.oauthConsumerKey);
    $('#consumerSecret').val(app.oauthConsumerSecret);
    //$('#addAppForm h4').html('View/Update application settings');
    //$('#addAppForm h5').html('Application Settings');
    $('#consumerkey').val(app.oauthConsumerKey);
    $('#consumersecret').val(app.oauthConsumerSecret);
    $('#oauthVersion').val(app.OAuthVersion);
    var versionRow = '<label for="oauthVersion">OAuth Version' +
        '<span class="required">*</span>' +
        '</label>' +
        '<div class="col-sm-10">' +
        '<label class="col-sm-2 control-label">' + app.OAuthVersion +'</label>'+
        '</div>';
    $('#versionRow').empty();
    $('#versionRow').append(versionRow);

    if (applicationSPName == null) {
        $('#application').val(app.applicationName);
        $('#appnamehid').show();
    } else {
        $('#application').val(applicationSPName);
        $('#appnamehid').hide();
    }
    $('#callback').val(app.callbackUrl);
    var body = "";
    if (app.OAuthVersion == VERSION_1 || codeGrant || implicitGrant) {
        $(jQuery('#callback_row')).attr('style', '');
    } else {
        $(jQuery('#callback_row')).attr('style', 'display:none');
    }

    if (app.OAuthVersion == VERSION_2) {
        $('#grant_row').show();
        $('#pkce_enable').show();
        $('#pkce_support_plain').show();
        var grantRow = '<label for="grantTypes" >Allowed Grant Types </label>' +
            '<div>';
        if ($.inArray('authorization_code', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_code" name="grant_code" value="authorization_code"';
            if (codeGrant) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>Code</label></div>';
        }
        if ($.inArray('implicit', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_implicit" name="grant_implicit" value="implicit"';
            if (implicitGrant) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>Implicit</label></div>';
        }
        if ($.inArray('password', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_password" name="grant_password" value="password"';
            if (passowrdGrant) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>Password</label></div>';
        }
        if ($.inArray('client_credentials', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_client" name="grant_client" value="client_credentials"';
            if (clientCredGrant) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>Client Credential</label></div>';
        }
        if ($.inArray('refresh_token', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_refresh" name="grant_refresh" value="refresh_token"';
            if (refreshGrant) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>Refresh Token</label></div>';
        }
        if ($.inArray('urn:ietf:params:oauth:grant-type:saml1-bearer', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_saml1" name="grant_saml1" value="urn:ietf:params:oauth:grant-type:saml1-bearer"';
            if (samlGrant1) {
                grantRow = grantRow + "checked=\"checked\""
            }
            grantRow = grantRow + '/>SAML1</label></div>';
        }
        if ($.inArray('urn:ietf:params:oauth:grant-type:saml2-bearer', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_saml2" name="grant_saml2" value="urn:ietf:params:oauth:grant-type:saml2-bearer"';
            if (samlGrant2) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>SAML2</label></div>';
        }
        if ($.inArray('iwa:ntlm', allowedGrantTypes) > 0) {
            grantRow = grantRow + '<div class="checkbox"><label><input class="custom-checkbox custom-checkbox-white" type="checkbox" id="grant_ntlm" name="grant_ntlm" value="iwa:ntlm"';
            if (ntlmGrant) {
                grantRow = grantRow + "checked=\"checked\"";
            }
            grantRow = grantRow + '/>IWA-NTLM</label></div>';
        }
        grantRow = grantRow + '</div>';
        $('#grant_row').empty();
        $('#grant_row').append(grantRow);

        if (oauthClient.isPKCESupportEnabled) {
            if (app.pkceMandatory == 'true') {
                $('#pkce').prop('checked', true);
            } else {
                $('#pkce').prop('checked', false);
            }

            if (app.pkceSupportPlain == 'true') {
                $('#pkce_plain').prop('checked', true);
            } else {
                $('#pkce_plain').prop('checked', false);
            }
        }
    } else {
        $('#grant_row').hide();
        $('#pkce_enable').hide();
        $('#pkce_support_plain').hide();
    }
    jQuery(document).ready(function () {
        //on load adjust the form based on the current settings
        adjustFormEdit();
        $("form[name='addAppForm']").change(adjustFormEdit);
    });
    cancelOauthForm();
}

function onClickAdd() {
    var version2Checked = document.getElementById("oauthVersion20").checked;
    if (($(jQuery("#grant_code"))[0] != null && $(jQuery("#grant_code"))[0].checked) || ($(jQuery("#grant_implicit"))[0] && $(jQuery("#grant_implicit"))[0].checked)) {
        var callbackUrl = document.getElementById('callback').value;
        if (callbackUrl.trim() == '') {
            //CARBON.showWarningDialog('<fmt:message key="callback.is.required"/>');
            return false;
        } else {
            validate();
        }
    } else {
        var callbackUrl = document.getElementsByName("callback")[0].value;
        if (!version2Checked) {
            if (callbackUrl.trim() == '') {
                // CARBON.showWarningDialog('<fmt:message key="callback.is.required"/>');
                return false;
            }
        }
        validate();
    }
}

function validate() {
    //var callbackUrl = document.getElementById('callback').value;
    //if ($(jQuery("#grant_code"))[0].checked || $(jQuery("#grant_implicit"))[0].checked) {
    //    if (!isWhiteListed(callbackUrl, ["url"]) || !isNotBlackListed(callbackUrl,
    //            ["uri-unsafe-exists"])) {
    //        //CARBON.showWarningDialog('<fmt:message key="callback.is.not.url"/>');
    //        return false;
    //    }
    //}
    //var value = document.getElementsByName("application")[0].value;
    //if (value == '') {
    //    //CARBON.showWarningDialog('<fmt:message key="application.is.required"/>');
    //    return false;
    //}
    //var version2Checked = document.getElementById("oauthVersion20").checked;
    //if (version2Checked) {
    //    if (!$(jQuery("#grant_code"))[0].checked && !$(jQuery("#grant_implicit"))[0].checked) {
    //        document.getElementsByName("callback")[0].value = '';
    //    }
    //} else {
    //    if (!isWhiteListed(callbackUrl, ["url"]) || !isNotBlackListed(callbackUrl,
    //            ["uri-unsafe-exists"])) {
    //        //CARBON.showWarningDialog('<fmt:message key="callback.is.not.url"/>');
    //        return false;
    //
    //    }
    //}
    saveOauthConfig();
}

function adjustForm() {
    var VERSION_2 = 'OAuth-2.0';
    var VERSION_1 = 'OAuth-1.0a';
    var oauthVersion = $('input[name=oauthVersion]:checked').val();
    var supportGrantCode = $('input[name=grant_code]:checked').val() != null;
    var supportImplicit = $('input[name=grant_implicit]:checked').val() != null;

    if (oauthVersion == VERSION_1) {
        $(jQuery('#grant_row')).empty();
        $(jQuery('#callback_row')).show();
        $(jQuery("#pkce_enable").hide());
        $(jQuery("#pkce_support_plain").hide());
    } else if (oauthVersion == VERSION_2) {
        $(jQuery('#grant_row')).show();
        $(jQuery("#pkce_enable").show());
        $(jQuery("#pkce_support_plain").show());

        if (!supportGrantCode && !supportImplicit) {
            $(jQuery('#callback_row')).hide();
        } else {
            $(jQuery('#callback_row')).show();
        }
        if (supportGrantCode) {
            $(jQuery("#pkce_enable").show());
            $(jQuery("#pkce_support_plain").show());
        } else {
            $(jQuery("#pkce_enable").hide());
            $(jQuery("#pkce_support_plain").hide());
        }
    }

}
//<EDIT OAUTH>
function onClickUpdate() {
    validateEdit(); //uncomment above and remove this line
}

function validateEdit() {
    saveOauthConfig(); //uncomment above but don't remove this line
}

function adjustFormEdit() {
    if($('#isEditOauthSP').val() == "false"){
        return false;
    }
    var oauthVersion = $('input[name=oauthVersion]:checked').val();
    var supportGrantCode = $('input[name=grant_code]:checked').val() != null;
    var supportImplicit = $('input[name=grant_implicit]:checked').val() != null;

    if (!supportGrantCode && !supportImplicit) {
        $(jQuery('#callback_row')).hide();
    } else {
        $(jQuery('#callback_row')).show();
    }
    if (supportGrantCode) {
        $(jQuery("#pkce_enable").show());
        $(jQuery("#pkce_support_plain").show());
    } else {
        $(jQuery("#pkce_enable").hide());
        $(jQuery("#pkce_support_plain").hide());
    }

}

function showHidePassword(element, inputId){
    if($('#secretSpan').html()=='Show'){
        document.getElementById(inputId).type = 'text';
        $('#secretSpan').html('Hide');
    }else{
        document.getElementById(inputId).type = 'password';
        $('#secretSpan').html('Show');
    }
}