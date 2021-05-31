const config = require('../config.json');
const csvWriter = require('csv-writer').createObjectCsvStringifier;
const csvReader = require('csv-reader');
const ads = require('autodetect-decoder-stream');
const fs = require('fs');
const { Readable } = require('stream');
const path = require('path');

module.exports = {
    category: 'Card Lists',
    commands: [
        {
            name: 'load-cards',
            description: 'Load current card data from CSV files in the `card-data` folder.',
            longDescription: 'Load current card data from CSV files in the `assets` folder. Any missing files ' +
              'will cause the operation to abort, and a warning will be issued. Required files are: ' +
              '`main.csv`, `hero.csv`, and `villain.csv`. Subsequent requests for card data will yield the new data, ' +
              'unless an error occurs, in which case the old card data will remain available.',
            aliases: ['load'],
            usage: '`!load-cards`',
            minimumRole: config.moderatorRole,
            adminOnly: true,
            guildOnly: true,
            execute(message, args) {
                // TODO: Do we want to use this?
                /**
                if (message.channel.name !== config.reportingChannel) {
                    return message.channel.send(`You must issue this command from the #${config.reportingChannel} ` +
                      ` channel.`);
                }
                */
                // Determine paths to source files
                const mainFile = path.join(__dirname, '..', 'assets', 'main.csv');
                const heroFile = path.join(__dirname, '..', 'assets', 'hero.csv');
                const villainFile = path.join(__dirname, '..', 'assets', 'villain.csv');

                // Instantiate temporary arrays
                const mainCards = [];
                const heroCards = [];
                const villainCards = [];

                // Source files must exist on disk
                if(!fs.existsSync(mainFile) || !fs.existsSync(heroFile) || !fs.existsSync(villainFile)) {
                    return message.channel.send('Required files could not be found. Check the `assets` folder.');
                }

                // Check for read errors while looping over data
                let readError = false;

                // Load data from the main file
                const mainStream = fs.createReadStream(mainFile).pipe(new ads({ defaultEncoding: '1255' }));
                mainStream.pipe(new csvReader({ parseNumbers: true, trim: true })).on('data', (row) => {
                    // If an error has occurred or the card's legal quantity is zero, do nothing
                    if (readError || row[0] === 0) { return; }

                    // Expect exactly three columns in the CSV file
                    if (row.length !== 3) { return readError = true; }

                    mainCards.push({
                        quantity: row[0],
                        title: row[1],
                        expansion: row[2],
                    });
                });

                // Load data from the hero file
                const heroStream = fs.createReadStream(heroFile).pipe(new ads({ defaultEncoding: '1255' }));
                heroStream.pipe(new csvReader({ parseNumbers: true, trim: true })).on('data', (row) => {
                    // If an error has occurred or the card's legal quantity is zero, do nothing
                    if (readError || row[0] === 0) { return; }

                    // Expect exactly three columns in the CSV file
                    if (row.length !== 3) { return readError = true; }

                    heroCards.push({
                        quantity: row[0],
                        title: row[1],
                        expansion: row[2],
                    });
                });

                // Load data from the villain file
                const villainStream = fs.createReadStream(villainFile).pipe(new ads({ defaultEncoding: '1255' }));
                villainStream.pipe(new csvReader({ parseNumbers: true, trim: true })).on('data', (row) => {
                    // If an error has occurred or the card's legal quantity is zero, do nothing
                    if (readError || row[0] === 0) { return; }

                    // Expect exactly three columns in the CSV file
                    if (row.length !== 3) { return readError = true; }

                    villainCards.push({
                        quantity: row[0],
                        title: row[1],
                        expansion: row[2],
                    });
                });

                if (readError) {
                    return message.channel.send('An error occurred while reading the card data. Please verify the ' +
                      'CSV files `main.csv`, `hero.csv`, and `villain.csv` in your assets folder are formatted ' +
                      'correctly and contain three columns of data.');
                }

                message.client.mainCards = mainCards;
                message.client.heroCards = heroCards;
                message.client.villainCards = villainCards;
                return message.channel.send('Card data updated successfully. It may be retrieved with `!cards`.');
            },
        },
        {
            name: 'cards',
            description: 'Load current card data from CSV files in the `card-data` folder.',
            longDescription: 'Load current card data from CSV files in the `assets` folder. Any missing files ' +
              'will cause the operation to abort, and a warning will be issued. Required files are: ' +
              '`main.csv`, `hero.csv`, and `villain.csv`. Subsequent requests for card data will yield the new data, ' +
              'unless an error occurs, in which case the old card data will remain available.',
            aliases: [],
            usage: '`!cards`',
            minimumRole: null,
            adminOnly: false,
            guildOnly: false,
            execute(message, args) {
                // TODO: Do we want to use this?
                /**
                 if (message.channel.name !== config.reportingChannel) {
                    return message.channel.send(`You must issue this command from the #${config.reportingChannel} ` +
                      ` channel.`);
                }
                 */

                if ( // If no data is present, do not print anything
                  message.client.mainCards.length === 0 &&
                  message.client.heroCards.length === 0 &&
                  message.client.villainCards.length === 0
                ) {
                    return message.channel.send('No card data is currently available. Please contact a moderator.');
                }

                const mainCsv = csvWriter({
                    header: [
                        { id: 'quantity', title: 'Tier' },
                        { id: 'title', title: 'Title' },
                        { id: 'expansion', title: 'Expansion' },
                    ]
                });

                const heroCsv = csvWriter({
                    header: [
                        { id: 'quantity', title: 'Quantity' },
                        { id: 'title', title: 'Title' },
                        { id: 'expansion', title: 'Expansion' },
                    ]
                });

                const villainCsv = csvWriter({
                    header: [
                        { id: 'quantity', title: 'Quantity' },
                        { id: 'title', title: 'Title' },
                        { id: 'expansion', title: 'Expansion' },
                    ]
                });

                return message.channel.send({
                    files: [
                        {
                            name: 'main-deck.csv',
                            attachment: Readable.from(
                              mainCsv.getHeaderString() + mainCsv.stringifyRecords(message.client.mainCards)
                            ),
                        },
                        {
                            name: 'heroes.csv',
                            attachment: Readable.from(
                              heroCsv.getHeaderString() + heroCsv.stringifyRecords(message.client.heroCards)
                            ),
                        },
                        {
                            name: 'villains.csv',
                            attachment: Readable.from(
                              villainCsv.getHeaderString() + villainCsv.stringifyRecords(message.client.villainCards)
                            ),
                        },
                    ],
                });
            },
        },
    ],
};