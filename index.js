// Written by Eric Crosson
// 2017-11-07

const _ = require('lodash');
const scraper = require('table-scraper');
const Table = require('cli-table2');

const args = process.argv;
const coin = args[2];

function getTopExchangesByVolume(tableData) {

    var parsedData = {};
    var counter = 0;

    _.each(tableData, function(data, key) {
        volume = parseFloat(data['Volume (%)'].split("%")[0]);
        if (volume < 1) {
            return;
        }
        var scrapedData = {};
        scrapedData['Exchange'] = data['Source'];
        scrapedData['Pair'] = data['Pair'];
        scrapedData['Volume (%)'] = data['Volume (%)'];
        scrapedData['Volume (24h)'] = data['Volume (24h)'];
        scrapedData['Price'] = data['Price'];
        parsedData[counter++] = scrapedData;
    });

    return parsedData;
}

function getMatchingMarketCaps(tableData) {

    var parsedData = {};
    var counter = 0;

    _.each(tableData, function(coinData, key) {
        if (coinData['Name'].toLowerCase().indexOf(coin.toLowerCase()) < 0) {
            return;
        }
        var scrapedData = {};
        scrapedData['Symbol'] = coinData['Name'].replace(/\s.*/, '');
        scrapedData['Currency'] = coinData['Name'].replace(/\S+\s*/, '');
        scrapedData['Market cap'] = coinData['Market Cap'];
        parsedData[counter++] = scrapedData;
    });

    return parsedData;
}

// returns a table object
function tableize(tableData) {
    var table = new Table({
        head: Object.keys(tableData[0]),
        chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
        style: { 'padding-left': 0, 'padding-right': 0 }
    });

    _.each(tableData, function(row, index) {
        table.push(_.values(row));
    });
    return table;
}

function main() {

    const urlMarkets = `https://coinmarketcap.com/currencies/${coin}/#markets`;
    const urlMarketCap = `https://coinmarketcap.com/`;

    // console.log(`Received arguments ${args}`);
    // console.log(`Fetching coinmarketcap data for ${coin}`);

    scraper
        .get(urlMarkets)
        .then(function(tableData) {
            const coinmarketcapData = tableData[0];
            const topExchangesByVolume = getTopExchangesByVolume(coinmarketcapData);
            const table = tableize(topExchangesByVolume);
            console.log(table.toString());


            scraper
                .get(urlMarketCap)
                .then(function(tableData) {
                    const coinmarketcapTable = tableData[0];
                    const marketcaps = getMatchingMarketCaps(coinmarketcapTable);
                    const table = tableize(marketcaps);
                    console.log(table.toString());
                });
        });
}

main();
