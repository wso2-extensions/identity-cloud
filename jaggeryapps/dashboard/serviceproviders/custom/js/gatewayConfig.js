function preDrawGatewayConfig() {}

$(document).ready(function() {
    $("#skipgateway").change(function () {
        if (this.checked) {
            $("#gw-config").hide();
        } else {
            $("#gw-config").show();
        }
    });
});

