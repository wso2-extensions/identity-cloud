/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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


function validateInputs() {

    if ($('#spType').val() == "custom") {
        var selected = $("#custom-app-dropdown .dropdown-toggle").text();
        var secSelected = $("#custom-security-dropdown .dropdown-toggle").text();

        if (selected == "Select App Type") {
            $('.app-drop-down-status').append($(messageContainer).addClass('alert-error').hide()
                .fadeIn('fast').delay(2000).fadeOut('fast'));
            $('.app-drop-down-status').find('.alert-content').text('Please Select App Type').focus();
            $(window).scrollTop($('.app-drop-down-status').position().top);

            return false;
        } else if (selected.trim() == "Agent Type".trim() && secSelected.trim() == "Select Security Protocol".trim()) {

            $('.security-drop-down-status').append($(messageContainer).addClass('alert-error').hide()
                .fadeIn('fast').delay(2000).fadeOut('fast'));
            $('.security-drop-down-status').find('.alert-content').text('Please select security protocol').focus();
            $(window).scrollTop($('.app-drop-down-status').position().top);
            //security-drop-down-status
            return false;
        } else if (selected.trim() == "Agent Type".trim() && secSelected.trim() == "SAML2 Web SSO Configuration".trim()) {
            $("#addServiceProvider").validate({
                focusInvalid: true,
                invalidHandler: function(form, validator) {
                    $(validator.errorList[0].element).focus();
                }
            }); //sets up the validator since dynamically added elements here
            $("input[id*=issuer]").rules("add", "required");

            if ($("#addServiceProvider").valid() && $("#storeConfigForm").valid()) {
                updateSP();
            }

        } else if (selected.trim() == "Proxy Type".trim()) {
            if ($("#gatewayConfigForm").valid() && $("#storeConfigForm").valid()) {
                updateSP();
            }
        }
    } else {
        $("#addServiceProvider").validate({
            focusInvalid: true,
            invalidHandler: function(form, validator) {
                $(validator.errorList[0].element).focus();
            }
        }); //sets up the validator since dynamically added elements here
        $("input[id*=issuer]").rules("add", "required");
        if ($("#addServiceProvider").valid() && $("#storeConfigForm").valid()) {
            updateSP();
        }
    }
}

$(function () {
    $("form[name='storeConfigForm']").validate({
        rules: {
            'store-app-name': "required",
            'store-app-url': {
                required: true,
                url: true
            }
        },
        messages: {
            'store-app-name': "Display Name is a required field",
            'store-app-url': "URL is a required field"
        },
        submitHandler: function () {
            return false;
        }
    });


    $("form[name='addServiceProvider']").validate({
        rules: {
            issuer: "required"
        },
        messages: {
            issuer: "issuer is a required field"
        },
        submitHandler: function () {
            return false;

        }
    });

    $("form[name='gatewayConfigForm']").validate({
        rules: {
            'gw-app-context': "required",
            'gw-app-url': {
                required: true,
                url: true
            }
        },
        messages: {
            'gw-app-context': "context is a required field",
            'gw-app-url': "URL is a required field"
        },
        submitHandler: function () {
            return false;
        }
    });


});