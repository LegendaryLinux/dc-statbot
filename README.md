# DCStatBot

A bot designed to track character usage and win statistics for the card game DC Deckbuilding.

[Click here to add DCStatBot to your Discord server!](https://discord.com/oauth2/authorize?client_id=820171225275432971&scope=bot&permissions=35840)

You will need a `config.json` file in the root directory of the project.
```json
{
  "token": "your-secret-discord-key-here",
  "commandPrefix": "!",
  "moderatorRole": "Moderator",
  "reportingChannel": "bot-testing"
}

```

- `token` is your Discord bot's secret key
- `commandPrefix` is the text a user should enter to inform the bot a command is being issued
- `moderatorRole` is the role on your server you want to grant elevated bot access to
- `reportingChannel` is the text-channel on your server which the `new-season` command will send
    the report csv files to
  
You will also need to place a json file of heroes and their point values in the `assets` directory:
```json
{
  "bane crisis": 1,
  "batgirl crisis": 1,
  "batwoman": 1
}
```

# Installation and running the bot
**Note:** DCStatBot requires at least Node.js v14.14.0, but v16+ is recommended.

```bash
git clone https://github.com/LegendaryLinux/dc-statbot
cd dc-statbot
npm install
node bot.js
```