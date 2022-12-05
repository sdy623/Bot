const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const axios = require('axios');
const apis = require('../gm/api');
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cmd")
        .setDescription("Send command to GIO Server")
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('uid player')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('command')
                .setDescription('stamina infinite on')
                .setRequired(true)),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {
        try {
            let uid = interaction.options.getString('uid');
            let set_command = interaction.options.getString('command');

            // 1116 = GM
            let params = apis.YSGM_cmd(1116, uid, set_command, null);
            const response = await axios.get(config.api_server_gio, { params: params });
            const result = response.data;
            console.log(result);
            if (result.msg == 'succ' && result.retcode == 0) {
                return await interaction.reply({ content: `Command has been sent`, ephemeral: true });
            } else {
                return await interaction.reply({ content: `Error msg: ${result.msg}, retcode: ${result.retcode}`, ephemeral: true });
            }
        } catch (err) {
            console.log("Error: ", err);
            return await interaction.reply({ content: "error2", ephemeral: true });
        }
    },
};