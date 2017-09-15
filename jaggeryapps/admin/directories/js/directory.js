var userstoredomain = "is-wso2.com";
var endpointurl = "EndPointURL";
var uniqueId = "UniqueID";
var disabled = "Disabled";
var properties = null;

function addOrUpdateUserDirectory() {
    var agentUniqueId = document.getElementById("uniqueid").value;
    var agentDisabled = document.getElementById("disabled").value;
    var url;
    var data;
    var domain = $('#domain').attr('value');
    if (domain != null && domain != 'null') {
        data = "name=" + name + "&accessToken=" + generateAccessToken() + "&domain=" + userstoredomain + "&uniqueid=" + agentUniqueId + "&disabled=" + agentDisabled;
        url = DIRECTORY_UPDATE_FINISH_PATH;
    } else {
        data = "name=" + name + "&accessToken=" + generateAccessToken() + "&domain=" + userstoredomain;
        url = DIRECTORY_ADD_FINISH_PATH;
    }

    var dirList = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
    var currentCount = 0 ;
    var newCount = 0 ;
    $.ajax({
            url: url,
            type: "POST",
            async: false,
            cache: false,
            data: data,
        })
        .done(function (data) {

            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }
            if (resp.success == true) {

                if (dirList && dirList.domainId) {
                    currentCount =  newCount = 1;
                } else if (dirList && dirList.length > 0) {
                    currentCount = newCount = dirList.length;
                } else {
                    currentCount = newCount = 0;
                }

                var retryCount = 0;
                var retryState = true;

                while (currentCount == newCount && retryState) {
                    wait(DIRECTORY_TIMEOUT);
                    dirList = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
                    retryCount += 1;
                    if (dirList && dirList.domainId) {
                        newCount = 1;
                    } else if (dirList && dirList.length > 0) {
                        newCount = dirList.length;
                    } else {
                        newCount = 0;
                    }

                    if (retryCount > RETRY_COUNT) {
                        retryState = false;
                    }
                }

                $("#model-text").hide();
                $("#process-icon").hide();
                $("#model-title").hide();
                $("#connection-popup-modal").hide();
                $("#model-title").text("User Directory");
                $("#btn-close").hide();
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
            message({content: 'Error while adding Directory. ', type: 'servererror'});
        })
        .always(function () {
        });
}

function getDirectories() {
    directoryList = null;
    $.ajax({
        url: DIRECTORY_GET_LIST_PATH,
        type: "GET",
        data: "",
        success: function (data) {

            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }

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
                directoryList = $.parseJSON(data).return;
                if (directoryList != null && directoryList.constructor !== Array) {
                    var arr = [];
                    arr[0] = directoryList;
                    directoryList = arr;
                }
                drawList();
            }
        },
        error: function (e) {
            message({
                content: 'Error occurred while loading directory information.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function drawList() {
    var isUserStoreCreated = false;
    var properties = null;
    var agentUrl = null;
    var output;


    $("#listBody").empty();
    if (directoryList != null) {
        $('#drList').show();
        $('#emptyList').hide();
        for (var i in directoryList) {
            var spdesc = directoryList[i].description;
            if (directoryList[i].domainId == userstoredomain) {
                isUserStoreCreated = true;
                properties = directoryList[i].properties;
            }
        }

        if (isUserStoreCreated) {
            for (var j in properties) {
                if (properties[j].name == endpointurl) {
                    agentUrl = properties[j].value;
                    break;
                }
            }

            var spimage = '<img src="images/is/custom.png " class="square-element">';
            output = '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">' +
                '                    <div class="cloud-app-listing app-color-one">' +
                '                        <a href="' + DIRECTORY_ADD_PATH + '?domain=' + userstoredomain + '">' +
                '                            <div class="app-icon">' +
                spimage +
                '                            </div>' +
                '                            <div class="app-name" >' + spdesc +
                '                            </div>' +
                '                        </a>' +
                '                        <a class="dropdown-toggle app-extra" data-toggle="dropdown">' +
                '                            <i class="fa fa-ellipsis-v"></i>' +
                '                            <span class="sr-only">Toggle Dropdown</span>' +
                '                        </a>' +
                '                        <ul class="dropdown-menu app-extra-menu" role="menu">' +
                '                            <li><a href="' + DIRECTORY_ADD_PATH + '?domain=' + userstoredomain + '">Edit</a></li>' +
                '                            <li><a href="" onclick = deleteDirectory(userstoredomain,\''+overview+'\');>Delete</a></li>' +
                '                        </ul>' +
                '                    </div>' +
                '               </div>';

            $("#listBody").append(output);
        } else {
            $('#emptyList').show();
        }

    } else {
        $('#drList').hide();
        $('#emptyList').show();
    }

}

function deleteDirectory(domainname, redirectPage) {
    $("#delete-label-text").hide();
    $("#process-icon").show();
    $("#delete-heading").text("Deleting User Directory");
    $("#delete-buttons-block").hide();
    var directoryStatus = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
    $.ajax({
            url: DIRECTORY_DELETE_FINISH_PATH,
            type: "POST",
            data: "domain=" + domainname,
        })
        .done(function (data) {
            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }
            if (resp.success == true) {

                var directoryLength = 0,newDirectoryLength = 0 ;
                if (directoryStatus && directoryStatus.domainId) {
                    directoryLength = newDirectoryLength = 1;
                } else if (directoryStatus) {
                    directoryLength = newDirectoryLength = directoryStatus.length;
                } else {
                    directoryLength = newDirectoryLength = 0;
                }

                var retryCount = 0 ;
                var retryState = true ;

                while (directoryLength == newDirectoryLength && retryState) {
                    wait(DIRECTORY_TIMEOUT);
                    directoryStatus = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
                    retryCount += 1;
                    if (directoryStatus && directoryStatus.domainId) {
                        newDirectoryLength = 1;
                    } else if (directoryStatus) {
                        newDirectoryLength = directoryStatus.length;
                    } else {
                        newDirectoryLength = -1;
                    }

                    if (retryCount > RETRY_COUNT) {
                        retryState = false;
                    }
                }
                if (redirectPage) {
                    urlResolver(redirectPage, userName);
                }
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
            $("#btn-progress").hide();
            $("#btn-delete").show();
            message({content: 'Error while deleting directory. ', type: 'servererror'});
        })
        .always(function () {
        });
}

function revokeAndRegenerateAccessToken(domainname) {

    $("#revoke-label-text").hide();
    $("#revoke-process-icon").show();
    $("#revoke-heading").text("Revoking & Re-generating access token");
    $("#revoke-buttons-block").hide();

    var accessToken = document.getElementById("accessToken").value;
    $.ajax({
        url: ACCESS_TOKEN_UPDATE_FINISH_PATH,
        type: "POST",
        data: "domain=" + domainname + "&oldaccesstoken=" + accessToken + "&newaccesstoken=" + generateAccessToken(),
    })
        .done(function (data) {
            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }
            if (resp.success == true) {
                urlResolver('directory', userName);
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
            $("#btn-progress").hide();
            $("#btn-delete").show();
            message({content: 'Error while deleting directory. ', type: 'servererror'});
        })
        .always(function () {
        });
}

function populateDirectory(domain) {

    $.ajax({
        url: DIRECTORY_GET_LIST_PATH,
        type: "GET",
        data: "domain=" + domain,
        success: function (data) {
            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }


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
                if (data) {
                    directoryList = $.parseJSON(data).return;
                }
                if (directoryList != null && directoryList.constructor !== Array) {
                    var arr = [];
                    arr[0] = directoryList;
                    directoryList = arr;
                }
                for (var i in directoryList) {
                    if (directoryList[i].domainId == domain) {
                        properties = directoryList[i].properties;
                    }
                }
                drawUpdatePage(properties);
            }
        },
        error: function (e) {
            message({
                content: 'Error occurred while lading directory information.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function populateAgentConnection(domain) {
    $.ajax({
        url: DIRECTORY_CONNECTIONS_GET_LIST,
        type: "GET",
        data: "domain=" + domain,
        success: function (data) {
            $("#noconnectiondiv").show();
            $("#downloadGuide").show();
            //Backend sends empty response with a new line when connection list is empty - Need to exclude that
            if (data && data.trim() != "") {
                var resp;
                try {
                    resp = $.parseJSON(data);
                } catch (err) {
                    urlResolver('login');
                }

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
                    if (data) {
                        connectionsList = $.parseJSON(data).return;
                    }
                    if (connectionsList != null && connectionsList.constructor !== Array) {
                        var arr = [];
                        arr[0] = connectionsList;
                        connectionsList = arr;
                    }
                    drawConnections(connectionsList);
                }
            }
        },
        error: function (e) {
            message({
                content: 'Error occurred while lading directory information.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function populateAccessToken(domain) {
    $.ajax({
        url: ACCESS_TOKEN_GET_PATH,
        type: "GET",
        data: "domain=" + domain,
        success: function (data) {
            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }

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
                if ($.parseJSON(data).return) {
                    $('#accessToken').val($.parseJSON(data).return);
                } else {
                    gotoDirectoryConfigure();
                }
            }
        },
        error: function (e) {
            message({
                content: 'Error occurred while lading directory information.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function gotoDirectoryConfigure(){
    var currentUrl, context, newUrl;
    currentUrl = window.location.href.toString();
    if (currentUrl && currentUrl.indexOf(ADMIN_PORTAL_NAME) > -1) {
        context = window.location.href.toString().split(ADMIN_PORTAL_NAME)[0];
        newUrl = context + ADMIN_PORTAL_NAME + "/directories/downloadagent";
        window.location.href = newUrl;
    }
}

function downloadAgent() {

    $.ajax({
        url: DIRECTORY_DOWNLOAD_FINISH_PATH,
        type: "GET",
        data: "domain=" + domain,
        success: function (data) {
            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }
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
                document.getElementById('ifrmDownload').src = DIRECTORY_DOWNLOAD_FINISH_PATH + "?download=true";
            }
        },
        error: function (e) {
            window.top.location.href = window.location.protocol + '//' + serverUrl + '/' + ADMIN_PORTAL_NAME + '/logout.jag';
            message({
                content: 'Error occurred while lading directory information.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function downloadAgentRedirect() {
    $.ajax({
        url: DIRECTORY_DOWNLOAD_FINISH_PATH,
        type: "GET",
        async:false,
        data: "domain=" + domain,
        success: function (data) {
            var resp;
            try {
                resp = $.parseJSON(data);
            } catch (err) {
                urlResolver('login');
            }
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
                document.getElementById('ifrmDownload').src = DIRECTORY_DOWNLOAD_FINISH_PATH + "?download=true";
            }
        },
        error: function (e) {
            window.top.location.href = window.location.protocol + '//' + serverUrl + '/' + ADMIN_PORTAL_NAME + '/logout.jag';
            message({
                content: 'Error occurred while lading directory information.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function drawConnections(properties) {

    $("#downloadGuide").hide();
    var isRecordExist = false;
    var isConnected = false;
    var table = document.getElementById("tblConnection");
    if(properties != null) {
        $("#tblConnection tr").remove();
        for (var j in properties) {
            if (properties[j].node != null && properties[j].node != "") {
                isRecordExist = true;
                var row = table.insertRow(0);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);

                if (properties[j].status == 'C') {
                    isConnected = true;
                    cell1.innerHTML = '<span class="fw-stack btn-action-ico noti-success"><i class="fw fw-circle-outline fw-stack-2x"></i><i class="fw fw-check fw-stack-1x"></i></span>';
                } else {
                    cell1.innerHTML = '<span class="fw-stack btn-action-ico noti-error"><i class="fw fw-circle-outline fw-stack-2x"></i><i class="fw fw-cancel fw-stack-1x"></i></span>';
                }
                cell2.innerHTML = properties[j].node;
                cell3.innerHTML = properties[j].status == 'C' ? "Connected" : "Failed";

            }
        }
        if(isConnected){
            $("#connectionInfodiv").show();
        }else{
            $("#connectionInfodiv").hide();
        }

        if (isRecordExist) {
            $("#noconnectiondiv").hide();
        } else {
            $("#noconnectiondiv").show();
            $("#downloadGuide").show();
        }
    }
}

function drawUpdatePage(properties) {

    var agentUniqueId;
    var agentDisabled;

    for (var j in properties) {
        if (properties[j].name == uniqueId) {
            agentUniqueId = properties[j].value;
        } else if (properties[j].name == disabled) {
            agentDisabled = properties[j].value;
        }
    }
    $('#uniqueid').val(agentUniqueId);
    $('#disabled').val(agentDisabled);
}

function gotoBack() {
    var domain = $('#domain').attr('value');
    if (domain != null && domain != 'null') {
        window.location.href = DIRECTORY_DOWNLOAD_PATH + "?domain=" + domain;
    } else {
        window.location.href = DIRECTORY_DOWNLOAD_PATH;
    }
}

function proceed() {
    var domain = $('#domain').attr('value');
    if (domain != null && domain != 'null') {
        window.location.href = DIRECTORY_ADD_PATH + "?domain=" + domain;
    } else {
        window.location.href = DIRECTORY_ADD_PATH;
    }
}

function cancel() {
    gadgets.Hub.publish('org.wso2.is.dashboard', {
        msg: 'A message from User profile',
        id: "custom_sp .shrink-widget"
    });
}

function generateAccessToken() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 32; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

$("#agent-download-form").submit(function(e) {
    e.preventDefault();
});

/**
 * This method will wait without skipping for next code line
 * @param ms milliseconds
 */
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}
