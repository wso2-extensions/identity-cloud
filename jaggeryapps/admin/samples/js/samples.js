
function setupSamples(){

    $('#process-icon').show()
    var url = SAMPLE_DIRECTORY_ADD_PATH;
    $.ajax({
        url: url,
        type: "POST",
        data: "",
    })
        .done(function (data) {

            var resp = $.parseJSON(data);
            if (resp.success == true) {
                while (!checkUserStoreExist(resp.domain)) {
                    setTimeout(function () {
                        console.log("Waiting for complete ...")
                    }, 2000);
                }
                addSampleUsers();
            } else {

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
            }
        })
        .fail(function () {
            $('#process-icon').hide()
            message({content: 'Error while adding Directory. ', type: 'servererror'});
        })
        .always(function () {
            console.log('completed');
        });
}

function checkUserStoreExist(domain){

    var result = false;
    var url = DIRECTORY_GET_PATH + "?domain=" + domain;
    $.ajax({
        url: url,
        type: "POST",
        async: false,
        data: "",
    })
        .done(function (data) {

            var resp = $.parseJSON(data);
            if (resp.success == false) {
                console.log("checking user store  : " + resp.success);
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
                if(resp.return != ""){
                    result = true;
                }
            }

        })
        .fail(function () {
            $('#process-icon').hide();
            message({content: 'Error while adding Directory. ', type: 'servererror'});
        })
        .always(function () {
            console.log('completed');
        });
    return result;
}

function addSampleUsers(){

    var url = SAMPLE_ADD_USERS_FINISH_PATH;
    $.ajax({
        url: url,
        type: "POST",
        data: "",
    })
        .done(function (data) {

            var resp = $.parseJSON(data);
            if (resp.success == true) {
                window.location.href = SAMPLE_USERS_LIST_PATH;
            } else {

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
            }
            $('#process-icon').hide()

        })
        .fail(function () {
            $('#process-icon').hide();
            message({content: 'Error while adding Directory. ', type: 'servererror'});
        })
        .always(function () {
            console.log('completed');
        });

}


function getSampleUsers(){
    userList = null;
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/directories/get-sample-user-list",
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName,
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
                userList = resp;
                if (userList != null && userList.constructor !== Array) {
                    var arr = [];
                    arr[0] = userList;
                    userList = arr;
                }
                drawList();
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

function drawList() {
    var output = "";
    if (userList != null) {
        for (var i = 0; i < userList.length; i++) {
            console.log(userList[i].name);
            var table = document.getElementById("userTable").getElementsByTagName('tbody')[0];
            var row = table.insertRow(0);
            row.className = "info";
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            cell1.innerHTML = userList[i].name;
            cell2.innerHTML = '<div class="input-append input-group"><input id="password" class="form-control" type="password" value="'+ userList[i].password + '" placeholder="password" style="display: block;"> <span tabindex="100" title="Click here show/hide password" onclick="togglePassword(this);" class="add-on input-group-addon " style="cursor: pointer;"><i class="fw  fw-hide">   </i></span></div>';
        }
    }
}

/**
 * This method will toggle password text to visible/hide status
 * @param element
 */
function togglePassword(element) {
    var relatedTextBox = $($(element).parent().find('input')[0]);
    if ($(relatedTextBox).attr('type') === "text") {
        $(relatedTextBox).attr('type', 'password');
        $($(element).find('i')[0]).removeClass('fw-view').addClass('fw-hide');
    } else if ($(relatedTextBox).attr('type') === "password") {
        $(relatedTextBox).attr('type', 'text');
        $($(element).find('i')[0]).removeClass('fw-hide').addClass('fw-view');
    }
}

function viewApplications(){
    window.location.href = "../serviceproviders";
}

function gotoUserPortal(){
    window.location.href = USER_PORTAL_LINK;
}