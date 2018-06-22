const MarketCache = require('./MarketCache');

let MarketCalculation = {

    relationships(a, b, c) {
        let ab = MarketCalculation.relationship(a, b);
        if (!ab) return;

        let bc = MarketCalculation.relationship(b, c);
        if (!bc) return;

        let ca = MarketCalculation.relationship(c, a);
        if (!ca) return;



        return {
            id: a + b + c,
            ab: ab,
            bc: bc,
            ca: ca,
            symbol: {
                a: a.toLowerCase(),
                b: b.toLowerCase(),
                c: c.toLowerCase()
            }
        };
    },

    relationship(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();

        if (MarketCache.tickers[a+b]) return {
            method: 'Sell',
            ticker: a+b,
            volume: MarketCache.volumes[a+b]
        };
        if (MarketCache.tickers[b+a]) return {
            method: 'Buy',
            ticker: b+a,
            volume: MarketCache.volumes[b+a]
        };
        return null;
    },

    getRelationshipsFromSymbol(symbol1) {
        //console.log("getRelationshipsFromSymbol ----->",symbol1);
        let relationships = [];
        MarketCache.symbols.forEach(function(symbol2) {
            //console.log("symbol2 ----->",symbol2);
            MarketCache.symbols.forEach(function(symbol3) {
               // console.log("symbol3 ----->",symbol3);
                let relationship = MarketCalculation.relationships(symbol1, symbol2, symbol3);
                if (relationship) relationships.push(relationship);
            });
        });
       // console.log("relationships len----->",relationships.length);
        //MarketCache.tickers = MarketCache.getSubTickerArray();
        return relationships;
    }

};

module.exports = MarketCalculation;
