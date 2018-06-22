module.exports = {
    // Base symbol which all triangle trades must start and end with
    BASE_SYMBOL: 'ht',

    INVESTMENT: {
        MIN: 0.1,
        MAX: 0.3,
        STEP: 0.001
    },

    // Order book depth to maintain on each ticker
    // Valid Values: [5, 10, 20, 50, 100, 500, 1000]
    DEPTH_SIZE: 100,

    // Delay (ms) between opening initial websockets and beginning to scan for arbs
    CACHE_INIT_DELAY: 20000,

    // Delay (ms) after calculations are performed before starting another cycle
    SCAN_DELAY: 2000,

    // Interval (ms) at which the HUD is refreshed
    HUD_REFRESH_INTERVAL: 200,

    // Number of arbs shown on the HUD
    HUD_ARB_COUNT: 50
};
