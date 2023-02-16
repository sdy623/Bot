/** @format */

const { CommandInteraction, SlashCommandBuilder } = require("discord.js")

const log = require("../util/logger")

const api_control = require("../gm/control")
const lib = require("../lib")

const config = require("../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("sh")
		.setDescription("Access Super Admin Servers")
		.addStringOption((option) => option.setName("id").setDescription("Server ID: [eu1|sg1|gio2]").setRequired(true))
		.addStringOption((option) => option.setName("command").setDescription("who").setRequired(true)),
	/**
	 * @param {CommandInteraction} interaction
	 * @returns {void}
	 */
	async execute(interaction) {
		try {
			let server_id = interaction.options.getString("id")
			let set_command = interaction.options.getString("command")
			let id_user = interaction.user.id

			if (id_user != config.id_admin) {
				return await interaction.reply({ content: "No Admin: " + id_user, ephemeral: true })
			}

			interaction.reply({ content: "Please wait...", ephemeral: true })
			await lib.sleep(2)

			let d = await api_control.SH(set_command, server_id)

			return await interaction.editReply({ content: d.msg, ephemeral: true })
		} catch (e) {
			log.error(e)
			return await interaction.editReply({ content: "Unknown error", ephemeral: true })
		}
	}
}
