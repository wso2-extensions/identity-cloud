function drawAddSP(sptype) {
    var output = "";
    output = '<div class="container-fluid form-listing">'+
        '<div class="col-md-5 forms">'+
        '<div class="form-group">'+
        '<label for="spName">Application Name: </label>'+
        '<input id="spName" name="spName" type="text" class="form-control" placeholder="Enter application name" autofocus/>'+
        '<label id="spName-error" class="error" hidden="" for="issuer">This field is required.</label>'+
        '</div>'+
        '<div class="form-group">'+
        '<label for="spDesc" >Description: </label>'+
        '<textarea id="spDesc" name="spDesc" class="form-control" rows="3" ></textarea>'+
        '<input type="hidden" value="'+sptype+'" id="spType" name="spType" />\n' +
        '</div>'+
        '<div class="form-group">'+
        '<button class="cu-btn cu-btn-sm cu-btn-blue cu-btn-position" onclick="validateSPName(\''+sptype+'\');return false;" >'+
        '<span class="fw-stack fw-lg btn-action-ico">'+
        '<i class="fw fw-circle-outline fw-stack-2x"></i>'+
        '<i class="fw fw-register fw-stack-1x"></i>'+
        '</span>'+
        ' Register'+
        '</button>'+
        '</div>'+
        '</div>'+
        '</div>';
    $("#addSPBody").empty();
    $("#addSPBody").append(output);
}

function validateSPName(sptype) {
    var spName = $("input[id='spName']").val();
    if (spName.length == 0) {
        message({
            labelId: 'spName-error', content: 'Service Provider name can\'t be empty', type: 'error'
        });
        return false;
    } else {
        $('#spName-error').hide();
        registerCustomSP(sptype);
    }
}

function registerCustomSP(sptype) {
    var str = "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/add_finish";
    $.ajax({
        url: str,
        type: "POST",
        data: "spName=" + $('#spName').val() + "&spDesc=" + $('#spType').val() + ']' + $('#spDesc').val() + "&spType=" + sptype + "&profileConfiguration=default" + "&cookie=" + cookie + "&user=" + userName,
    })
        .done(function (data) {

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
                window.location.href = "/" + ADMIN_PORTAL_NAME + "/serviceprovider/" + $('#spName').val();
            }
        })
        .fail(function () {
            console.log('Error Occurred');
            message({content: 'Error while adding Service Provider. ', type: 'servererror'});
        })
        .always(function () {
            console.log('completed');
        });
}

function cancel() {
    gadgets.Hub.publish('org.wso2.is.dashboard', {
        msg: 'A message from User profile',
        id: "custom_sp .shrink-widget"
    });
}

