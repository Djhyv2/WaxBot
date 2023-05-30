const Cron = require('cron');
const RuneGoldberg = require('./rune-goldberg');
const Print = require('./print');
const Alts = require('./alts');

module.exports = class Scheduled
{
    /**
     * Calculates and Prints current alts to a channel on a schedule
     * @param {Collection.<Discord.GuildEmoji>} emojis Collection of emojis available to Discord Bot
     * @param {Collection.<Discord.Channel>} channels Collection of discord channels available to Discord Bot
     * @param {Integer} botId Author Id of Bot
    * @param {Array.<Integer>=[]} channelIds Channel Ids to post scheduled message to
     */
    static start(emojis, channels, botId, channelIds = [])
    {
        //Setting cron to Midnight UTC
        const job = new Cron.CronJob('0 0 * * *', async () =>
        {
            try
            {
                let messageContents;
                try
                {
                    const runeWaxValues = RuneGoldberg.parseAllRunes();
                    const {
                        combination, alts, ironAlts, notableRunes,
                    } = await Alts.calculateAlts(runeWaxValues);
                    messageContents = Print.generateMessage(combination, alts, ironAlts, notableRunes, emojis);
                }
                catch (error)
                {
                    messageContents = error.message;
                }

                await this.deleteFromChannels(channels, channelIds, botId);
                await this.postToChannels(channels, channelIds, messageContents);
            }
            catch (error)
            {
                console.log('Unable to post scheduled message');
                console.log(error);
            }
        }, null, false, 'UTC');
        job.start();
    }

    /**
     * Posts message to all channels provided
     * @param {Collection.<Discord.Channel>} channels Collection of discord channels available to Discord Bot
     * @param {Array.<Integer>} channelIds Channel Ids to post message to
     * @param {String} messageContents Message to post
     */
    static async postToChannels(channels, channelIds, messageContents)
    {
        for (let channelIdIndex = 0; channelIdIndex < channelIds.length; channelIdIndex += 1)
        {
            const channelId = channelIds[channelIdIndex];
            const channel = channels.get(channelId);
            const message = await channel.send(messageContents);
            //Publish message in announcement channel
            try
            {
                await message.crosspost();
            }
            catch (error)
            {
                console.log(`Unable to publish scheduled message to ${channelId}`);
                console.log(error);
            }
        }
    }

    /**
     * Deletes recently (<50 message old) messages from bot from specified channels
     * @param {Collection.<Discord.Channel>} channels Collection of discord channels available to Discord Bot
     * @param {Array.<Integer>} channelIds Channel Ids to post message to
     * @param {Integer} botId Author Id to delete messages from
     */
    static async deleteFromChannels(channels, channelIds, botId)
    {
        for (let channelIdIndex = 0; channelIdIndex < channelIds.length; channelIdIndex += 1)
        {
            const channelId = channelIds[channelIdIndex];
            const channel = channels.get(channelId);
            const messagesCollection = await channel.messages.fetch();
            const messages = Array.from(messagesCollection.values());
            let messagesIndex;
            for (messagesIndex = 0; messagesIndex < messages.length; messagesIndex += 1)
            {
                const message = messages[messagesIndex];
                if (message.author.id === botId)
                {
                    await message.delete();
                }
            }
        }
    }
};
