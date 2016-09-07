function deleteCustomSP(applicationName) {
    var str = PROXY_CONTEXT_PATH + "/dashboard/serviceproviders/custom/controllers/custom/delete_finish.jag";
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

function reloadGrid() {
    spList = null;
    $.ajax({
        url: "/dashboard/serviceproviders/getSPList",
        type: "GET",
        data: "&cookie=" + cookie + "&user=" + userName,
        success: function (data) {
            if(data) {
                spList = $.parseJSON(data).return;
            }
            if (spList!=null && spList.constructor !== Array) {
                var arr = [];
                arr[0] = spList;
                spList = arr;
            }
            drawList();
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
        url: "/dashboard/serviceproviders/downloadmetadata",
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

function drawList() {
    var output = "";
    $("#listBody").empty();
    if (spList != null) {
        $('#spList').show();
        $('#emptyList').hide();
        for (var i in spList) {
            var spdesc = spList[i].description;
            var spimage = '<img src="images/is/custom.png " class="square-element">';
            if (spList[i].description.indexOf(']') > -1) {
                spdesc = spList[i].description.split(']') [1];
                var type = spList[i].description.split(']') [0];
                if (type == CUSTOM_SP) {
                    spimage = '<img src="images/is/custom.png " class="square-element">';
                } else if (type == CONCUR_SP) {
                    spimage = '<img src="images/is/concur.png " class="square-element">';
                } else if (type == GOTOMEETING_SP) {
                    spimage = '<img src="images/is/gotomeeting.png " class="square-element">';
                } else if (type == NETSUIT_SP) {
                    spimage = '<img src="images/is/netsuit.png " class="square-element">';
                } else if (type == ZUORA_SP) {
                    spimage = '<img src="images/is/zuora.png " class="square-element">';
                } else if (type == SALESFORCE_SP) {
                    spimage = '<img src="images/is/salesforce.png " class="square-element">';
                } else if (type == AMAZON_SP) {
                    spimage = '<img src="images/is/aws.png " class="square-element">';
                } else {
                    spimage = '<img src="images/is/custom.png " class="square-element">';
                }
            }
            output = output + '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">' +
                '                    <div class="cloud-app-listing app-color-one">' +
                '                        <a href="/dashboard/serviceprovider/'+spList[i].applicationName+'">' +
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
                '                            <li><a href="/dashboard/serviceprovider/'+spList[i].applicationName+'">Edit</a></li>' +
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

}
