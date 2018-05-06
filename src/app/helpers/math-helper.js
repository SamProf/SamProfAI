var MathHelper = (function () {
    function MathHelper() {
    }
    // Возвращает случайное число между min (включительно) и max (не включая max)
    MathHelper.getRandomArbitrary = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    // Возвращает случайное целое число между min (включительно) и max (не включая max)
    // Использование метода Math.round() даст вам неравномерное распределение!
    MathHelper.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    return MathHelper;
})();
exports.MathHelper = MathHelper;
