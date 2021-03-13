const heroes = require('../assets/heroes.json');

// One-liner to determine is a hero is present in the heroes.json file
const isValidHero = (hero) => heroes.hasOwnProperty(hero.toString().trim().toLowerCase());

// One liner to determine a hero's point value
const getHeroPoints = (hero) => heroes[hero.toString().trim().toLowerCase()] || 0;

module.exports = async (client, message) => {
  // Ignore messages send within guilds
  if (message.guild) { return; }

  // If the user is not currently mid-conversation, do nothing
  if (!client.conversations.hasOwnProperty(message.author.id)) {
    return await message.author.send('I\'m busy plotting to take over the world. Go away!');
  }

  /*
  There are six possible stages of conversation, and the data is populated in order:
  1. Prompt for placement
  2. Prompt for character 1
  3. Prompt for character 2
  4. Prompt for character 3
  5. Prompt for character 4
  6. Prompt for character 5
  */

  // Determine and record the user's match placement
  if (client.conversations[message.author.id].placement === null) {
    // User's response must be an integer
    if (message.content.match(/^\d+$/) === null) {
      return await message.author.send('You must enter a number. What place did you come in (ex. 1)?');
    }

    client.conversations[message.author.id].placement = parseInt(message.content, 10);
    return await message.author.send('Which character was your first draft?');
  }

  // Determine the user's first draft pick and track their points
  if (client.conversations[message.author.id].hero1 === null) {
    if (!isValidHero(message.content)) {
      return await message.author.send('I don\'t recognize that hero. Please try again.');
    }

    // Update conversation
    client.conversations[message.author.id].hero1 = message.content.trim();
    client.conversations[message.author.id].points += getHeroPoints(message.content);

    return await message.author.send([
      `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. Your team total is ` +
        ` ${client.conversations[message.author.id].points}.`,
      'Which character was your second draft? If you are done, just type "Done".'
    ]);
  }

  // Determine the user's second draft and track their points
  if (client.conversations[message.author.id].hero2 === null) {
    if (message.content.trim().toLowerCase() === 'done' || message.content.trim().toLowerCase() === 'done.') {
      if (client.conversations[message.author.id].points < 5) {
        return await message.author.send(`Your current team only has ` +
          `${client.conversations[message.author.id].points} points. You need 5 to report a game.`);
      }

      client.conversationCache.push(client.conversations[message.author.id]);
      delete client.conversations[message.author.id];
      return await message.author.send('Thank you for your report!');
    }

    if (!isValidHero(message.content)) {
      return await message.author.send('I don\'t recognize that hero. Please try again.');
    }

    // Update conversation
    client.conversations[message.author.id].hero2 = message.content.trim();
    client.conversations[message.author.id].points += getHeroPoints(message.content);

    if (client.conversations[message.author.id].points > 5) {
      await message.author.send([
        `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. **Your team total is ` +
          ` ${client.conversations[message.author.id].points}, which is illegal.**`,
        'This report has been aborted. Please use `!report` to try again.'
      ]);
      delete client.conversations[message.author.id];
      return;
    }

    return await message.author.send([
      `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. Your team total is ` +
      ` ${client.conversations[message.author.id].points}.`,
      'Which character was your third draft? If you are done, just type "Done".'
    ]);
  }

  // Determine the user's third draft and track their points
  if (client.conversations[message.author.id].hero3 === null) {
    if (message.content.trim().toLowerCase() === 'done' || message.content.trim().toLowerCase() === 'done.') {
      if (client.conversations[message.author.id].points < 5) {
        return await message.author.send(`Your current team only has ` +
          `${client.conversations[message.author.id].points} points. You need 5 to report a game.`);
      }

      client.conversationCache.push(client.conversations[message.author.id]);
      delete client.conversations[message.author.id];
      return await message.author.send('Thank you for your report!');
    }

    if (!isValidHero(message.content)) {
      return await message.author.send('I don\'t recognize that hero. Please try again.');
    }

    // Update conversation
    client.conversations[message.author.id].hero3 = message.content.trim();
    client.conversations[message.author.id].points += getHeroPoints(message.content);

    if (client.conversations[message.author.id].points > 5) {
      await message.author.send([
        `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. **Your team total is ` +
        ` ${client.conversations[message.author.id].points}, which is illegal.**`,
        'This report has been aborted. Please use `!report` to try again.'
      ]);
      delete client.conversations[message.author.id];
      return;
    }

    return await message.author.send([
      `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. Your team total is ` +
      ` ${client.conversations[message.author.id].points}.`,
      'Which character was your fourth draft? If you are done, just type "Done".'
    ]);
  }

  // Determine the user's fourth draft and track their points
  if (client.conversations[message.author.id].hero4 === null) {
    if (message.content.trim().toLowerCase() === 'done' || message.content.trim().toLowerCase() === 'done.') {
      if (client.conversations[message.author.id].points < 5) {
        return await message.author.send(`Your current team only has ` +
          `${client.conversations[message.author.id].points} points. You need 5 to report a game.`);
      }

      client.conversationCache.push(client.conversations[message.author.id]);
      delete client.conversations[message.author.id];
      return await message.author.send('Thank you for your report!');
    }

    if (!isValidHero(message.content)) {
      return await message.author.send('I don\'t recognize that hero. Please try again.');
    }

    // Update conversation
    client.conversations[message.author.id].hero4 = message.content.trim();
    client.conversations[message.author.id].points += getHeroPoints(message.content);

    if (client.conversations[message.author.id].points > 5) {
      await message.author.send([
        `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. **Your team total is ` +
        ` ${client.conversations[message.author.id].points}, which is illegal.**`,
        'This report has been aborted. Please use `!report` to try again.'
      ]);
      delete client.conversations[message.author.id];
      return;
    }

    return await message.author.send([
      `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. Your team total is ` +
      ` ${client.conversations[message.author.id].points}.`,
      'Which character was your fifth draft? If you are done, just type "Done".'
    ]);
  }

  // Determine the user's fifth draft and track their points
  if (client.conversations[message.author.id].hero5 === null) {
    if (message.content.trim().toLowerCase() === 'done' || message.content.trim().toLowerCase() === 'done.') {
      if (client.conversations[message.author.id].points < 5) {
        return await message.author.send(`Your current team only has ` +
          `${client.conversations[message.author.id].points} points. You need 5 to report a game.`);
      }

      client.conversationCache.push(client.conversations[message.author.id]);
      delete client.conversations[message.author.id];
      return await message.author.send('Thank you for your report!');
    }

    if (!isValidHero(message.content)) {
      return await message.author.send('I don\'t recognize that hero. Please try again.');
    }

    // Update conversation
    client.conversations[message.author.id].hero5 = message.content.trim();
    client.conversations[message.author.id].points += getHeroPoints(message.content);

    if (client.conversations[message.author.id].points > 5) {
      await message.author.send([
        `${message.content.trim()} is worth ${getHeroPoints(message.content)} points. **Your team total is ` +
        ` ${client.conversations[message.author.id].points}, which is illegal.**`,
        'This report has been aborted. Please use `!report` to try again.'
      ]);
      delete client.conversations[message.author.id];
      return;
    }

    await message.author.send(`${message.content.trim()} is worth ${getHeroPoints(message.content)} points. ` +
      `Your team total is ${client.conversations[message.author.id].points}.`);

    client.conversationCache.push(client.conversations[message.author.id]);
    delete client.conversations[message.author.id];
    return await message.author.send('Thank you for your report!');
  }
};