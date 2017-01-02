var MapGen = (function () {
    function MapGen(seed, time) {
        this.seed = seed | 0;
        this.noiseGenerator = new Noise(this.seed);
        this.time = time | 0;
    }

    MapGen.prototype.getType = function (x, y) {
        /*
         var height = this.noiseGenerator.perlinNoise3D((x) / 100, (y) / 100);
         return height;
         */
    };

    MapGen.prototype.getHeight = function (x, y) {
        return ((this.noiseGenerator.perlinNoise3D((x) / 100, (y) / 100, this.time) + 1) / 2) * ((this.noiseGenerator.perlinNoise3D((x) / 1000, (y) / 1000, this.time) + 1) / 2);
    };
    /**
     * Get the value of seed
     *
     * @return the value of seed
     */
    MapGen.prototype.getSeed = function () {
        return this.seed;
    };
    return MapGen;
}());
MapGen["__class"] = "MapGen";