let path = require( 'path' );
let util = require( 'util' );
let huobi = require('node-huobi-api');
let logger = {
    log: function (msg){
        let logLineDetails = ((new Error().stack).split('at ')[3]).trim();
        let logLineNum = logLineDetails.split(':');
        console.log('DEBUG', logLineNum[1] + ':' + logLineNum[2], msg);
    }
}

let debug = function( x ) {
    if ( typeof ( process.env.node_huobi_api ) === 'undefined' ) {
        return;
    }
    logger.log( typeof ( x ) );
    logger.log( util.inspect( x ) );
}

debug('Begin');

tickers=['xrpbtc', 'bchusdt']
//done();
huobi.websockets.depthCache( tickers,(symbol, depth)  => {
    debug(symbol+"=="+ JSON.stringify( depth) );
    //debug( symbol );


},10);

