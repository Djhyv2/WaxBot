/*eslint-disable prefer-destructuring */
/*eslint-disable no-console */
const discord = require('discord.js');//Allows connection to discord
const auth = require('./auth.json');//Contains the security token for the bot. In Format of { token: (token) }

const Alts = require('./alts');
const Printing = require('./printing');
const GrandExchange = require('./grand-exchange');
const RuneGoldberg = require('./rune-goldberg');

function parseMessage(message)
{
    let parsedValues = message.content.split('\n');
    if (4 !== parsedValues.length)
    {
        return null;
    }//If message not 4 lines, return


    parsedValues = parsedValues.map((row) => row.split(',').map((part) =>
    {
        const components = part.replace(/ +/g, ' ').trim().split(' ');
        if (2 !== components.length)
        {
            throw new Error('Invalid Format - Are you missing any commas or spaces?');
        }
        const wax = parseInt(components[1], 10);
        if (Number.isNaN(wax))
        {
            throw new Error('Invalid Format - Did you mistype an amount of wax?');
        }
        return {
            rune: components[0].toLowerCase(),
            wax,
        };
    }));//Splits multiline string into array of rows of comma seperated values, splits the comma seperated values into values, splits the values into 2 parts, rune and wax
    return parsedValues;
}

async function runBot()
{
    const bot = new discord.Client({ intents: [discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.Guilds] });
    bot.on(
        'ready',
        () =>
        {
            console.log('Bot Initialized');
        },
    );//Fired when bot is ready to process messages, after connection established

    bot.on(
        'message',
        async (message) =>
        {
            if ('412021190446546946' !== message.channel.id /*Vis Wax Server, secretwaxroom channel */ && '407678839498604554' !== message.channel.id /*Eean's Server, bottesting channel*/ && '621875889126375426' !== message.channel.id /*Test Server, General Channel*/)
            {
                return;
            }//If message in wrong channel return

            let parsedValues;
            try
            {
                parsedValues = parseMessage(message);
            }
            catch (error)
            {
                message.channel.send(error.message);
                return;
            }//Parse Message
            if (null === parsedValues)
            {
                return;
            }//Return if nothing parsed


            const data = await GrandExchange.fetchGEPrices();
            if (null == data)
            {
                message.channel.send('Unable to reach GE Server');
                return;
            }//Get Data from API

            try
            {
                const { computedData, alts, ironAlts } = Alts.calculateAlts(parsedValues, data);
                message.channel.send(Printing.createMessage(computedData, alts, ironAlts));
            }//Calculate alts and send as message
            catch (error)
            {
                message.channel.send(error.message);
            }
        },
    );//Message handler


    bot.on(discord.Events.InteractionCreate, async (interaction) =>
    {
        try
        {
        //If not a slash command
            if (!interaction.isChatInputCommand())
            {
                return;
            }

            if ('calculate_all_alts' === interaction.commandName)
            {
                await interaction.deferReply();
                const data = await GrandExchange.fetchGEPrices();
                const parsedValues = RuneGoldberg.parseAllRunes();
                const { computedData, alts, ironAlts } = Alts.calculateAlts(parsedValues, data);
                await interaction.editReply(Printing.createMessage(computedData, alts, ironAlts, true));
            }
        }
        catch (error)
        {
            console.log('Unable to Handle Interaction');
            console.log(error);
            process.exit();
        }
    });//On interaction with bot

    try
    {
        await bot.login(auth.token);
    }
    catch (error)
    {
        console.log('Invalid Login Token');
        console.log(error);
        process.exit();
    }//Establishes connection to Discord Servers

    try
    {
        await new discord.REST().setToken(auth.token).put(
            discord.Routes.applicationGuildCommands(auth.clientId, '621875889126375424'),
            { body: [new discord.SlashCommandBuilder().setName('calculate_all_alts').setDescription('calculate alts for all runes.').toJSON()] },
        );
    }
    catch (error)
    {
        console.log('Unable to register slash command');
        console.log(error);
        process.exit();
    }
}//Async wrapper allows use of await within main body of code
runBot();
