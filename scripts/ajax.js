(function (AJAX, undefined) {

    AJAX.getJSONAsync = function (url, data, success, fail, always, callbackData) {
        var xhttp = new XMLHttpRequest();
        var params = data ? json.stringify(data) : '';
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var respData = JSON.parse(this.responseText);
                    success(respData, callbackData);
                } else {
                    if (fail) {
                        var respData = this.status ? this.status : '' + this.responseText ? this.responseText : '';
                        fail(respData, callbackData);
                    }
                }
                if (always) {
                    // show off the loading panel
                    //window.setTimeout(always, 3000, callbackData);
                    // don't show off the loading panel
                    always(callbackData);
                }
            }
        };
        xhttp.open("GET", encodeURI(url), true);
        xhttp.send(params);
    };

})(window.AJAX = window.AJAX || {});