const threads = require('threads');
threads.config.set({
    basepath: {
        node: __dirname
    }
});
require('dotenv').config({path: './config/application.env'});
//console.log(process.env.BINANCE_API_KEY);
const MarketCache = require('./MarketCache');
const ArbDisplay = require('./ArbDisplay');
const HubBi = require('./HuobiApi');
const MarketCalculation = require('./MarketCalculation');
const CONFIG = require('../../config/live.config');


// Set up symbols and tickers
HubBi.exchangeInfo().then((data) => {

    let symbols = new Set();
    let tickers = [];
    const CACHE_INIT_DELAY = CONFIG.CACHE_INIT_DELAY;

    // Extract Symbols and Tickers
    data.data.forEach(function(symbolObj) {
        //console.log("-->",JSON.stringify( symbolObj));
        //if (symbolObj.status !== 'TRADING') return;
        symbols.add(symbolObj["base-currency"]);
        symbolObj.dustQty = 0.01;
        tickers[symbolObj["base-currency"]+symbolObj["quote-currency"]] = symbolObj;
       // console.log("tickers[%s] = %o",symbolObj.symbol,symbolObj);

    });
    // console.log("sym len : ",data.data.length);
    // console.log("symbols len : ",symbols.size);
    // console.log("tickers : ",Object.keys(tickers).length );
    // Initialize market cache
    MarketCache.symbols = symbols;
    MarketCache.tickers = tickers;
    MarketCache.relationships = MarketCalculation.getRelationshipsFromSymbol(CONFIG.BASE_SYMBOL);

    // console.log("%o",MarketCache.relationships);
    // console.log("%o",MarketCache.getSubTickerArray());

    HubBi.listenForDepthCache(MarketCache.getSubTickerArray(), (ticker, depth) => {
        //console.log(ticker,depth);

        //console.log("===",ticker,Object.keys( depth.bids).length,Object.keys( depth.asks).length);
    }, CONFIG.DEPTH_SIZE);
    //
    // // Listen for depth updates
    // BinanceApi.listenForDepthCache(MarketCache.getTickerArray(), (ticker, depth) => {}, CONFIG.DEPTH_SIZE);
    //
    // //
    // BinanceApi.listenForUserData(function (e) {
    //
    // })

    // Delay before beginning calculation cycle
    console.log(`\nWaiting ${CACHE_INIT_DELAY / 1000} seconds to populate market caches`);
    setTimeout(() => {
        calculateArbitrage();
        CONFIG.HUD_REFRESH_INTERVAL && setInterval(refreshDisplay, CONFIG.HUD_REFRESH_INTERVAL);
    }, CACHE_INIT_DELAY);
}).catch(console.error);



function calculateArbitrage() {
    MarketCache.pruneDepthsAboveThreshold(CONFIG.DEPTH_SIZE);


    // const CalculationNode = require('./CalculationNode.js');
    //
    // MarketCache.relationships.forEach(relationship => {
    //   //  console.log(">>>",relationship.id);
    //     const partial = MarketCache.getSubsetFromTickers([relationship.ab.ticker, relationship.bc.ticker, relationship.ca.ticker])
    //     //console.log(">>>",partial);
    //     CalculationNode({trade: relationship,minInvestment: CONFIG.INVESTMENT.MIN,maxInvestment: CONFIG.INVESTMENT.MAX,stepSize: CONFIG.INVESTMENT.STEP, MarketCache: MarketCache.getSubsetFromTickers([relationship.ab.ticker, relationship.bc.ticker, relationship.ca.ticker])},function (calculated) {
    //         if (calculated) {
    //            MarketCache.arbs[calculated.trade.id] = calculated;
    //         }
    //     });
    //
    // })
    // setTimeout(calculateArbitrage, CONFIG.SCAN_DELAY);


     const pool = new threads.Pool();
     const job = pool
         .run('CalculationNode.js')
         .on('error',  console.error)
         .on('done', (job, calculated) => {
             if (calculated) {
                 MarketCache.arbs[calculated.trade.id] = calculated;
             }
         });

     MarketCache.relationships.forEach(relationship => {
         job.send({
             trade: relationship,
             minInvestment: CONFIG.INVESTMENT.MIN,
             maxInvestment: CONFIG.INVESTMENT.MAX,
             stepSize: CONFIG.INVESTMENT.STEP,
             MarketCache: MarketCache.getSubsetFromTickers([relationship.ab.ticker, relationship.bc.ticker, relationship.ca.ticker])
         })
     });

     pool.on('finished', () => {
         pool.killAll();
         setTimeout(calculateArbitrage, CONFIG.SCAN_DELAY);
     });
}

function refreshDisplay() {
    const arbsToDisplay = MarketCache.getTopProfitableArbs(CONFIG.HUD_ARB_COUNT);
    ArbDisplay.displayArbs(arbsToDisplay);
}