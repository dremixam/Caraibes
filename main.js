document.addEventListener('DOMContentLoaded', function () {

    function insertParam(key, value) {
        key = encodeURI(key);
        value = encodeURI(value);

        var kvp = document.location.search.substr(1).split('&');

        if (kvp[0] === '') kvp = [];

        for (var i = 0; i < kvp.length; i++) {
            x = kvp[i].split('=');

            if (x[0] == key) {
                x[1] = value;
                kvp[i] = x.join('=');
                break;
            }
        }

        if (i === kvp.length) {
            kvp[kvp.length] = [key, value].join('=');
        }

        if (history.pushState) {
            var newurl = window.location.protocol
                + '//'
                + window.location.host + window.location.pathname + '?' + kvp.join('&');

            window.history.pushState({path: newurl}, '', newurl);
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

    if (isNaN(seed)) seed = 0x42;

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
        offsetH -= 100 / zoom;
        update();
        insertParam('y', offsetH);
    };


    document.getElementById('down').onclick = function () {
        offsetH += 100 / zoom;
        update();
        insertParam('y', offsetH);
    };


    document.getElementById('left').onclick = function () {
        offsetW -= 100 / zoom;
        update();
        insertParam('x', offsetW);
    };


    document.getElementById('right').onclick = function () {
        offsetW += 100 / zoom;
        update();
        insertParam('x', offsetW);
    };

    function update() {
        var hm1;
        for (var i = 0; i < width; i++) {
            hm1 = 0.4;
            for (var j = 0; j < height; j++) {
                var h = (noise.getHeight(Math.ceil((i + (offsetW * zoom - width / 2)) / zoom), Math.ceil((j + (offsetH * zoom - height / 2)) / zoom))) - 0.4;

                var pente = 100 * (h - hm1) * zoom;

                var color;

                if (pente < -1) pente = -1;
                if (pente > 1) pente = 1;


                if (h < 0) {
                    // eau


                    var profondeur = -(20 * h);
                    if (profondeur > 1) {
                        color = {r: 84, g: 132, b: 219};
                    } else {
                        profondeur /= 2;
                        var sable = brightness({r: 224, g: 222, b: 116}, 1 + pente);
                        var eau = {r: 84, g: 132, b: 219};

                        color.r = (sable.r * (0.5 - profondeur) + eau.r * (profondeur + 0.5));
                        color.g = (sable.g * (0.5 - profondeur) + eau.g * (profondeur + 0.5));
                        color.b = (sable.b * (0.5 - profondeur) + eau.b * (profondeur + 0.5));

                    }

                } else if (h < 0.005) {
                    color = brightness({r: 224, g: 222, b: 116}, 1 + pente);
                } else if (h < 0.3) {
                    color = brightness({r: 44, g: 176, b: 40}, 1 + pente);


                } else {
                    color = brightness({r: 255, g: 255, b: 255}, 1 + pente);
                }


                setPixel(imgData, i, j, color.r, color.g, color.b, 255);

                hm1 = h;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    update();

}, false);

function brightness(color, change) {
    var hsl = rgbToHsl(color.r, color.g, color.b);
    hsl.l *= change;
    if (hsl.l > 1) hsl.l = 1;
    if (hsl.l < 0) hsl.l = 0;
    return hslToRgb(hsl);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {h: h, s: s, l: l};
}

function hslToRgb(hsl) {
    var r, g, b;

    var h = hsl.h;
    var s = hsl.s;
    var l = hsl.l;


    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {r: r * 255, g: g * 255, b: b * 255};
}