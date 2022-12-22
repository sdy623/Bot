//const crypto = require("crypto");
//const config = require("../config.json");
const axios = require('axios');
const fs = require('fs');
const path = require('path');

function read_json(file) {
    return JSON.parse(fs.readFileSync(file));
}

module.exports = {
    // RAW DATA
    INFO: async function (version = "", platform = 1) {
        // 1 = PC, 2 = Android, 3 = iOS
        try {
            var data = [];
            if (version) {
                // grab version only
            } else {
                // get all version
                // TODO: save and load by datebase
                // TODO: add android & ios

                // Load by file json (PC)
                const file_version = './src/web/public/json/genshin/version/archive';
                fs.readdirSync(file_version).forEach(cn => {
                    var file_cn = path.join(file_version, cn);
                    fs.readdirSync(file_cn).forEach(cn2 => {
                        var x = path.join(file_cn, cn2);
                        let jsonData = read_json(x);
                        //console.log(jsonData);
                        data.push(jsonData);
                    });
                });

            }
            return {
                msg: "OK",
                code: 200,
                data: data
            };
        } catch (error) {
            console.log(error);
            return {
                msg: "Error Get",
                code: 302
            };
        }
    }
};