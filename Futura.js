const futura = require('./ELIZA/Eliza-bot.js');
// require the discord.js module
const Discord = require('discord.js');
// require http to be able to parse http pages for google searches
let http = require('http');
// require fs to be able to read and write data files
let fs = require('fs');
// Importing constfix and token
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

const request = require('request');

// Enable/Disable Futura
let isAwake = false;

// Array of Friday songs for good vibes
let fridaySongs = []
readFile('./data/songs.txt', fridaySongs);

// Array of Raffle prizes
let rafflePrizes = [];
readFile('./data/prizes.txt', rafflePrizes);

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
                writeFile('./data/songs.txt', fridaySongs);
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
                writeFile('./data/prizes.txt', rafflePrizes);
                msg.reply(prize + ' has been successfully added to the catalogue of prizes.')
            }
        }

        // Google search functionality
        else if (msg.content.startsWith(`${prefix}g `)) {
            let lookup = msg.content.slice(3);
            lookup = lookup.replace(/ /g, '+');
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

        /*
        // Stack Overflow functionality
        else if (msg.content.startsWith(`${prefix}SO `)) {
            let searchtext = msg.content.slice(4);
            searchtext = searchtext.replace(/ /g, '+');
            const lookup = 'https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=' + searchtext + '&site=stackoverflow';
            let options = {json: true};
            
            request(lookup, options, (error, res, body) => {
                if (error) {
                    return  console.log(error)
                };

                if (!error && res.statusCode == 200) {
                    // do something with JSON, using the 'body' variable
                    body = JSON.parse(body);
                    console.log(body[10])
                    url = [];
                    for (let key in body) {
                        console.log('Index is: ' + key + '\nDescription is:  ' + body[key]);
                    }
                    msg.reply("")
                };
            });

        }
        */

        // Testing out if it is possible to retrieve top hit on google
        else if (msg.content.startsWith(`${prefix}google `)) {
            let lookup = msg.content.slice(8);
            // Replace every space with a plus sign
            lookup = lookup.replace(/ /g, '+');
            console.log(lookup)
            const newlookup = 'http://www.google.com/search?source=hp&ei=mFopW5aMIomSsAfRw77IDg&q=' + lookup;
            console.log(newlookup);
            http.get(newlookup, onGotData);
            function onGotData(res) {
                var chunks = [];
                res.on('data', onGotData);
                res.on('end', onEnd);
                function onGotData(chunk) {
                    chunks.push(chunk);
                }
                function onEnd() {
                    console.log(chunks.join(''));
                }
            }
        }

        // Wiki search functionality
        else if (msg.content.startsWith(`${prefix}wiki `)) {
            let lookup = msg.content.slice(6);
            lookup = lookup.replace(/ /g, '+');
            console.log(lookup);
            const newlookup = `http://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${lookup}&prop=info&inprop=url`;
            // Get the JSON with results, and extract query -> search -> 0 -> pageid
            // and concatenate this with https://en.wikipedia.org/?curid= before returning it to user
            let options = {json: true};
            
            request(newlookup, options, (error, res, body) => {
                if (error) {
                    return  console.log(error)
                };

                if (!error && res.statusCode == 200) {
                    // do something with JSON, using the 'body' variable
                    const pageid = body.query.search[0].pageid;
                    msg.reply(`https://en.wikipedia.org/?curid=${pageid}`)
                };
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
                '\t' + prefix + 'wiki [search query] : Returns a direct link to the apropriate Wiki article.\n' +
                '\t' + prefix + 'SO [search query] : Returns a direct link to the first Stack Overflow question with an accepted answer.\n' +
                '\t' + prefix + 'raffle : Play the raffle and maybe win an exciting gift!\n' +
                '\t' + prefix + 'addprize [prize] : Add a new prize to the raffle.\n' + 
                '\t' + prefix + 'week : Returns the current week number. Notoriously hard to grasp\n' +
                '\t' + prefix + 'server : Returns information about the current server.\n' +
                '\t' + prefix + 'user-info : Returns information about the user that typed the command.\n\n' +
                'General therapy: \n\t "Hi Futura" : Starts the conversation with Futura.\n' +
                '\t "Bye Futura" : Ends the conversation with Futura.\n' +
                'If you would just like a casual conversation, you can do that by tagging her name in your message.\n' +
                '\tEx: "What are you doing, @Futura?"')
        }

    }

    // If users tags Futura in their message
    else if (msg.content.includes("687582372610441223")) {
        msg.reply(futura.reply(msg.content));
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
        else if (msg.content.contains && !msg.author.bot && isAwake) {
            msg.reply(futura.reply(msg.content));
        }

    }
});

function readFile(path, array) {
    fs.readFile(path, 'utf8', (error, data) => {
        if (error) {
            console.log(error);
        }
        let newArray = data.split(',');
        newArray.map((str) => {
            array.push(str);
        });
    })
}
function writeFile(path, array) {
    fs.writeFile(path, array, (error) => {
        if (error) {
            console.log('An error occured when trying to read to file ', path);
        }
        else {
            console.log('Data saved to file ', path);
        }
    })
}

// login to Discord with your app's token
client.login(token);