const { SlashCommandBuilder, CommandInteraction } = require("discord.js");

const log = require('../util/logger');

const api_control = require('../gm/control');
const lib = require("../lib");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cmd")
        .setDescription("Send Command (RAW) to Server")
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Server ID: [sg1|eu1|gio2]')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('uid player')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('command')
                .setDescription('stamina infinite on')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code you got in mail (in-game), if you dont have it, leave it blank.')
                .setRequired(false)),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {
        try {
            let server_id = interaction.options.getString('id');
            let uid = interaction.options.getString('uid');
            let set_command = interaction.options.getString('command');
            let set_code = interaction.options.getString('code');
            let id_user = interaction.user.id;

            interaction.reply({ content: "Please wait...", ephemeral: true });
            await lib.sleep(3);

            let d = await api_control.GM(server_id, uid, set_command, set_code);

            return await interaction.editReply({ content: `${d.msg} | ${d.code}`, ephemeral: true });
        } catch (err) {
            log.error("Error: ", err);
            //return await interaction.reply({ content: "Unknown error", ephemeral: true });
        }
    },
};