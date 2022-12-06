const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const axios = require('axios');
const api_gio = require('../gm/gio');
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mail")
        .setDescription("Send email to GIO Server")
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('uid player')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('command')
                .setDescription('msg-title-yourmessage|gitem-itemid-amount,itemid-amount')
                .setRequired(true)),
    /**
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async execute(interaction) {
        try {
            let uid = interaction.options.getString('uid');
            let set_command = interaction.options.getString('command');
            var input;
            if (set_command.includes("msg")) {
                // send email
                var valb = set_command.split("-");
                input = api_gio.Mail(uid, valb[1], interaction.user.username, null, valb[2]);
            } else if (set_command.includes("gitem")) {
                // send multi item
                var more_item = set_command.split(",");
                var itemtoadd = [];
                more_item.forEach(function (data_msg) {
                    console.log(data_msg);
                    let ks = data_msg.replace("gitem-", "");
                    var valb2 = ks.split("-");
                    itemtoadd.push({
                        'item_id': valb2[0],  // item id
                        'amount': valb2[1],   // quantity
                        'level': 0,         // level
                        'promote_level': 0,  // cts
                    });
                });
                input = api_gio.Mail(uid, "A gift item from Discord", interaction.user.username, null, `Accept a gift from me ~ YuukiPS`, itemtoadd);
            } else {
                return await interaction.reply({ content: `Unknown command: ${set_command}`, ephemeral: true });
            };
            if (input.code == 200) {
                return await interaction.reply({ content: `Message has been sent`, ephemeral: true });
            } else {
                return await interaction.reply({ content: `Error msg: ${input.msg}, code: ${input.code}`, ephemeral: true });
            }
        } catch (err) {
            console.log("Error: ", err);
            return await interaction.reply({ content: "error2", ephemeral: true });
        }
    },
};