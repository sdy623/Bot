const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  CommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("verify if you are human"),
  /**
   * @param {CommandInteraction} interaction
   * @returns {void}
   */
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("verify")
      .setTitle("Verification");

    const PasswordInput = new TextInputBuilder()
      .setCustomId("password")
      .setLabel("Please type password (find it somewhere)")
      .setStyle(TextInputStyle.Short);

    // An action row only holds one text input, so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(PasswordInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow);

    // Show modal to user
    try {
      await interaction.showModal(modal);
    } catch (ex) {
      console.log(ex);
    }
    
  },
};
