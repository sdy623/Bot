var randomRegExp = /(random)/

module.exports = {
    processAST: function (buff, env) {

        for (var i = 0; i < buff.length; i++) {

            let currItem = buff[i];
            if (randomRegExp.test(currItem.val)) {
                //console.log(currItem.val);
                buff[i] = Math.floor(Date.now() / 1000).toString();
            }

        }

        return buff
    }
}