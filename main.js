document.addEventListener('DOMContentLoaded', function () {
    function insertParam(key, value) {
        key = encodeURI(key); value = encodeURI(value);

        var kvp = document.location.search.substr(1).split('&');

        var i=kvp.length; var x; while(i--) 
        {
            x = kvp[i].split('=');

            if (x[0]==key)
            {
                x[1] = value;
                kvp[i] = x.join('=');
                break;
            }
        }

        if(i<0) {kvp[kvp.length] = [key,value].join('=');}

        //this will reload the page, it's likely better to store this until finished
        document.location.search = kvp.join('&'); 
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

    var seed = 0x42;

    var noise = new MapGen(seed, 4);

    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");

    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    var width = canvas.width;
    var height = canvas.height;


    var zoom = QueryString.z | 1;
    var offsetW = QueryString.x | 0;
    var offsetH = QueryString.y | 0;

    var imgData = ctx.createImageData(width, height);

    document.getElementById('newseed').onclick = function () {
        seed = Math.random() * 65536 * 2 * 2 * 2;
        noise = new MapGen(seed, 4);
        update();
    };

    document.getElementById('plus').onclick = function () {
        zoom *= 2;
        document.getElementById('zoomlevel').innerHTML = 'x' + zoom;
        offsetH *= 2;
        offsetW *= 2;
        update();
    };

    document.getElementById('minus').onclick = function () {
        zoom /= 2;
        document.getElementById('zoomlevel').innerHTML = 'x' + zoom;
        offsetH /= 2;
        offsetW /= 2;
        update();
    };


    document.getElementById('up').onclick = function () {
        offsetH -= 100;
        update();
    };


    document.getElementById('down').onclick = function () {
        offsetH += 100;
        update();
    };


    document.getElementById('left').onclick = function () {
        offsetW -= 100;
        update();
    };


    document.getElementById('right').onclick = function () {
        offsetW += 100;
        update();
    };

    function update() {
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var h = noise.getHeight((i + (offsetW-width/2)) / zoom, (j + (offsetH-height/2)) / zoom);
                if (Math.ceil((i + (offsetW-width/2)) / zoom) == 0 || Math.ceil((j + (offsetH-height/2)) / zoom) == 0) {
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

