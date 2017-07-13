function preDrawClaimConfig(selectedAppType) {
    var spClaimConfig = null;
    var isLocalClaimsSelected = true;
    var claimMapping = null;

    if (appdata != null) {
        spClaimConfig = appdata.claimConfig;
    }
    if (spClaimConfig != null) {
        isLocalClaimsSelected = (spClaimConfig.localClaimDialect.toLowerCase() === 'true');
        claimMapping = spClaimConfig.claimMappings;
        if (claimMapping != null && claimMapping.constructor !== Array) {
            var tempArr = [];
            tempArr[0] = claimMapping;
            claimMapping = tempArr;
        }
    }
    getClaimUrisClaimConfig(spClaimConfig, isLocalClaimsSelected, claimMapping);
}

/**
 * This method will render the claim tables initially
 * @param spClaimConfig
 * @param isLocalClaimsSelected
 * @param claimMapping
 */
function drawClaimConfigs(spClaimConfig, isLocalClaimsSelected, claimMapping) {

    var localClaimConfigDropDown;
    for (var localClaimNameEntry in spConfigClaimUris) {
        // If the selected app type is "Proxy" remove the "role" claim from the dropdown list.
        if (!(spConfigClaimUris[localClaimNameEntry].trim() == WSO2_ROLE_CLAIM && selectedAppType == APP_PROXY_TYPE)) {
            localClaimConfigDropDown += '<option  value="' + spConfigClaimUris[localClaimNameEntry] +
                '" data-index = "' + localClaimNameEntry + '" > ' + spConfigClaimUris[localClaimNameEntry] + '</option>';
        }
    }
    $("#local-claim-url").append(localClaimConfigDropDown);

    var customClaimConfigDropDown;
    for (var localClaimNameEntry in spConfigClaimUris) {
        customClaimConfigDropDown += '<option  value="' + spConfigClaimUris[localClaimNameEntry] +
            '" data-index = "' + localClaimNameEntry + '" > ' + spConfigClaimUris[localClaimNameEntry] + '</option>';
    }

    $("#custom-claim-url").append(customClaimConfigDropDown);

    if (isLocalClaimsSelected) {
        $("#claim_dialect_wso2").prop("checked", true);
    }
    //add table by default
    var assertionConsumerURLTblRow;
    assertionConsumerURLTblRow =
        '        <table id="localClaimTable" class=" table" hidden>' +
        '            <tbody id="localClaimTableTableBody">' +
        '          <tr><th>Claim</th>  <th class="delete-col">Action</th> </tr> ';

    assertionConsumerURLTblRow = assertionConsumerURLTblRow + '</tbody></table>';
    $("#claimsConfRow").append(assertionConsumerURLTblRow);

    if (claimMapping && claimMapping.length > 0) {
        if (!isLocalClaimsSelected) {
            $("#claim_dialect_custom").click();
            $("#claim_dialect_custom").prop("checked", true);
        }
        addClaimDataFromObject(claimMapping, isLocalClaimsSelected);
    }

}

/**
 * This method will generate the claim data list from the stored object
 * @param claimMapping
 * @param isLocalClaimsSelected
 */
function addClaimDataFromObject(claimMapping, isLocalClaimsSelected) {
    var currentLocalRow = 0, currentCustomRow = 0;
    claimMapping.reverse();
    //TODO: this content is repeating need to refactor
    for (var entry in claimMapping) {
        if (isLocalClaimsSelected) {
            if ($("#localClaimTableTableBody").find('tr').length > 1) {
                currentLocalRow = parseInt($("#localClaimTableTableBody").find('tr:last-child').attr('data-id')) + 1;
            }
            // If the selected app type is "Proxy" remove the "role" claim from the claim configurations.
            if ($("#localClaimTableTableBody").find('tr').length <= claimMapping.length &&
                !(claimMapping[entry].localClaim.claimUri == WSO2_ROLE_CLAIM && selectedAppType == APP_PROXY_TYPE)) {
                var trow = '<tr id="localClaimUrl_' + currentLocalRow + '" data-id="' + currentLocalRow + '">' +
                    '<td>' + '<input type="text" disabled  style="width: 100%" class="idpClaim" id="idpClaim_' +
                    currentLocalRow + '" data-id="' + currentLocalRow + '" value="' +
                    claimMapping[entry].localClaim.claimUri + '"> </input>' + '</td>' +
                    '<td><a onclick="removeClaimUrl($(this));return false;"' +
                    'href="#" class="delete-link"  ><i class="fw fw-delete"></i>  <span class="hidden-xs">Delete </span></a></td></tr>';

                $("#localClaimTableTableBody tr:nth-child(1)").after(trow);
                $("#customClaimTable").hide();
                $("#localClaimTable").show();
            }

            $("#subject-claim-dropdown").remove();
            generateSubjectURI($("#localClaimTable"));
        } else {

            if ($("#customClaimTableTableBody").find('tr').length > 1) {
                currentCustomRow = parseInt($("#customClaimTableTableBody").find('tr:last-child').attr('data-id')) + 1;
            }
            if ($("#customClaimTableTableBody").find('tr').length <= claimMapping.length) {
                var trow = '<tr id="customClaimUrl_' + currentCustomRow + '" data-id="' + currentCustomRow + '">' +
                    '<td>' + '<input class="spClaim" type="text" placeholder="Add your custom claim" id="spClaim_' +
                    currentCustomRow + '" data-id="' + currentCustomRow + '" value="' +
                    claimMapping[entry].remoteClaim.claimUri + '"> </input>' + '</td>' +

                    '<td>' + '<input type="text" disabled  style="width: 100%" class="idpClaim" id="idpClaimC_' +
                    currentCustomRow + '" data-id="' + currentCustomRow + '" value="' +
                    claimMapping[entry].localClaim.claimUri + '"> </input>' + '</td>' +
                    '<td><a onclick="removeClaimUrl($(this));return false;"' +
                    'href="#" class="delete-link"  > <i class="fw fw-delete"></i> <span class="hidden-xs">Delete </span></a></td></tr>';

                $("#customClaimTableTableBody tr:nth-child(1)").after(trow);
                $("#localClaimTable").hide();
                $("#customClaimTable").show();
            }

            $("#subject-claim-dropdown").remove();
            generateSubjectURI($("#customClaimTable"));
        }

    }
    var subjectClaimUri = appdata.localAndOutBoundAuthenticationConfig.subjectClaimUri;
    if (subjectClaimUri) {
        var list = $("#subject-claim-url").find('option');

        for (var option in list) {
            if ($(list[option]).val() == subjectClaimUri) {
                $(list[option]).attr('selected', 'selected');
            }
        }
    }
}
/**
 * This method will generate the claim list when click on add claim button
 */
function addClaimIntoList() {
    var currentLocalRow = 0, currentCustomRow = 0;
    if ($("#claim_dialect_wso2").is(":checked")) {
        if ($("#localClaimTableTableBody").find('tr').length > 1) {
            currentLocalRow = parseInt($("#localClaimTableTableBody").find('tr:last-child').attr('data-id')) + 1;
        }

        var trow = '<tr id="localClaimUrl_' + currentLocalRow + '" data-id="' + currentLocalRow + '">' +
            '<td>' + '<input type="text" disabled  style="width: 100%" class="idpClaim" id="idpClaim_' +
            currentLocalRow + '" data-id="' + currentLocalRow + '" value="' + $("#local-claim-url").val() +
            '"> </input>' + '</td>' + '<td><a onclick="removeClaimUrl($(this));return false;"' +
            'href="#" class="delete-link"  > <i class="fw fw-delete"></i><span class="hidden-xs"> Delete </span></a></td></tr>';
        
        $("#localClaimTableTableBody tr:nth-child(1)").after(trow);
        $("#customClaimTable").hide();
        $("#localClaimTable").show();

        $("#subject-claim-dropdown").remove();
        generateSubjectURI($("#localClaimTable"));
    } else {

        if ($("#customClaimTableTableBody").find('tr').length > 1) {
            currentCustomRow = parseInt($("#customClaimTableTableBody").find('tr:last-child').attr('data-id')) + 1;
        }
        var trow = '<tr id="customClaimUrl_' + currentCustomRow + '" data-id="' + currentCustomRow + '">' +
            '<td>' + '<input class="spClaim" type="text" placeholder="Add your custom claim" id="spClaim_' +
            currentCustomRow + '" data-id="' + currentCustomRow + '" value="' +
            $("#custom-claim-text-main").val() + '"> </input>' + '</td>' +

            '<td>' + '<input type="text" disabled  style="width: 100%" class="idpClaim" id="idpClaimC_' +
            currentCustomRow + '" data-id="' + currentCustomRow + '" value="' + $("#custom-claim-url").val() +
            '"> </input>' + '</td>' + '<td><a onclick="removeClaimUrl($(this));return false;"' +
            'href="#" class="delete-link"  > <i class="fw fw-delete"></i><span class="hidden-xs"> Delete </span></a></td></tr>';

        $("#customClaimTableTableBody tr:nth-child(1)").after(trow);
        $("#localClaimTable").hide();
        $("#customClaimTable").show();


        $("#subject-claim-dropdown").remove();
        generateSubjectURI($("#customClaimTable"));
    }
    $("#custom-claim-text-main").val("");
}

function removeClaimUrl(obj) {
    if (obj.closest('tbody').find('tr').length == 2) { // its the last element of the table
        obj.closest('table').hide();
    }
    $("#subject-claim-dropdown").remove();
    var tbody = $(obj.closest('tbody'));

    obj.closest('tr').remove();
    generateSubjectURI(tbody);
}

/**
 * This method will generate subject uri based on user selection
 * @param element
 */
function generateSubjectURI(element) {
    var SubjectClaimURI = "<div id='subject-claim-dropdown' class='input-group input-wrap' hidden> <label> Select Subject Claim  </label> <select id='subject-claim-url' style='float: left;' class='idpClaim form-control'>";
    SubjectClaimURI = SubjectClaimURI + '<option selected disabled hidden   value="' + 0 + '" data-index = "' + 0 + '" > '
        + "None" + '</option>';
    var urlCount = element.find('tr').length;
    var urlValue;
    for (var i = 1; i < urlCount; i++) {
        urlValue = $(element.find('tr')[i]).find('.idpClaim')[0].value;
        SubjectClaimURI = SubjectClaimURI + '<option value="' + urlValue + '" data-index = "' + parseInt(i - 1) + '" > '
            + urlValue + '</option>';

    }
    SubjectClaimURI += "</select> </div>";
    $("#claimsConfRow").after(SubjectClaimURI);
    var selected = $("#custom-apptype-content input[name=toggler]:checked").attr('id').trim().toLowerCase();
    if(selected == "proxytype"){
        $("#subject-claim-dropdown").remove();
    }
}
/**
 * This method will trigger when claim radio button clicked
 * @param obj clicked radio button object
 */
function claimRadioClick(obj) {
    var assertionConsumerURLTblRow;
    if ($(obj).attr('id') === "claim_dialect_wso2") {
        $("#local-claim-dropdown").show();
        $("#custom-claim-dropdown").hide();

        assertionConsumerURLTblRow =
            '        <table id="localClaimTable" style="margin-bottom: 3px;" class=" table table-bordred  " hidden>' +
            '            <tbody id="localClaimTableTableBody">' +
            '          <tr><th>Claim</th>  <th class="delete-col">Action</th> </tr> ';

        assertionConsumerURLTblRow = assertionConsumerURLTblRow + '</tbody></table>';

        if ($("#localClaimTable").length == 0) {
            $("#claimsConfRow").append(assertionConsumerURLTblRow);
        }
        $("#customClaimTable").hide();
        $("#subject-claim-dropdown").remove();

        if ($("#localClaimTable").is(":hidden") && $("#localClaimUrl_0").length > 0) {
            $("#localClaimTable").show();
            generateSubjectURI($("#localClaimTable"));
        }


    } else {
        $("#local-claim-dropdown").hide();
        $("#custom-claim-dropdown").show();

        assertionConsumerURLTblRow =
            '        <table id="customClaimTable" style="margin-bottom: 3px;" class=" table table-bordred  " hidden>' +
            '            <tbody id="customClaimTableTableBody">' +
            '          <tr><th>Custom Claim</th><th>Claim URI</th> <th class="delete-col">Action</th> </tr> ';
        assertionConsumerURLTblRow = assertionConsumerURLTblRow + '</tbody></table>';

        if ($("#customClaimTable").length == 0) {
            $("#claimsConfRow").append(assertionConsumerURLTblRow);
        }

        $("#localClaimTable").hide();
        $("#subject-claim-dropdown").remove();
        if ($("#customClaimTable").is(":hidden") && $("#customClaimUrl_0").length > 0) {
            $("#customClaimTable").show();
            generateSubjectURI($("#customClaimTable"));
        }

    }

}

function getClaimUrisClaimConfig(spClaimConfig, isLocalClaimsSelected, claimMapping) {

    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/samlSSOConfigClient.jag",
        type: "GET",
        data: "&user=" + userName + "&clientAction=getClaimURIs",
        success: function (data) {
            try {
                spConfigClaimUris = $.parseJSON(data).return;
            } catch (err) {
                urlResolver('login');
            }
            handleWellKnownAppClaims(spClaimConfig, isLocalClaimsSelected, claimMapping);
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

function handleWellKnownAppClaims(spClaimConfig, isLocalClaimsSelected, claimMapping) {
    if ($('#spType').val() == "aws" && claimMapping == null) {
        isLocalClaimsSelected = false;
        claimMapping = [];
        var roleClaim = {};
        roleClaim["defaultValue"] = "";
        var localrole = {};
        localrole["claimId"] = "0";
        localrole["claimUri"] = AWS_SUBJECT_LOCAL_DIALECT;
        roleClaim["localClaim"] = localrole;
        var remoterole = {}
        remoterole["claimId"] = "0";
        remoterole["claimUri"] = AWS_SUBJECT_REMOTE_DIALECT;
        roleClaim["remoteClaim"] = remoterole;
        roleClaim["requested"] = "true";
        claimMapping[0] = roleClaim;


        var emailClaim = {};
        emailClaim["defaultValue"] = "";
        var localemail = {};
        localemail["claimId"] = "0";
        localemail["claimUri"] = WSO2_EMAIL;
        emailClaim["localClaim"] = localemail;
        var remoteEmail = {};
        remoteEmail["claimId"] = "0";
        remoteEmail["claimUri"] = AWS_EMAIL_REMOTE_DIALECT;
        emailClaim["remoteClaim"] = remoteEmail;
        emailClaim["requested"] = "true";
        claimMapping[1] = emailClaim;

        spClaimConfig.roleClaimURI = AWS_EMAIL_REMOTE_DIALECT;
    }else if ($('#spType').val() == "netsuite" && claimMapping == null) {
        isLocalClaimsSelected = false;
        claimMapping = [];

        var accountClaim = {};
        accountClaim["defaultValue"] = "";
        accountClaim["requested"] = "true";

        var localClaim = {};
        localClaim["claimId"] = "0";
        localClaim["claimUri"] = NETSUITE_ACCOUNT_LOCAL_DIALECT;
        accountClaim["localClaim"] = localClaim;

        var remoteClaim= {}
        remoteClaim["claimId"] = "0";
        remoteClaim["claimUri"] = NETSUITE_ACCOUNT_REMOTE_DIALECT;
        accountClaim["remoteClaim"] = remoteClaim;

        claimMapping[0] = accountClaim;
      }

      // drawClaimConfig(spClaimConfig, isLocalClaimsSelected, claimMapping);
      drawClaimConfigs(spClaimConfig, isLocalClaimsSelected, claimMapping);
}

function getSubjectClaimUri() {
    if ($('#spType').val() == "aws") {
        return AWS_SUBJECT_REMOTE_DIALECT;
    }
    return DEFAULT_SUBJECT_CLAIM_URI;
}

function resetRoleClaims() {
    $("#roleClaim option").filter(function () {
        return $(this).val().length > 0;
    }).remove();
    $("#subject_claim_uri option").filter(function () {
        return $(this).val().length > 0;
    }).remove();
    $.each($('.spClaimVal'), function () {
        if ($(this).val().length > 0) {
            $("#roleClaim").append('<option value="' + $(this).val() + '">' + $(this).val() + '</option>');
            $('#subject_claim_uri').append('<option value="' + $(this).val() + '">' + $(this).val() + '</option>');
        }
    });
}

function changeDialectUIs(element) {
    $("#roleClaim option").filter(function () {
        return $(this).val().length > 0;
    }).remove();

    $("#subject_claim_uri option").filter(function () {
        return $(this).val().length > 0;
    }).remove();

    if (element.val() == 'local') {
        $('#addClaimUrisLbl').text('Requested Claims:');
        $('#roleMappingSelection').hide();
        if ($('#local_calim_uris').length > 0 && $('#local_calim_uris').val().length > 0) {
            var dataArray = $('#local_calim_uris').val().split(',');
            if (dataArray.length > 0) {
                var optionsList = "";
                $.each(dataArray, function () {
                    if (this.length > 0) {
                        optionsList += '<option value=' + this + '>' + this + '</option>'
                    }
                });
                if (optionsList.length > 0) {
                    $('#subject_claim_uri').append(optionsList);
                }
            }
        }
    } else {
        $('#addClaimUrisLbl').text('Identity Provider Claim URIs:');
        $('#roleMappingSelection').show();
    }
}

function deleteClaimRow(obj) {
    if ($('input:radio[name=claim_dialect]:checked').val() == CUSTOM_SP) {
        if ($(obj).parent().parent().find('input.spClaimVal').val().length > 0) {
            $('#roleClaim option[value="' + $(obj).parent().parent().find('input.spClaimVal').val() + '"]').remove();
            $('#subject_claim_uri option[value="' + $(obj).parent().parent().find('input.spClaimVal').val() + '"]').remove();
        }
    }

    jQuery(obj).parent().parent().remove();
    if ($('.idpClaim').length == 0) {
        $('#claimMappingAddTable').hide();
    }
}

function validateForDuplications(selector, authenticatorName, type) {
    if ($(selector).length > 0) {
        var isNew = true;
        $.each($(selector), function () {
            if ($(this).val() == authenticatorName) {
                //CARBON.showWarningDialog(type+' "'+authenticatorName+'" is already added');
                isNew = false;
                return false;
            }
        });
        if (!isNew) {
            return false;
        }
    }
    return true;
}