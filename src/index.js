const express = require('express');
const cors = require('cors');
const eta = require("eta");

const log = require('./util/logger');

const api_control = require('./gm/control');
const api_genshin = require('./game/genshin/api'); // TODO: use control version game by game type

const mylib = require("./lib");
const config = require("./config.json");
var eta_plugin_random = require("./web/plugin/random")

const fs = require("node:fs");
const path = require("node:path");

log.info('Yuuki Web Server 2 Up');

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
} = require("discord.js");

process.on("unhandledRejection", (error) => {
  log.error("Unhandled promise rejection:", error);
  //process.exit(1);
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

bot.on(Events.Error, error => {
  log.error('Error Bot', error);
  //process.exit(1);
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
  //log.info(name);
  bot.modals.set(name, m);
}

bot.on(Events.InteractionCreate, async (interaction) => {

  // log
  log.info(
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

  // If modal with input command
  if (interaction.isModalSubmit()) {
    const m = bot.modals.get(interaction.customId);
    if (!m) return;
    try {
      await m.execute(interaction);
    } catch (error) {
      log.error(error);
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
      log.error(error_real);
    }
  }
});

// https://discordjs.guide/creating-your-bot/creating-commands.html#server-info-command
// https://discordjs.guide/popular-topics/intents.html#error-disallowed-intents
// https://stackoverflow.com/questions/64006888/discord-js-bot-disallowed-intents-privileged-intent-provided-is-not-enabled-o
// https://stackoverflow.com/a/69110976/3095372

bot.on("messageCreate", (message) => {

  // 969145030537281536,988248508429647922 = log public (join/out/levelup) | 987073348418809928 = log private
  if (!mylib.contains(message.channel.id, ['969145030537281536', '987073348418809928','988248508429647922'])) {
    log.info(
      `Message from ${message.author.username} - ${message.author.id} (Channel: ${message.channel.name} - ${message.channel.id}):\n-> ${message.content}`
    );
  }

  if (message.interaction) {
    log.info("interaction message: " + message.interaction.commandName);
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
  log.info("bot run....");
  bot.login(config.token);
} else {
  log.info("bot skip run....");
}

const web = express();

// Core
web.use(cors());

// Static
web.use(express.static(__dirname + '/web/public'));
// Web
eta.configure({
  plugins: [eta_plugin_random],
  cache: false
});
web.engine("eta", eta.renderFile);
web.set("view engine", "eta");
web.set("views", __dirname + '/web/views');

web.all('/', (req, res) => {
  res.render("home", {
    title: "Welcome to YuukiPS",
    description: "Im lazy to write"
  })
});

web.all('/command', (req, res) => {
  res.render("command", {
    title: "Command Tool",
    description: "Im lazy to write"
  })
});

// Web
web.all('/game/genshin', (req, res) => {
  res.render("genshin_list", {
    title: "Download Genshin",
    description: "Im lazy to write"
  })
});
// Web Download
web.all('/game/genshin/:id', (req, res) => {
  res.render("genshin_dl", {
    title: "Download Genshin",
    description: "Im lazy to write"
  })
});

web.all('/api', (req, res) => {
  res.send('API YuukiPS');
});

// Testing
web.all('/api/game/genshin', async (req, res) => {
  try {
    let d = await api_genshin.INFO();
    return res.json(d);
  } catch (error) {
    log.error(error);
    return res.json({
      msg: "Error",
      code: 302
    });
  }
});

web.all('/api/server', async (req, res) => {
  try {
    let d = await api_control.Server();
    return res.json(d);
  } catch (error) {
    log.error(error);
    return res.json({
      msg: "Error",
      code: 302
    });
  }
});
web.all('/api/server/:id', async (req, res) => {
  try {
    let d = await api_control.Server(req.params.id);
    return res.json(d);
  } catch (error) {
    log.error(error);
    return res.json({
      msg: "Error",
      code: 302
    });
  }
})

web.all('/api/server/:id/ping', async (req, res) => {
  var s = "gio";

  if (req.params.id) {
    s = req.params.id;
    var g_config = config.server[s];
    if (g_config) {
      // TODO: add check login      
    } else {
      return res.json({
        msg: "Config server not found",
        code: 404
      });
    }
  };

  try {

    return res.json({
      data: {
        version: g_config.api.type
      },
      msg: "Hello",
      code: 200
    });

  } catch (error) {
    log.error(error);
    return res.json({
      msg: "Error",
      code: 302
    });
  }
})

web.all('/api/server/:id/command', async (req, res) => {
  let d = await api_control.GM(req.params.id, req.query.uid, req.query.cmd, req.query.code);
  return res.json(d);
})

if (config.startup.webserver) {
  var listener = web.listen(3000, function () {
    log.info('Server started on port %d', listener.address().port);
  });
} else {
  log.info("skip run webserver...");
}