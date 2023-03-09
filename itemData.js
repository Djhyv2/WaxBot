const Axios = require('axios');
const runeData = require('./staticRuneData.json');

module.exports = class itemData
{
    /**
     * Mapping of Rune name to Prices and Quantities
     * @typedef {Object} RuneData
     * @property {Integer} goldbergQuantity Quantity of Rune needed in Rune Goldberg Machine
     * @property {Integer} ironPrice Price of Item for Ironman Accounts
     * @property {Integer} itemId ItemId from Runescape Database
     * @property {Integer} grandExchangePrice Price of Item on Grand Exchange
     */

    /**
     * Fetches Rune prices from Grand Exchange, Rune prices for Ironmen, and Quantity needed for Rune Goldberg Machine
     * @returns {Object.<String, RuneData} Mapping of Items to Prices and Quantities
     */
    static async getRunesData()
    {
        const itemIds = Object.keys(runeData).map((itemName) => runeData[itemName].itemId);
        let weirdGloopResponseData;
        try
        {
            const weirdGloopResponse = await Axios.get('https://api.weirdgloop.org/exchange/history/rs/latest', { params: { id: itemIds.join('|') } });
            weirdGloopResponseData = weirdGloopResponse.data;
        }
        catch (error)
        {
            throw new Error('Unable to reach GE Server');
        }

        Object.keys(weirdGloopResponseData).forEach((itemId) =>
        {
            const integerItemId = Number.parseInt(itemId, 10);
            const matchingItemName = Object.keys(runeData).find((itemName) => runeData[itemName].itemId === integerItemId);
            runeData[matchingItemName].grandExchangePrice = weirdGloopResponseData[itemId].price;
        });
        return runeData;
    }

    /**
     * Fetches price of Vis Wax on Grand Exchange
     * @returns {Integer} Price of Vis Wax on Grand Exchange
     */
    static async getWaxPrice()
    {
        const visWaxItemId = 32092;
        let weirdGloopResponseData;
        try
        {
            const weirdGloopResponse = await Axios.get('https://api.weirdgloop.org/exchange/history/rs/latest', { params: { id: visWaxItemId } });
            weirdGloopResponseData = weirdGloopResponse.data;
        }
        catch (error)
        {
            throw new Error('Unable to reach GE Server');
        }
        return weirdGloopResponseData[visWaxItemId].price;
    }
};
