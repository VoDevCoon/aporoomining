import crypto from 'crypto';
import request from 'request-promise';
import _ from 'underscore';
import chalk from 'chalk';
import { aporoo } from '../config/api';

const keyname = 'Apiid';
const key = aporoo.key;
const secret = aporoo.secret;
const httpsAccountBaseUrl = "https://www.aporoo.com";
const httpsMarketBaseUrl = "https://ws.aporoo.com";

let markets = new Map();
let currencyList = new Map();
let commitInit = Promise.all([getMarkets(), getCurrencies()]); //initialize exchange static data

//retrieve all market info
function getMarkets() {
  return new Promise((resolve, reject) => {
    let result = { action: 'getting markets', success: false };
    request({
      method: "GET",
      uri: httpsAccountBaseUrl + "/exchange/config/controller/website/marketcontroller/getByWebId",
      json: true
    }).then((res) => {
      let data = res.datas;
      data.forEach(market => {
        markets.set(market.name.toUpperCase(), market.marketId);
      });

      if (markets.size > 0) {
        result.success = true;
        resolve(result);
      } else {
        reject(result.action);
      }

    }).catch((err) => { reject(err.message) });
  });
}

//retrieve all currency info
function getCurrencies() {
  let result = { action: 'getting currencies', success: false };
  return new Promise((resolve, reject) => {
    request({
      method: "POST",
      uri: httpsAccountBaseUrl + "/exchange/config/controller/website/currencycontroller/getCurrencyList",
      json: true
    }).then((res) => {
      let data = res.datas;
      data.forEach(currency => {
        let _currency = {
          currencyName: currency.name.toUpperCase(),
          currencyId: currency.currencyId,
          precision: currency.defaultDecimal
        };
        currencyList.set(~~_currency.currencyId, _currency);
      });

      if (currencyList.size > 0) {
        result.success = true;
        resolve(result);
      } else {
        reject(result.action);
      }

    }).catch((error) => { reject(error.message) });
  });
}

let getCurrentFunds = function () {

  let params = {
    "pageSize": 30,
    "pageNum": 1
  }

  return request({
    method: "POST",
    uri: httpsAccountBaseUrl + "/exchange/fund/controller/website/fundcontroller/findbypage",
    body: params,
    json: true,
    headers: getPostHeader(params)
  }).then((data) => {

    let currentFunds = new Map();
    data.datas.list.forEach((fund) => {

      let currencyName = currencyList.get(fund.currencyTypeId).currencyName;
      let _fund = {
        currencyName: currencyName,
        amount: fund.amount,
        freeze: fund.freeze
      };
      currentFunds.set(_fund.currencyName, _fund);
    });

    return currentFunds;
  }).catch(err => { console.log(err) });
}

let getOrderBook = function (token, currency) {

  let tradingPair = `${token}_${currency}`;
  let marketId = markets.get(tradingPair);

  let params = {
    marketId: marketId,
    marketName: tradingPair
  }

  return request({
    method: "GET",
    uri: httpsMarketBaseUrl + "/api/data/v1/entrusts",
    qs: params,
    json: true,
    headers: getGetHeader(params)
  }).then((data) => {
    if (data) {
      let rawOrderbook = data.datas;

      if (rawOrderbook) {

        let orderbook = {};
        orderbook.asks = rawOrderbook.asks.reverse();
        orderbook.bids = rawOrderbook.bids;
        orderbook.ts = Date.now();//rawOrderbook.timestamp;
        orderbook.pair = `${token}_${currency}`;

        //console.log(`orderbook: asks ${orderbook.asks[0]} bids ${orderbook.bids[0]} ts ${orderbook.ts}`);
        return orderbook;
      }
      else {
        console.log('no data');
      }
    }
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

    return request({
      method: "POST",
      uri: httpsAccountBaseUrl + "/exchange/entrust/controller/website/EntrustController/addEntrust",
      body: params,
      json: true,
      headers: getPostHeader(params)
    }).then((res) => {
      //console.log(res);
      return res.datas;
    }).catch((err) => { console.log(err.statusCode); });
  }
}

let getOutstandingOrders = function (token, currency) {

  let market = markets.get(`${token}_${currency}`);
  let params = {
    "marketId": market
  }

  return request({
    method: "GET",
    uri: httpsAccountBaseUrl + "/exchange/entrust/controller/website/EntrustController/getUserEntrustRecordFromCache",
    qs: params,
    json: true,
    headers: getGetHeader(params)
  }).then((res) => {
    if (res.datas && res.datas.length > 0) {
      let orders = [];
      res.datas.forEach((order) => {
        orders.push({
          orderId: order.entrustId,
          createTime: order.createTime
        })
      });
      return orders;
    } else {
      console.log(chalk.green("No outstanding orders."));
    }
  }).catch((err) => { console.log(err) });
}

let getOrderById = function (token, currency, orderId) {

  let marketId = markets.get(`${token}_${currency}`);

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

      // getOrderById(token, currency, res.datas.entrustId).then(
      //   (result) => {
      //     let order = {
      //       id: result.datas.entrustId,
      //       amount: result.datas.amount,
      //       type: result.datas.entrustType,
      //       price: result.datas.price,
      //       completeAmount: result.datas.completeAmount,
      //       market: result.datas.marketId
      //     }
      //     resolve(order);
      //   }
      // );
    }).catch((err) => { reject(err.statusCode); });
  });
}

let cancelOrderById = function (token, currency, orderId) {
  if (markets.size > 0) {

    let market = markets.get(`${token}_${currency}`);
    let params = {
      "entrustId": orderId,
      "marketId": market
    }

    return request({
      method: "POST",
      uri: httpsAccountBaseUrl + "/exchange/entrust/controller/website/EntrustController/cancelEntrust",
      body: params,
      json: true,
      headers: getPostHeader(params)
    }).then((res) => {
      if (res.resMsg.code == 1) {
        console.log(chalk.red(`order ${orderId} cancelled`));
      } else {
        console.log(chalk.yellow(`There's error cancelling order ${orderId}`));
      }
    }).catch((err) => { console.log(err.statusCode); });
  }
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

module.exports.commitInit = commitInit;
module.exports.getOrderBook = getOrderBook;
module.exports.getUserInfo = getUserInfo;
module.exports.getCurrentFunds = getCurrentFunds;
module.exports.getOutstandingOrders = getOutstandingOrders;
module.exports.placeOrder = placeOrder;
module.exports.getOrderById = getOrderById;
module.exports.cancelOrderById = cancelOrderById

// order book
// { asks:
//    [ [ '0.00009', '6352.85' ],
//               ...
//      [ '0.001', '197.51' ] ],
//   bids:
//    [ [ '0.000087', '51974.14' ],
//               ...
//      [ '0.000001', '1287719.05' ] ],
//   ts: ,
//   pair: 'AT_ETH' }
