function drawThemeList() {
    var str = "/dashboard/customTheme/getThemeList";
    $.ajax({
               url: str,
               type: 'GET',
               success: function (data) {
                   var parsedResult = JSON.parse(data);
                   if (Object.keys(parsedResult).length == 0) {
                       $("#themeTypesTbl").hide();
                       $("#themesDiv").append("<label>No themes deployed.</label>");
                   }
                   $.each(parsedResult, function (key, available) {
                       if (available) {
                           //draw the table content
                           $("#themeTypesTbl tbody").append("<tr><td >" + key + "</td><td title='delete'><a id = " + key
                                                            + "><i class='fw fw-delete'></i></a></td></tr>");

                           //bind delete event
                           $("#" + key).bind("click", function () {
                               var str = "/dashboard/customTheme/deleteTheme";
                               $.ajax({
                                          url: str,
                                          type: 'POST',
                                          data: "themeType=" + key,
                                          success: function (data) {
                                              var result = JSON.parse(data);
                                              alert(result.errorMsg);
                                              //Refresh the pae when there's no errors
                                              if (!result.error) {
                                                  location.reload();
                                              }
                                          }
                                      });
                           });
                       }

                   });

               }
           });
}