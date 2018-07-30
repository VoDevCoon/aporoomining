import socket from 'ws';
import crypto from 'crypto';
import request from 'request-promise';
import _ from 'underscore';
import { aporoo } from '../config/api';

//const ws = new socket('wss://stream.binance.com:9443/ws/zileth@depth20');
//let marketList = new Map('AT_ETH');

const keyname = 'Apiid';
const key = aporoo.key;
const secret = aporoo.secret;
const wsUrl = 'wss://ws.aporoo.com/websocket';
const httpsAccountBaseUrl = "https://www.aporoo.com";
const httpsMarketBaseUrl = "https://ws.aporoo.com";



let markets = new Map();

request({
  method: "GET",
  uri: httpsAccountBaseUrl + "/exchange/config/controller/website/marketcontroller/getByWebId",
  json: true
}).then((res) => {
  let data = res.datas;
  data.forEach(market => {
    markets.set(market.name.toUpperCase(), market.marketId);
  });
});


let getOrderBook = function (token, currency, dataSize = 50) {

  let ws = new socket(wsUrl);
  let tradingPair = `${token}_${currency}`;
  let payload = { "dataType": "484_ENTRUST_ADD_BTC_USDT", "dataSize": dataSize, "action": "ADD" }; //default to btc_usdt market

  switch (tradingPair.toUpperCase()) {
    case "AT_ETH":
      payload = { "dataType": "482_ENTRUST_ADD_AT_ETH", "dataSize": dataSize, "action": "ADD" };
      break;
    default:
      console.log('no trading pair.');
  }

  ws.on('open', () => {
    ws.send(JSON.stringify(payload));

  });

  ws.on('error', (err) => {
    console.log(err);
  });

  return new Promise((resolve, reject) => {

    ws.on('message', (data) => {
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
        else {
          reject(new Error('received data is in wrong format'));
        }
      }
    });
  });

}

let getUserInfo = function () {

  request({
    method: "POST",
    uri: httpsAccountBaseUrl + "/exchange/user/controller/website/usercontroller/getuserinfo",
    json: true,
    headers: getPostHeader()
  }).then((res) => { console.log(res) });

}

let placeOrder = function (token, currency, type, price, amount) {

  if (markets.size > 0) {

    let market = markets.get(`${token}_${currency}`);
    let params = {
      "amount": amount,
      "rangeType": 0,
      "type": type,
      "marketId": market,
      "price": price
    }

    //console.log(params);
    return new Promise((resolve, reject) => {
      request({
        method: "POST",
        uri: httpsAccountBaseUrl + "/exchange/entrust/controller/website/EntrustController/addEntrust",
        body: params,
        json: true,
        headers: getPostHeader(params)
      }).then((res) => {
        getOrderById(market, res.datas.entrustId).then(
          (result) => {
            let order = {
              id : result.datas.entrustId,
              amount : result.datas.amount,
              type : result.datas.entrustType,
              price : result.datas.price,
              completeAmount : result.datas.completeAmount,
              market : result.datas.marketId
            }
            resolve(order);

            console.log(`new order placed => id:${order.id}
                                            | market:${order.market}
                                            | type:${order.type}
                                            | price:${order.price}
                                            | amount:${order.amount}
                                            | complete:${order.completeAmount}`);
          }
        );
      }).catch((err) => { reject(err.statusCode); });
    });
  }
}

let getOrderById = function (marketId, orderId) {

  let params = {
    marketId: marketId,
    entrustId: orderId
  }
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      uri: httpsAccountBaseUrl + "/exchange/entrust/controller/website/EntrustController/getEntrustById",
      qs: params,
      json: true,
      headers: getGetHeader(params)
    }).then((res) => {
      resolve(res);
    }).catch((err) => { reject(err.statusCode); });
  });
}

function getPostHeader(params) {
  let header = {};
  let ts = Date.now();
  header.apiid = key;
  header.Timestamp = ts;

  if (params) {
    header.Sign = encryptMD5(key + ts + JSON.stringify(params) + secret);
  } else {
    header.Sign = encryptMD5(key + ts + secret);
  }

  return header;
}

function getGetHeader(params) {
  let header = {};
  let ts = Date.now();
  header.apiid = key;
  header.Timestamp = ts;

  if (params) {

    let sortedKeys = _.sortBy(Object.keys(params), (key) => { return key; });
    let sortedParams = "";

    _.each(sortedKeys, (key) => {
      sortedParams = sortedParams.concat(key).concat(params[key]);
    });

    //console.log(sortedParams);

    header.Sign = encryptMD5(key + ts + sortedParams + secret);
  } else {
    header.Sign = encryptMD5(key + ts + secret);
  }

  return header;
}

function encryptMD5(str) {
  return crypto.createHash('MD5').update(str).digest("hex");
}


module.exports.getOrderBook = getOrderBook;
module.exports.getUserInfo = getUserInfo;
module.exports.placeOrder = placeOrder;
module.exports.getOrderById = getOrderById;

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
