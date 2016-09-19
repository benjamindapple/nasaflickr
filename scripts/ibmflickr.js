(function (IBMFlickr, undefined) {

    var apiKey = 'a5e95177da353f58113fd60296e1d250';
    var nasaUid = '24662369@N07';
    var apiUrl = 'https://api.flickr.com/services/rest/?format=json&nojsoncallback=1&api_key=' + apiKey + '&user_id=' + nasaUid;
    var emptyHref = 'javascript:void(0);';
    var imgRowsContainerId = 'imagerows';
    var mainBodyId = 'mainBody';
    var modalContainerId = 'imgModalContainer';
    var messageCenterId = 'messageCenter';
    var perPageSelectId = 'perPageSelect';
    var searchBoxId = 'searchBox';
    var currentRawJSON;

    function getThumbUrl(img) {
        return 'https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '_q.jpg';
    }

    function preventEventDefault(e) {
        e = e ? e : window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        return false;
    }

    function addImageToRow(imgRow, img, prevImgId, nextImgId) {
        var imgDiv = document.createElement("div");
        var image = document.createElement("img");
        var titleDiv = document.createElement('div');
        var titleSpan = document.createElement('span');
        imgDiv.classList.add('col-xs-6');
        imgDiv.classList.add('col-sm-4');
        imgDiv.classList.add('col-md-3');
        imgDiv.classList.add('col-lg-2');
        imgDiv.classList.add('imgDiv');
        imgDiv.onclick = function (e) { IBMFlickr.thumbClick(e); };
        image.setAttribute('data-imgid', img.id);
        if (prevImgId) {
            img.prevImgId = prevImgId;
        }
        if (nextImgId) {
            img.nextImgId = nextImgId;
        }
        image.classList.add('imgThumb');
        image.src = getThumbUrl(img);
        image.alt = img.title;
        titleDiv.classList.add('titleDiv');
        titleSpan.innerHTML = img.title.substr(0, Math.max(img.title.length, 125));
        titleDiv.appendChild(titleSpan);
        imgDiv.appendChild(titleDiv);
        imgDiv.appendChild(image);
        imgRow.appendChild(imgDiv);
    }

    function addImageRow(imgArray) {
        var lastRow = document.getElementById(imgRowsContainerId).lastChild;
        var lastRowId = (lastRow && lastRow.getAttribute) ? lastRow.getAttribute('data-rowid') : 0;
        var nextRow = document.createElement("div");
        nextRow.setAttribute('data-rowid', lastRowId ? parseInt(lastRowId) + 1 : 0);
        nextRow.classList.add('row');
        for(var i = 0; i<imgArray.length; i++){
            addImageToRow(nextRow, imgArray[i], i == 0 ? null : imgArray[i - 1].id, i == (imgArray.length - 1) ? null : imgArray[i + 1].id);
        }
        document.getElementById(imgRowsContainerId).appendChild(nextRow);
    }

    function removeNodeChildren(node){
        var node = node.id ? node : document.getElementById(node);
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    }

    function addPagination(currentPage, totalPages, perPage, total, cbData) {
        var pagerContainer = document.getElementById('pager');
        removeNodeChildren(pagerContainer);
        if (totalPages > 1) {
            var ul = document.createElement("ul");
            ul.classList.add('pagination');
            var pli = document.createElement("li");
            var pa = document.createElement('a');
            pa.href = emptyHref;
            pa.innerHTML = '<';
            if (cbData && cbData.term) {
                pa.setAttribute('data-search-term', cbData.term);
            }
            if (currentPage == 1) {
                pa.onclick = function (e) { return preventEventDefault(e); };
                pli.classList.add('disabled');
            } else {
                pa.setAttribute('data-page', currentPage - 1);
                pa.onclick = function (e) { IBMFlickr.gotoPage(e); return preventEventDefault(e); };
            }
            pli.appendChild(pa);
            ul.appendChild(pli);
            var i = currentPage < 5 ? 1 : currentPage - 3;
            var end = currentPage < 5 ? Math.min(7, totalPages) : currentPage + 3;
            for (i; i <= end; i++) {
                var li = document.createElement("li");
                var a = document.createElement('a');
                a.href = emptyHref;
                a.innerHTML = i;
                if (cbData && cbData.term) {
                    a.setAttribute('data-search-term', cbData.term);
                }
                if (i != currentPage) {
                    a.setAttribute('data-page', i);
                    a.onclick = function (e) { IBMFlickr.gotoPage(e); return preventEventDefault(e); };
                } else {
                    li.classList.add('active');
                }
                li.appendChild(a);
                ul.appendChild(li);
            }
            var nli = document.createElement("li");
            var na = document.createElement('a');
            na.href = emptyHref;
            na.innerHTML = '>';
            if (cbData && cbData.term) {
                na.setAttribute('data-search-term', cbData.term);
            }
            if (currentPage == totalPages) {
                na.onclick = function (e) { return preventEventDefault(e); };
                nli.classList.add('disabled');
            } else {
                na.setAttribute('data-page', currentPage + 1);
                na.onclick = function (e) { IBMFlickr.gotoPage(e); return preventEventDefault(e); };
            }
            nli.appendChild(na);
            ul.appendChild(nli);
            pagerContainer.appendChild(ul);
            if (totalPages > 7) {
                var jumpDiv = document.createElement('div');
                var jumpDesc = document.createElement('span');
                var jumpSel = document.createElement('select');
                jumpDesc.innerHTML = "Jump to page:&nbsp;";
                if (cbData && cbData.term) {
                    jumpSel.setAttribute('data-search-term', cbData.term);
                }
                jumpDiv.classList.add('pagejump');
                jumpSel.classList.add('selectpicker');
                jumpSel.onchange = function (e) { IBMFlickr.gotoPage(e); return preventEventDefault(e); };
                for (i = 1; i < totalPages; i++) {
                    var opt = document.createElement('option');
                    opt.innerHTML = i;
                    opt.value = i;
                    if (i == currentPage) {
                        opt.selected = true;
                    }
                    jumpSel.appendChild(opt);
                }
                jumpDiv.appendChild(jumpDesc);
                jumpDiv.appendChild(jumpSel);
                pagerContainer.appendChild(jumpDiv);
            }
        }
    }

    function addSearchSummary(currentPage, totalPages, perPage, total, cbData) {
        var msgCenter = document.getElementById(messageCenterId);
        removeNodeChildren(msgCenter);
        var span1 = document.createElement('span');
        var span2 = document.createElement('span');
        var clearBtn = document.createElement('button');
        span1.innerHTML = 'Search results for: "' + cbData.term + '" ';
        span2.innerHTML = total + ' items in ' + totalPages + ' pages';
        clearBtn.classList.add('btn');
        clearBtn.innerHTML = 'Clear Results';
        clearBtn.onclick = function (e) { IBMFlickr.clearSearchBox(); IBMFlickr.loadMoreImages(); return preventEventDefault(e); };
        msgCenter.appendChild(span1);
        msgCenter.appendChild(span2);
        msgCenter.appendChild(clearBtn);
        msgCenter.classList.remove('hidden');
    }

    function loadImageRows(data, cbData) {
        currentRawJSON = data;
        var rows =  document.getElementById(imgRowsContainerId);
        while (rows.lastChild) {
            rows.removeChild(rows.lastChild);
        }
        var p = data.photos.photo;
        for (var i = 0; i < p.length; i += 12) {
            var last = Math.min(i + 12, p.length);
            addImageRow(p.slice(i, last));
            if (last < p.length - 1) {
                p[last -1].nextImgId = p[last].id;;
            }
            if (i != 0) {
                p[i].prevImgId = p[i - 1].id;
            }
        }
        if (cbData && cbData.term) {
            addSearchSummary(data.photos.page, data.photos.pages, data.photos.perpage, data.photos.total, cbData);
        }
        addPagination(data.photos.page, data.photos.pages, data.photos.perpage, data.photos.total, cbData);
    }

    function attachPreviewKeyListener(img) {
        window.onkeyup = function (e) {
            if (e.which == 27) {
                // esc
                IBMFlickr.closePreview();
                return preventEventDefault(e);
            }
            if (e.which == 37) {
                // left
                if (img.prevImgId) {
                    IBMFlickr.loadLargeImage(img.prevImgId);
                }
                return preventEventDefault(e);
            }
            if (e.which == 39) {
                // right
                if (img.nextImgId) {
                    IBMFlickr.loadLargeImage(img.nextImgId);
                }
                return preventEventDefault(e);
            }
        };
    }

    function showLargeImage(data, cbData) {
        var modal = document.getElementById(modalContainerId);
        removeNodeChildren(modal);
        var lrgUrl;
        var maxWUrl;
        var maxW = 0;
        if(data && data.sizes && data.sizes.size){
            for (var i = 0; i < data.sizes.size.length; i++) {
                if (data.sizes.size[i].width > maxW && data.sizes.size[i].source.toLowerCase().indexOf('farm') > -1) {
                    maxWUrl = data.sizes.size[i].source;
                }
                if (data.sizes.size[i].label.toLowerCase() == 'large') {
                    lrgUrl = data.sizes.size[i].source;
                }
            }
            var img = document.createElement('img');
            var desc = document.createElement('span');
            var closeLink = document.getElementById('imgCloseLink');
            var prevLink = document.getElementById('imgPrevLink');
            var nextLink = document.getElementById('imgNextLink');
            closeLink.onclick = function (e) { IBMFlickr.closePreview(e); return preventEventDefault(e); };
            if (cbData && cbData.img && cbData.img.prevImgId) {
                prevLink.onclick = function (e) { IBMFlickr.loadLargeImage(cbData.img.prevImgId); return preventEventDefault(e); };
                prevLink.disabled = false;
            } else {
                prevLink.onclick = function (e) { return preventEventDefault(e); };
                prevLink.disabled = true;
            }
            if (cbData && cbData.img && cbData.img.nextImgId) {
                nextLink.onclick = function (e) { IBMFlickr.loadLargeImage(cbData.img.nextImgId); return preventEventDefault(e); };
                prevLink.disabled = false;
            } else {
                nextLink.onclick = function (e) { return preventEventDefault(e); };
                prevLink.disabled = true;
            }
            img.alt = (cbData && cbData.img && cbData.img.title) ? cbData.img.title : '';
            desc.innerHTML = img.alt;
            img.classList.add('img-responsive');
            img.onload = function () {
                modal.appendChild(img);
                modal.appendChild(desc);
                modal.parentElement.classList.add('modal-visible');
                document.body.style.overflow = 'hidden';
                attachPreviewKeyListener(cbData.img);
                LoadingPanel.hideLoadingPanel();
            };
            if (lrgUrl) {
                img.src = lrgUrl;
            }else {
                img.src = maxWUrl;
            } 
           
        } else {
            // an error occurred
            IBMFlickr.closePreview();
            LoadingPanel.hideLoadingPanel();
        }
    }

    function findParentByClass(node, className) {
        var parent = node;
        while (!parent.classList.contains(className) && parent != document.body) {
            parent = parent.parentNode;
        }
        return parent == document.body ? null : parent;
    }

    IBMFlickr.searchLoad = function (term, page) {
        if (term) {
            var perPage = document.getElementById(perPageSelectId).value;
            var url = apiUrl + '&method=flickr.photos.search&text=' + term + '&per_page=' + perPage;
            if (page) {
                url += '&page=' + page;
            }
            LoadingPanel.showLoadingPanel(mainBodyId);
            AJAX.getJSONAsync(url, null, loadImageRows, null, LoadingPanel.hideLoadingPanel, { term: term });
        } else {
            IBMFlickr.loadMoreImages(page);
        }
    };

    IBMFlickr.closePreview = function () {
        document.getElementById(modalContainerId).parentElement.classList.remove('modal-visible');
        document.body.style.overflow = '';
    };

    IBMFlickr.loadLargeImage = function (imgId) {
        var url = apiUrl + '&method=flickr.photos.getSizes&photo_id=' + imgId;
        var prevId, nextId;
        var img = currentRawJSON.photos.photo.filter(function (c) {
            return c.id == this;
        }, imgId)[0];
        var modal = document.getElementById(modalContainerId);
        removeNodeChildren(modal);
        LoadingPanel.showLoadingPanel();
        AJAX.getJSONAsync(url, null, showLargeImage, LoadingPanel.hideLoadingPanel, null, { img: img });
    };

    IBMFlickr.thumbClick = function (e) {
        var img = findParentByClass(e.target, 'imgDiv').getElementsByTagName('img')[0];
        var imgId = img.getAttribute('data-imgid');
        IBMFlickr.loadLargeImage(imgId);
    };

    IBMFlickr.gotoPage = function (e) {
        var a = e.target;
        if (a) {
            var page;
            if (a.nodeName.toLowerCase() == 'select') {
                page = a.value;
            } else {
                page = a.getAttribute('data-page');
            }
            if (a.getAttribute('data-search-term')) {
                IBMFlickr.searchLoad(a.getAttribute('data-search-term'), page);
            } else {
                IBMFlickr.loadMoreImages(page);
            }
        }
    };

    IBMFlickr.search = function (inputId, page) {
        var term = document.getElementById(inputId).value;
        if (term) {
            IBMFlickr.searchLoad(term);
        }
    };

    IBMFlickr.clearSearchBox = function () {
        var msgCenter = document.getElementById(messageCenterId);
        removeNodeChildren(msgCenter);
        msgCenter.classList.add('hidden');
        document.getElementById(searchBoxId).value = '';
    };

    IBMFlickr.loadMoreImages = function (page) {
        var perPage = document.getElementById(perPageSelectId).value;
        var url = apiUrl + '&method=flickr.people.getPublicPhotos&per_page=' + perPage;
        if (page > 0) {
            url += '&page=' + page;
        }
        LoadingPanel.showLoadingPanel(mainBodyId);
        AJAX.getJSONAsync(url, null, loadImageRows, null, LoadingPanel.hideLoadingPanel);
    };

    IBMFlickr.preventDefault = function (e) {
        return preventEventDefault(e);
    };

})(window.IBMFlickr = window.IBMFlickr || {});