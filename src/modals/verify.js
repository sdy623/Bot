const { ModalSubmitInteraction } = require("discord.js");
const crypto = require("crypto");
const config = require("../config.json");
module.exports = {
  /**
   * @param {ModalSubmitInteraction} interaction
   * @returns {void}
   */
  async execute(interaction) {
    //1039554337438961714 real, 987879230585069609 tes bot
    if (interaction.channelId != "1039554337438961714") {
      console.log("Hmm not here: " + interaction.channelId);
      return await interaction.reply({
        content: "Can't do it here",
        ephemeral: true,
      });
    }

    // User
    const input_password = interaction.fields.getTextInputValue("password");
    const hash = crypto.createHash("md5");
    const hashedInput = hash.update(input_password).digest("hex");

    // Config
    const password = config.password;

    // Check Password
    if (hashedInput != password) {
      return await interaction.reply({
        content: "Wrong password try again",
        ephemeral: true,
      });
    }

    const id_role = "1039554857746583573"; // 964119462188040202
    const ismember = interaction.guild.roles.cache.get(id_role);
    // check if role available
    if (ismember) {
      // check if have role
      if (interaction.member.roles.cache.has(id_role)) {
        return await interaction.reply({
          content: "You already verified",
          ephemeral: true,
        });
      }
    } else {
      return await interaction.reply({
        content: "Error check Role!!!",
        ephemeral: true,
      });
    }

    // add role
    interaction.member.roles.add(ismember);

    await interaction.reply({
      content: "You've been verified!",
      ephemeral: true,
    });
  },
};
