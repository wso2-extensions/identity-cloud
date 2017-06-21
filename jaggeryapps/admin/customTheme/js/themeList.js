/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 */
function showThemeInfo() {
    var str = "/" + ADMIN_PORTAL_NAME + "/customTheme/getThemeList";

    $.ajax({
               url: str,
               type: 'GET',
               success: function (data) {
                   var parsedResult;
                   try {
                       parsedResult = JSON.parse(data);
                   } catch(err) {
                       window.location.href = "login.jag";
                   }
                   var themeName = parsedResult['themeName'];
                   var description = parsedResult['themeDescription'];
                   $("#themeName").val(themeName);
                   $("#themeDescription").val(description);
               }
           });
}

function downloadThemeFile() {
    var str = "/" + ADMIN_PORTAL_NAME + "/customTheme/downloadTheme";
    document.getElementById('ifrmDownload').src = str;
 }


function showDeleteModal() {
    var themeName = $("#themeName").val();

    $('.delete-modal-content').html('');
    $('.btn-ok').html('');
    $('.delete-modal-content').append("Are you sure you want to delete theme: \"" + htmlEncode(themeName)  + "\"?" +
        "<p>This will delete the current theme from user portal and revert back to the default theme</p>");
    $('#delete-buttons-block .btn-ok').prepend('<button type="button" class="btn btn-default" id="delete">Yes</button>')
    $('#delete-popup-modal').modal('show');

    // bind delete event
    $("#delete").bind("click", function () {
        var str = "/" + ADMIN_PORTAL_NAME + "/customTheme/deleteTheme";
        $.ajax({
            url: str,
            type: 'POST',
            data: "",
            success: function (data) {
                var result;
                try {
                    result = JSON.parse(data);
                } catch(err) {
                    window.location.href = "login.jag";
                }
                // Redirect to theme upload page when there's no errors
                if (!result.error) {
                    window.top.location.href = window.location.protocol + '//' + serverUrl + '/' + ADMIN_PORTAL_NAME + '/customTheme/themeUpload';
                }
            }
        });
    });
}

/**
 * Encode html value using jQuery.
 * @method htmlEncode
 * @param {String} value html value to be encoded
 */
function htmlEncode(value){
    return $('<div/>').text(value).html();
}
