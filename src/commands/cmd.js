const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const apis = require('../gm/api');

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
            let d = await apis.YSGM_gm(uid, set_command);
            return await interaction.reply({ content: d.msg, ephemeral: true });
        } catch (err) {
            console.log("Error: ", err);
            return await interaction.reply({ content: "unknown error", ephemeral: true });
        }
    },
};