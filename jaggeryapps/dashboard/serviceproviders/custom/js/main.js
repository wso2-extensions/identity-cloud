function validateEmpty(fldname) {
    var fld = document.getElementsByName(fldname)[0];
    var error = "";
    var value = fld.value;
    if (value.length == 0) {
        error = fld.name + " ";
        return error;
    }
    value = value.replace(/^\s+/, "");
    if (value.length == 0) {
        error = fld.name + "(contains only spaces) ";
        return error;
    }
    return error;
}

function cancelProcess(parameters){
    location.href = "index.jag?" + (parameters ? parameters : "");
}

function cancelProcessToLogin(parameters){
    location.href = "login.jag?" + (parameters ? parameters : "");
}
function message(params){
    if(params.type == "custom"){
        messageDisplay(params);
        return;
    }

    var icon = "";
    if(params.type == "servererror"){
        var n = noty({
            theme:'wso2',
            layout: 'topCenter',
            type: 'error',
            closeWith: ['button','click'],
            text: params.content,
            animation: {
                open: {height: 'toggle'}, // jQuery animate function property object
                close: {height: 'toggle'}, // jQuery animate function property object
                easing: 'swing', // easing
                speed: 500 // opening & closing animation speed
            }
        });
    }else if(params.type == "success"){
        icon = "icon-info";
    }else if(params.type == "error"){
        $('#'+params.labelId).text(params.content);
        $('#'+params.labelId).show();
        alert(params.labelId);
    }else if(params.type == "confirm"){
        icon = "icon-question-sign";
    }
}

    var messageDisplay = function (params) {
           $('#messageModal').html($('#confirmation-data').html());
           if(params.title == undefined){
               $('#messageModal h3.modal-title').html('My Identity');
           }else{
               $('#messageModal h3.modal-title').html(params.title);
           }
           $('#messageModal div.modal-body').html(params.content);
           if(params.buttons != undefined){
               //$('#messageModal a.btn-primary').hide();
               $('#messageModal div.modal-footer').html('');
               for(var i=0;i<params.buttons.length;i++){
                   $('#messageModal div.modal-footer').append($('<a class="btn '+params.buttons[i].cssClass+'">'+params.buttons[i].name+'</a>').click(params.buttons[i].cbk));
               }
           }else{
               $('#messageModal a.btn-primary').html('OK').click(function() {
                   $('#messageModal').modal('hide');
               });
           }
           $('#messageModal a.btn-other').hide();
           $('#messageModal').modal();
       };
        /*
       usage
       Show info dialog
       message({content:'foo',type:'info', cbk:function(){alert('Do something here.')} });

       Show warning
       dialog message({content:'foo',type:'warning', cbk:function(){alert('Do something here.')} });

       Show error dialog
       message({content:'foo',type:'error', cbk:function(){alert('Do something here.')} });

       Show confirm dialog
       message({content:'foo',type:'confirm',okCallback:function(){},cancelCallback:function(){}});
        */



