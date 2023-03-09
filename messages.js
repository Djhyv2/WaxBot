const runeData = require('./staticRuneData.json');
const Alts = require('./alts');
const Print = require('./print');

module.exports = class Messages
{
    /**
     * Calculates and Prints Alts for applicable Discord Messages
     * @param {Discord.Message} message Discord Message Object
     */
    static async handleMessage(message)
    {
        try
        {
            const parsedMessage = this.parseMessage(message.content);
            if (parsedMessage)
            {
                const {
                    combination, alts, ironAlts, notableRunes,
                } = await Alts.calculateAlts(parsedMessage);
                message.channel.send(Print.generateMessage(combination, alts, ironAlts, notableRunes, message.client.emojis.cache));
            }
        }
        catch (error)
        {
            message.channel.send(error.message);
        }
    }

    /**
     * Mapping of Rune name to Wax provided by Rune Goldberg Machine
     * @typedef {Object} RuneWaxAmount
     * @property {String} rune Lowercase name of Rune
     * @property {Integer} wax Number of Wax given for Rune
     * @property {Integer=} profit Optional Amount of profit for normal characters
     * @property {Integer=} ironProfit Optional Amount of profit for ironman characters
     */

    /**
     * Parses Discord Message object into Array of Arrays of RuneValues representing each RuneValue for each slot
     * @param {String} message Contents of Discord message
     * @returns {Array.<Array.<RuneWaxAmount>>} Representing RuneValues in Slot 1, Slot 2a, Slot 2b, Slot 2c
     * @returns {null} If not 4 lined message
     * @throws {Error} if 4 lined message contains error
     */
    static parseMessage(message)
    {
        let lines = message.split('\n');
        if (4 !== lines.length)
        {
            return null;
        }
        lines = lines.map((row) => row.split(',').map((entry) =>
        {
            const components = entry.replace(/ +/g, ' ').trim().split(' ');
            if (2 !== components.length)
            {
                throw new Error('Invalid Format - Are you missing any commas or spaces?');
            }
            const rune = components[0].toLowerCase();
            if (!runeData[rune])
            {
                throw new Error('Invalid Format - Did you misspell a rune?');
            }
            const wax = parseInt(components[1], 10);
            if (Number.isNaN(wax))
            {
                throw new Error('Invalid Format - Did you mistype an amount of wax?');
            }
            return { rune, wax };
        }));
        return lines;
    }
};
