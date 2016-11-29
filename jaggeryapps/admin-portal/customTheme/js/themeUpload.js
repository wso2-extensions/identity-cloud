function uploadTheme() {


    var themeType = $("#themeType").val();
    var themeFile = $("#themeFile")[0].files[0];

    if (themeType == null) {
        message({labelId: 'themeType-error', content: 'Please select a Theme Type', type: 'error'});
        return;
    } else {
        $('#themeType-error').hide();
    }

    if (themeFile == undefined) {
        message({labelId: 'themeFile-error', content: 'Please select a Theme File', type: 'error'});
        return;
    } else {
        $('#themeFile-error').hide();
    }

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
        formData.append('themeType', themeType);
        formData.append('fileName', fileName);

        var str = "/admin-portal/customTheme/themeUpload_finish";
        $.ajax({
                   url: str,
                   type: 'POST',
                   data: formData,
                   contentType: false,
                   processData: false,
                   success: function (data) {
                       var result = JSON.parse(data);
                       alert(result.errorMsg);

                       //Refresh the pae when there's no errors
                       if (!result.error) {
                           location.reload();
                       }
                   }
               });

    }

}


function loadThemeList() {
    var str = "/admin-portal/customTheme/themeTypes";
    $.ajax({
               url: str,
               type: 'GET',
               data: "printDetails=" + true,
               success: function (data) {
                   $.each(JSON.parse(data), function (key, value) {
                       $('#themeType')
                           .append($("<option></option>")
                                       .attr("value", value)
                                       .text(value));
                   });
               }
           });
}