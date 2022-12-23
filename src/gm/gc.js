//const crypto = require("crypto");
//const config = require("../config.json");
const log = require('../util/logger');

const axios = require('axios');

module.exports = {
    GM: async function (url, uid, cmd, code) {
        try {
            const response = await axios.get(url + "api/command", {
                params: {
                    token: code,
                    cmd: cmd,
                    player: uid
                },
                timeout: 5000
            });
            const d = response.data;
            return {
                msg: d.message,
                code: d.retcode,
                data: d.data
            }
        } catch (error) {
            log.error(error);
            return {
                msg: "Error Get",
                code: 302
            };
        }
    },
    Server: async function (server_url) {
        try {
            const response = await axios.get(server_url + "status/server", {
                timeout: 5000
            });
            const d = response.data;
            return {
                msg: "OK",
                code: d.retcode,
                data: d.status
            }
        } catch (error) {
            //log.error(error);
            return {
                msg: "Error Get",
                code: 302
            };
        }
    }
};