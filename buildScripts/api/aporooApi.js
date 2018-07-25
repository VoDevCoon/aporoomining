import socket from 'ws';
import chalk from 'chalk'
import { debug } from 'util';

const ws = new socket('wss://ws.aporoo.com/websocket');
//const ws = new socket('wss://stream.binance.com:9443/ws/zileth@depth20');

let getOrderBook = function (token, currency, dataSize = 5) {
  debug('in api');

  ws.on('open', function () {
    console.log(chalk.green("------- ws connected -------"));
    ws.send(JSON.stringify({ "dataType": "482_ENTRUST_ADD_AT_ETH", "dataSize": dataSize, "action": "ADD" }));

  });

  return new Promise(function (resolve, reject) {

    ws.on('message', function (data) {
      if (data) {
        let rawOrderbook = JSON.parse(data);

        if (rawOrderbook[0][0] === 'AE') {

          let orderbook = new Object();
          orderbook.asks = rawOrderbook[0][4].asks.reverse();
          orderbook.bids = rawOrderbook[0][5].bids;

          //console.log(orderbook.asks);

          resolve(orderbook);
        }
      }
    });
  });

}

module.exports.getOrderBook = getOrderBook;
