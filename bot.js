const { Client, Collection } = require('discord.js')
const config = require('./config.json');
const {generalErrorHandler} = require('./errorHandlers');
const { verifyModeratorRole, verifyIsAdmin, cachePartial, parseArgs } = require('./lib');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Catch all unhandled errors
process.on('uncaughtException', (err) => generalErrorHandler(err));

const client = new Client({ partials: [ 'MESSAGE' ] });
client.commands = new Collection();
client.commandCategories = [];
client.messageListeners = [];

// Track conversations currently in progress
client.conversations = {};
client.conversationCache = [];

// Track currently loaded card data
client.mainCards = [];
client.heroCards = [];
client.villainCards = [];

// Create the csv file handler
fs.stat('statCache.csv', (err) => {
    client.csvHandler = createCsvWriter({
        path: 'statCache.csv',
        append: !(err && err.code === 'ENOENT'),
        header: [
            { id: 'placement', title: 'Placement' },
            { id: 'points', title: 'Total Points' },
            { id: 'hero1', title: 'Draft 1' },
            { id: 'hero2', title: 'Draft 2' },
            { id: 'hero3', title: 'Draft 3' },
            { id: 'hero4', title: 'Draft 4' },
            { id: 'hero5', title: 'Draft 5' },
        ]
    });
});

// Write the conversationCache to the csvFile once every fifteen minutes
setInterval(async () => {
    if (client.conversationCache.length > 0) {
        await client.csvHandler.writeRecords(client.conversationCache);
        client.conversationCache = [];
    }
}, 900000)

// Load command category files
fs.readdirSync('./commandCategories').filter((file) => file.endsWith('.js')).forEach((categoryFile) => {
    const commandCategory = require(`./commandCategories/${categoryFile}`);
    client.commandCategories.push(commandCategory);
    commandCategory.commands.forEach((command) => {
        client.commands.set(command.name, command);
    });
});

// Load message listener files
fs.readdirSync('./messageListeners').filter((file) => file.endsWith('.js')).forEach((listenerFile) => {
    const listener = require(`./messageListeners/${listenerFile}`);
    client.messageListeners.push(listener);
});

client.on('message', async(message) => {
    // Fetch message if partial
    message = await cachePartial(message);
    if (message.member) { message.member = await cachePartial(message.member); }
    if (message.author) { message.author = await cachePartial(message.author); }

    // Ignore all bot messages
    if (message.author.bot) { return; }

    // If the message does not begin with the command prefix, run it through the message listeners
    if (!message.content.startsWith(config.commandPrefix)) {
        return client.messageListeners.forEach((listener) => listener(client, message));
    }

    // If the message is a command, parse the command and arguments
    const args = parseArgs(message.content.slice(config.commandPrefix.length).trim());
    const commandName = args.shift().toLowerCase();

    try{
        // Get the command object
        const command = client.commands.get(commandName) ||
            client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

        // If the command does not exist, alert the user
        if (!command) { return message.channel.send("I don't know that command. Use `!help` for more info."); }

        // If the command does not require a guild, just run it
        if (!command.guildOnly) { return command.execute(message, args); }

        // If this message was not sent from a guild, deny it
        if (!message.guild) { return message.reply('That command may only be used in a server.'); }

        // If the command is available only to administrators, run it only if the user is an administrator
        if (command.adminOnly) {
            if (verifyIsAdmin(message.member)) {
                return command.execute(message, args);
            } else {
                // If the user is not an admin, warn them and bail
                return message.author.send("You do not have permission to use that command.");
            }
        }

        // If the command is available to everyone, just run it
        if (!command.minimumRole) { return command.execute(message, args); }

        // Otherwise, the user must have permission to access this command
        if (verifyModeratorRole(message.member)) {
            return command.execute(message, args);
        }

        return message.reply('You are not authorized to use that command.');
    }catch (error) {
        // Log the error, report a problem
        console.error(error);
        message.reply("Something broke. Maybe check your command?")
    }
});

// Use the general error handler to handle unexpected errors
client.on('error', async(error) => generalErrorHandler(error));

client.once('ready', async() => {
    console.log(`Connected to Discord. Active in ${client.guilds.cache.array().length} guilds.`);
});

client.login(config.token);