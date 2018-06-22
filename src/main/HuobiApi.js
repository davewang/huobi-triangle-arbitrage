const huobi = require('node-huobi-api');
const MarketCache = require('./MarketCache');
if (process.env.HUOBI_API_KEY && process.env.HUOBI_API_SECRET) {
    huobi.options({
        APIKEY: process.env.HUOBI_API_KEY,
        APISECRET: process.env.HUOBI_API_SECRET,
        useServerTime: true,
        test: true,
        log: function(...args) {

        }

    });
}

let HuobiApi = {
    exchangeInfo() {
        console.log('Querying exchangeInfo');
        return new Promise((resolve, reject) => {
            huobi.exchangeInfo((error, data) => {
                if (error) return reject(error);
                return resolve(data);
            });
        });
    },

    // marketBuy(ticker, quantity) {
    //     return new Promise((resolve, reject) => {
    //         binance.marketBuy(ticker, quantity, (error, response) => {
    //             if (error) return reject(error);
    //             return resolve(response);
    //         })
    //     })
    // },
    //
    // marketSell(ticker, quantity) {
    //     return new Promise((resolve, reject) => {
    //         binance.marketSell(ticker, quantity, (error, response) => {
    //             if (error) return reject(error);
    //             return resolve(response);
    //         });
    //     });
    // },
    //
    // listenForUserData(balanceCallback, executionCallback) {
    //     return binance.websockets.userData(balanceCallback, executionCallback);
    // },

    listenForDepthCache(tickers, callback, limit=100) {
        console.log(`Opening depth cache for ${Array.isArray(tickers) ? tickers.length : 1} tickers`);
        huobi.websockets.depthCache(tickers, (symbol, depth) => {
           // console.log(depth.bids)
            depth.bids = huobi.sortBids(depth.bids);
            depth.asks = huobi.sortAsks(depth.asks);
            depth.time = new Date().getTime();
            MarketCache.updateDepthCache(symbol,depth)
            callback(symbol, depth);
        }, limit);
    }

};

module.exports = HuobiApi;
