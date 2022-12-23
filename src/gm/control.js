const log = require('../util/logger');

const api_gio = require('./gio');
const api_gc = require('./gc');

const mylib = require("../lib");
const config = require("../config.json");

const axios = require('axios');

// TODO: better use datebase
let key = [];
// Thank you ChatGPT
let cache_serverlist;

module.exports = {
    Config: function (server_id) {
        // check id server
        if (server_id) {
            var g_config = config.server[server_id];
            if (!g_config) {
                return {
                    msg: "Config server not found",
                    code: 404
                }
            }
        } else {
            return {
                msg: "Need id server",
                code: 404
            }
        }
        return {
            msg: "OK",
            code: 200,
            data: g_config
        }
    },
    GM: async function (server_id, uid, cmd, code) {
        try {

            log.info(`LOG GM: ID ${server_id} | UID ${uid} | CMD ${cmd} | CODE ${code}`);

            if (mylib.contains(cmd, ['item add all'])) {
                return {
                    msg: "This command has been temporarily blocked",
                    code: 403
                }
            }

            // check uid
            if (!uid) {
                return {
                    msg: "no uid",
                    code: 301
                }
            }
            // check cmd
            if (!cmd) {
                return {
                    msg: "no cmd",
                    code: 301
                }
            }

            // check server
            var configis = this.Config(server_id);
            if (configis.code != 200) {
                return {
                    msg: configis.msg,
                    code: configis.code
                }; // maybe it's better to take it safe
            }

            if (configis.data.api.type == 1) {
                // GIO
                return await api_gio.GM(configis.data.api.url, uid, cmd);
            } else if (configis.data.api.type == 2) {
                // GC
                return await api_gc.GM(configis.data.api.url, uid, cmd, code);
            } else {
                return {
                    msg: "No Found config server",
                    code: 404
                }
            }

        } catch (error) {
            log.error(` > Error GM`,error);
            return {
                msg: "Error Get",
                code: 302
            }
        }

    },
    Server: async function (server_id) {
        var obj = config.server;

        if (cache_serverlist && Date.now() < cache_serverlist.cache) {
            cache_serverlist['msg'] = "OK but cache";
            if (server_id) {
                return cache_serverlist.data.find((j) => j.id == server_id);
            }
            return cache_serverlist;
        }

        const r = await Promise.all(Object.keys(obj).map(async (key) => {
            var tmp = {};
            var d = obj[key];

            var o = {
                online: false,
                player: 0,
                game: d.game,
                version: d.version,
                public: d.public,
                cpu: "???",
                ram: "???",
                commit: "???"
            };

            try {
                if (d.api.type == 1) {

                    var ts = await api_gio.Server(d.api.url);
                    if (ts.code == 200) {
                        // TODO: get stats ram cpu via shell
                        o['online'] = true;
                        o['player'] = ts.data.online;
                        o['sub'] = ts.data.server;
                    }

                } else if (d.api.type == 2) {

                    var ts = await api_gc.Server(d.api.url);
                    if (ts.code == 0) {
                        o['online'] = true;
                        o['player'] = ts.data.playerCount;
                        if (ts.data.MemoryCurrently) {
                            o['ram'] = ts.data.MemoryCurrently + " MB (" + ((ts.data.MemoryCurrently / ts.data.MemoryMax) * 100).toFixed(2) + " %)";
                        }
                        if (ts.data.DockerGS) {
                            o['commit'] = ts.data.DockerGS;
                        }
                    }

                }
            } catch (error) {
                log.error(error);
            }

            tmp['name'] = d.title;
            tmp['id'] = key;
            tmp['server'] = o;
            
            return tmp;
        }));

        // fetch data from external source
        cache_serverlist = {
            data: r,
            msg: "OK but update",
            code: 200,
            cache: Date.now() + (1 * 60 * 1000) // 1 minutes
        };
        if (server_id) {
            return cache_serverlist.data.find((j) => j.id == server_id);
        }

        return cache_serverlist;
    },
    Verified: function (tes) {
        /*
                   if (!set_code) {
                       // find id user in key
                       var found_user = key.find((j) => j.id === itme);
                       var time_expiry = Date.now() + 5 * 60 * 1000;
                       if (!found_user) {
                           var my_code = Math.floor(Math.random() * 100000);
                           key.push({
                               id: itme,
                               code: my_code,
                               expiry: time_expiry,
                               verification: false
                           });
                           // TODO: add time_expiry
                           var input = await api_gio.Mail(uid, "Verification Code", "YuukiPS", null, "Your verification code is: " + my_code);
                           if (input.code == 200) {
                               return await interaction.editReply({ content: `A mail has been sent please check in-game`, ephemeral: true });
                           } else {
                               return await interaction.editReply({ content: `Error send mail, msg: ${input.msg}, code: ${input.code}`, ephemeral: true });
                           }
                       } else {
                           let index_me = key.map(function (x) { return x.id; }).indexOf(itme);
                           if (!key[index_me].verification == true) {
                               return await interaction.editReply({ content: `Verification code has been sent, please check your in-game mail`, ephemeral: true });
                           } else {
                               await interaction.editReply({ content: `Previously you have been verified, so continue checking command`, ephemeral: true });
                           }
                       }
                   } else {
                       var found_user_code = key.find((j) => j.id === itme && j.code == set_code);
                       if (!found_user_code) {
                           return await interaction.editReply({ content: `Incorrect Verification Code`, ephemeral: true });
                       } else {
                           await interaction.editReply({ content: `Yay you have been verified, after that you don't need to type the code again, just make sure only this account can access commands on the account in-game`, ephemeral: true });
       
                           // update verification
                           let index_me = key.map(function (x) { return x.id; }).indexOf(itme);
                           key[index_me].verification = true;
       
                       }
                   }
                   */
    }

};