// order book
// { asks:
//    [ [ '0.00009', '6352.85' ],
//               ...
//      [ '0.001', '197.51' ] ],
//   bids:
//    [ [ '0.000087', '51974.14' ],
//               ...
//      [ '0.000001', '1287719.05' ] ],
//   ts: 2018-07-28T05:26:50.253Z,
//   pair: 'AT_ETH' }
import socket from 'ws';
import chalk from 'chalk'
import { debug, error } from 'util';

//const ws = new socket('wss://stream.binance.com:9443/ws/zileth@depth20');
//let marketList = new Map('AT_ETH');


let getOrderBook = function (token, currency, dataSize = 50) {

  let ws = new socket('wss://ws.aporoo.com/websocket');
  let tradingPair = `${token}_${currency}`;
  let payload = {"dataType":"484_ENTRUST_ADD_BTC_USDT","dataSize":dataSize,"action":"ADD"}; //default to btc_usdt market

  switch(tradingPair.toUpperCase()){
    case "AT_ETH":
      payload = {"dataType":"482_ENTRUST_ADD_AT_ETH","dataSize":dataSize,"action":"ADD"};
      break;
    default:
      console.log('no trading pair.');
  }

  //console.log(payload);

  ws.on('open', function () {
    //ws.send(JSON.stringify({ "dataType": "482_ENTRUST_ADD_AT_ETH", "dataSize": dataSize, "action": "ADD" }));
    ws.send(JSON.stringify(payload));

  });

  return new Promise(function (resolve, reject) {

    ws.on('message', function (data) {
      if (data) {
        let rawOrderbook = JSON.parse(data);

        if (rawOrderbook[0][0] === 'AE') {

          let orderbook = new Object();
          orderbook.asks = rawOrderbook[0][4].asks.reverse();
          orderbook.bids = rawOrderbook[0][5].bids;
          orderbook.ts = new Date();
          orderbook.pair = `${token}_${currency}`;

          resolve(orderbook);
          ws = null;
        }
        else{
          reject(new Error('received data is in wrong format'));
        }
      }
    });
  });

}

let placeOrder = function (token, currency, type, amount){

}

module.exports.getOrderBook = getOrderBook;
module.exports.placeOrder = placeOrder;
