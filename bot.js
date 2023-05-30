const Discord = require('discord.js');
const auth = require('./auth');

const Commands = require('./commands');
const Messages = require('./messages');
const Scheduled = require('./scheduled');

module.exports = class Bot
{
    /**
     * Starts bot and sets event handlers
    */
    static async runBot()
    {
        const bot = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent] });

        bot.once(Discord.Events.ClientReady, () =>
        {
            console.log('Bot initialized');
            try
            {
                Scheduled.start(bot.emojis.cache, bot.channels.cache, bot.user.id, auth.postChannelIds);
                console.log('Scheduled message initialized');
            }
            catch (error)
            {
                console.log('Unable to initialize scheduled messages');
                console.log(error);
            }
        });

        bot.on(Discord.Events.InteractionCreate, async (interaction) =>
        {
            try
            {
                Commands.handleSlashCommand(interaction);
            }
            catch (error)
            {
                console.log('Unable to handle interaction');
                console.log(error);
            }
        });

        bot.on(Discord.Events.MessageCreate, async (message) =>
        {
            try
            {
                Messages.handleMessage(message, auth.respondChannelIds);
            }
            catch (error)
            {
                console.log('Unable to handle message');
                console.log(error);
            }
        });

        try
        {
        //Start Bot
            await bot.login(auth.token);
        }
        catch (error)
        {
            console.log('Unable to start bot');
            console.log(error);
            process.exit();
        }

        try
        {
        //Register Slash commands
            const botREST = new Discord.REST().setToken(auth.token);
            botREST.put(
                Discord.Routes.applicationCommands(auth.clientId),
                { body: Commands.registrationArray() },
            );
            console.log('Slash commands initialized');
        }
        catch (error)
        {
            console.log('Unable to register slash command');
            console.log(error);
            process.exit();
        }
    }
};
