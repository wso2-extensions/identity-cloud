function preDrawSAMLConfigPage(samlsp) {
    serviceProviders = null;
    spConfigClaimUris = null;
    spConfigCertificateAlias = null;
    spConfigSigningAlgos = null;
    spConfigDigestAlgos = null;
    signingAlgorithmUriByConfig = null;
    digestAlgorithmUriByConfig = null;

    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/samlSSOConfigClient",
        type: "GET",
        data: "&user=" + userName,
        success: function (data) {
            samlClient = $.parseJSON(data);
            var tableTitle = "Configurations";
            var isEditSP = false;
            var issuer = samlsp.inboundAuthKey;
            if (samlsp.inboundAuthKey != null && samlsp.inboundAuthKey.length > 0) {
                isEditSP = true;
            }
            //have to set
            $('#isEditSp').val(isEditSP);
            spConfigClaimUris = samlClient.claimURIs;
            spConfigCertificateAlias = samlClient.certAliases;
            spConfigSigningAlgos = samlClient.signingAlgos;
            spConfigDigestAlgos = samlClient.digestAlgos;
            signingAlgorithmUriByConfig = samlClient.signingAlgo;
            digestAlgorithmUriByConfig = samlClient.digestAlgo;
            samlClient.storeUrl = samlClient.storeUrl + issuer;
            drawSAMLConfigPage(issuer, isEditSP, tableTitle, samlsp);
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

function drawSAMLConfigPage(issuer, isEditSP, tableTitle, samlsp) {
    var providerProps = {};
    var hiddenFields = [];
    for (var i in samlsp.properties) {
        var prop = samlsp.properties[i];
        providerProps[prop.name] = prop;
    }
    //$('#addServiceProvider h4').html(tableTitle);
    if (providerProps["issuer"] != null && providerProps["issuer"].value.length > 0) {
        issuer = providerProps["issuer"].value;
    }
    $('#issuer').val(issuer);
    $('#hiddenIssuer').val(issuer);
    if (isEditSP) {
        $('#issuer').prop('readonly', true);
    } else {
        $('#issuer').prop('readonly', false);
    }


    if (providerProps["assertionConsumerURLs"] != null && providerProps["assertionConsumerURLs"].value.length > 0) {
        var assertionConsumerURLTblRow =
            '        <table id="assertionConsumerURLsTable" style="margin-bottom: 3px;" class=" table table-bordred  ">' +
            '            <tbody id="assertionConsumerURLsTableBody">' +
            '          <tr><th>Default</th><th>Assertion Consumer URL</th> <th class="delete-col">Action</th> </tr> ' ;


        var acsColumnId = 0;
        var defaultAssertionConsumerURLRow = "<option value=\"\">---Select---</option>\n";
        var acsUrls = [];
        if (providerProps["assertionConsumerURLs"].value.indexOf(',') > -1) {
            acsUrls = providerProps["assertionConsumerURLs"].value.split(',');
        } else {
            acsUrls = [providerProps["assertionConsumerURLs"].value]
        }
        acsUrls.reverse();
        for (var i in acsUrls) {
            var assertionConsumerURL = acsUrls[i];
            var trow
            if (providerProps["defaultAssertionConsumerURL"].value === assertionConsumerURL) {
                trow = '<tr id="acsUrl_' + acsColumnId + '">' +
                    '</td><td>' + '<input type="radio"   name="radio" class="radio-group"   checked/>' +
                    '</td><td>' + assertionConsumerURL + '</td>' +
                    '<td><a onclick="removeAssertionConsumerURL (\'' + assertionConsumerURL + '\', \'acsUrl_' + acsColumnId + '\');return false;"' +
                    'href="#" class="delete-link"  > <i class="fw fw-delete"></i> Delete </a></td></tr>';
            } else {
                trow = '<tr id="acsUrl_' + acsColumnId + '">' +
                    '</td><td>' + '<input type="radio"   name="radio" class="radio-group" />' +
                    '</td><td>' + assertionConsumerURL + '</td>' +
                    '<td><a onclick="removeAssertionConsumerURL (\'' + assertionConsumerURL + '\', \'acsUrl_' + acsColumnId + '\');return false;"' +
                    'href="#" class="delete-link"> <i class="fw fw-delete"></i> Delete </a></td></tr>';
            }


            assertionConsumerURLTblRow = assertionConsumerURLTblRow + trow;
            acsColumnId++;

            var option = "";
            if (assertionConsumerURL == providerProps["defaultAssertionConsumerURL"].value) {
                option = "<option value=\"" + assertionConsumerURL + "\" selected>" + assertionConsumerURL + "</option>";
            } else {
                option = "<option value=\"" + assertionConsumerURL + "\">" + assertionConsumerURL + "</option>";
            }
            defaultAssertionConsumerURLRow = defaultAssertionConsumerURLRow + option;
        }

        assertionConsumerURLTblRow = assertionConsumerURLTblRow + '</tbody></table>';
        $('#assertionConsumerURLs').val(providerProps["assertionConsumerURLs"].value);
        $('#currentColumnId').val(acsColumnId);
        $('#assertionConsumerURLTblRow').empty();
        $('#assertionConsumerURLTblRow').append(assertionConsumerURLTblRow);
        $('#defaultAssertionConsumerURL').empty();
        $('#defaultAssertionConsumerURL').append(defaultAssertionConsumerURLRow);
    }
    var nameIDVal = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress";
    if (providerProps["nameIdFormat"].value.length > 0) {
        nameIDVal = providerProps["nameIdFormat"].value.replace(/\//g, ":");
    }
    $('#nameIdFormat').val(nameIDVal);
    var certificateAliasRow = "";
    var aliasSet = spConfigCertificateAlias;
    if (providerProps["alias"] != null && providerProps["alias"].value.length > 0) {
        if (aliasSet != null) {
            for (var i in aliasSet) {
                var alias = aliasSet[i];
                if (alias != null) {
                    if (alias == providerProps["alias"].value) {
                        certificateAliasRow = certificateAliasRow + '<option selected="selected" value="' + alias + '">' + alias +
                            '</option>\n';
                    } else {
                        certificateAliasRow = certificateAliasRow + '<option value="' + alias + '">' + alias + '</option>\n';
                    }
                }
            }
        }
        $('#alias').empty();
        $('#alias').append(certificateAliasRow);
    } else {
        if (aliasSet != null) {
            for (var i in aliasSet) {
                var alias = aliasSet[i];
                if (alias != null) {
                    if (alias == 'wso2carbon.cert') {
                        certificateAliasRow = certificateAliasRow + '<option selected="selected" value="' + alias + '">' + alias +
                            '</option>\n';
                    } else {
                        certificateAliasRow = certificateAliasRow + '<option value="' + alias + '">' + alias + '</option>\n';
                    }
                }
            }
        }
        $('#alias').empty();
        $('#alias').append(certificateAliasRow);
    }

    var publicCertificate = "";
    if (providerProps["publicCertificate"] != null && providerProps["publicCertificate"].value.length > 0) {
        publicCertificate = providerProps["publicCertificate"].value;
    }
    $('#publicCertificate').text(publicCertificate);

    var defaultSigningAlgorithmRow = "";
    var signAlgorithm = null;
    if (providerProps["signingAlgorithm"] != null && providerProps["signingAlgorithm"].value.length > 0) {
        signAlgorithm = providerProps["signingAlgorithm"].value;
    }
    else {
        signAlgorithm = signingAlgorithmUriByConfig;
    }
    if (spConfigSigningAlgos != null) {
        for (var i in spConfigSigningAlgos) {
            var signingAlgo = spConfigSigningAlgos[i];

            if (signAlgorithm != null && signingAlgo == signAlgorithm) {
                defaultSigningAlgorithmRow = defaultSigningAlgorithmRow + '<option value="' + signingAlgo + '" selected>\n' +
                    signingAlgo + '</option>';
            } else {
                defaultSigningAlgorithmRow = defaultSigningAlgorithmRow + '<option value="' + signingAlgo + '">' + signingAlgo +
                    '</option>\n';
            }
        }
    }
    $('#signingAlgorithm').empty();
    $('#signingAlgorithm').append(defaultSigningAlgorithmRow);

    var digestAlgorithmRow = "";
    var digestAlgorithm = "";
    if (providerProps["digestAlgorithm"] != null && providerProps["digestAlgorithm"].value.length > 0) {
        digestAlgorithm = providerProps["digestAlgorithm"].value;
    } else {
        digestAlgorithm = digestAlgorithmUriByConfig;
    }
    if (spConfigDigestAlgos != null) {
        for (var i in spConfigDigestAlgos) {
            var digestAlgo = spConfigDigestAlgos[i];
            if (digestAlgorithm != "" && digestAlgo == digestAlgorithm) {
                digestAlgorithmRow = digestAlgorithmRow + '<option value="' + digestAlgo + '" selected>' + digestAlgo +
                    '</option>';
            } else {
                digestAlgorithmRow = digestAlgorithmRow + '<option value="' + digestAlgo + '">' + digestAlgo +
                    '</option>';
            }
        }
    }
    $('#digestAlgorithm').empty();
    $('#digestAlgorithm').append(digestAlgorithmRow);
    //start from here
    if (appStatus !== "new") {
        if (providerProps["enableResponseSignature"] != null && providerProps["enableResponseSignature"].value == 'true') {
            $('#enableResponseSignature').prop('checked', true);
            $('#enableResponseSignature').val(true);
        } else {
            $('#enableResponseSignature').prop('checked', false);
            $('#enableResponseSignature').val(false);
        }

        if (providerProps["enableSigValidation"] != null && providerProps["enableSigValidation"].value == 'true') {
            $('#enableSigValidation').prop('checked', true);
            $('#enableSigValidation').val(true);
        } else {
            $('#enableSigValidation').prop('checked', false);
            $('#enableSigValidation').val(false);
        }
        if (providerProps["enableEncAssertion"] != null && providerProps["enableEncAssertion"].value == 'true') {
            $('#enableEncAssertion').prop('checked', true);
            $('#enableEncAssertion').val(true);
        } else {
            $('#enableEncAssertion').prop('checked', false);
            $('#enableEncAssertion').val(false);
        }
        if (providerProps["enableSingleLogout"] != null && providerProps["enableSingleLogout"].value == 'true') {
            $('#enableSingleLogout').prop('checked', true);
            $('#enableSingleLogout').val(true);
            $('#sloResponseURL').prop('disabled', false);
            $('#sloRequestURL').prop('disabled', false);
            if (providerProps["sloResponseURL"] != null && providerProps["sloResponseURL"].value.length > 0) {
                $('#sloResponseURL').val(providerProps["sloResponseURL"].value);
            }
            if (providerProps["sloRequestURL"] != null && providerProps["sloRequestURL"].value.length > 0) {
                $('#sloRequestURL').val(providerProps["sloRequestURL"].value);
            }
        } else {
            $('#enableSingleLogout').prop('checked', false);
            $('#enableSingleLogout').val(false);
            //$('#sloResponseURL').prop('disabled', true);
           // $('#sloRequestURL').prop('disabled', true);
            $('#sloResponseURL').val("");
            $('#sloRequestURL').val("");
        }

    var appClaimConfigs = appdata.claimConfig.claimMappings;
    var requestedClaimsCounter = 0;
    if (appClaimConfigs != null) {
        if (appClaimConfigs.constructor !== Array) {
            appClaimConfigs = [appClaimConfigs];
        }

        for (var i in appClaimConfigs) {
            var tempClaim = appClaimConfigs[i];
            if (tempClaim.requested == 'true') {
                requestedClaimsCounter = requestedClaimsCounter + 1;
            }
        }
    }
    //spConfigClaimUris
    var applicationSPName = appdata.applicationName;
    var show = false;
    if (applicationSPName == null || applicationSPName.length == 0) {
        if (requestedClaimsCounter > 0) {
            show = true;
        }
    } else {
        show = true;
    }

    if (providerProps["acsindex"] != null && providerProps["acsindex"].value.length > 0) {
        $('#attributeConsumingServiceIndex').val(providerProps["acsindex"].value);
    }
    if (show) {
        if (providerProps["enableAttributeProfile"] != null && providerProps["enableAttributeProfile"].value == 'true') {
            if (providerProps["acsindex"] != null && providerProps["acsindex"].value.length > 0) {
                $('#acsindex').val(providerProps["acsindex"].value);
            }
            $('#enableAttributeProfile').prop("checked", true);
            $('#enableAttributeProfile').val(true);
            $('#enableDefaultAttributeProfile').prop("disabled", false);
            if (providerProps["enableDefaultAttributeProfile"] != null && providerProps["enableDefaultAttributeProfile"].value == 'true') {
                $('#enableDefaultAttributeProfile').prop("checked", true);
                $('#enableDefaultAttributeProfile').val(true);
                $('#enableDefaultAttributeProfileHidden').val(true);
            }
            else {
                $('#enableDefaultAttributeProfile').prop("checked", false);
                $('#enableDefaultAttributeProfile').val(false);
                $('#enableDefaultAttributeProfileHidden').val(false);
            }
        } else {
            $('#acsindex').val("");
            $('#enableAttributeProfile').prop("checked", false);
            $('#enableAttributeProfile').val(false);
            $('#enableDefaultAttributeProfile').prop("checked", false);
            $('#enableDefaultAttributeProfile').val(false);
           // $('#enableDefaultAttributeProfile').prop("disabled", true);
        }
    } else {
        $('#enableAttributeProfile').val(false);
        $('#enableDefaultAttributeProfile').val(false);
        $('#enableAttributeProfile').prop("checked", false);
        $('#enableDefaultAttributeProfile').prop("checked", false);
       // $('#enableDefaultAttributeProfile').prop("disabled", true);
    }

    var enableAudienceRestrictionRow = "";
    if (providerProps["enableAudienceRestriction"] != null && providerProps["enableAudienceRestriction"].value == 'true') {
        $('#enableAudienceRestriction').prop("checked", true);
        $('#enableAudienceRestriction').val(true);
        $("#addAudience").prop('disabled', false);
        $('#audience').prop('disabled', false);
    } else {
        $('#enableAudienceRestriction').prop("checked", false);
        $('#enableAudienceRestriction').val(false);
       // $("#addAudience").prop('disabled', true);
        //$('#audience').prop('disabled', true);
    }
    var audienceTableStyle = "";
    if (providerProps["audienceURLs"] != null && providerProps["audienceURLs"].value.length > 0) {
        audienceTableStyle = "";
    } else {
        audienceTableStyle = "display:none";
    }

    enableAudienceRestrictionRow = enableAudienceRestrictionRow +
        '    <table id="audienceTableId" style="' + audienceTableStyle + '" class="table">' +
        '          <tr><th>Audience</th>  <th style="text-align: right !important;">Action</th> </tr> ' +
        '        <tbody id="audienceTableTbody">';
    var j = 0;
    if (providerProps["audienceURLs"] != null && providerProps["audienceURLs"].value.length > 0) {
        var requestedAudiences = [];
        if (providerProps["audienceURLs"].value.indexOf(',') > -1) {
            requestedAudiences = providerProps["audienceURLs"].value.split(',');
        } else {
            requestedAudiences = [providerProps["audienceURLs"].value]
        }
        requestedAudiences.reverse();
        for (var i in requestedAudiences) {
            var audience = requestedAudiences[i];
            if (audience != null && "null" != audience) {
                enableAudienceRestrictionRow = enableAudienceRestrictionRow + '<tr id="audienceRow' + j + '">' +
                    '                    <td >' +
                    '                    <input type="hidden" name="audiencePropertyName' + j + '"' +
                    '                id="audiencePropertyName' + j + '" value="' + audience + '"/>' + audience +
                    '                    </td>' +
                    '                    <td>' +
                    '                    <a onclick="removeAudience(\'' + j + '\');return false;"' +
                    '                href="#" class="delete-link"> <i class="fw fw-delete "></i> Delete' +
                    '                    </a>' +
                    '                    </td>' +
                    '                    </tr>';
                j = j + 1;
            }
        }

    }
    $('#audiencePropertyCounter').val(j);
    if (providerProps["audienceURLs"] != null && providerProps["audienceURLs"].value != null) {
        $('#audienceURLs').val(providerProps["audienceURLs"].value);
    }
    enableAudienceRestrictionRow = enableAudienceRestrictionRow +
        '        </tbody>' +
        '        </table>';
    $('#audienceTblRow').empty();
    $('#audienceTblRow').append(enableAudienceRestrictionRow);


    var enableReceiptValidRow = "";

    if (providerProps["enableRecipients"] != null && providerProps["enableRecipients"].value == 'true') {
        $('#enableRecipients').prop("checked", true);
        $('#enableRecipients').val(true);
        $('#recipient').prop('disabled', false);
        $("#addRecipient").prop('disabled', false);
    } else {
        $('#enableRecipients').prop("checked", false);
        $('#enableRecipients').val(false);
        //$('#recipient').prop('disabled', true);
       // $("#addRecipient").prop('disabled', true);
    }
    var recipientTableStyle = "";
    //if (providerProps["receipientURLs"] != null && parseInt(providerProps["receipientURLs"].value) > 0) {
    if (providerProps["receipientURLs"] != null &&  providerProps["receipientURLs"].value.length > 0 && providerProps["receipientURLs"].value != "0") {
        recipientTableStyle = "";
    } else {
        recipientTableStyle = "display:none";
    }
    enableReceiptValidRow = enableReceiptValidRow +
        '    <table id="recipientTableId" style="' + recipientTableStyle + ';" class="table" >' +
        '          <tr><th>Recipients</th> <th class="delete-col">Action</th> </tr> ' +
        '        <tbody id="recipientTableTbody">';

    var k = 0;
    if (providerProps["receipientURLs"] != null && providerProps["receipientURLs"].value.length > 0) {
        var requestedRecipients = [];
        if (providerProps["receipientURLs"].value.indexOf(',') > -1) {
            requestedRecipients = providerProps["receipientURLs"].value.split(',');
        } else {
            requestedRecipients = [providerProps["receipientURLs"].value];
        }
        requestedRecipients.reverse(); // to render the list according to added order
        for (var i in requestedRecipients) {
            var recipient = requestedRecipients[i];
            if (recipient) {
                enableReceiptValidRow = enableReceiptValidRow + '<tr id="recipientRow' + k + '">' +
                    '                    <td >' +
                    '                    <input type="hidden" name="recipientPropertyName' + k + '"' +
                    '                id="recipientPropertyName' + k + '" value="' + recipient + '"/>' + recipient +
                    '                    </td>' +
                    '                    <td>' +
                    '                    <a onclick="removeRecipient(\'' + k + '\');return false;"' +
                    '                href="#" class="delete-link"> <i class="fw fw-delete "></i> Delete' +
                    '                    </a>' +
                    '                    </td>' +
                    '                    </tr>';
                k = k + 1;
            }
        }

    }
    $('#recipientPropertyCounter').val(k);
    if (providerProps["receipientURLs"] != null && providerProps["receipientURLs"].value !== null) {
        $('#receipientURLs').val(providerProps["receipientURLs"].value);
    }
    enableReceiptValidRow = enableReceiptValidRow +
        '        </tbody>' +
        '        </table>';
    $('#recptTblRow').empty();
    $('#recptTblRow').append(enableReceiptValidRow);

    if (providerProps["enableIdPInitSSO"] != null && providerProps["enableIdPInitSSO"].value == 'true') {
        $('#enableIdPInitSSO').prop("checked", true);
        $('#enableIdPInitSSO').val(true);
        //Store app access url should be constructed
        $("#store-app-url-sec").hide();
    } else {
        $('#enableIdPInitSSO').prop("checked", false);
        $('#enableIdPInitSSO').val(false);
    }

    if (providerProps["enableIdPInitSLO"] != null && providerProps["enableIdPInitSLO"].value == 'true') {
        $('#enableIdPInitSLO').prop("checked", true);
        $('#enableIdPInitSLO').val(true);
        $('#returnToURLTxtBox').prop("disabled", false);
        $('#addReturnToURL').prop("disabled", false);
    } else {
        $('#enableIdPInitSLO').prop("checked", false);
        $('#enableIdPInitSLO').val(false);
       // $('#returnToURLTxtBox').prop("disabled", true);
       // $('#addReturnToURL').prop("disabled", true);
    }
    var idpSLOReturnToURLInputRow = '<table id="idpSLOReturnToURLsTbl" style="margin-bottom: 3px;" class="table">\n' +
        '            <tbody id="idpSLOReturnToURLsTblBody">\n' +
            '<tr><th>Slo Urls</th> <th style="text-align: right !important;">Action</th> </tr>';
    var returnToColumnId = 0;
    if (providerProps["idpSLOURLs"] != null && providerProps["idpSLOURLs"].value.length > 0) {
        var idpInitSLOReturnToURLs = [];
        if (providerProps["idpSLOURLs"].value.indexOf(',') > -1) {
            idpInitSLOReturnToURLs = providerProps["idpSLOURLs"].value.split(',');
        } else {
            idpInitSLOReturnToURLs = [providerProps["idpSLOURLs"].value];
        }
        idpInitSLOReturnToURLs.reverse();
        for (var i in idpInitSLOReturnToURLs) {
            var returnToURL = idpInitSLOReturnToURLs[i];
            if (returnToURL != null && "null" != returnToURL) {
                idpSLOReturnToURLInputRow = idpSLOReturnToURLInputRow + '<tr id="returnToUrl_' + returnToColumnId + '">' +
                    '                    <td>' +
                    returnToURL +
                    '                    </td>' +
                    '                    <td>' +
                    '                    <a onclick="removeSloReturnToURL(\'' + returnToURL + '\', \'returnToUrl_' + returnToColumnId + '\');return false;"' +
                    '                href="#" class="delete-link" "> <i class="fw fw-delete "></i> Delete' +
                    '                    </a>' +
                    '                    </td>' +
                    '                    </tr>';
                returnToColumnId = returnToColumnId + 1;
            }
        }
    }
    idpSLOReturnToURLInputRow = idpSLOReturnToURLInputRow + '</tbody>' +
        '        </table>';
    if (providerProps["idpSLOURLs"] != null && providerProps["idpSLOURLs"].value != null) {
        $('#idpSLOURLs').val(providerProps["idpSLOURLs"].value);
    }
    $('#currentReturnToColumnId').val(returnToColumnId);
    }

    $("#idpSLOReturnToURLInputRow").empty();
    $("#idpSLOReturnToURLInputRow").append(idpSLOReturnToURLInputRow);

    controlHiddenFields(providerProps);
    $('#addServiceProvider').show();
}

function controlHiddenFields(providerProps) {
    if (isHidden(ISSUER, providerProps)) {
        $('#issuerRow').hide();
    }
    if (isHidden(ACS_URLS, providerProps)) {
        $('#acsRow').hide();
        $('#defaultAssertionConsumerURLRow').hide();
    }
    if (isHidden(NAME_ID_FORMAT, providerProps)) {
        $('#nameIDRow').hide();
    }
    if (isHidden(ALIAS, providerProps)) {
       $('#aliasRow').hide();
    }
    if (isHidden(CERTIFICATE, providerProps)) {
        $('#certificateRow').hide();
    }
    if (isHidden(SIGN_ALGO, providerProps)) {
        $('#signingAlgorithmRow').hide();
    }
    if (isHidden(DIGEST_ALGO, providerProps)) {
        $('#digestAlgorithmRow').hide();
    }
    if (isHidden(ENABLE_RESPONSE_SIGNATURE, providerProps)) {
        $('#enableResponseSignatureRow').hide();
    }
    if (isHidden(ENABLE_SIG_VALID, providerProps)) {
       // $('#enableSigValidationRow').hide();
    }
    if (isHidden(ENABLE_ENC_ASSERTION, providerProps)) {
        $('#enableEncAssertionRow').hide();
    }
    if (isHidden(ENABLE_SLO, providerProps)) {
        $('#singleLogoutRow').hide();
    }
    if (isHidden(ENABLE_ATTR_PROF, providerProps)) {
        $('#attributeRow').hide();
    }
    if(isHidden(ENABLE_DEFAULT_ATTR_PROF,providerProps)){
        $('#enableDefaultAttributeProfileRow').hide();
    }
    if (isHidden(ENABLE_AUDIENCE_RESTRICTION, providerProps)) {
        $('#audienceRestrictionRow').hide();
    }
    if (isHidden(ACS_INDEX, providerProps)) {
        $('#acsindexRow').hide();
    }
    if (isHidden(ENABLE_RECEIPIENTS, providerProps)) {
        $('#receipientRow').hide();
    }
    if (isHidden(ENABLE_IDP_SSO, providerProps)) {
        $('#idpInitSSORow').hide();
    }
    if (isHidden(ENABLE_IDP_SLO, providerProps)) {
        $('#idpInitSLORow').hide();
    }
}

function isHidden(fieldName, providerProps) {
    if (providerProps[fieldName] == null || providerProps[fieldName].type == "hidden") {
        return true;
    }
    return false;
}

function onClickAddACRUrl() {
    //var isValidated = doValidateInputToConfirm(document.getElementById('assertionConsumerURLTxt'), "<fmt:message
    // key='sp.not.https.endpoint.address'/>", addAssertionConsumerURL, null, null);
    if(!$("#acsUrl_0").length > 0) {
        $("#addServiceProvider").validate();
        $("input[id*=assertionConsumerURLTxt]").rules("add", {
            url2: true,
            messages: {
                url2: "Please enter valid URL",
            }
        });
    }
    addAssertionConsumerURL();
}

function disableAttributeProfile(chkbx) {
    if (chkbx.checked) {
        $('#enableDefaultAttributeProfile').prop("disabled", false);
        $('#enableDefaultAttributeProfile').prop("checked", true);
        $('#enableDefaultAttributeProfile').val(true);
        $('#enableAttributeProfile').val(true);
        $('#acsindex').val($('#attributeConsumingServiceIndex').val());
    } else {
        $('#enableDefaultAttributeProfile').prop("checked", false);
        $('#enableDefaultAttributeProfile').prop("disabled", true);
        $('#enableAttributeProfile').val(false);
        $('#enableDefaultAttributeProfile').val(false);
        $('#acsindex').val("");
    }
}

function disableDefaultAttributeProfile(chkbx) {
    if (chkbx.checked) {
        $('#enableDefaultAttributeProfileHidden').val("true");
        $('#enableDefaultAttributeProfile').val(true);
    } else {
        $('#enableDefaultAttributeProfileHidden').val("false");
        $('#enableDefaultAttributeProfile').val(false);
    }

}

function disableResponseSignature(chkbx) {
    $('#enableResponseSignature').val(chkbx.checked);
}

function disableSignatureValidation(chkbx) {
    $('#enableSigValidation').val(chkbx.checked);
}

function disableEncAssertion(chkbx) {
    $('#enableEncAssertion').val(chkbx.checked);
}


function disableLogoutUrl(chkbx) {
    if (chkbx.checked) {
        $("#sloResponseURL-form").slideToggle(1000);
        $("#sloRequestURL-form").slideToggle(1000);
        $("#sloResponseURL").prop('disabled', false);
        $("#sloRequestURL").prop('disabled', false);
        $("#enableSingleLogout").val(true);
    } else {
        $("#sloResponseURL-form").slideToggle(1000);
        $("#sloRequestURL-form").slideToggle(1000);
       // $("#sloResponseURL").prop('disabled', true);
        //$("#sloRequestURL").prop('disabled', true);
        $("#sloResponseURL").val("");
        $("#sloRequestURL").val("");
        $("#enableSingleLogout").val(false);
    }
}

function disableAudienceRestriction(chkbx) {
    if (chkbx.checked) {
        $("#audience").prop('disabled', false);
        $("#addAudience").prop('disabled', false);
        $("#enableAudienceRestriction").val(true);
    } else {
        //$("#audience").prop('disabled', true);
       // $("#addAudience").prop('disabled', true);
        $("#enableAudienceRestriction").val(false);
    }
}

function disableRecipients(chkbx) {
    if (chkbx.checked) {
        $("#recipient").prop('disabled', false);
        $("#addRecipient").prop('disabled', false);
        $("#enableRecipients").val(true);
    } else {
        //$("#recipient").prop('disabled', true);
       // $("#addRecipient").prop('disabled', true);
        $("#enableRecipients").val(false);
    }
}

function disableIdPInitSSO(chkbx) {
    $('#enableIdPInitSSO').val(chkbx.checked);
    if ( $('#enableIdPInitSSO').is(":checked")) {
        $("#store-app-url-sec").slideToggle(1000);
    } else {
        $("#store-app-url-sec").slideToggle(1000);
    }
}


function disableIdPInitSLO(chkbx) {
    if (chkbx.checked) {
        $("#returnToURLTxtBox").prop('disabled', false);
        $("#addReturnToURL").prop('disabled', false);
        $("#enableIdPInitSLO").val(true);
    } else {
       // $("#returnToURLTxtBox").prop('disabled', true);
       // $("#addReturnToURL").prop('disabled', true);
        $("#enableIdPInitSLO").val(false);
    }
}

function isContainRaw(tbody) {
    if (tbody.childNodes == null || tbody.childNodes.length == 0) {
        return false;
    } else {
        for (var i = 0; i < tbody.childNodes.length; i++) {
            var child = tbody.childNodes[i];
            if (child != undefined && child != null) {
                if (child.nodeName == "tr" || child.nodeName == "TR") {
                    return true;
                }
            }
        }
    }
    return false;
}
/**
 *
 * Manage tables
 */
function addAssertionConsumerURL() {
    $('.urlStatus').html('');
    $('.urlStatus').addClass('hide');
    var messageContainer = "<label class='' for='assertion-url' role='alert'>" +
        "<span class='alert-content'></span></label>";
    
    var assertionConsumerURL = $("#assertionConsumerURLTxt").val();
    assertionConsumerURL = assertionConsumerURL.trim();

    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if ((assertionConsumerURL == null || assertionConsumerURL.trim().length == 0) && !$("#acsUrl_0").length > 0) {
        //CARBON.showWarningDialog("<fmt:message key='sp.enter.not.valid.endpoint.address'/>", null, null);
        if($('#assertionConsumerURLInputRow').children().find('label.error').length==0){
            $('.urlStatus').html($(messageContainer).addClass('error')).removeClass('hide');
            $('.urlStatus').find('.alert-content')
                .text('Add at least one Assertion Consumer URL');
        } else {
            $('.urlStatus').addClass('hide');
        }
        return false;
    } else if (!regexp.test(assertionConsumerURL) || assertionConsumerURL.indexOf(",") > -1){
        //CARBON.showWarningDialog("<fmt:message key='sp.enter.not.valid.endpoint.address'/>", null, null);
        if($('#assertionConsumerURLInputRow').children().find('label.error').length==0){
            $('.urlStatus').html($(messageContainer).addClass('error')).removeClass('hide');
            $('.urlStatus').find('.alert-content')
                .text('Please enter valid URL');
        } else{
            $('.urlStatus').addClass('hide');
        }
        return false;
    }

    if ($("#assertionConsumerURLsTable").length == 0) {
        var row =
            '        <table id="assertionConsumerURLsTable" style="margin-bottom: 3px;" class=" table table-bordred  ">' +
            '            <tbody id="assertionConsumerURLsTableBody">' +
            '          <tr><th>Default</th><th>Assertion Consumer URL</th> <th class="delete-col" width="10%">Action</th> </tr> ' +
            '            </tbody>' +
            '        </table>';
        $('#assertionConsumerURLTblRow').append(row);
        $('#assertionConsumerURLs').val("");
        $('#currentColumnId').val("0");
    }

    var assertionConsumerURLs = $("#assertionConsumerURLs").val();
    var currentColumnId = $("#currentColumnId").val();
    if (assertionConsumerURLs == null || assertionConsumerURLs.trim().length == 0 ) {

        $("#assertionConsumerURLs").val(assertionConsumerURL);
        var row =
            '<tr id="acsUrl_' + parseInt(currentColumnId) + '">' +
            '</td><td>' + '<input type="radio"   name="radio" class="radio-group"   checked/>' +
            '</td><td>' + assertionConsumerURL +  '</td>' +
            '<td><a onclick="removeAssertionConsumerURL (\'' + assertionConsumerURL + '\', \'acsUrl_' + parseInt(currentColumnId) + '\');return false;"' +
            'href="#" class="delete-link"  > <i class="fw fw-delete"></i> Delete </a></td></tr>';


        $('#assertionConsumerURLsTable tbody').append(row);

    } else {
        var isExist = false;
        $.each(assertionConsumerURLs.split(","), function (index, value) {
            if (value === assertionConsumerURL) {
                isExist = true;
                //CARBON.showWarningDialog("<fmt:message key='sp.endpoint.address.already.exists'/>", null, null);
                return false;
            }
        });
        if (isExist) {
            return false;
        }

        $("#assertionConsumerURLs").val(assertionConsumerURLs + "," + assertionConsumerURL);
        var row =
            '<tr id="acsUrl_' + parseInt(currentColumnId) + '">' +
            '</td><td>' + '<input type="radio"   name="radio" class="radio-group"   checked/>'  +
            '</td><td>' + assertionConsumerURL +  '</td>' +
            '<td><a onclick="removeAssertionConsumerURL (\'' + assertionConsumerURL + '\', \'acsUrl_' + parseInt(currentColumnId) + '\');return false;"' +
            'href="#" class="delete-link"  >  <i class="fw fw-delete "></i> Delete </a></td></tr>';

        $('#assertionConsumerURLsTable tbody tr:nth-child(1)').after(row);

    }
    $("#assertionConsumerURLTxt").val("");
    $("#currentColumnId").val(parseInt(currentColumnId) + 1);
}

function removeAssertionConsumerURL(assertionConsumerURL, columnId) {

    var assertionConsumerURLs = $("#assertionConsumerURLs").val();
    var defaultAssertionConsumerURL = $('#defaultAssertionConsumerURL').val();
    var newAssertionConsumerURLs = "";
    var isDeletingSelected = false;

    if (assertionConsumerURLs != null && assertionConsumerURLs.trim().length > 0) {
        $.each(assertionConsumerURLs.split(","), function (index, value) {
            if (value === assertionConsumerURL) {
                if (assertionConsumerURL === defaultAssertionConsumerURL) {
                    isDeletingSelected = true;
                }
                return true;
            }

            if (newAssertionConsumerURLs.length > 0) {
                newAssertionConsumerURLs = newAssertionConsumerURLs + "," + value;
            } else {
                newAssertionConsumerURLs = value;
            }
        });
    }

    $('#defaultAssertionConsumerURL option[value="' + assertionConsumerURL + '"]').remove();

    if (isDeletingSelected && newAssertionConsumerURLs.length > 0) {
        $('select[id="defaultAssertionConsumerURL"] option:eq(1)').attr('selected', 'selected');
    }

    $('#' + columnId).remove();
    $("#assertionConsumerURLs").val(newAssertionConsumerURLs);

    if (newAssertionConsumerURLs.length == 0) {
        $('#assertionConsumerURLsTable').remove();
    }
}

function addAudienceFunc() {
    var audience = document.getElementById('audience').value;
    var audienceUrls = $("#audienceURLs").val();
    if (audienceUrls == null || audienceUrls.length == 0) {
        $("#audienceURLs").val(audience);
    } else {
        var isExist = false;
        $.each(audienceUrls.split(","), function (index, value) {
            if (value === audience) {
                isExist = true;
                //CARBON.showWarningDialog("<fmt:message key='sp.endpoint.address.already.exists'/>", null, null);
                return false;
            }
        });
        if (isExist) {
            return false;
        }
        $("#audienceURLs").val(audienceUrls + "," + audience);
    }
    var propertyCount = document.getElementById("audiencePropertyCounter");
    var i = propertyCount.value;
    var currentCount = parseInt(i);
    currentCount = currentCount + 1;
    propertyCount.value = currentCount;

    var audienceTableTBody = document.getElementById('audienceTableTbody');
    if (!audienceTableTBody) {
        var tableInit = ' <table id="audienceTableId"  class="table"><tr><th>Audience</th> <th class="delete-col">Action</th> </tr><tbody id="audienceTableTbody"></tbody></table>';
        $("#audienceTblRow").html(tableInit);
        audienceTableTBody = document.getElementById('audienceTableTbody');
    }
    var audienceRow = document.createElement('tr');
    audienceRow.setAttribute('id', 'audienceRow' + i);
    var audiencePropertyTD = document.createElement('td');
    // audiencePropertyTD.setAttribute('style', 'padding-left: 15px ! important; color:rgb(255, 255, 255);font-style: italic;background-color: #697780;color: white;');
    audiencePropertyTD.innerHTML = "" + audience + "<input type='hidden' name='audiencePropertyName" + i + "' id='audiencePropertyName" + i + "'  value='" + audience + "'/> ";
    var audienceRemoveTD = document.createElement('td');
    audienceRemoveTD.innerHTML = "<a class='delete-link' href='#' onclick='removeAudience(" + i + ");return false;'>" + '<i class="fw fw-delete "></i>  Delete' + "</a>";
    audienceRow.appendChild(audiencePropertyTD);
    audienceRow.appendChild(audienceRemoveTD);
    $("#audienceTableTbody").prepend(audienceRow);

    $('#audience').val("");
    $('#audienceTableId').show();
    $("#audienceTblRow").slideDown(1000);
    $("#addAudience").prop('disabled', true);
}

function removeAudience(i) {
    var newAudienceUrls = "";
    var audienceUrls = $("#audienceURLs").val();
    var audience = $("#audiencePropertyName" + i).val();
    var propRow = document.getElementById("audienceRow" + i);
    if (propRow != undefined && propRow != null) {
        var parentTBody = propRow.parentNode;
        if (parentTBody != undefined && parentTBody != null) {
            parentTBody.removeChild(propRow);
            if (!isContainRaw(parentTBody)) {
                var propertyTable = document.getElementById("audienceTblRow");
                propertyTable.style.display = "none";
            }
        }
    }
    if (audienceUrls != null && audienceUrls.trim().length > 0) {
        $.each(audienceUrls.split(","), function (index, value) {
            if (value === audience) {
                return true;
            }

            if (newAudienceUrls.length > 0) {
                newAudienceUrls = newAudienceUrls + "," + value;
            } else {
                newAudienceUrls = value;
            }
        });
    }
    $("#audienceURLs").val(newAudienceUrls);
    if (newAudienceUrls.length == 0) {
        $('#audiencePropertyCounter').val("0");
    }
}

function addRecipientFunc() {
    var recipient = document.getElementById('recipient').value;
    var recipientUrls = $("#receipientURLs").val();
    if (recipientUrls == null || parseInt(recipientUrls) == 0) {
        $("#receipientURLs").val(recipient);
    } else {
        var isExist = false;
        if (recipientUrls && recipientUrls.indexOf(',') > -1) {
            $.each(recipientUrls.split(","), function (index, value) {
                if (value === recipient) {
                    isExist = true;
                    //CARBON.showWarningDialog("<fmt:message key='sp.endpoint.address.already.exists'/>", null, null);
                    return false;
                }
            });
        }

        if (isExist) {
            return false;
        }
        $("#receipientURLs").val(recipientUrls + "," + recipient);
    }
    var propertyCount = document.getElementById("recipientPropertyCounter");
    var i = propertyCount.value;
    var currentCount = parseInt(i);
    currentCount = currentCount + 1;
    propertyCount.value = currentCount;
    var recipientTableTBody = document.getElementById('recipientTableTbody');
    if (!recipientTableTBody) {
        var tableInit = ' <table id="recipientTableId"  class="table"><tr><th>Recipients</th> <th class="delete-col">Action</th> </tr><tbody id="recipientTableTbody"></tbody></table>';
        $("#recptTblRow").html(tableInit);
        recipientTableTBody = document.getElementById('recipientTableTbody');
    }
    var recipientRow = document.createElement('tr');
    recipientRow.setAttribute('id', 'recipientRow' + i);
    var recipientPropertyTD = document.createElement('td');
    // recipientPropertyTD.setAttribute('style', 'padding-left: 15px ! important; rgb(255, 255, 255);font-style: italic;background-color: #697780;color: white;');
    recipientPropertyTD.innerHTML = "" + recipient + "<input type='hidden' name='recipientPropertyName" + i + "' id='recipientPropertyName" + i + "'  value='" + recipient + "'/> ";
    var recipientRemoveTD = document.createElement('td');
    recipientRemoveTD.innerHTML = "<a  class='delete-link' href='#' onclick='removeRecipient(" + i + ");return false;'>" + ' <i class="fw fw-delete "></i> Delete' + "</a>";
    recipientRow.appendChild(recipientPropertyTD);
    recipientRow.appendChild(recipientRemoveTD);
    $("#recipientTableTbody").prepend(recipientRow);
    $('#recipient').val("");
    $('#recipientTableId').show();
    $("#recptTblRow").slideDown(1000);
    $("#addRecipient").prop('disabled', true);

}

function removeRecipient(i) {
    var newReceipientUrls = "";
    var receipientUrls = $("#receipientURLs").val();
    var receipient = $("#recipientPropertyName" + i).val();
    var propRow = document.getElementById("recipientRow" + i);
    if (propRow != undefined && propRow != null) {
        var parentTBody = propRow.parentNode;
        if (parentTBody != undefined && parentTBody != null) {
            parentTBody.removeChild(propRow);
            if (!isContainRaw(parentTBody)) {
                var propertyTable = document.getElementById("recptTblRow");
                propertyTable.style.display = "none";
            }
        }
    }
    if (receipientUrls != null && receipientUrls.trim().length > 0) {
        $.each(receipientUrls.split(","), function (index, value) {
            if (value === receipient) {
                return true;
            }

            if (newReceipientUrls.length > 0) {
                newReceipientUrls = newReceipientUrls + "," + value;
            } else {
                newReceipientUrls = value;
            }
        });
    }
    $("#receipientURLs").val(newReceipientUrls);
    if (newReceipientUrls.length == 0) {
        $('#recipientPropertyCounter').val("0");
    }
}

function removeSloReturnToURL(returnToURL, columnId) {

    var idpInitSLOReturnToURLs = $("#idpSLOURLs").val();
    var newIdpInitSLOReturnToURLs = "";

    if (idpInitSLOReturnToURLs != null && idpInitSLOReturnToURLs.trim().length > 0) {
        $.each(idpInitSLOReturnToURLs.split(","), function (index, value) {
            if (value === returnToURL) {
                return true;
            }

            if (newIdpInitSLOReturnToURLs.length > 0) {
                newIdpInitSLOReturnToURLs = newIdpInitSLOReturnToURLs + "," + value;
            } else {
                newIdpInitSLOReturnToURLs = value;
            }
        });
    }

    $('#' + columnId).remove();
    $("#idpSLOURLs").val(newIdpInitSLOReturnToURLs);

    if (newIdpInitSLOReturnToURLs.length == 0) {
        $('#idpSLOReturnToURLsTbl').remove();
    }
}

function addSloReturnToURL() {
    var returnToURL = $("#returnToURLTxtBox").val();
    if (returnToURL == null || returnToURL.trim().length == 0) {
        // CARBON.showWarningDialog("<fmt:message key='slo.enter.not.valid.endpoint.address'/>", null, null);
        return false;
    }

    returnToURL = returnToURL.trim();

    if ($("#idpSLOReturnToURLsTbl").length == 0) {
        var row =
            '        <table id="idpSLOReturnToURLsTbl"  class=" table">' +
            '            <tbody id="idpSLOReturnToURLsTblBody">' +
            '<tr><th>Slo Urls</th> <th style="text-align: right !important;">Action</th> </tr>'+
            '            </tbody>' +
            '        </table>';
        $('#idpSLOReturnToURLInputRow').append(row);
        $('#currentReturnToColumnId').val("0");
    }
    var idpInitSLOReturnToURLs = $("#idpSLOURLs").val();
    var currentColumnId = $("#currentReturnToColumnId").val();
    if (idpInitSLOReturnToURLs == null || idpInitSLOReturnToURLs.trim().length == 0) {
        $("#idpSLOURLs").val(returnToURL);
        var row =
            '<tr id="returnToUrl_' + parseInt(currentColumnId) + '">' +
            '</td><td >' + returnToURL +
            '</td><td><a onclick="removeSloReturnToURL(\'' + returnToURL + '\', \'returnToUrl_' +
            parseInt(currentColumnId) + '\');return false;"' +
            'href="#" class="delete-link" "> <i class="fw fw-delete "></i>  Delete </a></td></tr>';

        $('#idpSLOReturnToURLsTbl tbody').append(row);
    } else {
        var isExist = false;
        $.each(idpInitSLOReturnToURLs.split(","), function (index, value) {
            if (value === returnToURL) {
                isExist = true;
                //CARBON.showWarningDialog("<fmt:message key='slo.endpoint.address.already.exists'/>", null, null);
                return false;
            }
        });
        if (isExist) {
            return false;
        }

        $("#idpSLOURLs").val(idpInitSLOReturnToURLs + "," + returnToURL);
        var row =
            '<tr id="returnToUrl_' + parseInt(currentColumnId) + '">' +
            '</td><td >' +
            returnToURL + '</td><td><a onclick="removeSloReturnToURL(\'' + returnToURL + '\', \'returnToUrl_' + parseInt(currentColumnId) + '\');return false;"' +
            'href="#" class="delete-link" "> <i class="fw fw-delete "></i>  Delete </a></td></tr>';


        $('#idpSLOReturnToURLsTbl tbody tr:nth-child(1)').after(row);
    }
    $("#returnToURLTxtBox").val("");
    $("#currentReturnToColumnId").val(parseInt(currentColumnId) + 1);
}

$(document).ready(function () {
    //IDP initiated sso check box check/uncheck event
    $("#enableIdPInitSSO").change(function () {
        if (this.checked) {
            $("#store-app-url-sec").hide();
        } else {
            $("#store-app-url-sec").show();
        }
    });

    $("#addAudience").prop('disabled', true);
    $("#addRecipient").prop('disabled', true);
    $(document).on('keyup', '#audience, #recipient', function() {
        if ($(this).val()) {
            $(this).next().find('button.btn-add').prop('disabled', false);
        } else {
            $(this).next().find('button.btn-add').prop('disabled', true);
        }
    });
});


/**
 * Get Assertion Consumer URL
 * @param appContext
 * @param appVersion
 * @param transport
 * @returns ACS URL
 */
function getACSURL(appContext, appVersion, transport) {
    var ascUrl = "";
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/appmConf",
        type: "GET",
        data: "&requestType=GET_ACS_URL&appContext=" + appContext + "&version=" + appVersion
        + "&transport=" + transport,
        async: false,
        success: function (data) {
            ascUrl = data;
        },
        error: function (e) {
            message({
                content: 'Error occurred while getting the configuration: Issuer details',
                type: 'error'
            });
        }
    });
    return ascUrl;
}

function populateIssuerName(appName, appVersion) {
    var saml2SsoIssuer = "";
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/appmConf",
        type: "GET",
        data: "&requestType=POPULATE_ISSUER_NAME&appName=" + appName + "&version=" + appVersion,
        async: false,
        success: function (data) {
            saml2SsoIssuer = data;
        },
        error: function (e) {
            message({
                content: 'Error occurred while getting the configuration: Issuer details',
                type: 'error'
            });
        }
    });
    return saml2SsoIssuer;
}

