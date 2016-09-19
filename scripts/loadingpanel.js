(function (LoadingPanel, undefined) {

    var lpTimer = null;
    var visible = false;
    var hiddenNode;
    var hiddenNodeDisplay;

    function centerElementOnScreen(element) {
        var scrollTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        var scrollLeft = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
        var viewPortHeight = document.body.clientHeight;
        var viewPortWidth = document.body.clientWidth;
        if (document.compatMode == "CSS1Compat") {
            viewPortHeight = document.documentElement.clientHeight;
            viewPortWidth = document.documentElement.clientWidth;
        }
        var topOffset = 0;
        var leftOffset = 0;
        if (element.offsetHeight == 0 && element.height > 0) {
            topOffset = Math.ceil((viewPortHeight / 2) - (element.height / 2));
        } else {
            topOffset = Math.ceil((viewPortHeight / 2) - (element.offsetHeight / 2));
        }
        if (element.offsetWidth == 0 && element.width > 0) {
            leftOffset = Math.ceil((viewPortWidth / 2) - (element.width / 2));
        } else {
            leftOffset = Math.ceil((viewPortWidth / 2) - (element.offsetWidth / 2));
        }
        var top = scrollTop + topOffset;
        var left = scrollLeft + leftOffset;
        element.style.position = "absolute";
        element.style.top = top + "px";
        element.style.left = left + "px";
    }

    function centerLoadingPanel() {
        if (visible) {
            if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
                document.getElementById('LoadingPanelOverlay').style.height = document.documentElement.scrollHeight + "px";
            }
            centerElementOnScreen(document.getElementById('LoadingImage'));
            if (lpTimer != null) {
                clearTimeout(lpTimer);
            }
            lpTimer = setTimeout(centerLoadingPanel, 500);
            document.getElementById('LoadingImage').focus();
        }
    }

    function blurInputs() {
        document.getElementsByTagName('input').forEach(function () {
            this.blur();
        });
    }

    window.onscroll = centerLoadingPanel;

    LoadingPanel.showLoadingPanel = function (hideNode) {
        document.getElementById('LoadingPanelOverlay').style.display = '';
        if (hideNode) {
            hideNode = hideNode.id ? hideNode : document.getElementById(hideNode);
            if (hideNode) {
                hiddenNode = hideNode;
                hiddenNode.style.display = 'none';
            }
        }
        visible = true;
        //blurInputs();
        centerLoadingPanel();
    }

    LoadingPanel.hideLoadingPanel = function () {
        document.getElementById('LoadingPanelOverlay').style.display = 'none';
        if (hiddenNode) {
            hiddenNode.style.display = hiddenNodeDisplay ? hiddenNodeDisplay : '';
        }
        visible = false;
        if (lpTimer != null) {
            clearTimeout(lpTimer);
            lpTimer = null;
        }
    }

})(window.LoadingPanel = window.LoadingPanel || {});