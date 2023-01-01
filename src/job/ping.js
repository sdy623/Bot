const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');

const log = require('../util/logger');

const api_control = require('../gm/control');
const lib = require("../lib");

const { parentPort } = require("worker_threads");

// check server every 10 seconds
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

            msgadd = `${msg_now} (<t:${old_time}:R> from previous message | ${diffSeconds} seconds)`;

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
            var cpi_usg_raw = i.server.cpu;
            var is_online = i.server.online;
            var mnt_name = i.server.monitor;

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
                            "value": `${cpi_usg_raw}`
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

            // cek
            //const old_ram = parseFloat(old.server.player.match(regex));
            const regex = /\((\d+\.\d+)%\)/;
            var get_ram = ram_usg_raw.match(regex);
            if (get_ram) {
                const new_ram = parseFloat(get_ram[1]);
                if (new_ram >= 98) {
                    //`Server ${i.name} reaches memory limit ${ram_usg_raw}, time to restart.`
                    // ${ram_usg_raw}
                    let d = await api_control.SH(`docker restart ${mnt_name}`, id_server); // TODO: add type monitor
                    log.info(d);
                    send({
                        "content": `Server reaches memory limit, server was successfully restarted`,
                        "embeds": stats
                    }, id_server);
                } else {
                    //log.info(`${old.server.ram} vs ${ram_usg_raw}`);
                }
            }

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

            //var tes = "";
            //tes += `${i.name} (${i.id}) > Player ${i.server.player} | CPU: ${i.server.cpu} | RAM ${i.server.ram} \n`
            //parentPort.postMessage(tes);            

        } else {
            log.info("skip");
            tmp_cek.push(i);
        }

    });

    // send stats online
    parentPort.postMessage({
        type: "bot_stats",
        data: `Currently ${total_online} people playing.`
    });

}, 1000 * 10);