const { SlashCommandBuilder } = require("discord.js");
const api_gio = require('../gm/gio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("online")
        .setDescription("Check online Server GIO"),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {        
        try {
            // 1101 = check online?
            let d = await api_gio.GIO_server();
            if (d.code == 200) {
                await interaction.reply(`Total Player currently ${d.data.online} online on GIO server with ${Object.keys(d.data.server).length} sub server`);
            } else {
                await interaction.reply(`Error msg: ${d.msg}, retcode: ${d.code}`);
            }
        } catch (err) {
            console.log("Error: ",err);
            await interaction.reply("Unknown problem");
        }
    },
};