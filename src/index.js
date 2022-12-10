const express = require('express');
const cors = require('cors');

const api_gio = require('./gm/gio');
const config = require("./config.json");

const fs = require("node:fs");
const path = require("node:path");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
} = require("discord.js");

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

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

/*
bot.on(Events.Error, error => {
  console.error('Error Bot', error);
  //process.exit(1);
});
*/

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

  // log
  console.log(
    `interaction from ${interaction.commandName} - ${interaction.user.id} (Channel: ${interaction.channel.name} - ${interaction.channel.id})`
  );

  // if found cmd
  if (interaction.commandName) {

    // verify channel
    if (interaction.channel.id == "1039554337438961714") {
      if (!(interaction.commandName).includes("verify")) {
        await interaction.reply({
          content: "can't be used here",
          ephemeral: true,
        });
        return; // bye bug :p
      }
    }

  }

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
  } catch (error_real) {
    try {
      await interaction.reply({
        content: "Command is not recognized :(",
        ephemeral: true,
      });
    } catch (error_skip) {
      console.error(error_real);
    }
  }
});

// https://discordjs.guide/creating-your-bot/creating-commands.html#server-info-command
// https://discordjs.guide/popular-topics/intents.html#error-disallowed-intents
// https://stackoverflow.com/questions/64006888/discord-js-bot-disallowed-intents-privileged-intent-provided-is-not-enabled-o
// https://stackoverflow.com/a/69110976/3095372

bot.on("messageCreate", (message) => {


  // 969145030537281536 = log public (join/out) | 987073348418809928 = log private
  if (message.channel.id != "969145030537281536" || message.channel.id != "987073348418809928") {
    console.log(
      `Message from ${message.author.username} - ${message.author.id} (Channel: ${message.channel.name} - ${message.channel.id}):\n-> ${message.content}`
    );
  }

  if (message.interaction) {
    console.log("interaction message: " + message.interaction.commandName);
  }

  // ignore messages from bots
  if (message.author.bot) return;

  // (verify) Delete useless messages, If not admin (TODO: Add multi user)
  if (message.channel.id == 1039554337438961714) {
    if (message.author.id != config.id_admin) {
      message.delete();
    }
  }

  // Add Melon
  if (message.content.toLowerCase() === "melon") {
    message.react("🍈");
  }
});

if (config.startup.bot) {
  console.log("bot run....");
  bot.login(config.token);
} else {
  console.log("bot skip run....");
}

const web = express();
web.use(cors());

web.all('/', (req, res) => {
  res.send('API YuukiBot');
});

web.all('/server/:id', async (req, res) => {
  var s = "gio";
  if (req.params.id) {
    s = req.params.id;
  };
  try {
    let d = await api_gio.Server();
    return res.json(d);
  } catch (error) {
    console.log(error);
    return res.json({ error: 302 });
  }
})

web.all('/server/:id/command', async (req, res) => {
  var s = "gio";
  if (req.params.id) {
    s = req.params.id;
  };
  let uid = req.query.uid;
  let cmd = req.query.cmd;
  if (!uid) {
    return res.json({
      msg: "no uid",
      code: 301
    });
  }
  if (!cmd) {
    return res.json({
      msg: "no cmd",
      code: 301
    });
  }
  try {
    let d = await api_gio.GM(uid, cmd);
    return res.json(d);
  } catch (error) {
    console.log(error);
    return res.json({ error: 302 });
  }
})

if (config.startup.webserver) {
  var listener = web.listen(3000, function () {
    console.log('Server started on port %d', listener.address().port);
  });
}else{
  console.log("skip run webserver...");
}