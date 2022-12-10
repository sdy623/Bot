module.exports = {
    sleep: function (ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000*ms);
        });
    },
    isEmpty: function (str) {
        return (!str || str.length === 0 );
    },
    contains: function(target, pattern){
        var value = 0;
        pattern.forEach(function(word){
          value = value + target.includes(word);
        });
        return (value === 1)
    }
}