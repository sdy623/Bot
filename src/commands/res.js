/** @format */

const { SlashCommandBuilder, CommandInteraction } = require("discord.js")

const log = require("../util/logger")

const api_genshin = require("../game/genshin/api")

const lib = require("../lib")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("res")
		.setDescription("Get debug res")
		.addStringOption((option) => option.setName("seed").setDescription("Seed ID").setRequired(true))
		.addStringOption((option) => option.setName("version").setDescription("Game Version").setRequired(true)),
	/**
	 * @param {CommandInteraction} interaction
	 * @returns {void}
	 */
	async execute(interaction) {
		try {
			let set_seed_id = interaction.options.getString("seed")
			let set_version = interaction.options.getString("version")
			let id_user = interaction.user.id

			interaction.reply({ content: "Please wait...", ephemeral: true })

			await lib.sleep(2)

			let d = await api_genshin.RES(set_version, set_seed_id)

			console.log(JSON.stringify(d))

			if (d.code != 200) {
				await interaction.editReply({
					content: d.msg,
					ephemeral: true
				})
				return;
			}

			var da = `			
			cfResource.add(
				new Resource(
					"${set_version}",
					"${d.data.regionInfo.resourceUrl}",
					"${d.data.regionInfo.dataUrl}",
					"${d.data.regionInfo.resourceUrlBak}",
					${JSON.stringify(d.data.regionInfo.clientDataVersion)},
					${JSON.stringify(d.data.regionInfo.clientSilenceDataVersion)},
					"${d.data.regionInfo.clientDataMd5}",
					"${d.data.regionInfo.clientSilenceDataMd5}",
					"${d.data.regionInfo.clientVersionSuffix}",
					"${d.data.regionInfo.clientSilenceVersionSuffix}",
					new ResVersionConfig(
						${d.data.regionInfo.resVersionConfig.version},
						${JSON.stringify(d.data.regionInfo.resVersionConfig.md5)},
						"${d.data.regionInfo.resVersionConfig.releaseTotalSize}",
						"${d.data.regionInfo.resVersionConfig.versionSuffix}",
						"${d.data.regionInfo.resVersionConfig.branch}"
					),
					new ResVersionConfig(0, " ", " ", " ", " "),
					""
				)
			);			
			`

			return await interaction.editReply({
				content: `\`\`\`\n${da}\n\`\`\``,
				ephemeral: true
			})
		} catch (err) {
			log.error(err)
			return await interaction.editReply({ content: "Unknown error", ephemeral: true })
		}
	}
}
