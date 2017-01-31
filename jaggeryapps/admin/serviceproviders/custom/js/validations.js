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
        } else if (selected.trim() == "Agent".trim() && secSelected.trim() == "Select Security Protocol".trim()) {

            $('.security-drop-down-status').append($(messageContainer).addClass('alert-error').hide()
                .fadeIn('fast').delay(2000).fadeOut('fast'));
            $('.security-drop-down-status').find('.alert-content').text('Please select security protocol').focus();
            $(window).scrollTop($('.app-drop-down-status').position().top);
            //security-drop-down-status
            return false;
        } else if (selected.trim() == "Agent".trim() && secSelected.trim() == "SAML2 Web SSO".trim()) {
            $("#addServiceProvider").validate({
                focusInvalid: true,
                invalidHandler: function(form, validator) {
                    $(validator.errorList[0].element).focus();
                }
            }); //sets up the validator since dynamically added elements here
            $("input[id*=issuer]").rules("add", "required");
            // $("input[id*=assertionConsumerURLTxt]").rules("add", "required");

            $.validator.addMethod("acsUrls", function (value, element) {
                return $("#acsUrl_0").length > 0 ;
            }, $.validator.messages.url);
            if(!$("#acsUrl_0").length > 0){
                $("input[id*=assertionConsumerURLTxt]").rules('add', {
                    required: true,
                    url2:true,
                    messages: {
                        required: "Add at least one Assertion Consumer URL",
                        url2: "Please enter valid URL"
                    }
                });
            } else {
                $("input[id*=assertionConsumerURLTxt]").rules('add', {
                    required: false,
                });
            }

            $.validator.addMethod("base64",function(value, element) {
                    var re = new RegExp(getPattern("base-64"));
                    return this.optional(element) || re.test(value);
                },
                "Please enter a valid Public Certificate"
            );
            $("#publicCertificate").rules("add", { base64: true });


            if ($("#addServiceProvider").valid() && $("#storeConfigForm").valid()) {
                updateSP();
            }

        } else if (selected.trim() == "Agent".trim() && secSelected.trim() == "WS-Federation (Passive)".trim()) {
            $("#wsfed-form").validate({
                focusInvalid: true,
                invalidHandler: function(form, validator) {
                    $(validator.errorList[0].element).focus();
                }
            });

            $("input[id*=passiveSTSRealm]").rules("add", "required");
            $("input[id*=passiveSTSWReply]").rules("add", { url2:true });

            if ($('#wsfed-form').valid() && $("#storeConfigForm").valid()) {
                updateSP();
            }
        } else if (selected.trim() == "Agent".trim() && secSelected.trim() == "OpenID Connect".trim()) {
            $("#addAppForm").validate({
                focusInvalid: true,
                invalidHandler: function(form, validator) {
                    $(validator.errorList[0].element).focus();
                }
            });

            $("input[id*=callback]").rules("add", { url2:true });
            if ($('#addAppForm').valid() && $("#storeConfigForm").valid()) {
                updateSP();
            }
        } else if (selected.trim() == "Proxy".trim()) {
            //Add the whitespaces validation for the context.
            $.validator.addMethod("noSpace", function(value, element) {
                var regExp = new RegExp("^[a-zA-Z0-9._|-]*$");
                return regExp.test(value);
            }, "White spaces are not allowed in application context.");
            $("input[id*=gw-app-context]").rules("add", { noSpace: true });

            if ($("#gatewayConfigForm").valid() && $("#storeConfigForm").valid()) {
                updateSP();
            }
        } else if (selected.trim() == "Shortcut".trim()) {
            $('#gw-app-context').val($('#store-app-name').val());
            $('#gw-app-url').val($('#store-app-url').val());
            if ($("#storeConfigForm").valid()) {
                updateSP();
            }
        } else {
            updateSP();
        }
    } else {
        $("#addServiceProvider").validate({
            focusInvalid: true,
            invalidHandler: function(form, validator) {
                $(validator.errorList[0].element).focus();
            }
        }); //sets up the validator since dynamically added elements here
        $("input[id*=issuer]").rules("add", "required");

        if(!$("#acsUrl_0").length > 0){
            $("input[id*=assertionConsumerURLTxt]").rules('add', {
                required: true,
                url2:true,
                messages: {
                    required: "Add at least one Assertion Consumer URL",
                    url2: "Please enter valid URL"
                }
            });
        } else {
            $("input[id*=assertionConsumerURLTxt]").rules('add', {
                required: false,
            });
        }

        if ($("#addServiceProvider").valid() && $("#storeConfigForm").valid()) {
            updateSP();
        }
    }
}

$(function () {

    $.validator.addMethod("url2", function (value, element) {
        return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }, $.validator.messages.url);

    $("form[name='storeConfigForm']").validate({
        rules: {
            'store-app-name': "required",
            'store-app-url': {
                required: true,
                url2: true
            }
        },
        messages: {
            'store-app-name': "Display Name is a required field",
            'store-app-url': {
                required: "Access URL is a required field",
            }
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
            issuer: "Issuer is a required field"
        },
        submitHandler: function () {
            return false;

        }
    });

    $("form[name='gatewayConfigForm']").validate({
        rules: {
            'gw-app-context': {
                required: true,
                noSpace: true
            },
            'gw-app-url': {
                required: true,
                url2: true
            }
        },
        messages: {
            'gw-app-context': {
                required: "context is a required field",
                noSpace: "Only [a-zA-Z0-9._|-] characters are allowed in application context."
            },
            'gw-app-url': {
                required: "URL is a required field"
            }
        },
        submitHandler: function () {
            return false;
        }
    });
});