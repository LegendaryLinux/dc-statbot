module.exports = {
    category: 'Game Reports',
    commands: [
        {
            name: 'report',
            description: 'Report the results of a game.',
            longDescription: 'Report the results of a DC DeckBuilder game to DCStatBot',
            aliases: ['r'],
            usage: '`!report`',
            minimumRole: null,
            adminOnly: false,
            guildOnly: false,
            execute(message, args) {
                // If the user restarts a report midway through, clear any existing timeout to prevent
                // prematurely aborting the new report
                if (message.client.conversations.hasOwnProperty(message.author.id)) {
                    clearTimeout(message.client.conversations[message.author.id].timeoutId);
                }

                message.client.conversations[message.author.id] = {
                    placement: null,
                    points: 0,
                    hero1: null,
                    hero2: null,
                    hero3: null,
                    hero4: null,
                    hero5: null,
                    timeoutId: setTimeout(() => {
                        // Time out a user's report if they don't finish it after fifteen minutes
                        if (message.client.conversations.hasOwnProperty(message.author.id)) {
                            delete message.client.conversations[message.author.id];
                        }
                    }, 900000),
                }

                // Tell users to check their DMs
                message.channel.send('Check your DMs. You can also `!report` from there.');

                // Send a DM to the user to begin the conversation about the game
                message.author.send("**You are now reporting the results of a DC DeckBuilder game.**\n" +
                  "What place did you come in (1, 2, 3, etc.)?");
            },
        }
    ],
};