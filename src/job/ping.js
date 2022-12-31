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
    if (found !== -1) {
        var old_msg = last_msg[found];
        if (old_msg) {
            if (old_msg.msg == raw.content) {
                //console.log("dup");
                return;
            }
            console.log("tesss " + old_msg.msg + " == " + raw.content + " ");

            last_msg[found] = raw; // update

            tosend = true;
        } else {
            toadd = true;
            console.log("nani");
        }
        //last_msg[found]
    } else {
        toadd = true;
        tosend = true;
    }
    if (toadd) {
        last_msg.push({
            id: id,
            msg: raw.content
        })
    }
    if (tosend) {
        parentPort.postMessage(raw);
    }
}

setIntervalAsync(async () => {
    let d = await api_control.Server();
    d.data.forEach(async function (i) {

        //console.log(i);
        var id_server = i.id;
        var server_name = i.name;

        var found = tmp_cek.findIndex(el => el.id === id_server);
        if (found !== -1) {

            var old = tmp_cek[found];

            var ram_usg_raw = i.server.ram;
            var cpi_usg_raw = i.server.cpu;
            var player_online = i.server.player;
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
                if (new_ram >= 95) {
                    //`Server ${i.name} reaches memory limit ${ram_usg_raw}, time to restart.`
                    // ${ram_usg_raw}
                    let d = await api_control.SH(`docker restart ${mnt_name}`,id_server); // TODO: add type monitor
                    console.log(d);
                    send({
                        "content": `Server reaches memory limit, server was successfully restarted`,
                        "embeds": stats
                    }, id_server);
                } else {
                    //console.log(`${old.server.ram} vs ${ram_usg_raw}`);
                }
            }

            if (is_online !== old.server.online) {
                if (is_online) {
                    send({
                        "content": `Server ${server_name} currently back.`,
                    }, id_server);
                } else {
                    send({
                        "content": `Server ${server_name} online down.`,
                    }, id_server);
                }
            }

            tmp_cek[found] = i;

            //var tes = "";
            //tes += `${i.name} (${i.id}) > Player ${i.server.player} | CPU: ${i.server.cpu} | RAM ${i.server.ram} \n`
            //parentPort.postMessage(tes);

        } else {
            console.log("skip");
            tmp_cek.push(i);
        }

    });
}, 1000 * 10);