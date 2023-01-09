module.exports = {
    sleep: function (ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000 * ms);
        });
    },
    timestr: function (time) {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const timeDifferenceInSeconds = currentTimeInSeconds - parseInt(time);
        return (timeDifferenceInSeconds < 60) ? `${timeDifferenceInSeconds} seconds ago`
            : (timeDifferenceInSeconds < 3600) ? `${Math.floor(timeDifferenceInSeconds / 60)} minutes ${timeDifferenceInSeconds % 60} seconds ago`
                : (timeDifferenceInSeconds < 86400) ? `${Math.floor(timeDifferenceInSeconds / 3600)} hours ${Math.floor((timeDifferenceInSeconds % 3600) / 60)} minutes ${timeDifferenceInSeconds % 60} seconds ago`
                    : `${Math.floor(timeDifferenceInSeconds / 86400)} days ${Math.floor((timeDifferenceInSeconds % 86400) / 3600)} hours ${Math.floor((timeDifferenceInSeconds % 3600) / 60)} minutes ${timeDifferenceInSeconds % 60} seconds ago`;
    },
    isEmpty: function (str) {
        return (!str || str.length === 0);
    },
    contains: function (target, pattern) {
        var value = 0;
        pattern.forEach(function (word) {
            value = value + target.includes(word);
        });
        return (value === 1)
    },
    contains2: function (target, pattern) {
        var value = 0;
        pattern.forEach(function (word) {
            if (target == word) {
                value = 1;
            }
        });
        return (value === 1)
    }
}