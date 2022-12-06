module.exports = {
    sleep: function (ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000*ms);
        });
    },
    isEmpty: function (str) {
        return (!str || str.length === 0 );
    }
}