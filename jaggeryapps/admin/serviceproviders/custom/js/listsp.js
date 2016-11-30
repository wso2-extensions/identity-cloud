function deleteCustomSP(applicationName) {
    var str = PROXY_CONTEXT_PATH + "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/delete_finish.jag";
    $.ajax({
            url: str,
            type: "POST",
            data: "applicationName=" + applicationName + "&profileConfiguration=default" + "&cookie=" + cookie + "&user=" + userName,
        })
        .done(function (data) {
            reloadGrid();
            //message({content:'Successfully saved changes to the profile',type:'info', cbk:function(){} });

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
/**
 * This method will delete a given application without page refresh
 * @param applicationName
 */
function deleteCustomSPWithoutRefresh(applicationName) {
    var str = "/" + ADMIN_PORTAL_NAME + "/serviceproviders/custom/controllers/custom/delete_finish.jag";
    $.ajax({
            url: str,
            async: false,
            type: "POST",
            data: "applicationName=" + applicationName + "&profileConfiguration=default" + "&cookie=" + cookie + "&user=" + userName,
        })
        .done(function (data) {


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

function reloadGrid() {
    spList = null;
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/getSPList",
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName,
        success: function (data) {
            if (data) {
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
                    spList = resp.return;
                    if (spList != null && spList.constructor !== Array) {
                        var arr = [];
                        arr[0] = spList;
                        spList = arr;
                    }
                    drawList();
                }
            } else {
                $('#spList').hide();
                $('#emptyList').show();
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

function downloadIDPMetaData() {
    idpMetadata = null;
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/downloadmetadata",
        type: "GET",
        data: "",
        success: function (data) {
            if(data) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
                element.setAttribute('download', 'SAMLMetadata.xml');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        },
        error: function (e) {
            message({
                content: 'Error occurred while downloading IDP SAML metadata.', type: 'error', cbk: function () {
                }
            });
        }
    });
}

function    drawList() {
    var output = "";
    $("#listBody").empty();
    if (spList != null) {
        $('#spList').show();
        $('#emptyList').hide();
        for (var i in spList) {
            var sampleIcon ='';
            var appName = spList[i].applicationName;
            var spdesc = spList[i].description;
            var spimage = '<img src="images/is/custom.png " class="square-element">';
            var sampleIcon = '';

            if(appName == APP_NAME1 || appName == APP_NAME2) {
                sampleIcon ='<div class="app-sample-icon" title="Sample"><span>Sample</span></div>';
            }

            if (spList[i].description.indexOf(']') > -1 ) {
                spdesc = spList[i].description.split(']') [1];
                var type = spList[i].description.split(']') [0];

                if (type == CUSTOM_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/custom.png " class="square-element">';
                } else if (type == CONCUR_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/concur.png " class="square-element">';
                } else if (type == GOTOMEETING_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/gotomeeting.png " class="square-element">';
                } else if (type == NETSUIT_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/netsuit.png " class="square-element">';
                } else if (type == ZUORA_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/zuora.png " class="square-element">';
                } else if (type == SALESFORCE_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/salesforce.png " class="square-element">';
                } else if (type == AMAZON_SP) {
                    spimage = '<img id=' + appName + ' src="images/is/aws.png " class="square-element">';
                } else if (type == "sample") {
                    if (appName == APP_NAME1) {
                        spimage = '<img src="images/is/sample/sampleApp1.jpg" class="sample square-element">';
                    } else if (appName == APP_NAME2) {
                        spimage = '<img  src="images/is/sample/sampleApp2.jpg " class="sample square-element">';
                    }
                } else {
                    spimage = '<img id=' + appName + ' src="images/is/custom.png " class="square-element">';
                }
                setCustomImage(appName);
            }
            output = output + '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">' +
                '                    <div class="cloud-app-listing app-color-one">' +
                                        sampleIcon +
                '                        <a href="/'+ ADMIN_PORTAL_NAME +'/serviceprovider/'+spList[i].applicationName+'">' +
                '                            <div class="app-icon">' +
                spimage +
                '                            </div>' +
                '                            <div class="app-name" >' + spList[i].applicationName +
                '                            </div>' +
                '                        </a>' +
                '                        <a class="dropdown-toggle app-extra" data-toggle="dropdown">' +
                '                            <i class="fa fa-ellipsis-v"></i>' +
                '                            <span class="sr-only">Toggle Dropdown</span>' +
                '                        </a>' +
                '                        <ul class="dropdown-menu app-extra-menu" role="menu">' +
                '                            <li><a href="/'+ ADMIN_PORTAL_NAME +'/serviceprovider/'+spList[i].applicationName+'">Edit</a></li>' +
                '                            <li><a href="" onclick = deleteCustomSP(\'' + spList[i].applicationName + '\');>Delete</a></li>' +
                '                        </ul>' +
                '                    </div>' +
                '               </div>';
        }
        $("#listBody").append(output);
    } else {
        $('#spList').hide();
        $('#emptyList').show();
    }

    if ($("#searchBar").is(':visible')) {
        var cloneElement = $("#msg-issue-element").clone();
        $("#msg-issue-element").remove();
        $("#searchBox").addClass("search-margin");
        $("#searchBar").prepend(cloneElement);
    }
}

function drawListOverview(spList) {
    var output = "";
    var count = 0;
    $("#ovr-app-listing").empty();
    if (spList != null) {
        $('#spList').show();
        $('#emptyList').hide();
        for (var i in spList) {
            var appName = spList[i].applicationName;
            count += 1;
            if (count <= 3){
                var spdesc = spList[i].description;
                var spimage = '<img src="../images/is/custom.png " class="square-element">';
                var sampleIcon = '';

                if(appName == APP_NAME1 || appName == APP_NAME2) {
                    sampleIcon ='<div class="app-sample-icon" title="Sample"><span>Sample</span></div>';
                }

                if (spList[i].description.indexOf(']') > -1) {
                    spdesc = spList[i].description.split(']') [1];
                    var type = spList[i].description.split(']') [0];
                    var appName = spList[i].applicationName;

                    if (type == CUSTOM_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/custom.png " class="square-element">';
                    } else if (type == CONCUR_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/concur.png " class="square-element">';
                    } else if (type == GOTOMEETING_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/gotomeeting.png " class="square-element">';
                    } else if (type == NETSUIT_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/netsuit.png " class="square-element">';
                    } else if (type == ZUORA_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/zuora.png " class="square-element">';
                    } else if (type == SALESFORCE_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/salesforce.png " class="square-element">';
                    } else if (type == AMAZON_SP) {
                        spimage = '<img id=' + appName + ' src="../images/is/aws.png " class="square-element">';
                    } else if (type == "sample") {
                        if (appName == APP_NAME1) {
                            spimage = '<img src = "../images/is/sample/sampleApp1.jpg" class="sample square-element">';
                        } else if (appName == APP_NAME2) {
                            spimage = '<img  src = "../images/is/sample/sampleApp2.jpg " class="sample square-element">';
                        }
                    } else {
                        spimage = '<img id=' + appName + ' src="../images/is/custom.png " class="square-element">';
                    }
                    setCustomImage(appName);
                }
                output = output + '<div class="col-xs-6 col-sm-4  col-md-4 col-lg-4 pull-right">' +
                    '                    <div class="cloud-app-listing app-color-one">' +
                                            sampleIcon +
                    '                        <a href="/' + ADMIN_PORTAL_NAME + '/serviceprovider/' + spList[i].applicationName + '">' +
                    '                            <div class="app-icon">' +
                    spimage +
                    '                            </div>' +
                    '                            <div class="app-name" >' + spList[i].applicationName +
                    '                            </div>' +
                    '                        </a>' +
                    '                        <a class="dropdown-toggle app-extra" data-toggle="dropdown">' +
                    '                            <i class="fa fa-ellipsis-v"></i>' +
                    '                            <span class="sr-only">Toggle Dropdown</span>' +
                    '                        </a>' +
                    '                        <ul class="dropdown-menu app-extra-menu" role="menu">' +
                    '                            <li><a href="/' + ADMIN_PORTAL_NAME + '/serviceprovider/' + spList[i].applicationName + '">Edit</a></li>' +
                    '                        </ul>' +
                    '                    </div>' +
                    '               </div>';
            }

        }
        $("#ovr-app-listing").append(output);
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
                           $('#' + appName).attr('src', link);
                       }
                   }
               },
               error: function (e) {
               }
           });
}