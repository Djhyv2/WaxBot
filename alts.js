module.exports = class Alts
{
    static calculateAlts(parsedData, data)
    {
        let computedData;

        computedData = parsedData.map((row) => row.map((item) =>
        {
            if (null == data[item.rune])
            {
                throw new Error('Invalid Format - Did you misspell a rune?');
            }
            //eslint-disable-next-line no-param-reassign
            item.profit = item.wax * data.wax.price - data[item.rune].price * data[item.rune].quantity;
            //eslint-disable-next-line no-param-reassign
            item.ironProfit = item.wax * data.wax.price - data[item.rune].ironPrice * data[item.rune].quantity;
            return item;
        }));//Calculates profit for given rune and quantity

        //const mainRunes = [computedData[0][0], null, computedData[1][0], computedData[2][0], computedData[3][0]];//The runes for optimal number of wax, The null is in the spot for a secondary main rune

        computedData = computedData.map((row) => row.sort((component1, component2) =>
        {
            if (component1.ironProfit > component2.ironProfit)
            {
                return -1;
            }
            if (component1.ironProfit < component2.ironProfit)
            {
                return 1;
            }
            return 0;
        }));//Sorts each row by ironman profit

        const ironAlts = [computedData[0][0], null, computedData[1][0], computedData[2][0], computedData[3][0]];//The runes for optimal amount of gold for ironmen
        let secondSlotBetterCounter = 0;//Counts how many times second slot overrides 1
        for (let slot = 1; 4 > slot; slot += 1)
        {
            if (computedData[0][0].rune === computedData[slot][0].rune)
            {
                if (1 < computedData[slot].length && (2 > computedData[0].length || computedData[0][1].ironProfit - computedData[0][0].ironProfit < computedData[slot][1].ironProfit - computedData[slot][0].ironProfit))
                {
                    ironAlts[slot + 1] = computedData[slot][1];
                }//If first slot switching loses more profit or there is no alternate first slot and there is alternate second slot use secondary second slot
                else if (1 < computedData[0].length)
                {
                    ironAlts[1] = computedData[0][1];
                    secondSlotBetterCounter += 1;
                }//If second switching loses more profit and there is alternate first slot add alternate first slot
            }//If conflicting rune
        }//Checks for conflicts

        if (3 === secondSlotBetterCounter)
        {
            ironAlts[0] = computedData[0][1];
            ironAlts[1] = null;
        }//If second slot has a better rune than the first for all 3, move the first slot to its alternate

        computedData = computedData.map((row) => row.sort((component1, component2) =>
        {
            if (component1.profit > component2.profit)
            {
                return -1;
            }
            if (component1.profit < component2.profit)
            {
                return 1;
            }
            return 0;
        }));//Sorts each row by profit

        const alts = [computedData[0][0], null, computedData[1][0], computedData[2][0], computedData[3][0]];//The runes for optimal amount of gold
        secondSlotBetterCounter = 0;//Counts how many times second slot overrides 1
        for (let slot = 1; 4 > slot; slot += 1)
        {
            if (computedData[0][0].rune === computedData[slot][0].rune)
            {
                if (1 < computedData[slot].length && (2 > computedData[0].length || computedData[0][1].profit - computedData[0][0].profit < computedData[slot][1].profit - computedData[slot][0].profit))
                {
                    alts[slot + 1] = computedData[slot][1];
                }//If first slot switching loses more profit and there is alternate second slot use secondary second slot
                else if (1 < computedData[0].length)
                {
                    alts[1] = computedData[0][1];
                    secondSlotBetterCounter += 1;
                }//If second switching loses more profit and there is alternate first slot add alternate first slot
            }//If conflicting rune
        }//Checks for conflicts

        if (3 === secondSlotBetterCounter)
        {
            alts[0] = computedData[0][1];
            alts[1] = null;
        }//If second slot has a better rune than the first for all 3, move the first slot to its alternate

        computedData = computedData.map((row) =>
        {
            let maxWaxRune = row[0];
            row.forEach((item) =>
            {
                if (item.wax > maxWaxRune.wax)
                {
                    maxWaxRune = item;
                }
            });
            row.sort((component1, component2) =>
            {
                if (component1.profit > component2.profit)
                {
                    return -1;
                }
                if (component1.profit < component2.profit)
                {
                    return 1;
                }
                return 0;
            });
            row.unshift(maxWaxRune);
            return row;
        });//Sorts each row by main rune then profit

        return { computedData, alts, ironAlts };
    }
};
