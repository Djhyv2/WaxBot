const _ = require('lodash');//Lodash is an expansive package containing a large amount of utility features including a deep merge
const request = require('request');//Allows use of request.get to sent http requests
const async = require('async');//Allows use of async.parallel or async.series
const quantities = require('./runeData.json');//Contains values for ironmen and quantities of runes needed

module.exports = class GrandExchange
{
//http://services.runescape.com/m=itemdb_rs/api/catalogue/search.json?page=1&query=name&simple=1 api call to search for item by name, not found in documentation
    static geHttpRunescapeData(callback, id)
    {
        request.get(`http://services.runescape.com/m=itemdb_rs/api/graph/${id}.json`, (error, response, body) =>
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
                    const maxTimestampKey = Math.max(...Object.keys(json.daily));
                    const price = json.daily[maxTimestampKey];
                    callback(null, { price });
                }
                catch (innerError)
                {
                    callback(innerError, null);
                }
            }
        });//Fires http request to Runescape Servers to get item data
    }

    static async fetchGEPrices()
    {
        let prices;
        try
        {
            prices = await async.series(
                {
                    fire: (callback) => this.geHttpRunescapeData(callback, 554),
                    water: (callback) => this.geHttpRunescapeData(callback, 555),
                    air: (callback) => this.geHttpRunescapeData(callback, 556),
                    earth: (callback) => this.geHttpRunescapeData(callback, 557),
                    mind: (callback) => this.geHttpRunescapeData(callback, 558),
                    body: (callback) => this.geHttpRunescapeData(callback, 559),
                    death: (callback) => this.geHttpRunescapeData(callback, 560),
                    nature: (callback) => this.geHttpRunescapeData(callback, 561),
                    chaos: (callback) => this.geHttpRunescapeData(callback, 562),
                    law: (callback) => this.geHttpRunescapeData(callback, 563),
                    cosmic: (callback) => this.geHttpRunescapeData(callback, 564),
                    blood: (callback) => this.geHttpRunescapeData(callback, 565),
                    soul: (callback) => this.geHttpRunescapeData(callback, 566),
                    steam: (callback) => this.geHttpRunescapeData(callback, 4694),
                    mist: (callback) => this.geHttpRunescapeData(callback, 4695),
                    dust: (callback) => this.geHttpRunescapeData(callback, 4696),
                    smoke: (callback) => this.geHttpRunescapeData(callback, 4697),
                    mud: (callback) => this.geHttpRunescapeData(callback, 4698),
                    lava: (callback) => this.geHttpRunescapeData(callback, 4699),
                    astral: (callback) => this.geHttpRunescapeData(callback, 9075),
                    wax: (callback) => this.geHttpRunescapeData(callback, 32092),
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
};
