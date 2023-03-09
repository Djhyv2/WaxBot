module.exports = class Print
{
    /**
     * Generates message string for alts to be posted to Discord
     * @param {Array.<String>} combination Runes for maximum wax in Slot 1, Slot 2a, Slot 2b, and Slot 2c
     * @param {Array.<String>} alts Runes for optimal profit in Slot 1, Slot 1 Backup, Slot 2a, Slot 2b, and Slot 2c
     * @param {Array.<String>} ironAlts Runes for optimal profit for Ironmen in Slot 1, Slot 1 Backup, Slot 2a, Slot 2b, and Slot 2c
     * @param {Array.<Array.<RuneWaxAmount>>} notableRunes Notable Rune wax amounts in Slot 1, Slot 2a, Slot 2b, Slot 2c in order by profit for normal accounts
     * Notable Runes minimally contain Max Wax Rune, Iron Alt(s), 2 Alts and will contain no more than 4 Runes unless more are needed for the listed criteria
     * @param {Collection.<Discord.GuildEmoji>} emojis Collection of emojis available to Discord Bot
     * @param {Integer=0} runedateOffset Number of days offset from today to print values for
     * @returns {String} String message to be viewed in Discord
     */
    static generateMessage(combination, alts, ironAlts, notableRunes, emojis, runedateOffset = 0)
    {
        let date = new Date();
        date.setDate(date.getDate() + runedateOffset);
        date = date.toLocaleDateString('en-US', {
            timeZone: 'UTC', month: 'short', day: '2-digit', year: 'numeric',
        });
        const lines = [];
        lines.push(date);
        lines.push('Slot 1:');
        lines.push(this.generateSlot(combination[0], notableRunes[0], emojis));
        lines.push('Slot 2:');
        for (let slot = 1; 4 > slot; slot += 1)
        {
            lines.push(this.generateSlot(combination[slot], notableRunes[slot], emojis));
        }
        lines.push(`Alts: ${this.generateAlts(alts)}`);
        lines.push(`Iron Alts: ${this.generateAlts(ironAlts)}`);
        return lines.join('\n');
    }

    /**
     * Generates the line of text for a single slot in the Rune Goldberg Machine
     * @param {String} combinationRune Rune worth the most wax in the slot
     * @param {Array.<RuneWaxAmount>} notableRunes Runes to print in line for given slot
     * @param {Collection.<Discord.GuildEmoji>} emojis Collection of emojis available to Discord Bot
     * @returns {String} A line of text representing a single slot of Runes
     */
    static generateSlot(combinationRune, notableRunes, emojis)
    {
        const capitalizedCombinationRune = this.capitalizeFirstLetter(combinationRune);
        let slotString = `    ${emojis.find((emoji) => emoji.name === `${capitalizedCombinationRune}_rune`).toString()} ${capitalizedCombinationRune} `;
        slotString += `(${notableRunes.map((runeWaxAmount) => `${this.capitalizeFirstLetter(runeWaxAmount.rune)} ${runeWaxAmount.wax}`).join(', ')})`;
        return slotString;
    }

    /**
     * Converts alts array into a string
     * @param {Array.<String>} alts Array containing alts to convert to a string
     * @returns {String} String of alts
     */
    static generateAlts(alts)
    {
        const capitalizedAlts = alts.map((rune) => this.capitalizeFirstLetter(rune));
        return `${capitalizedAlts[0]}${capitalizedAlts[1] ? `/${capitalizedAlts[1]}` : ''} ${capitalizedAlts.slice(2).join(' ')}`;
    }

    /**
     * Capitalizes first letter in a string
     * @param {String} string String to capitalize first letter of
     * @returns {String|null} String with first letter capitalized or null
     */
    static capitalizeFirstLetter(string)
    {
        return string && string[0].toUpperCase() + string.slice(1);
    }
};
