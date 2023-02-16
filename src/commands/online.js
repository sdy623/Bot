/** @format */

const { SlashCommandBuilder } = require("discord.js")

const log = require("../util/logger")

const api_control = require("../gm/control")
const lib = require("../lib")

module.exports = {
	data: new SlashCommandBuilder().setName("online").setDescription("Check Server Online Player"),
	/**
	 * @param {CommandInteraction} interaction
	 * @returns {void}
	 */
	async execute(interaction) {
		try {
			interaction.reply({ content: "Please wait...", ephemeral: true })
			await lib.sleep(3)

			var tes = ""
			var total = 0
			let d = await api_control.Server()
			d.data.forEach(function (i) {
				tes += `${i.name} (${i.id}) > Player ${i.server.player} | CPU: ${i.server.cpu} / RAM ${i.server.ram} \n`
				total = total + i.server.player
			})

			tes += `\nTotal Player ${total}`
			return await interaction.editReply({ content: `${tes}`, ephemeral: true })
		} catch (err) {
			log.error("Error: ", err)
			await interaction.editReply({ content: "Unknown problem", ephemeral: true })
		}
	}
}
