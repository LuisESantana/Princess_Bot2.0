const Discord = require('discord.js');
const music = require('discord.js-musicbot-addon');
const client = new Discord.Client();
const settings = require('./settings.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
require('./util/eventLoader')(client);

const prefix = '!'

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    const props = require(`./commands/${f}`);
    log(`Loading Command: ${props.help.name}. 👌`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      const cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  /* This function should resolve to an ELEVATION level which
     is then sent to the command handler for verification*/
  let permlvl = 0;
  const mod_role = message.guild.roles.find('name', settings.modrolename);
  if (mod_role && message.member.roles.has(mod_role.id)) permlvl = 2;
  const admin_role = message.guild.roles.find('name', settings.adminrolename);
  if (admin_role && message.member.roles.has(admin_role.id)) permlvl = 3;
  if (message.author.id === settings.ownerid) permlvl = 4;
  return permlvl;
};


var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.on('ready', () => {
  //client.user.setActivity({game: {url: 'https://www.twitch.tv/mikichu', type: 0}});
  //client.user.setActivity('Watching', "Cute girl streaming | !help', 'https://www.twitch.tv/mikichu")
  //client.user.setActivity('The princess\'s stream | ' + prefix + 'help', {url: 'https://www.twitch.tv/mikichu'}) //{type: 'WATCHING'}
  client.user.setStatus('Online')
  client.user.setGame('Cute girl streaming | !help', 'https://www.twitch.tv/mikichu');
});

client.on('presenceUpdate', (oldMember, newMember) => {
  let streamRole = newMember.guild.roles.find('name', "Now Live!")
  if (!streamRole) return;

  if(newMember.user.presence && newMember.user.presence.game && newMember.user.presence.game.streaming) {
    newMember.addRole(streamRole);
  } else {
    newMember.removeRole(streamRole);
  }
});

client.on('message', message => {
  if (message.author.bot) return;
  if (message.channel.type !== "text") return;

  if(message.channel.id !== '433414875151073281') return;
    if (message.content.startsWith(prefix +'confirm')) {
      message.member.addRole('433388421277548544');
      message.delete();
    } else {
      message.delete();
    };
});

music.start(client, settings);
client.login(settings.token);
