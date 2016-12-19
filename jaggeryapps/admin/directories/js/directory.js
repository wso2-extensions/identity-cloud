var userstoredomain = "is-wso2.com";
var endpointurl = "EndPointURL";
var uniqueId = "UniqueID";
var disabled = "Disabled";
var properties = null;
const CONNECTION_NOT_ESTABLISHED_MSG = "The connection to the provided URL could not be established.";
var showWarning = false;
var showedOnce = false;

function addOrUpdateUserDirectory() {
    var name = document.getElementById("drName").value;
    var agentUrl = document.getElementById("agentUrl").value;
    var agentUniqueId = document.getElementById("uniqueid").value;
    var agentDisabled = document.getElementById("disabled").value;
    var url;
    var data;


    if (!validateDirectory(name, agentUrl)) {
        return;
    }

    if (agentUrl.substring(agentUrl.length - 1, agentUrl.length) == "/") {
        agentUrl = agentUrl.substring(0, agentUrl.length - 1);
    }

    var domain = $('#domain').attr('value');
    if (domain != null && domain != 'null') {
        data = "name=" + name + "&url=" + agentUrl + "&uniqueid=" + agentUniqueId + "&disabled=" + agentDisabled;
        url = DIRECTORY_UPDATE_FINISH_PATH;
    } else {
        data = "name=" + name + "&url=" + agentUrl;
        url = DIRECTORY_ADD_FINISH_PATH;
    }

    $("#btn-save").hide();
    $("#add-directory-loading").show();
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

            var resp = $.parseJSON(data);
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

                if (!retryState) {
                    $(".connection-status").first().html("User directory indexing retry count exceeded.");
                    $("#verified").find("span:nth-child(1)").find("i:nth-child(2)").removeClass("fw-check");
                    $("#verified").find("span:nth-child(1)").find("i:nth-child(2)").addClass("fw-cancel");
                }

                // when success connection creation
                $("#model-button-ok").show();
                $("#model-text").hide();
                $("#verified").show();
                $("#process-icon").hide();
                $("#model-title").text("User Directory");
                $("#btn-close").hide();
                $("#add-directory-loading").hide();
                if (!$("#btn-success").is(':visible')) {
                    $("#action-buttons").html('<a class="cu-btn cu-btn-md cu-btn-blue" ' +
                        'href="javascript:urlResolver(&#39applist&#39)"> <span class="fw-stack fw-lg btn-action-ico"> ' +
                        '<i class="fw fw-circle-outline fw-stack-2x"></i> <i class="fw fw-list fw-stack-1x"></i> </span> ' +
                        '<span>Skip to application list</span> </a>');
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
            $("#btn-save").show();
            $("#add-directory-loading").hide();
            message({content: 'Error while adding Directory. ', type: 'servererror'});
        })
        .always(function () {
        });
}

function updateUserDirectory() {
    // since we are using only one user directory
    var domain = userstoredomain;
    var name = document.getElementById("drName").value;
    var agentUrl = document.getElementById("agentUrl").value;
    var agentUniqueId = document.getElementById("uniqueid").value;
    var agentDisabled = document.getElementById("disabled").value;
    var url;
    var data;

    if (!validateDirectory(name, agentUrl)) {
        return;
    }

    if (agentUrl.substring(agentUrl.length - 1, agentUrl.length) == "/") {
        agentUrl = agentUrl.substring(0, agentUrl.length - 1);
    }

    if (domain != null && domain != 'null') {
        data = "name=" + name + "&url=" + agentUrl + "&uniqueid=" + agentUniqueId + "&disabled=" + agentDisabled;
        url = DIRECTORY_UPDATE_FINISH_PATH;
    } else {
        data = "name=" + name + "&url=" + agentUrl;
        url = DIRECTORY_ADD_FINISH_PATH;
    }


    $("#btn-save").hide();
    $("#add-directory-loading").show();
    var currentUrl = checkDirectory(DEFAULT_USER_STORE_DOMAIN).properties[75].value;
    $.ajax({
            url: url,
            type: "POST",
            async: false,
            cache: false,
            data: data,
        })
        .done(function (data) {

            var resp = $.parseJSON(data);
            if (resp.success == true) {

                var retryCount = 0;
                var retryState = true;

                while (agentUrl != currentUrl && retryState) {
                    wait(DIRECTORY_TIMEOUT);
                    var directoryList = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
                    retryCount += 1;
                    if (directoryList && directoryList.properties) {
                        currentUrl = directoryList.properties[75].value;
                    } else if (directoryList.length >= 1) {
                        $.each(directoryList, function (key, value) {
                            if (value.domainId === DEFAULT_USER_STORE_DOMAIN) {
                                currentUrl = value.properties[75].value;
                            }
                        });
                    }

                    if (retryCount > RETRY_COUNT) {
                        retryState = false;
                    }
                }
                window.location.href = DIRECTORY_LIST_PATH;
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
            $("#btn-save").show();
            $("#add-directory-loading").hide();
            message({content: 'Error while adding Directory. ', type: 'servererror'});
        })
        .always(function () {
        });
}

function validateDirectory(name, agentUrl) {
    if (name.length == 0) {
        message({labelId: 'drName-error', content: 'Directory name can\'t be empty', type: 'error'});
        return false;
    } else {
        $('#drName-error').hide();
    }

    if (agentUrl.length == 0) {
        message({labelId: 'agentUrl-error', content: 'Agent URL can\'t be empty', type: 'error'});
        return false;
    } else {
        $('#agentUrl-error').hide();
    }

    return true;
}

function getDirectories() {
    directoryList = null;
    $.ajax({
        url: DIRECTORY_GET_LIST_PATH,
        type: "GET",
        data: "",
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
                '                            <li><a href="" onclick = deleteDirectory(\'' + userstoredomain + '\');>Delete</a></li>' +
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

function deleteDirectory(domainname) {

    $("#btn-progress").show();
    $("#btn-delete").hide();
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
            var resp = $.parseJSON(data);
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
                urlResolver('overview');
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

    var directoryName = "";
    $.ajax({
        url: DIRECTORY_GET_LIST_PATH,
        type: "GET",
        data: "domain=" + domain,
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
                        directoryName = directoryList[i].description;
                        properties = directoryList[i].properties;
                    }
                }
                drawUpdatePage(directoryName, properties);
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

function downloadAgent() {

    $.ajax({
        url: DIRECTORY_DOWNLOAD_FINISH_PATH,
        type: "GET",
        data: "domain=" + domain,
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

function downloadAgentRedirect(param) {
    $.ajax({
        url: DIRECTORY_DOWNLOAD_FINISH_PATH,
        type: "GET",
        data: "domain=" + domain,
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
                urlResolver(param);
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

function showHideConfigureAgentURL() {
    if ($("#configure-agent").is(":visible")) {
        $("#configure-agent").slideToggle(1000);
        $("#btn-configure-agent-url").html('<span class="fw-stack btn-action-ico">' +
            '<i class="fw fw-circle-outline fw-stack-2x"></i><i class="fw fw-down fw-stack-1x">' +
            '</i></span><span class="btn-content">  Configure agent URL</span>');
    } else {
        $("#configure-agent").slideToggle(1000);
        $("#btn-configure-agent-url").html('<span class="fw-stack btn-action-ico">' +
            '<i class="fw fw-circle-outline fw-stack-2x"></i><i class="fw fw-up fw-stack-1x">' +
            '</i></span><span class="btn-content">  Configure agent URL</span>');
    }
}

function validateURL(textval) {
    var isValidated = validateInput(document.getElementById("agentUrl"));
    return isValidated["isValid"] == true;
}
function checkhttps(url){
    var urlregex = getPattern("https-url");
    return urlregex.test(url);
}
function checkhttp(url){
    var urlregex = getPattern("http-url");
    return urlregex.test(url);
}

function testConnection(agentUrl) {
    var messageContainer = "<label class='' for='agentUrl' role='alert'>" +
        "<span class='alert-content'></span></label>";

    if (agentUrl.substring(agentUrl.length - 1, agentUrl.length) == "/") {
        agentUrl = agentUrl + "status";
    } else {
        agentUrl = agentUrl + "/" + "status";
    }


    $.ajax({
        url: DIRECTORY_TEST_CONNECTION_PATH,
        type: "GET",
        data: "url=" + agentUrl,
        success: function (data) {
            if (data) {
                $('.connectionStatus').html('');
                if ($.parseJSON(data).return == "true") {
                    $('.connectionStatus').html($(messageContainer).addClass('success').hide()
                        .fadeIn('fast').delay(3000).fadeOut('fast'));
                    $('.connectionStatus').find('.alert-content')
                        .text('The connection to provided URL was successful.');
                    
                } else if ($.parseJSON(data).return == "false") {
                    $('.connectionStatus').html($(messageContainer).addClass('error').hide()
                        .fadeIn('fast').delay(3000).fadeOut('fast'));
                    $('.connectionStatus').find('.alert-content')
                        .text(CONNECTION_NOT_ESTABLISHED_MSG);
                } else {
                    $('.connectionStatus').html($(messageContainer).addClass('error').hide()
                        .fadeIn('fast').delay(3000).fadeOut('fast'));
                    $('.connectionStatus').find('.alert-content')
                        .text(CONNECTION_NOT_ESTABLISHED_MSG);
                    var resp = $.parseJSON(data);
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
            }
        },
        error: function (e) {
            $('.connectionStatus').html('');
            $('.connectionStatus').html($(messageContainer).addClass('error').hide()
                .fadeIn('fast').delay(3000).fadeOut('fast'));
            $('.connectionStatus').find('.alert-content')
                .text(CONNECTION_NOT_ESTABLISHED_MSG);
        }
    });

}


function verifyConnection(agentUrl) {
    if (agentUrl) {
        var messageContainer = "<div class='alert' role='alert'>" +
            "<span class='alert-content'></span></div>";

        if (agentUrl.substring(agentUrl.length - 1, agentUrl.length) == "/") {
            agentUrl = agentUrl + "status";
        } else {
            agentUrl = agentUrl + "/" + "status";
        }
        
        $('.connectionStatus').empty();

        $.ajax({
            url: DIRECTORY_TEST_CONNECTION_PATH,
            type: "GET",
            data: "url=" + agentUrl,
            success: function (data) {
                if (data) {
                    if ($.parseJSON(data).return == "true") {
                        $("#verified").show();
                        $("#process-icon").hide();
                        $("#unverified").hide();
                        $("#progress-icon").hide();
                    } else if ($.parseJSON(data).return == "false") {
                        $("#verified").hide();
                        $("#unverified").show();
                        $("#progress-icon").hide();
                    } else {
                        var resp = $.parseJSON(data);
                        if (typeof resp.reLogin != 'undefined' && resp.reLogin == true) {
                            window.top.location.href = window.location.protocol + '//' + serverUrl + '/' + ADMIN_PORTAL_NAME + '/logout.jag';
                        } else {
                            if (resp.message != null && resp.message.length > 0) {
                                $("#verified").hide();
                                $("#unverified").show();
                                $("#progress-icon").hide();
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
                }
            },
            error: function (e) {
                $('.connectionStatus').append($(messageContainer).addClass('alert-error').hide()
                    .fadeIn('fast').delay(2000).fadeOut('fast'));
                $('.connectionStatus').find('.alert-content')
                    .text(CONNECTION_NOT_ESTABLISHED_MSG)
                $("#verified").hide();
                $("#unverified").show();
                $("#progress-icon").hide();
            }
        });
    } else {
        $("#verified").hide();
        $("#unverified").show();
        $("#progress-icon").hide();
    }

}


function drawUpdatePage(directoryName, properties) {

    var agentEndpoint;
    var agentUniqueId;
    var agentDisabled;

    for (var j in properties) {
        if (properties[j].name == endpointurl) {
            agentEndpoint = properties[j].value;
        } else if (properties[j].name == uniqueId) {
            agentUniqueId = properties[j].value;
        } else if (properties[j].name == disabled) {
            agentDisabled = properties[j].value;
        }
    }

    $('#agentUrl').val(agentEndpoint);
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


function initValidate() {

    $("#agent-download-form").validate();
    jQuery.validator.addMethod("connection", function () {
        return testConnection(document.getElementById('agentUrl').value);
    }, "wrong nic number");

    $.validator.addMethod("url2", function (value, element) {
        return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }, $.validator.messages.url);

    $("input[id*=agentUrl]").rules("add", {
        required: true,
        url2: true,
        messages: {
            required: "This field cannot be empty",
            url: "Please enter valid URL",
            connection: "Connection is not valid"
        }
    });
}


function validateBeforeSubmit() {
    initValidate();
    if ($("#agent-download-form").valid()) {
        testConnection(document.getElementById('agentUrl').value);

    }
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

$('#agentUrl').on('input', function() {
    var messageContainer = "<label class='' for='agentUrl' role='alert'>" +
        "<span class='alert-content'></span></label>";
    var agentUrl = $('#agentUrl').val();

    showWarning = checkhttp(agentUrl);
    if (!showedOnce && showWarning) {
        $('.connectionStatus').html($(messageContainer).addClass('warning'));
        $('.connectionStatus').find('.alert-content')
            .text('Your connection is not secure. Use https.');
        showedOnce = true;
    } else if (checkhttps(agentUrl)) {
        $('.connectionStatus').html('');
        showedOnce = false;
    }

    if (agentUrl.includes("localhost:")) {
        $.validator.addMethod("localhostUrl", function (value, element) {
                var re = new RegExp(/^(localhost:)/);
                return this.optional(element) || re.test(value);
            },
            $.validator.messages.localhostUrl);

        $("input[id*=agentUrl]").rules("add", {
            localhostUrl: true,
            messages: {
                localhostUrl: "'localhost' can not be used within the agent URL."
            }
        });
    } else {
        $("input[id*=agentUrl]").rules("add", {
            localhostUrl: false
        });
    }

});