const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const api_gio = require('../gm/gio');
const lib = require("../lib");

// TODO: better use datebase
var key = [];

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
            let uid = interaction.options.getString('uid');
            let set_command = interaction.options.getString('command');
            let set_code = interaction.options.getString('code');
            let itme = interaction.user.id;

            interaction.reply({ content: "Please wait...", ephemeral: true });
            await lib.sleep(3);

            if (!set_code) {
                // find id user in key
                var found_user = key.find((j) => j.id === itme);
                var time_expiry = Date.now() + 5 * 60 * 1000;
                if (!found_user) {
                    var my_code = Math.floor(Math.random() * 100000);
                    key.push({
                        id: itme,
                        code: my_code,
                        expiry: time_expiry,
                        verification: false
                    });
                    // TODO: add time_expiry
                    var input = await api_gio.Mail(uid, "Verification Code", "YuukiPS", null, "Your verification code is: " + my_code);
                    if (input.code == 200) {
                        return await interaction.editReply({ content: `A mail has been sent please check in-game`, ephemeral: true });
                    } else {
                        return await interaction.editReply({ content: `Error send mail, msg: ${input.msg}, code: ${input.code}`, ephemeral: true });
                    }
                } else {
                    let index_me = key.map(function (x) { return x.id; }).indexOf(itme);
                    if (!key[index_me].verification == true) {
                        return await interaction.editReply({ content: `Verification code has been sent, please check your in-game mail`, ephemeral: true });
                    } else {
                        await interaction.editReply({ content: `Previously you have been verified, so continue checking command`, ephemeral: true });
                    }
                }
            } else {
                var found_user_code = key.find((j) => j.id === itme && j.code == set_code);
                if (!found_user_code) {
                    return await interaction.editReply({ content: `Incorrect Verification Code`, ephemeral: true });
                } else {
                    await interaction.editReply({ content: `Yay you have been verified, after that you don't need to type the code again, just make sure only this account can access commands on the account in-game`, ephemeral: true });

                    // update verification
                    let index_me = key.map(function (x) { return x.id; }).indexOf(itme);
                    key[index_me].verification = true;

                }
            }

            let d = await api_gio.GM(uid, set_command);
            return await interaction.editReply({ content: d.msg, ephemeral: true });
        } catch (err) {
            console.log("Error: ", err);
            return await interaction.editReply({ content: "Unknown error", ephemeral: true });
        }
    },
};