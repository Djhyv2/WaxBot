const Discord = require('discord.js');
const auth = require('./auth');

const Commands = require('./commands');
const Messages = require('./messages');

module.exports = class Bot
{
    /**
     * Starts bot and sets event handlers
    */
    static async runBot()
    {
        const bot = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent] });

        bot.once(Discord.Events.ClientReady, () => console.log('Bot Initialized'));

        bot.on(Discord.Events.InteractionCreate, async (interaction) =>
        {
            try
            {
                //Only handle slash commands
                if (interaction.isChatInputCommand())
                {
                    Commands.handleSlashCommand(interaction);
                }
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
                //Only handle message in approved Channels
                if (auth.channelIds.includes(message.channel.id) && message.author.id !== bot.user.id)
                {
                    Messages.handleMessage(message);
                }
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
            console.log('Slash Commands Initialized');
        }
        catch (error)
        {
            console.log('Unable to register slash command');
            console.log(error);
            process.exit();
        }
    }
};
