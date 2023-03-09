/*eslint-disable no-bitwise */

const ADDEND = 0xB;
const MASK = 2 ** 48;
const POW17 = 2 ** 17;
const POW32 = 2 ** 32;

const CHUNK = 2 ** 16;
const MAGIC0 = 0xE66D;
const MAGIC1 = 0xDEEC;
const MAGIC2 = 0x5;

const slot2params = [[2, -2], [3, -1], [4, 2]];

const RUNES = ['air', 'water', 'earth', 'fire', 'dust', 'lava', 'mist', 'mud', 'smoke', 'steam', 'mind', 'body', 'cosmic', 'chaos', 'nature', 'law', 'death', 'astral', 'blood', 'soul'];

module.exports = class RuneGoldberg
{
    //Credit to Cook#2222 for Method
    static safemul(seed)
    {
        const s0 = seed % CHUNK;
        const s1 = Math.floor(seed / CHUNK) % CHUNK;
        const s2 = Math.floor(seed / CHUNK / CHUNK);

        let carry = 0;

        let r0 = (s0 * MAGIC0) + carry;
        carry = Math.floor(r0 / CHUNK);
        r0 %= CHUNK;

        let r1 = (s1 * MAGIC0 + s0 * MAGIC1) + carry;
        carry = Math.floor(r1 / CHUNK);
        r1 %= CHUNK;

        let r2 = (s2 * MAGIC0 + s1 * MAGIC1 + s0 * MAGIC2) + carry;

        r2 %= CHUNK;
        return r2 * CHUNK * CHUNK + r1 * CHUNK + r0;
    }

    //Credit to Cook#2222 for Method
    static random(inputSeed)
    {
        const s0 = (inputSeed % CHUNK) ^ MAGIC0;
        const s1 = ((inputSeed / CHUNK) % CHUNK) ^ MAGIC1;
        const s2 = ((inputSeed / CHUNK / CHUNK) % CHUNK) ^ MAGIC2;

        let seed = s2 * CHUNK * CHUNK + s1 * CHUNK + s0;
        this.nextInt = (n) =>
        {
            seed = (this.safemul(seed) + ADDEND) % MASK;
            return Math.floor(seed / POW17) % n;
        };

        return this;
    }

    //Credit to Cook#2222 for Method
    /**
     * Calculates the values for every rune for the given runedate
     * @param {Integer} runedate Runedate to calculate Rune Goldberg values for
     * @returns {Array.<Array.Integer>>} Returns array of array of integers. Outer array contains values for slot 1, slot 2a, slot 2b, slot 2c.
     * Each inner array contains the number of wax for the rune in the same corresponding order as the RUNES constant
     */
    static computeForRunedate(runedate)
    {
        const NUM_BEST_OPTIONS = 19;
        const NUM_RUNES = RUNES.length;

        const slot1best = this.random(runedate * POW32).nextInt(NUM_BEST_OPTIONS);
        const slot1scores = Array(NUM_RUNES);
        slot1scores[slot1best] = 30;
        let used = new Set();
        const slot1rand = this.random(runedate * POW32 + 1);
        slot1rand.nextInt(29); //throw away
        for (let offset = 1; 20 > offset; offset += 1)
        {
            let score = slot1rand.nextInt(29) + 1;
            while (used.has(score))
            {
                score = (score + 1) % 29;
            }
            slot1scores[(slot1best + offset) % 20] = score;
            used.add(score);
        }

        const slot2scores = [Array(NUM_RUNES), Array(NUM_RUNES), Array(NUM_RUNES)];
        const slot2bests = Array(3);
        for (let i = 0; 3 > i; i += 1)
        {
            const [multiplier, finalOffset] = slot2params[i];
            slot2bests[i] = (this.random(multiplier * runedate * POW32).nextInt(NUM_BEST_OPTIONS) + finalOffset + NUM_BEST_OPTIONS) % NUM_BEST_OPTIONS;
            if (slot1best === slot2bests[i])
            {
                slot2bests[i] += 1;
            }
            slot2scores[i][slot2bests[i]] = 30;
            used = new Set();
            const slot2rand = this.random(multiplier * runedate * POW32 + multiplier);
            slot2rand.nextInt(29); //throw away
            for (let offset = 1; 20 > offset; offset += 1)
            {
                let score = slot2rand.nextInt(29) + 1;
                while (used.has(score))
                {
                    score = (score + 1) % 29;
                }
                slot2scores[i][(slot2bests[i] + offset) % 20] = score;
                used.add(score);
            }
        }
        return [slot1scores, slot2scores[0], slot2scores[1], slot2scores[2]];
    }

    /**
     * Calculates Runedate from Date
     * @param {Date} date Date to be converted to Runedate
     * @returns {Integer} Number of days since 2-27-02
     */
    static calculateRunedate(date)
    {
        const UTC = date.getTime() / 1000;
        const startUTC = new Date('2002-02-27T00:00:00.000+00:00').getTime() / 1000;
        return Math.floor((UTC - startUTC) / 86400);
    }

    /**
     * Calcuculates RuneValues for each slot for date
     * @param {Integer=0} runedateOffset Number of days offset from today to generate RuneValues for
     * @returns {Array.<Array.<RuneWaxAmount>>} Representing RuneValues in Slot 1, Slot 2a, Slot 2b, Slot 2c
     */
    static parseAllRunes(runedateOffset = 0)
    {
        const date = new Date();
        date.setDate(date.getDate() + runedateOffset);
        const scores = this.computeForRunedate(this.calculateRunedate(date));
        const parsedValues = [[], [], [], []];
        for (let slot = 0; 4 > slot; slot += 1)
        {
            for (let runeIndex = 0; runeIndex < RUNES.length; runeIndex += 1)
            {
                parsedValues[slot].push({
                    rune: RUNES[runeIndex],
                    wax: scores[slot][runeIndex],
                });
            }
        }
        return parsedValues;
    }
};

/*eslint-enable no-bitwise */
