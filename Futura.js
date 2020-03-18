const futura = require('./ELIZA/Eliza-bot.js');
// require the discord.js module
const Discord = require('discord.js');
// Importing constfix and token
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

// Enable/Disable Futura
let isAwake = false;

// Array of Friday songs for good vibes
let fridaySongs = [];
fridaySongs.push(
    'https://youtu.be/qijBzcteR9Y', 'https://youtu.be/XQCz96er7ns', 
    'https://youtu.be/MEIRNj0EmH0', 'https://youtu.be/K7l5ZeVVoCA', 
    'https://youtu.be/h61QG4s0I3U', 'https://youtu.be/ZRqSuRn9Obw',
    'https://youtu.be/SYnVYJDxu2Q', 'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/YlUKcNNmywk', 'https://youtu.be/NUTGr5t3MoY',
    'https://youtu.be/CDl9ZMfj6aE', 'https://youtu.be/sNJVFloPIVA');

// Array of Raffle prizes
let rafflePrizes = [];
rafflePrizes.push('a horse', 'a tub filled with Mountain Dew', '14 cubics of Cheetos',
    'Fish Sticks', '100 duck sized horses', '1 horse sized duck');

// Function that determines if it is friday or not
function isItFriday() {
    return new Date().getDay() == 5
}

function getWeekDay() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// When a message is displayed on the channel
client.on('message', msg => {

    // Block of code being used when using commands with the prefix
    if (msg.content.startsWith(`${prefix}`)) {

        // Friday song functionality
        if (msg.content === `${prefix}friday`)  {
            if (isItFriday()) {
                const randomSong = fridaySongs[Math.floor(Math.random() * fridaySongs.length)];
                msg.channel.send(randomSong);
            }
            else {
                msg.reply('No Friday Song for you yet, you have to wait until friday!');
            }
        }
        else if (msg.content.startsWith(`${prefix}addfriday `)) {
            const url = msg.content.slice(11);
            if (fridaySongs.includes(url)) {
                msg.reply('The song is already in the database, please add another song.')
            }
            else {
                fridaySongs.push(url);
                console.log(fridaySongs)
                msg.reply('Song successfully added');
            }
        }
        
        // Raffle functionality
        else if (msg.content == `${prefix}raffle`) {
            const randomPrize = rafflePrizes[Math.floor(Math.random() * rafflePrizes.length)];
            msg.channel.send('WoooW, congratulation! You won ' + randomPrize + "!");
        }
        else if (msg.content.startsWith(`${prefix}addprize `)) {
            let prize = msg.content.slice(10);
            if (rafflePrizes.includes(prize)) {
                msg.reply('Sorry, ' + prize + ' already exist in our catalogue.');
            }
            else {
                rafflePrizes.push(prize);
                msg.reply(prize + ' has been successfully added to the catalogue of prizes.')
                console.log(rafflePrizes)
            }
        }

        // Google search functionality
        else if (msg.content.startsWith(`${prefix}g `)) {
            let lookup = msg.content.slice(3);
            lookup = lookup.replace(' ', '+');
            const newlookup = 'https://www.google.com/search?source=hp&ei=mFopW5aMIomSsAfRw77IDg&q=' + lookup;
            msg.channel.send('<a:googling:426453223310622740> Loading...').then(message => {
                google(lookup, (err) => {
                  if (err) {console.error(err);}
                  else {
                        message.edit(newlookup);
                     }
                });
              });
        }

        // Meta information functionality
        else if (msg.content === `${prefix}week`) {
            msg.reply('We are currently in week ' + getWeekDay() + ".");
        }
        else if (msg.content === `${prefix}server`) {
            msg.channel.send(`Server name: ${msg.guild.name}\nTotal members: ${msg.guild.memberCount}\nGenesis: ${msg.guild.createdAt}\nLocation: ${msg.guild.region}`);
        }
        else if (msg.content === `${prefix}user-info`) {
            msg.channel.send(`Your username: ${msg.author.username}\nYour ID: ${msg.author.id}`);
        }
        else if (msg.content === `${prefix}help`) {
            msg.reply('I can help with various things. Two of the general topics are as follows: \n' + 
                'Commands and General therapy. \n\n' +
                'Commands: \n\t' + prefix + 'friday : Provides a random friday song if called on a friday.\n' +
                '\t' + prefix + 'addfriday [link] : Adds a given youtube link to the collection of friday songs. \n' +
                '\t' + prefix + 'g [search query] : Returns a URL for the search query on Google.com.\n' +
                '\t' + prefix + 'raffle : Play the raffle and maybe win an exciting gift!' +
                '\t' + prefix + 'week : Returns the current week number. Notoriously hard to grasp\n' +
                '\t' + prefix + 'server : Returns information about the current server.\n' +
                '\t' + prefix + 'user-info : Returns information about the user that typed the command.\n\n' +
                'General therapy: \n\t "Hi Futura" : Starts the conversation with Futura.\n' +
                '\t "Bye Futura" : Ends the conversation with Futura.')
        }

    }

    // Block of code being used when the user want some therapeutic consultation
    else {

        if (msg.content === 'Hi Futura' && !isAwake) {
            isAwake = true;
            msg.reply(futura.start());
        }
        else if (msg.content === 'Bye Futura' && isAwake) {
            isAwake = false;
            msg.reply(futura.bye());
        }
        else if (msg.content && !msg.author.bot && isAwake) {
            msg.reply(futura.reply(msg.content));
        }

    }
});

// login to Discord with your app's token
client.login(token);