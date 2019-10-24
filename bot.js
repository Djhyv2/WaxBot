/*eslint-disable prefer-destructuring */
/*eslint-disable no-console */
const discord = require('discord.js');//Allows connection to discord
const async = require('async');//Allows use of async.parallel to perform parallel I/O
const request = require('request');//Allows use of request.get to sent http requests
const _ = require('lodash');//Lodash is an expansive package containing a large amount of utility features including a deep merge
const auth = require('./auth.json');//Contains the security token for the bot. In Format of { token: (token) }
const quantities = require('./runeData.json');//Contains values for ironmen and quantities of runes needed

//http://services.runescape.com/m=itemdb_rs/api/catalogue/search.json?page=1&query=name&simple=1 api call to search for item by name, not found in documentation
function geHttpRunescapeData(callback, id)
{
    request.get(`http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${id}`, (error, response, body) =>
    {
        if (null != error || '' === body || 200 !== response.statusCode)
        {
            callback('Unable to reach GE Server', null);
        }
        else
        {
            try
            {
                const json = JSON.parse(body);
                const { price } = json.item.current;
                const priceString = price.toString().replace(',', '');
                const priceInt = parseInt(priceString, 10);//Converts string into json into string into int
                callback(null, { price: priceInt });
            }
            catch (innerError)
            {
                callback(innerError, null);
            }
        }
    });//Fires http request to Runescape Servers to get item data
}

async function fetchGEPrices()
{
    let prices;
    try
    {
        prices = await async.series(
            {
                fire: (callback) => geHttpRunescapeData(callback, 554),
                water: (callback) => geHttpRunescapeData(callback, 555),
                air: (callback) => geHttpRunescapeData(callback, 556),
                earth: (callback) => geHttpRunescapeData(callback, 557),
                mind: (callback) => geHttpRunescapeData(callback, 558),
                body: (callback) => geHttpRunescapeData(callback, 559),
                death: (callback) => geHttpRunescapeData(callback, 560),
                nature: (callback) => geHttpRunescapeData(callback, 561),
                chaos: (callback) => geHttpRunescapeData(callback, 562),
                law: (callback) => geHttpRunescapeData(callback, 563),
                cosmic: (callback) => geHttpRunescapeData(callback, 564),
                blood: (callback) => geHttpRunescapeData(callback, 565),
                soul: (callback) => geHttpRunescapeData(callback, 566),
                steam: (callback) => geHttpRunescapeData(callback, 4694),
                mist: (callback) => geHttpRunescapeData(callback, 4695),
                dust: (callback) => geHttpRunescapeData(callback, 4696),
                smoke: (callback) => geHttpRunescapeData(callback, 4697),
                mud: (callback) => geHttpRunescapeData(callback, 4698),
                lava: (callback) => geHttpRunescapeData(callback, 4699),
                astral: (callback) => geHttpRunescapeData(callback, 9075),
                wax: (callback) => geHttpRunescapeData(callback, 32092),
            },
        );//Ran in series to avoid throttling from runescape servers
    }
    catch (error)
    {
        console.log(error);
        return null;
    }

    const data = _.merge(quantities, prices);//Deep merge prices and quantities data
    return data;
}//Fetches data from Runescape API

function capitalizeFirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);//Capitalize first letter of string
}

function printSlot(slot)
{
    let string = '';
    string += `${capitalizeFirst(slot[0].rune)} `;
    if (1 < slot.length)
    {
        string += '(';
    }
    for (let i = 1; i < slot.length; i += 1)
    {
        string += `${capitalizeFirst(slot[i].rune)} ${slot[i].wax}`;
        if (i + 1 < slot.length)
        {
            string += ', ';
        }
    }
    if (1 < slot.length)
    {
        string += ')';
    }
    return string;
}//Converts array of rune and wax into string

async function runBot()
{
    const bot = new discord.Client();

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

            let computedValues = message.content.split('\n');
            if (4 !== computedValues.length)
            {
                return;
            }//If message not 4 lines, return

            try
            {
                computedValues = computedValues.map((row) => row.split(',').map((part) =>
                {
                    const components = part.replace(/ +/g, ' ').trim().split(' ');
                    if (2 !== components.length)
                    {
                        throw new Error('Invalid Format - Are you missing any commas or spaces?');
                    }
                    return {
                        rune: components[0].toLowerCase(),
                        wax: components[1],
                    };
                }));//Splits multiline string into array of rows of comma seperated values, splits the comma seperated values into values, splits the values into 2 parts, rune and wax
            }
            catch (error)
            {
                message.channel.send(error.message);
                return;
            }

            const data = await fetchGEPrices();
            if (null == data)
            {
                message.channel.send('Unable to reach GE Server');
                return;
            }

            try
            {
                computedValues = computedValues.map((row) => row.map((item) =>
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
            }
            catch (error)
            {
                message.channel.send(error.message);
                return;
            }

            const mainRunes = [computedValues[0][0], null, computedValues[1][0], computedValues[2][0], computedValues[3][0]];//The runes for optimal number of wax, The null is in the spot for a secondary main rune

            computedValues = computedValues.map((row) => row.sort((component1, component2) =>
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

            const ironAlts = [computedValues[0][0], null, computedValues[1][0], computedValues[2][0], computedValues[3][0]];//The runes for optimal amount of gold for ironmen
            let secondSlotBetterCounter = 0;//Counts how many times second slot overrides 1
            for (let slot = 1; 4 > slot; slot += 1)
            {
                if (computedValues[0][0].rune === computedValues[slot][0].rune)
                {
                    if (1 < computedValues[slot].length && (2 > computedValues[0].length || computedValues[0][1].ironProfit - computedValues[0][0].ironProfit < computedValues[slot][1].ironProfit - computedValues[slot][0].ironProfit))
                    {
                        ironAlts[slot + 1] = computedValues[slot][1];
                    }//If first slot switching loses more profit or there is no alternate first slot and there is alternate second slot use secondary second slot
                    else if (1 < computedValues[0].length)
                    {
                        ironAlts[1] = computedValues[0][1];
                        secondSlotBetterCounter += 1;
                    }//If second switching loses more profit and there is alternate first slot add alternate first slot
                }//If conflicting rune
            }//Checks for conflicts

            if (3 === secondSlotBetterCounter)
            {
                ironAlts[0] = computedValues[0][1];
                ironAlts[1] = null;
            }//If second slot has a better rune than the first for all 3, move the first slot to its alternate

            computedValues = computedValues.map((row) => row.sort((component1, component2) =>
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

            const alts = [computedValues[0][0], null, computedValues[1][0], computedValues[2][0], computedValues[3][0]];//The runes for optimal amount of gold
            secondSlotBetterCounter = 0;//Counts how many times second slot overrides 1
            for (let slot = 1; 4 > slot; slot += 1)
            {
                if (computedValues[0][0].rune === computedValues[slot][0].rune)
                {
                    if (1 < computedValues[slot].length && (2 > computedValues[0].length || computedValues[0][1].profit - computedValues[0][0].profit < computedValues[slot][1].profit - computedValues[slot][0].profit))
                    {
                        alts[slot + 1] = computedValues[slot][1];
                    }//If first slot switching loses more profit and there is alternate second slot use secondary second slot
                    else if (1 < computedValues[0].length)
                    {
                        alts[1] = computedValues[0][1];
                        secondSlotBetterCounter += 1;
                    }//If second switching loses more profit and there is alternate first slot add alternate first slot
                }//If conflicting rune
            }//Checks for conflicts

            if (3 === secondSlotBetterCounter)
            {
                alts[0] = computedValues[0][1];
                alts[1] = null;
            }//If second slot has a better rune than the first for all 3, move the first slot to its alternate

            computedValues = computedValues.map((row) => row.sort((component1, component2) =>
            {
                if ('30' === component2.wax)
                {
                    return 1;
                }
                if (component1.profit > component2.profit || '30' === component1.wax)
                {
                    return -1;
                }
                if (component1.profit < component2.profit)
                {
                    return 1;
                }
                return 0;
            }));//Sorts each row by main rune then profit

            const date = new Date().toLocaleDateString(
                'en-US',
                {
                    timeZone: 'UTC',
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                },
            );//Gets current date
            const response = `${date}\nSlot 1:\n\t ${printSlot(computedValues[0])}\nSlot 2:\n\t${printSlot(computedValues[1])}\n\t${printSlot(computedValues[2])}\n\t${printSlot(computedValues[3])}\nAlts: ${capitalizeFirst(alts[0].rune)}${null != alts[1] ? `/${capitalizeFirst(alts[1].rune)}` : ''} ${capitalizeFirst(alts[2].rune)} ${capitalizeFirst(alts[3].rune)} ${capitalizeFirst(alts[4].rune)} \nIron Alts: ${capitalizeFirst(ironAlts[0].rune)}${null != ironAlts[1] ? `/${capitalizeFirst(ironAlts[1].rune)}` : ''} ${capitalizeFirst(ironAlts[2].rune)} ${capitalizeFirst(ironAlts[3].rune)} ${capitalizeFirst(ironAlts[4].rune)} `;//Creates readable version of alts
            message.channel.send(response);
        },
    );//Message handler

    try
    {
        await bot.login(auth.token);
    }
    catch (error)
    {
        console.log('Invalid Login Token');
    }//Establishes connection to Discord Servers
}//Async wrapper allows use of await within main body of code
runBot();
