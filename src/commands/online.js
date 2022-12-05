const { SlashCommandBuilder } = require("discord.js");
const crypto = require("crypto");
const axios = require('axios');
const apis = require('../gm/api');
const config = require("../config.json");

async function checkOnline() {
    try {
        // 1101 = check online?
        let params = apis.YSGM_cmd(1101);
        const response = await axios.get(config.api_server_gio, {params: params});
        const result = response.data;
        console.log(result);
        if (result.msg == 'succ' && result.retcode == 0) {
            return `Total Player currently ${result.data.online_player_num_except_sub_account} online on GIO server with ${Object.keys(result.data.gameserver_player_num).length} sub server`;
        } else {
            return `Error msg: ${result.msg}, retcode: ${result.retcode}`;
        }
    } catch (err) {
        console.log("Error: ",err);
        return "Error catch2";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("online")
        .setDescription("Check online Server GIO"),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {        
        var r = await checkOnline();
        await interaction.reply(r);
    },
};