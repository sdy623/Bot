const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { token } = require("./config.json");

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

// List
bot.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  bot.commands.set(command.data.name, command);
}

bot.on("interactionCreate", async (interaction) => {
  // If interaction with inpu command
  if (!interaction.isChatInputCommand()) return;

  const command = bot.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Command is not recognized :(",
      ephemeral: true,
    });
  }
});

// https://discordjs.guide/creating-your-bot/creating-commands.html#server-info-command
bot.on("messageCreate", (message) => {
  // ignore messages from bots
  if (message.author.bot) return;

  console.log(
    `Message from ${message.author.username} (ID CN: ${message.channel.id}): ${message.content}`
  );

  // Support Server
  if (message.channel.id == 998367392663093321) {
    // TODO, help!!!
  }

  if (message.content.toLowerCase() === "4214") {
    return message.reply(
      `You haven't patched metadata correctly, if you want to play with official server please return original metadata, more details #📂tutorial-lock`
    );
  }

  if (message.content.toLowerCase() === "melon") {
    return message.react("🍈");
  }

  if (message.content.toLowerCase() === "ios") {
    return message.reply(
      "Currently iOS is not supported because admin does not have tools to do testing."
    );
  }
});

bot.login(token);
