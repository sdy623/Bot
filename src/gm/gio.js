const crypto = require("crypto");
const config = require("../config.json");
const axios = require('axios');

module.exports = {
    Sign: function (raw = null) {
        let sha256_salt = '1d8z98SAKF98bdf878skswa8kdjfy1m9dses';
        let query_string = Object.keys(raw).map(x => `${x}=${raw[x]}`).join('&');
        let sha256_result = crypto.createHash('sha256').update(query_string + sha256_salt).digest('hex');
        raw['sign'] = sha256_result;
        return raw;
    },
    CMD: function (cmd, uid = null, msg = null, raw = null, region = "dev_gio") {
        let params = {
            'cmd': `${cmd}`,
            'region': region,
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
        return this.Sign(params);
    },
    Mail: async function (uid = "10005", title = "Tes", sender = 'YuukiPS', expire_time = null, content = 'tes', item_list = null, is_collectible = false) {
        if (!expire_time) {
            const now = new Date();
            expire_time = Math.round(now.getTime() / 1000) + 60 ** 2 * 24 * 7;
        }
        let item_str = '';
        if (item_list) {
            item_str = item_list.map(x => `${x.item_id}:${x.amount}:${x.level}:${x.promote_level}`).join(',');
        }
        const mail_json = {
            uid: `${uid}`,
            title,
            sender,
            expire_time: `${expire_time}`,
            content,
            item_list: item_str,
            is_collectible
        };
        console.log(mail_json);
        try {
            // 1005 - email
            let params = this.CMD(1005, null, null, mail_json);
            const response = await axios.get(config.api_server_gio, { params: params });
            const result = response.data;
            console.log(result);
            if (result.msg == 'succ' && result.retcode == 0) {
                return {
                    msg: `Message has been sent`,
                    code: 200
                };
            } else {
                return {
                    msg: result.msg,
                    code: result.retcode
                };
            }
        } catch (error) {
            return {
                msg: `Error send mail`,
                code: 401
            };
        }
    },
    GM: async function (uid, set_command) {
        try {
            // 1116 = GM
            let params = this.CMD(1116, uid, set_command, null);
            const response = await axios.get(config.api_server_gio, { params: params });
            const result = response.data;
            console.log(result);
            if (result.msg == 'succ' && result.retcode == 0) {
                return {
                    msg: `Command has been sent`,
                    code: 200
                };
            } else {
                // if have data
                if (result.data) {
                    return {
                        msg: result.data.retmsg,
                        code: result.retcode
                    };
                } else {
                    return {
                        msg: result.msg,
                        code: result.retcode
                    };
                }

            }
        } catch (error) {
            console.log(error);
            return {
                msg: "Error get server",
                code: 401
            };
        }
    },
    Server: async function () {
        try {
            // 1101 = Server Status
            let params = this.CMD(1101);
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