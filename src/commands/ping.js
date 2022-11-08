const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  /**
   * @param {CommandInteraction} interaction
   * @returns {void}
   */
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
