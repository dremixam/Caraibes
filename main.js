document.addEventListener('DOMContentLoaded', function () {

    function insertParam(key, value) {
        key = encodeURI(key); value = encodeURI(value);

        var kvp = document.location.search.substr(1).split('&');

        if ( kvp[0] === '' ) kvp = [];

        for(var i=0; i < kvp.length; i++) {
            x = kvp[i].split('=');

            if (x[0]==key) {
                x[1] = value;
                kvp[i] = x.join('=');
                break;
            }
        }

        if(i===kvp.length) {kvp[kvp.length] = [key,value].join('=');}

        if (history.pushState) {
            var newurl = window.location.protocol 
                + '//' 
                + window.location.host + window.location.pathname + '?' + kvp.join('&');

            window.history.pushState({path:newurl},'',newurl);
        }
    }
    
    var QueryString = function () {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }();

    function setPixel(imageData, x, y, r, g, b, a) {
        index = (x + y * imageData.width) * 4;
        imageData.data[index + 0] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    var seed = parseInt(QueryString.seed);

    if(isNaN(seed)) seed = 0x42;

    var noise = new MapGen(seed, 4);

    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");

    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    var width = canvas.width;
    var height = canvas.height;

    var zoom = parseFloat(QueryString.z);
    if (isNaN(zoom)) zoom = 1;

    document.getElementById('zoomlevel').innerHTML = 'x' + zoom;

    var offsetW = QueryString.x | 0;
    var offsetH = QueryString.y | 0;

    var imgData = ctx.createImageData(width, height);

    document.getElementById('newseed').onclick = function () {
        seed = parseInt(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));
        noise = new MapGen(seed, 4);
        update();
        insertParam('seed', seed);
    };

    document.getElementById('plus').onclick = function () {
        zoom *= 2;
        update();
        insertParam('z', zoom);
        document.getElementById('zoomlevel').innerHTML = 'x' + zoom;
    };

    document.getElementById('minus').onclick = function () {
        zoom /= 2;
        update();
        insertParam('z', zoom);
        document.getElementById('zoomlevel').innerHTML = 'x' + zoom;
    };


    document.getElementById('up').onclick = function () {
        offsetH -= 100/zoom;
        update();
        insertParam('y', offsetH);
    };


    document.getElementById('down').onclick = function () {
        offsetH += 100/zoom;
        update();
        insertParam('y', offsetH);
    };


    document.getElementById('left').onclick = function () {
        offsetW -= 100/zoom;
        update();
        insertParam('x', offsetW);
    };


    document.getElementById('right').onclick = function () {
        offsetW += 100/zoom;
        update();
        insertParam('x', offsetW);
    };

    function update() {
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var h = noise.getHeight(Math.ceil((i + (offsetW*zoom-width/2)) / zoom), Math.ceil((j + (offsetH*zoom-height/2)) / zoom));
                if (Math.ceil((i + (offsetW*zoom-width/2)) / zoom) == 0 || Math.ceil((j + (offsetH*zoom-height/2)) / zoom) == 0) {
                    var color = {r: 255, g: 0, b: 0};
                } else if (h < 0.4) {
                    var color = {r: 84, g: 132, b: 219};
                } else if (h < 0.405) {
                    var color = {r: 224, g: 222, b: 116};
                } else if (h < 0.7) {
                    var r = (((h - 0.405) / 0.7 * (-44)) + 44);
                    var g = (((h - 0.405) / 0.7 * (-176)) + 176);
                    var b = (((h - 0.405) / 0.7 * (-40)) + 40);

                    var color = {r: r, g: g, b: b};


                } else {
                    var color = {r: 255, g: 255, b: 255};
                }

                setPixel(imgData, i, j, color.r, color.g, color.b, 255);
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    update();

}, false);

