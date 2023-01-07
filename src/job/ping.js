const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');

const log = require('../util/logger');

const api_control = require('../gm/control');
const lib = require("../lib");

const { parentPort } = require("worker_threads");

const regex_ram = /\((\d+\.\d+)%\)/;

// send msg
var tmp_cek = [];
var last_msg = [];
function send(raw, id) {

    var found = last_msg.findIndex(el => el.id === id);
    var toadd = false;
    var tosend = false;
    var nowtime = new Date();
    var msg_now = raw.content;

    if (found !== -1) {

        var old_msg = last_msg[found];
        if (old_msg) {

            if (old_msg.msg == msg_now) {
                return;
            }

            var msgadd = "";

            const diffMilliseconds = nowtime.getTime() - old_msg.date.getTime();
            const diffMinutes = Math.floor(diffMilliseconds / 60000);
            const diffSeconds = Math.floor(diffMilliseconds / 1000) % 60;

            var old_time = parseInt(old_msg.date.getTime() / 1000);

            msgadd = `${msg_now} (${diffMinutes > 0 ? diffMinutes + ' minutes ' : ''}${diffSeconds} seconds from previous message)`;

            msg_now = msgadd;

            log.info("Update: " + old_msg.msg + " == " + msgadd + " ");

            // Update raw data
            raw.content = msg_now;

            // Update msg & time
            last_msg[found].msg = msg_now;
            last_msg[found].date = nowtime;

            tosend = true;
        } else {
            toadd = true;
            log.info("nani");
        }

    } else {
        toadd = true;
        tosend = true;
    }
    if (toadd) {
        last_msg.push({
            id: id,
            msg: msg_now,
            date: nowtime
        })
    }
    if (tosend) {
        parentPort.postMessage({
            type: "msg",
            data: raw
        });
    }
}

// type restart
async function restart(mnt_type, mnt_name, id_server, mnt_service) {
    if (mnt_type == 1) {
        // Restart Container
        let d = await api_control.SH(`docker restart ${mnt_name}`, id_server);
        log.info("restart1: ", d);
    } else if (mnt_type == 2) {
        // Restart Process in Container
        let d = await api_control.SH(`docker container exec ${mnt_name} pkill -9 ${mnt_service}`, id_server);
        log.info("restart2: ", d);
    } else {
        log.error("unknown restart: " + mnt_type);
    }
}

// check server every 10 seconds
setIntervalAsync(async () => {
    let d = await api_control.Server();
    var total_online = 0;
    d.data.forEach(async function (i) {

        //log.info(i);
        var id_server = i.id;
        var server_name = i.name;
        var player_online = i.server.player;

        total_online = total_online + player_online;

        var found = tmp_cek.findIndex(el => el.id === id_server);
        if (found !== -1) {

            var old = tmp_cek[found];

            var ram_usg_raw = i.server.ram;
            var cpu_usg_raw = i.server.cpu;
            var is_online = i.server.online;

            var stats = [
                {
                    "type": "rich",
                    "title": `${server_name}`,
                    "description": "",
                    "color": 0xc31815,
                    "fields": [
                        {
                            "name": `RAM`,
                            "value": `${ram_usg_raw}`
                        },
                        {
                            "name": `CPU`,
                            "value": `${cpu_usg_raw}`
                        },
                        {
                            "name": `Player Online`,
                            "value": `${player_online}`
                        }
                    ],
                    "footer": {
                        "text": `Stats Server`
                    }
                }
            ];

            // Check Only Online
            if (is_online) {

                // Monitor
                var mnt = i.server.monitor;
                if (mnt) {
                    // check config max
                    var mnt_max = mnt.max;
                    var mnt_type = mnt.type;
                    var mnt_name = mnt.name;
                    var mnt_service = mnt.service;
                    if (mnt_max) {

                        // Check RAM
                        if (mnt_max.ram >= 1) {
                            var get_ram = ram_usg_raw.match(regex_ram);
                            if (get_ram) {
                                const new_ram = parseFloat(get_ram[1]);
                                if (new_ram >= mnt_max.ram) {

                                    await restart(mnt_type, mnt_name, id_server, mnt_service);
                                    send({
                                        "content": `Server reaches memory limit, server was successfully restarted`,
                                        "embeds": stats
                                    }, id_server);

                                } else {
                                    //log.info(`Monitor ${id_server}: ${new_ram} | LIMIT RAM ${mnt_max.ram}`);
                                }
                            } else {
                                log.info(`SKIP 3: ${ram_usg_raw} `);
                            }
                        } else {
                            log.info(`SKIP RAM...`);
                        }

                        // CPU
                        if (mnt_max.cpu >= 1) {
                            const new_cpu = parseFloat(cpu_usg_raw);
                            if (new_cpu >= mnt_max.cpu) {

                                await restart(mnt_type, mnt_name, id_server, mnt_service);
                                send({
                                    "content": `Server too busy, server was successfully restarted`,
                                    "embeds": stats
                                }, id_server);

                            } else {
                                //log.info(`Monitor ${id_server}: ${new_cpu} | LIMIT CPU ${mnt_max.cpu}`);
                            }
                        } else {
                            log.info(`SKIP CPU...`);
                        }

                    } else {
                        log.info(`SKIP 1`);
                    }

                } else {
                    log.info(`SKIP 2`);
                }
            }

            //Check previous comparisons online
            if (is_online !== old.server.online) {
                if (is_online) {
                    send({
                        "content": `Server ${server_name} back online`,
                    }, id_server);
                } else {
                    send({
                        "content": `Server ${server_name} down.`,
                    }, id_server);
                }
            }

            tmp_cek[found] = i;
        } else {
            log.info("SKIP");
            tmp_cek.push(i);
        }

    });

    // send stats online
    parentPort.postMessage({
        type: "bot_stats",
        data: `Currently ${total_online} people playing.`
    });

}, 1000 * 10);