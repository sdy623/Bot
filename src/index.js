const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
} = require("discord.js");
const { token, id_admin } = require("./config.json");
const { config } = require("node:process");

// debug, remove some later
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
});

// Commands
bot.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  bot.commands.set(command.data.name, command);
}
// Modal
bot.modals = new Collection();
const modalsPath = path.join(__dirname, "modals");
const modalsFiles = fs
  .readdirSync(modalsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of modalsFiles) {
  const filePath = path.join(modalsPath, file);
  const m = require(filePath);
  var name = file.replace(".js", "");
  //console.log(name);
  bot.modals.set(name, m);
}

bot.on(Events.InteractionCreate, async (interaction) => {
  // If modal with inpu command
  if (interaction.isModalSubmit()) {
    const m = bot.modals.get(interaction.customId);
    if (!m) return;
    try {
      await m.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Modals is not recognized :(",
        ephemeral: true,
      });
    }
    return;
  }

  // If interaction with inpu command
  if (!interaction.isChatInputCommand()) return;
  const c = bot.commands.get(interaction.commandName);
  if (!c) return;
  try {
    await c.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Command is not recognized :(",
      ephemeral: true,
    });
  }
});

// https://discordjs.guide/creating-your-bot/creating-commands.html#server-info-command
// https://stackoverflow.com/questions/64006888/discord-js-bot-disallowed-intents-privileged-intent-provided-is-not-enabled-o
// https://stackoverflow.com/a/69110976/3095372

bot.on("messageCreate", (message) => {
  console.log(
    `Message from ${message.author.username} - ${message.author.id} (Channel: ${message.channel.name} - ${message.channel.id}):\n-> ${message.content}`
  );

  // ignore messages from bots
  if (message.author.bot) return;

  // hehe melon
  if (message.content.toLowerCase() === "melon") {
    return message.react("🍈");
  }

  // (verify) Delete useless messages, If not admin
  if (message.channel.id == 1039554337438961714) {
    if (message.author.id != id_admin) {
      message.delete();
    }
  }
});

bot.login(token);
