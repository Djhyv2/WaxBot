const ItemData = require('./itemData');

module.exports = class Alts
{
    /**
     * Object containing the optimal combination of Runes for maximum wax, maximum profit, and Ironmen accounts
     * @typedef {Object} AltsData
     * @property {Array.<String>} combination Runes for maximum wax in Slot 1, Slot 2a, Slot 2b, and Slot 2c
     * @property {Array.<String>} alts Runes for optimal profit in Slot 1, Slot 1 Backup, Slot 2a, Slot 2b, and Slot 2c
     * @property {Array.<String>} ironAlts Runes for optimal profit for Ironmen in Slot 1, Slot 1 Backup, Slot 2a, Slot 2b, and Slot 2c
     * @property {Array.<Array.<RuneWaxAmount>>} notableRunes Notable Rune wax amounts in Slot 1, Slot 2a, Slot 2b, Slot 2c in order by profit for normal accounts
     * Notable Runes minimally contain Max Wax Rune, Iron Alt(s), 2 Alts and will contain no more than 4 Runes unless more are needed for the listed criteria
     */

    /**
     * Calculates the optimal runes for profit in Rune Goldberg machine for both Ironmen and Normal accounts
     * @param {Array.<Array.<RuneWaxAmount>>} runeWaxAmounts Representing RuneValues in Slot 1, Slot 2a, Slot 2b, Slot 2c
     * @returns {AltsData} Object containing the optimal combination of Runes for maximum wax, maximum profit, and Ironmen accounts
     * @throws {Error} if unable to calculate alts
     */
    static async calculateAlts(runeWaxAmounts)
    {
        const runesData = await ItemData.getRunesData();
        const waxPrice = await ItemData.getWaxPrice();

        const combination = new Array(4);

        //Calculate profits for each runeWaxAmounts and max wax combination
        for (let slot = 0; 4 > slot; slot += 1)
        {
            let maxWaxRuneWaxAmount = { wax: 0 };
            runeWaxAmounts[slot].forEach((runeWaxAmount) =>
            {
                const runeData = runesData[runeWaxAmount.rune];
                runeWaxAmount.profit = runeWaxAmount.wax * waxPrice - runeData.goldbergQuantity * runeData.grandExchangePrice;
                runeWaxAmount.ironProfit = runeWaxAmount.wax * waxPrice - runeData.goldbergQuantity * runeData.ironPrice;

                if (runeWaxAmount.wax > maxWaxRuneWaxAmount.wax)
                {
                    maxWaxRuneWaxAmount = runeWaxAmount;
                }
            });
            combination[slot] = maxWaxRuneWaxAmount.rune;
        }

        const ironAlts = this.calculateOptimalProfit('ironProfit', runeWaxAmounts);
        const alts = this.calculateOptimalProfit('profit', runeWaxAmounts);

        //Notable Runes contains Max Wax Rune, Iron Alt(s), and 2 Alts
        const notableRunes = [[], [], [], []];
        for (let slot = 0; 4 > slot; slot += 1)
        {
            const notableIronRunes = [];
            if (0 === slot)
            {
                notableIronRunes.push(ironAlts[0]);
            }
            if (ironAlts[slot + 1])
            {
                notableIronRunes.push(ironAlts[slot + 1]);
            }
            const notableAlts = [];
            let notableAltsCount = 2;
            //When Singular Iron Alt is also Primary Rune
            if (1 === notableIronRunes.length && notableIronRunes[0] === combination[slot])
            {
                notableAltsCount = 3;
            }
            for (let entryIndex = 0; entryIndex < runeWaxAmounts[slot].length; entryIndex += 1)
            {
                const entry = runeWaxAmounts[slot][entryIndex];
                if (entry.rune === combination[slot])
                {
                    notableRunes[slot].push(entry);
                }
                else if (notableIronRunes.includes(entry.rune))
                {
                    notableRunes[slot].push(entry);
                    //If multiple iron alts and 1 is in top 2 alts, reduce amount shown to keep 4 runes in line
                    if (2 === notableIronRunes.length && notableAltsCount > notableAlts.length)
                    {
                        notableAltsCount -= 1;
                    }
                }
                else if (notableAltsCount > notableAlts.length)
                {
                    notableAlts.push(entry);
                    notableRunes[slot].push(entry);
                }
            }
        }

        return {
            combination, alts, ironAlts, notableRunes,
        };
    }

    /**
     * Calculates runes for optimal profit based on the profitKey provided
     * @param {String} profitKey Key to use when sorting by profit to calculate alts
     * @param {Array.<Array.<RuneWaxAmount>>} runeWaxAmounts Representing RuneValues in Slot 1, Slot 2a, Slot 2b, Slot 2c
     * @returns {Array.<String>} alts Runes for optimal profit in Slot 1, Slot 1 Backup, Slot 2a, Slot 2b, and Slot 2c based on profitKey
    */
    static calculateOptimalProfit(profitKey, runeWaxAmounts)
    {
        const alts = new Array(5);
        let slot1ShiftCount = 0;
        for (let slot = 0; 4 > slot; slot += 1)
        {
            runeWaxAmounts[slot].sort((runeWaxAmounts1, runeWaxAmounts2) =>
            {
                if (runeWaxAmounts1[profitKey] < runeWaxAmounts2[profitKey]) return 1;
                if (runeWaxAmounts1[profitKey] > runeWaxAmounts2[profitKey]) return -1;
                return 0;
            });

            if (0 < slot)
            {
                //If neither slot needs to shift
                if (runeWaxAmounts[0][0].rune !== runeWaxAmounts[slot][0].rune)
                {
                    alts[slot + 1] = runeWaxAmounts[slot][0].rune;
                }
                //If neither slot can shift
                else if (1 === runeWaxAmounts[0].length && 1 === runeWaxAmounts[slot].length)
                {
                    throw new Error('Unable to Calculate Alts - Slot 1 and Slot 2 are the same with no other options');
                }
                //If slot 1 cannot shift
                else if (1 === runeWaxAmounts[0].length && 1 < runeWaxAmounts[slot].length)
                {
                    alts[slot + 1] = runeWaxAmounts[slot][1].rune;
                }
                //If slot 2 cannot shift
                else if (1 < runeWaxAmounts[0].length && 1 === runeWaxAmounts[slot].length)
                {
                    alts[1] = runeWaxAmounts[0][1].rune;
                    alts[slot + 1] = runeWaxAmounts[slot][0].rune;
                    slot1ShiftCount += 1;
                }
                //If slot 1 needs to shift
                else if (runeWaxAmounts[0][0][profitKey] + runeWaxAmounts[slot][1][profitKey] < runeWaxAmounts[0][1][profitKey] + runeWaxAmounts[slot][0][profitKey])
                {
                    alts[1] = runeWaxAmounts[0][1].rune;
                    alts[slot + 1] = runeWaxAmounts[slot][0].rune;
                    slot1ShiftCount += 1;
                }
                //If slot 2 needs to shift
                else if (runeWaxAmounts[0][0][profitKey] + runeWaxAmounts[slot][1][profitKey] >= runeWaxAmounts[0][1][profitKey] + runeWaxAmounts[slot][0][profitKey])
                {
                    alts[slot + 1] = runeWaxAmounts[slot][1].rune;
                }
            }
            else
            {
                alts[0] = runeWaxAmounts[slot][0].rune;
            }
        }
        //If slot 1 shifted for slot 2a, slot 2b, and slot 2c
        if (3 === slot1ShiftCount)
        {
            alts[0] = alts[1];
            alts[1] = null;
        }
        return alts;
    }
};
