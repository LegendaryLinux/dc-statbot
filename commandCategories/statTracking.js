const config = require('../config.json');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

module.exports = {
    category: 'Stat Tracking',
    commands: [
        {
            name: 'new-season',
            description: 'Copy the current csv data to the /output directory and create a new working file',
            longDescription: 'Copy the current csv data to the /output directory and create a new working file',
            aliases: ['ns'],
            usage: '`!new-season`',
            minimumRole: config.moderatorRole,
            adminOnly: false,
            guildOnly: true,
            execute(message, args) {
                if (message.channel.name !== config.reportingChannel) {
                    return message.channel.send(`You must issue this command from the #${config.reportingChannel} ` +
                      ` channel.`);
                }

                // Copy the current csv file to the /output directory
                const now = new Date();
                if (!fs.existsSync('statCache.csv')) {
                    return message.channel.send('There is currently no data to report.');
                }

                const outputFilePath = `output/report-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.csv`;
                fs.copyFileSync('statCache.csv', outputFilePath);

                // Replace the current working file
                fs.rm('statCache.csv', (err) => {
                    if (err) { throw err; }
                    message.client.csvHandler = createCsvWriter({
                        path: 'statCache.csv',
                        append: false,
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

                message.channel.send({
                    files: [
                        {
                            name: 'season-stats.csv',
                            attachment: outputFilePath,
                        },
                    ],
                });
            },
        },
        {
            name: 'write-now',
            description: 'Manually tell the bot to copy its conversationCache to the working file',
            longDescription: 'Manually tell the bot to copy its conversationCache to the working file',
            aliases: ['wn'],
            usage: '`!write-now`',
            minimumRole: config.moderatorRole,
            adminOnly: false,
            guildOnly: true,
            execute(message, args) {
                if (message.client.conversationCache.length > 0) {
                    message.client.csvHandler.writeRecords(message.client.conversationCache).then(() => {
                        message.client.conversationCache = [];
                    });
                }
                message.channel.send('Done.');
            },
        }
    ],
};