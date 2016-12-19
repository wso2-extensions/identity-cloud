
$('.cloud-menu-popover').popover({
    html : true,
    title: function() {
        return $("#popover-head").html();
    },
    content: function() {
        return $("#popover-content").html();
    }
});


/**
 * Use to handle file upload
 */
$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});

$('.btn-file :file').on('fileselect', function(event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;

        if( input.length ) {
            input.val(log);
        }
});


(function($) {
    
    /* ========================================================================
     * loading function
     * ======================================================================== */
    $.fn.loading = function(action) {

        var html = '<div class="loading-animation"> \
                        <div class="loading-logo"> \
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" \
                            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" \
                                 viewBox="0 0 14 14" enable-background="new 0 0 14 14" xml:space="preserve"> \
                                <path class="circle" stroke-width="1.4" stroke-miterlimit="10" d="M6.534,\
                                0.748C7.546,0.683,8.578,0.836,9.508,1.25 c1.903,0.807,3.339,2.615,3.685,4.654c0.244,\
                                1.363,0.028,2.807-0.624,4.031c-0.851,1.635-2.458,2.852-4.266,3.222 c-1.189,0.25-2.45,\
                                0.152-3.583-0.289c-1.095-0.423-2.066-1.16-2.765-2.101C1.213,9.78,0.774,8.568,0.718,\
                                7.335 C0.634,5.866,1.094,4.372,1.993,3.207C3.064,1.788,4.76,0.867,6.534,0.748z"/> \
                                <path class="pulse-line" stroke-width="0.55" stroke-miterlimit="10" d="M12.602,\
                                7.006c-0.582-0.001-1.368-0.001-1.95,0 c-0.491,0.883-0.782,1.4-1.278,2.28C8.572,\
                                7.347,7.755,5.337,6.951,3.399c-0.586,1.29-1.338,3.017-1.923,\
                                4.307 c-1.235,0-2.38-0.002-3.615,0"/> \
                            </svg> \
                            <div class="signal"></div> \
                        </div> \
                        <p>LOADING...</p> \
                    </div> \
                    <div class="loading-bg"></div>';

        return $(this).each(function(){
            if (action === 'show') {
                $(this).prepend(html).addClass('loading');
            }
            if (action === 'hide') {
                $(this).removeClass('loading');
                $('.loading-animation, .loading-bg', this).remove();
            }
        });

    };

    /* ========================================================================
     * loading button function
     * ======================================================================== */
    $.fn.loadingButton = function(options) {

        var settings = $.extend({}, {
                    // defaults.
                    action: "show",
                    width: "3em",
                    type: "default"
                }, options );
        var wValue = '';
        var borderSize = '5';
        var lineHeight = '3em';
        var marginTop = '3px';
        var top = '3px';
        var loaderMargin = '0px';

        if(settings.type === 'small'){
            wValueString = '20px';
            wValueRadius = '20px';
            borderSize = '2';
            lineHeight = '2.2em';
            marginTop = '0px';
            top = '0px';
            loaderMargin = '8px';
        }else{
            if(settings.width.indexOf('px') >= 0){
                wValue = parseFloat(settings.width.replace("px",''));
                wValueString = wValue + "px";
                wValueRadius = wValue * 10 + "px";
            }else if(settings.width.indexOf('em') >= 0){
                wValue = parseFloat(settings.width.replace("em",''));
                wValueString = wValue + "em";
                wValueRadius = wValue * 10 + "em";
            }
        }
        var html = '<span class="button-loader"><div class="loading-logo"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="'+ wValueString +'"\
                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                    viewBox="0 0 14 14" enable-background="new 0 0 14 14" xml:space="preserve">\
                        <path class="circle" stroke-width="1.4" stroke-miterlimit="10" d="M6.534,\
                        0.748C7.546,0.683,8.578,0.836,9.508,1.25 c1.903,0.807,3.339,2.615,3.685,4.654c0.244,\
                        1.363,0.028,2.807-0.624,4.031c-0.851,1.635-2.458,2.852-4.266,3.222 c-1.189,0.25-2.45,\
                        0.152-3.583-0.289c-1.095-0.423-2.066-1.16-2.765-2.101C1.213,9.78,0.774,8.568,0.718,\
                        7.335 C0.634,5.866,1.094,4.372,1.993,3.207C3.064,1.788,4.76,0.867,6.534,0.748z"/>\
                        <path class="pulse-line" stroke-width="0.55" stroke-miterlimit="10" d="M12.602,\
                        7.006c-0.582-0.001-1.368-0.001-1.95,0 c-0.491,0.883-0.782,1.4-1.278,2.28C8.572,\
                        7.347,7.755,5.337,6.951,3.399c-0.586,1.29-1.338,3.017-1.923,\
                        4.307 c-1.235,0-2.38-0.002-3.615,0"/>\
                    </svg>\
                    <div class="signal"></div>\
                    </div></span>';

        return $(this).each(function(){
            if (settings.action === 'show') {
                $(this).prop( "disabled", true );
                $(this).find('span').css('display','none');
                $(this).prepend(html).addClass('loading');
                $(this).find('.loading-logo').css({
                    'height':wValueString,
                    'width':wValueString,
                    'line-height': lineHeight
                });
                $(this).find('.signal').css({
                    'height':wValueString,
                    'width':wValueString,
                    'border-radius': wValueRadius,
                    'border': borderSize + 'px solid #fff',
                    'top': top
                });
                $(this).find('svg').css({
                    'margin-top':marginTop
                });
                $(this).find('.button-loader').css({
                    'margin-right':loaderMargin
                });
            }else if (settings.action === 'hide') {
                $(this).prop( "disabled", false );
                $(this).find('.button-loader').remove();
                $(this).find('span').css('display','inline-block');
            }
        });
    }

}(jQuery));



    /* ========================================================================
     * copy to clipboard function
     * ======================================================================== */
(function ( $ ) {

    $.fn.copyToClipboard = function( element ) {

            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($(element).val()).select();
            document.execCommand("copy");
            var t = $temp.val();
            copiedText = t +'   : copied to clipboard';
            $(element).attr('data-original-title', copiedText).tooltip('show',{ placement: 'top',trigger:'manual'});
            setTimeout(function(){
                $(element).tooltip('destroy');
            }, 3000);
            $temp.remove();

            return this;
    };

}( jQuery ));

//fix popover close issue
function hidePopover(e) {
    $('[data-toggle="popover"]').each(function () {
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
    });
}

$('body').on('click', function (e) {
    hidePopover(e);
});

$('#username-btn').on('click', function (e) {
    hidePopover(e);
});


/* ========================================================================
     * popover customization as a two level material menu
     * ======================================================================== */

$('#cloud-menu-popover,#cloud-menu-popover-xs').on('shown.bs.popover', function () {

    $('.cloud-block-invert-sub-true').click(function(){

        var itemPosition = $(this).position(),
            containerWidth = ($('.anim-container').width()) - 14,
            containerHeight = ($('.anim-container').height()) - 14,
            clone = $(this).clone(false);

        $(this).addClass('clickedParent');
        $(clone).children('.forward-btn').remove();
        $(clone).children('.back-btn').show();
        $(clone).children('.back-btn, .cloud-block-invert-icon').wrapAll('<div class="temp-wrap">');
        $(clone).children('.temp-wrap').append('<div class="clearfix"></div>');
        $(clone).children('.cloud-block-invert-icon').addClass('active');
        $(clone).css({
            'position':'absolute',
            'top': itemPosition.top,
            'left': itemPosition.left
        }).appendTo('.anim-container').animate({
            width : containerWidth,
            height: containerHeight,
            'top': 0,
            'left': 0
            }, {
                duration: 200,
                complete: function() {
                    var subActions = $(this).children('.sub-actions'),
                        listHeight = 224;
                    subActions.show();
                    if(subActions.hasClass('sub-actions')){

                        $(this).animate({
                            height: listHeight
                        }, {
                            duration: 200
                        });
                        $(this).parent().animate({
                            height: listHeight + 14
                        }, {
                            duration: 200
                        });
                    }
                    $(this).on('click','.back-btn',clickBackBtn);
            }
        });
        $('.temp-wrap').children().children('.cloud-name').hide();
        $('.temp-wrap').children('.cloud-block-invert-icon').children().children('span').show();
    });

    function clickBackBtn(){
        var pa = $(this).parent(),
            grandpa = $(pa).parent(),
            greatGrandpa = $(grandpa).parent();

        $(this).hide();

        $(grandpa).animate({
            width : '50px',
            height: '50px',
            'top': $('.clickedParent').position().top,
            'left': $('.clickedParent').position().left
        }, {
            duration: 200,
            complete: function() {
                $(greatGrandpa).css('height', 'auto');
                $(grandpa).remove();
                $(this).children('.forward-btn').show();
                $('.clickedParent').removeClass('clickedParent');
            }
        });
    }

});

$('#cloud-menu-popover,#cloud-menu-popover-xs').on('hidden.bs.popover', function () {
    $('.anim-container').children('.clearfix').nextAll().remove();
});

/**
 * this method using service providers and directories so keep it in custom.js
 * This method will check whether user directory is already created
 * @param domain domain name
 * @returns {boolean} status of user directory exsist or not
 */
function checkDirectory(domain) {
    var returnval = false;
    $.ajax({
        url: DIRECTORY_GET_LIST_PATH,
        async: false,
        cache: false,
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
                    returnval =  $.parseJSON(data).return;
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

    return returnval;
}

/**
 * This method will resolve what url to navigate based on user click.
 * @param param
 */
function urlResolver(param) {
    var currentUrl, context, newUrl, directoryList, isSampleExist, currrentDomain;
    currentUrl = window.location.href.toString();
    if (currentUrl && currentUrl.indexOf(ADMIN_PORTAL_NAME) > -1) {
        context = window.location.href.toString().split(ADMIN_PORTAL_NAME)[0];

        switch (param) {
            case 'configure':
                newUrl = context + ADMIN_PORTAL_NAME + "/directories/downloadagent";
                window.location.href = newUrl;
                break;
            case 'agentguide':
                newUrl = context + ADMIN_PORTAL_NAME + "/directories/agentguide";
                window.location.href = newUrl;
                break;
            case 'applist':
                newUrl = context + ADMIN_PORTAL_NAME + "/serviceproviders";
                window.location.href = newUrl;
                break;
            case 'addApp':
                newUrl = context + ADMIN_PORTAL_NAME + "/serviceproviders/add";
                window.location.href = newUrl;
                break;
            case 'directory' :
                directoryList = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
                isSampleExist = false;
                currrentDomain = false;
                if (directoryList && directoryList.length >= 1) {
                    $.each(directoryList, function (list, value) {
                        if (value.domainId === DEFAULT_USER_STORE_DOMAIN) {
                            currrentDomain = DEFAULT_USER_STORE_DOMAIN;
                        } else if (value.domainId === SAMPLE_USER_STORE_DOMAIN) {
                            isSampleExist = true;
                        }
                    });

                    if (currrentDomain === DEFAULT_USER_STORE_DOMAIN) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/directories";
                        window.location.href = newUrl;
                    } else if (isSampleExist) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/directories/sampleusers";
                        window.location.href = newUrl;
                    }

                } else if (directoryList) {

                    if (directoryList.domainId === DEFAULT_USER_STORE_DOMAIN) {
                        currrentDomain = DEFAULT_USER_STORE_DOMAIN;
                    } else if (directoryList.domainId === SAMPLE_USER_STORE_DOMAIN) {
                        isSampleExist = true;
                    }

                    if (currrentDomain === DEFAULT_USER_STORE_DOMAIN) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/directories";
                        window.location.href = newUrl;
                    } else if (isSampleExist) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/directories/sampleusers";
                        window.location.href = newUrl;
                    }

                } else {
                    newUrl = context + ADMIN_PORTAL_NAME + "/directories/downloadagent";
                    window.location.href = newUrl;
                }
                break;
            case 'overview':

                directoryList = checkDirectory(DEFAULT_USER_STORE_DOMAIN);
                var appList  = checkAppList(cookie,userName);
                isSampleExist = false;
                currrentDomain = false;
                if ((!appList && directoryList)) {
                    newUrl = context + ADMIN_PORTAL_NAME + "/serviceproviders";
                    window.location.href = newUrl;
                    return;
                } else if (!appList && !directoryList) {
                    newUrl = context + ADMIN_PORTAL_NAME + "/overview/landing";
                    window.location.href = newUrl;
                    return;
                } else if (appList && !directoryList) {
                    newUrl = context + ADMIN_PORTAL_NAME + "/overview/appoverview";
                    window.location.href = newUrl;
                    return;
                }

                if (directoryList && directoryList.length >= 1) {
                    $.each(directoryList, function (list, value) {
                        if (value.domainId === DEFAULT_USER_STORE_DOMAIN) {
                            currrentDomain = DEFAULT_USER_STORE_DOMAIN;
                        } else if (value.domainId === SAMPLE_USER_STORE_DOMAIN) {
                            isSampleExist = true;
                        }
                    });

                    if (currrentDomain === DEFAULT_USER_STORE_DOMAIN) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/overview/appoverview";
                        window.location.href = newUrl;
                    } else if (isSampleExist) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/overview/sampleoverview";
                        window.location.href = newUrl;
                    }

                } else if (directoryList) {

                    if (directoryList.domainId === DEFAULT_USER_STORE_DOMAIN) {
                        currrentDomain = DEFAULT_USER_STORE_DOMAIN;
                    } else if (directoryList.domainId === SAMPLE_USER_STORE_DOMAIN) {
                        isSampleExist = true;
                    }

                    if (currrentDomain === DEFAULT_USER_STORE_DOMAIN) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/overview/appoverview";
                        window.location.href = newUrl;
                    } else if (isSampleExist) {
                        newUrl = context + ADMIN_PORTAL_NAME + "/overview/sampleoverview";
                        window.location.href = newUrl;
                    }

                } else {
                    newUrl = context + ADMIN_PORTAL_NAME + "/overview/landing";
                    window.location.href = newUrl;
                }

                break;
            default:
        }
    }
}

/**
 * This method is using globally since directory.js can't load inside sample user store pages
 * deleting the user store for given domain name
 * @param domainname
 */
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

                var directoryLength = 0, newDirectoryLength = 0;
                if (directoryStatus && directoryStatus.domainId) {
                    directoryLength = newDirectoryLength = 1;
                } else if (directoryStatus) {
                    directoryLength = newDirectoryLength = directoryStatus.length;
                } else {
                    directoryLength = newDirectoryLength = 0;
                }

                while (directoryLength == newDirectoryLength) {
                    setTimeout(function () {
                    }, 2000);
                    directoryStatus = checkDirectory(DEFAULT_USER_STORE_DOMAIN);

                    if (directoryStatus && directoryStatus.domainId) {
                        newDirectoryLength = 1;
                    } else if (directoryStatus) {
                        newDirectoryLength = directoryStatus.length;
                    } else {
                        newDirectoryLength = -1;
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
/**
 * This method will return list of applications. This is method can use directory pages and service provider pages
 * @param cookie
 * @param userName
 * @returns list of applications
 */
function checkAppList(cookie,userName) {
    var spList = null;
    $.ajax({
        url: "/" + ADMIN_PORTAL_NAME + "/serviceproviders/getSPList",
        type: "GET",
        async:false,
        data: "&user=" + userName,
        success: function (data) {
            if (data) {
                var resp = $.parseJSON(data);

                if (resp.success == false) {

                } else {
                    spList = resp.return;
                    if (spList != null && spList.constructor !== Array) {
                        var arr = [];
                        arr[0] = spList;
                        spList = arr;
                    }
                }
            }

        },
        error: function (e) {
            message({
                content: 'Error occurred while loading values for the grid.', type: 'error', cbk: function () {
                }
            });
        }
    });

    return spList;
}
