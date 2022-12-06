const { SlashCommandBuilder } = require("discord.js");
const apis = require('../gm/api');

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
            let d = await apis.YSGM_server();
            if (d.code == 200) {
                await interaction.reply(`Total Player currently ${d.online} online on GIO server with ${Object.keys(d.server).length} sub server`);
            } else {
                await interaction.reply(`Error msg: ${d.msg}, retcode: ${d.code}`);
            }
        } catch (err) {
            console.log("Error: ",err);
            await interaction.reply("Error catch2");
        }
    },
};