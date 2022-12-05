const { SlashCommandBuilder,CommandInteraction } = require("discord.js");
const axios = require('axios');
const apis = require('../gm/api');
const config = require("../config.json");

const now = new Date();
const unix = Math.round(now.getTime() / 1000) + 60 ** 2 * 24 * 7;

const item = [
    {
        'item_id': 11101,    // item id
        'amount': 1,         // quantity
        'level': 90,         // level
        'promote_level': 0,  // cts
    },
    {
        'item_id': 11201,
        'amount': 3,
        'level': 56,
        'promote_level': 1,
    },
];

const YSGM_mail = (uid = "10005", title = "Tes", sender = 'YuukiPS', expire_time = unix, content = 'tes', item_list = null, is_collectible = false) => {
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
    return mail_json;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mail")
        .setDescription("Send email to GIO Server")
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('uid player')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('command')
                .setDescription('giveall|gitem-201-1000')
                .setRequired(true)),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {
        try {

            var item = null
            let uid = interaction.options.getString('uid');
            let set_command = interaction.options.getString('command');
      
            if(set_command == "giveall"){

            }else if(set_command.includes("gitem")){
                var valb = set_command.split("-");
                // TODO: add more check vaild
                item = [
                    {
                        'item_id': valb[1],  // item id
                        'amount': valb[2],   // quantity
                        'level': 0,         // level
                        'promote_level': 0,  // cts
                    },
                ];
            }else{
                return await interaction.reply({ content: `Unknown command: ${set_command}`, ephemeral: true });
            }

            var input = YSGM_mail(uid,"Command Discord","YuukiPS",unix,`This is command from ${interaction.user.username} > ${set_command}`,item);
            console.log("Data: " + apis.YSGM_sign(input));
            // 1005 - email
            let params = apis.YSGM_cmd(1005, null, null, input);
            const response = await axios.get(config.api_server_gio, { params: params });
            const result = response.data;
            console.log(result);
            if (result.msg == 'succ' && result.retcode == 0) {
                return await interaction.reply({ content: `Message has been sent`, ephemeral: true });
            } else {
                return await interaction.reply({ content: `Error msg: ${result.msg}, retcode: ${result.retcode}`, ephemeral: true });
            }
        } catch (err) {
            console.log("Error: ", err);
            return await interaction.reply({ content: "error2", ephemeral: true });
        }
    },
};