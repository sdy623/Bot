const crypto = require("crypto");
const config = require("../config.json");
const axios = require('axios');

module.exports = {
    YSGM_sign: function (raw = null) {
        let sha256_salt = '1d8z98SAKF98bdf878skswa8kdjfy1m9dses';
        let query_string = Object.keys(raw).map(x => `${x}=${raw[x]}`).join('&');
        let sha256_result = crypto.createHash('sha256').update(query_string + sha256_salt).digest('hex');
        raw['sign'] = sha256_result;
        return raw;
    },
    YSGM_cmd: function (cmd, uid = null, msg = null, raw = null) {
        let params = {
            'cmd': `${cmd}`,
            'region': 'dev_gio',
            'ticket': `YSGM@${Date.now()}`
        }
        if (uid) {
            params['uid'] = uid;
        }
        if (msg) {
            params['msg'] = msg;
        }
        if (raw) {
            params = Object.assign({}, params, raw);
        }
        return this.YSGM_sign(params);
    },
    YSGM_gm: async function (uid, set_command) {
        try {
            // 1116 = GM
            let params = this.YSGM_cmd(1116, uid, set_command, null);
            const response = await axios.get(config.api_server_gio, { params: params });
            const result = response.data;
            console.log(result);
            if (result.msg == 'succ' && result.retcode == 0) {
                return {
                    msg: `Command has been sent`,
                    code: 200
                };
            } else {
                return {
                    msg: result.msg,
                    code: result.retcode
                };
            }
        } catch (error) {
            console.log(error);
            return {
                msg: "Error get server",
                code: 401
            };
        }
    },
    YSGM_server: async function () {
        try {
            // 1101 = Server Status
            let params = this.YSGM_cmd(1101);
            const response = await axios.get(config.api_server_gio, { params: params });
            const result = response.data;
            return {
                data: {
                    server: result.data.gameserver_player_num,
                    online: result.data.online_player_num_except_sub_account
                },
                code: 200
            };
        } catch (error) {
            console.log(error);
            return {
                msg: "Error get server",
                code: 401
            };
        }
    }
};