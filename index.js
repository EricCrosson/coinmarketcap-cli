#!/usr/bin/env node
// Written by Eric Crosson
// 2017-11-07

const _ = require('lodash');
const Table = require('cli-table2');
const coinmarketcap = require('coinmarketcap-cli-api');

const args = process.argv;
const coin = args[2];

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

function displayTable(table) {
    console.log(tableize(table).toString());
}

function main() {

    market = '';
    marketcap = '';
    promises = [];

    promises.push(coinmarketcap.getMarkets(coin)
                  .then(function(markets) {
                      market = markets
                  }));
    promises.push(coinmarketcap.getMarketCap(coin)
                  .then(function(marketcaps) {
                      marketcap = marketcaps
                  }));

    Promise.all(promises)
        .then(function() {
            displayTable(market)
            displayTable(marketcap)
        })
}

main();
