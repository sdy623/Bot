const express = require('express');
const cors = require('cors');
const eta = require("eta");

const axios = require('axios'); // TODO: remove this

const api_gio = require('./gm/gio');
const mylib = require("./lib");
const config = require("./config.json");
var eta_plugin_random = require("./web/plugin/random")

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
  if (!mylib.contains(message.channel.id, ['969145030537281536', '987073348418809928'])) {
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

web.all('/api', (req, res) => {
  res.send('API YuukiPS');
});

web.all('/api/server', (req, res) => {
  var obj = config.server;
  const r = Object.keys(obj).map(key => {
    var tmp = {};
    tmp['name'] = obj[key].title;
    tmp['id'] = key;
    return tmp;
  });
  res.json(r);
});

web.all('/api/server/:id', async (req, res) => {
  var s = "gio";

  if (req.params.id) {
    s = req.params.id;
    var g_config = config.server[s];
    if (g_config) {
      //console.log(g_config);      
    } else {
      return res.json({
        msg: "Config server not found",
        code: 404
      });
    }
  };

  // get server stats/info
  try {
    let d = await api_gio.Server();
    return res.json(d);
  } catch (error) {
    console.log(error);
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
    console.log(error);
    return res.json({
      msg: "Error",
      code: 302
    });
  }
})

web.all('/api/server/:id/command', async (req, res) => {
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

  console.log(g_config);
  
  let uid = req.query.uid;
  let cmd = req.query.cmd;
  let code = req.query.code;

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

    if(g_config.api.type == 1){
      // GIO
      let d = await api_gio.GM(uid, cmd);
      return res.json(d);
    }else if(g_config.api.type == 2){
      // GC
      // TODO: move this
      const response = await axios.get(g_config.api.url+"api/command", { params: {
        token: code,
        cmd: cmd,
        player: uid
      } });
      const d = response.data;
      return res.json({
        msg: d.message,
        code: d.retcode,
        data:d.data
      });
    }
    
  } catch (error) {
    console.log(error);
    console.log("Server Error: "+s);
    return res.json({ 
      msg: "Error Get",
      code: 302
    });
  }
})

if (config.startup.webserver) {
  var listener = web.listen(3000, function () {
    console.log('Server started on port %d', listener.address().port);
  });
} else {
  console.log("skip run webserver...");
}