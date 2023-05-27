const Cron = require('cron');
const RuneGoldberg = require('./rune-goldberg');
const Print = require('./print');
const Alts = require('./alts');

module.exports = class Scheduled
{
    /**
     * Calculates and Prints current alts to a channel on a schedule
     * @param {Discord.Client} bot Discord Client to interact with channels
     * @param {Array.<Integer>=[]} channelIds Channel Ids to post scheduled message to
     */
    static start(bot, channelIds = [])
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
                    messageContents = Print.generateMessage(combination, alts, ironAlts, notableRunes, bot.emojis.cache);
                }
                catch (error)
                {
                    messageContents = error.message;
                }
                for (let channelIdIndex = 0; channelIdIndex < channelIds.length; channelIdIndex += 1)
                {
                    const channelId = channelIds[channelIdIndex];
                    const channel = bot.channels.cache.get(channelId);
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
            catch (error)
            {
                console.log('Unable to post scheduled message');
                console.log(error);
            }
        }, null, false, 'UTC');
        job.start();
    }
};
