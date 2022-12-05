const crypto = require("crypto");

module.exports = {    
    YSGM_sign: function (raw=null) {
        let sha256_salt = '1d8z98SAKF98bdf878skswa8kdjfy1m9dses';
        let query_string = Object.keys(raw).map(x => `${x}=${raw[x]}`).join('&');
        let sha256_result = crypto.createHash('sha256').update(query_string + sha256_salt).digest('hex');
        raw['sign'] = sha256_result;
        return raw;
    },
    YSGM_cmd: function (cmd, uid = null, msg = null,raw=null) {
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
        if(raw){
            params = Object.assign({}, params, raw);
        }
        return this.YSGM_sign(params);
    },
};