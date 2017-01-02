document.addEventListener('DOMContentLoaded', function () {
    var QueryString = function () {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
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


    var noise = new MapGen(0x42, 4);

    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");

    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    var width = canvas.width;
    var height = canvas.height;


    var zoom = QueryString.z | 1;
    var offsetW = QueryString.x | -(width / 2);
    var offsetH = QueryString.y | -(height / 2);

    var imgData = ctx.createImageData(width, height);


    document.getElementById('plus').onclick = function () {
        zoom *= 2;
        document.getElementById('zoomlevel').innerHTML = 'x'+zoom;
        offsetH *= 2;
        offsetW *= 2;
        update();
    };

    document.getElementById('minus').onclick = function () {
        zoom /= 2;
        document.getElementById('zoomlevel').innerHTML = 'x'+zoom;
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
                if (h < 0.4) {
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
