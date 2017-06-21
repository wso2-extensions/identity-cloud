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

function uploadTheme() {

    var themeName = $("#themeName").val();
    var description = $("#themeDescription").val();
    var themeFile = $("#themeFile")[0].files[0];

    var fileName = $("#themeFile").val().split('/').pop().split('\\').pop();
    var fileExt = fileName.substr(fileName.length - 4);
    if (fileExt != ".zip") {
        alert("File extension : " + fileExt + " of file : " + fileName + " is not supported");
        return;
    }
    else {
        var formData = new FormData();
        formData.append('themeFile', themeFile);
        formData.append('cookie', cookie);
        formData.append('fileName', fileName);
        formData.append('themeName', themeName);
        formData.append('description', description);

        var str = "/" + ADMIN_PORTAL_NAME + "/customTheme/themeUpload_finish";

        $.ajax({
                   url: str,
                   type: 'POST',
                   data: formData,
                   contentType: false,
                   processData: false,
                   success: function (data) {
                       var result;
                       try {
                           result = JSON.parse(data);
                       } catch(err) {
                           window.location.href = "login.jag";
                       }

                       // Redirect to themeInfo page when there's no errors
                       if (!result.error) {
                           window.top.location.href = window.location.protocol + '//' + serverUrl + '/' + ADMIN_PORTAL_NAME + '/customTheme/themeList';
                       }
                   }
               });

    }

}
