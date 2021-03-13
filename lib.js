const Discord = require('discord.js');
const config = require('./config.json');

module.exports = {
  // Function which returns a promise which will resolve to true or false
  verifyModeratorRole: (guildMember) => {
    if (module.exports.verifyIsAdmin(guildMember)) { return true; }
    return module.exports.getModeratorRole(guildMember.guild).position <= guildMember.roles.highest.position;
  },

  verifyIsAdmin: (guildMember) => guildMember.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR),

  getModeratorRole: (guild) => {
    // Find this guild's moderator role
    for (const role of guild.roles.cache.array()) {
      if (role.name === config.moderatorRole) {
        return role;
      }
    }
    return null;
  },

  cachePartial: (partial) => new Promise((resolve, reject) => {
    if (!partial.hasOwnProperty('partial') || !partial.partial) { resolve(partial); }
    partial.fetch()
      .then((full) => resolve(full))
      .catch((error) => reject(error));
  }),

  parseArgs: (command) => {
    // Quotes with which arguments can be wrapped
    const quotes = [`'`, `"`];

    // State tracking
    let insideQuotes = false;
    let currentQuote = null;

    // Parsed arguments are stored here
    const arguments = [];

    // Break the command into an array of characters
    const commandChars = command.trim().split('');

    let thisArg = "";
    commandChars.forEach((char) => {
      if (char === ' ' && !insideQuotes){
        // This is a whitespace character used to separate arguments
        if (thisArg) { arguments.push(thisArg); }
        thisArg = "";
        return;
      }

      // If this character is a quotation mark
      if (quotes.indexOf(char) > -1) {
        // If the cursor is currently inside a quoted string and has found a matching quote to the
        // quote which started the string
        if (insideQuotes && currentQuote === char) {
          arguments.push(thisArg);
          thisArg = "";
          insideQuotes = false;
          currentQuote = null;
          return;
        }

        // If a quote character is found within a quoted string but it does not match the current enclosing quote,
        // it should be considered part of the argument
        if (insideQuotes) {
          thisArg += char;
          return;
        }

        // Cursor is not inside a quoted string, so we now consider it within one
        insideQuotes = true;
        currentQuote = char;
        return;
      }

      // Include the character in the current argument
      thisArg += char;
    });

    // Append current argument to array if it is populated
    if (thisArg) {arguments.push(thisArg) }

    return arguments;
  },
};
