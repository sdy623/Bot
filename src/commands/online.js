const { SlashCommandBuilder } = require("discord.js");
const api_control = require('../gm/control');
const lib = require("../lib");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("online")
        .setDescription("Check Server Online Player"),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {        
        try {

            interaction.reply({ content: "Please wait...", ephemeral: true });
            await lib.sleep(3);

            var tes = "";
            var total = 0;
            let d = await api_control.Server();
            d.data.forEach(function(i){ 
                //console.log(i);
                tes += `${i.name} (${i.id}) > Player ${i.server.player}\n`
                total = total + i.server.player;
            });

            tes += `\nTotal Player ${total}`
            return await interaction.editReply({ content: `${tes}`, ephemeral: true });

        } catch (err) {
            console.log("Error: ",err);
            await interaction.reply("Unknown problem");
        }
    },
};