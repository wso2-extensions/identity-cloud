function preDrawClaimConfig() {
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

function drawClaimConfig(spClaimConfig, isLocalClaimsSelected, claimMapping) {
    if(isLocalClaimsSelected){
        $("#claim_dialect_wso2").prop("checked", true);
        $('#addClaimUrisLbl').text('Requested Claims:');
        $('#spccol').hide();
        $('#rccol').hide();
        $('#roleMappingSelection').hide();

    }else{
        $("#claim_dialect_custom").prop("checked", true);
        $('#addClaimUrisLbl').text('Identity Provider Claim URIs:');
        $('#spccol').show();
        $('#rccol').show();
        $('#roleMappingSelection').show();
    }

    if (claimMapping == null || claimMapping.length <= 0) {
        $('#claimMappingAddTable').hide();
    } else {
        $('#claimMappingAddTable').show();
        var i = -1;
        var requestedClaimTableBody = "";
        for (var entry in claimMapping) {
            i = i + 1;
            var row = '<tr> <td style=';
            if (isLocalClaimsSelected) {
                row = row + "display:none;"
            } else {
                row = row + ""
            }
            row = row + '><input type="text" class="spClaimVal form-control" value="' + claimMapping[entry].remoteClaim.claimUri + '" id="spClaim_' + i + '" name="spClaim_' + i + '" readonly="readonly"/></td>' +
                '<td style="width: 40%;">\n' +
                '<select id="idpClaim_' + i + '" name="idpClaim_' + i + '" class="idpClaim form-control" style="float:left; width: 100%">';
            for (var localClaimNameEntry in spConfigClaimUris) {
                var localClaimName = spConfigClaimUris[localClaimNameEntry];
                if (localClaimName == claimMapping[entry].localClaim.claimUri) {
                    row = row + '<option value="' + localClaimName + '" selected> ' + localClaimName + '</option>';
                } else {
                    row = row + '<option value = "' + localClaimName + '" >' + localClaimName + '</option >';
                }
            }

            row = row + '</select>\n' +
                '</td>' +
                '<td style="text-align: center;';
            if (isLocalClaimsSelected) {
                row = row + 'display:none;"';
            } else {
                row = row + '"';
            }
            row = row + '>';
            if (claimMapping[entry].requested == 'true') {
                row = row + '<input type="checkbox"  id="spClaim_req_' + i + '" name="spClaim_req_' + i + '" checked/>';
            } else {
                row = row + '<input type="checkbox"  id="spClaim_req_' + i + '" name="spClaim_req_' + i + '" />';
            }
            row = row + '</td>' +
                '<td>' +
                '<a title="Delete Permission ?" onclick="deleteClaimRow(this);return false;" href="#" class="icon-link" style="background-image: url(images/delete.gif)">' +
                'Delete' +
                '</a>\n' +
                '</td>\n' +
                '</tr>';
            requestedClaimTableBody = requestedClaimTableBody + row;
        }
        $('#claimMappingAddBody').empty();
        $('#claimMappingAddBody').append( requestedClaimTableBody );

    }
    var subjectClaimUri = appdata.localAndOutBoundAuthenticationConfig.subjectClaimUri;
    if(subjectClaimUri==null || subjectClaimUri.length==0 ){
        subjectClaimUri = getSubjectClaimUri();
    }
    var subjectoptionList = '<option value="">---Select---</option>';
    if (isLocalClaimsSelected) {
        for (var localClaimNameEntry in spConfigClaimUris) {
            var localClaimName = spConfigClaimUris[localClaimNameEntry];
            if (subjectClaimUri != null && localClaimName == subjectClaimUri) {
                subjectoptionList = subjectoptionList + '<option value="' + localClaimName + '" selected>' + localClaimName + '</option>';
            } else {
                subjectoptionList = subjectoptionList + '<option value="' + localClaimName + '">' + localClaimName + '</option>';
            }
        }
    } else {
        for (var entry in claimMapping) {
            var entryValue = claimMapping[entry].remoteClaim.claimUri;
            if (entryValue != null && entryValue.length > 0) {
                if (subjectClaimUri != null && subjectClaimUri == entryValue) {
                    subjectoptionList = subjectoptionList + '<option value="' + entryValue + '" selected>' + entryValue + '</option>';
                } else {
                    subjectoptionList = subjectoptionList + '<option value="' + entryValue + '">' + entryValue + '</option>';
                }
            }
        }
    }
    $('#subject_claim_uri').empty();
    $('#subject_claim_uri').append(subjectoptionList);

    var allLocalClaims = "";
    var localClaimsListBody =  '<select style="float:left; width: 100%">';
    for (var entry in spConfigClaimUris) {
        localClaimName = spConfigClaimUris[entry];
        localClaimsListBody = localClaimsListBody + '<option value="' + localClaimName + '">' + localClaimName + '</option>';
        allLocalClaims = allLocalClaims + localClaimName + ",";
    }
    $('#local_calim_uris').val(allLocalClaims);
    localClaimsListBody = localClaimsListBody + '</select>';
    $('#localClaimsList').empty();
    $('#localClaimsList').append(localClaimsListBody);


    var roleClaimsListBody = '<option value="">---Select---</option>';
    
    if (!isLocalClaimsSelected) {
        for (var entry in claimMapping) {
            var entryValue = claimMapping[entry].remoteClaim.claimUri;
            if (entryValue != null && entryValue.length > 0) {
                if (spClaimConfig.roleClaimURI != null && spClaimConfig.roleClaimURI == entryValue) {
                    roleClaimsListBody = roleClaimsListBody + '<option value="' + entryValue + '" selected>' + entryValue + '</option>';
                } else {
                    roleClaimsListBody = roleClaimsListBody + '<option value="' + entryValue + '">' + entryValue + '</option>';
                }
            }
        }
    }
    $('#roleClaim').empty();
    $('#roleClaim').append(roleClaimsListBody);


    var claimMappinRowID = -1;
    if (claimMapping != null) {
        claimMappinRowID = claimMapping.length - 1;
    }
    jQuery('#claimMappingAddLink').click(function () {
        $('#claimMappingAddTable').show();
        var selectedIDPClaimName = $('select[name=idpClaimsList]').val();
        if (!validateForDuplications('.idpClaim', selectedIDPClaimName, 'Local Claim')) {
            return false;
        }
        claimMappinRowID++;
        var idpClaimListDiv = $('#localClaimsList').clone();
        if (idpClaimListDiv.length > 0) {
            $(idpClaimListDiv.find('select')).attr('id', 'idpClaim_' + claimMappinRowID);
            $(idpClaimListDiv.find('select')).attr('name', 'idpClaim_' + claimMappinRowID);
            $(idpClaimListDiv.find('select')).addClass("idpClaim form-control");
        }
        if ($('input:radio[name=claim_dialect]:checked').val() == "local") {
            $('.spClaimHeaders').hide();
            $('#roleMappingSelection').hide();
            $('#spccol').hide();
            $('#rccol').hide();
            jQuery('#claimMappingAddTable').append(jQuery('<tr>' +
                '<td style="display:none;"><input type="text"" id="spClaim_' + claimMappinRowID + '" name="spClaim_' + claimMappinRowID + '"/></td> ' +
                '<td style="width: 85%;">' + idpClaimListDiv.html() + '</td>' +
                '<td style="text-align: center;display:none;"><div class="checkbox"><label><input type="checkbox"  class="custom-checkbox custom-checkbox-white" name="spClaim_req_' + claimMappinRowID + '"  id="spClaim_req_' + claimMappinRowID + '" checked/></label></div></td>' +
                '<td><a onclick="deleteClaimRow(this);return false;" href="#" class="icon-link" style="background-image: url(images/delete.gif)"> Delete</a></td>' +
                '</tr>'));
        }
        else {
            $('.spClaimHeaders').show();
            $('#roleMappingSelection').show();
            $('#spccol').show();
            $('#rccol').show();
            jQuery('#claimMappingAddTable').append(jQuery('<tr>' +
                '<td><input type="text" class="spClaimVal form-control"" id="spClaim_' + claimMappinRowID + '" name="spClaim_' + claimMappinRowID + '"/></td> ' +
                '<td style="width: 40%;">' + idpClaimListDiv.html() + '</td>' +
                '<td style="text-align: center;"><div class="checkbox"><label><input type="checkbox"  class="custom-checkbox custom-checkbox-white" name="spClaim_req_' + claimMappinRowID + '"  id="spClaim_req_' + claimMappinRowID + '"/></label></div></td>' +
                '<td><a onclick="deleteClaimRow(this);return false;" href="#" class="icon-link" style="background-image: url(images/delete.gif)"> Delete</a></td>' +
                '</tr>'));
            $('#spClaim_' + claimMappinRowID).change(function () {
                resetRoleClaims();
            });
        }

    });

    $("[name=claim_dialect]").click(function () {
        var element = $(this);
        claimMappinRowID = -1;
        if ($('.idpClaim').length > 0) {
            $.each($('.idpClaim'), function () {
                $(this).parent().parent().remove();
            });
            $('#claimMappingAddTable').hide();
            changeDialectUIs(element);

        } else {
            $('#claimMappingAddTable').hide();
            changeDialectUIs(element);
        }
        // TODO : Handle error messages
        // TODO : Following is the correct code
        //if ($('.idpClaim').length > 0) {
        //    CARBON.showConfirmationDialog('Changing dialect will delete all claim mappings. Do you want to proceed?',
        //        function () {
        //            $.each($('.idpClaim'), function () {
        //                $(this).parent().parent().remove();
        //            });
        //            $('#claimMappingAddTable').hide();
        //            changeDialectUIs(element);
        //        },
        //        function () {
        //            //Reset checkboxes
        //            $('#claim_dialect_wso2').attr('checked', (element.val() == 'custom'));
        //            $('#claim_dialect_custom').attr('checked', (element.val() == 'local'));
        //        });
        //} else {
        //    $('#claimMappingAddTable').hide();
        //    changeDialectUIs(element);
        //}
    });
}

function getClaimUrisClaimConfig(spClaimConfig, isLocalClaimsSelected, claimMapping) {

    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/samlSSOConfigClient.jag",
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName + "&clientAction=getClaimURIs",
        success: function (data) {
            spConfigClaimUris = $.parseJSON(data).return;
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
    }
    drawClaimConfig(spClaimConfig, isLocalClaimsSelected, claimMapping);
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