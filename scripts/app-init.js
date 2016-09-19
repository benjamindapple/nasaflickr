function bindListeners() {
    document.getElementById('searchBtn').onclick = function () { IBMFlickr.search('searchBox'); return IBMFlickr.preventDefault(); };
    //document.getElementById('GalleryBtn').onclick = function () { IBMFlickr.switchMode(this); return IBMFlickr.preventDefault(); };
    //document.getElementById('ThumbnailsBtn').onclick = function () { IBMFlickr.switchMode(this); return IBMFlickr.preventDefault(); };
    document.getElementById('perPageSelect').value = '36';
    var searchBox = document.getElementById('searchBox')
    document.getElementById('perPageSelect').onchange = function () { IBMFlickr.searchLoad(searchBox.value, 1); return IBMFlickr.preventDefault(); };
    searchBox.onkeyup = function (e) {
        if (e.which == 13) {
            e.preventDefault = true;
            IBMFlickr.search("searchBox");
        }
        return false;
    };
}

function documentReady() {
    LoadingPanel.showLoadingPanel();
    bindListeners();
    IBMFlickr.loadMoreImages();
}

window.onload = documentReady;
