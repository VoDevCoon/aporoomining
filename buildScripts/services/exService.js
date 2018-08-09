import chalk from 'chalk';

class ExService {
  constructor(api) {
    this.api = api;
    this.currentOrderbooks = new Map();
    this.latestOrder = null;
    this.outstandingOrders = null;
  }

  updateOrderbook(token, currency) {
    this.api.getOrderBook(token, currency).then((result) => {
      this.currentOrderbooks.set(result.pair, result);
      //console.log(this.currentOrderbooks);
    }).catch((err) => { console.log(`updateorderbook ${err}`) });
  }

  getFundBySymbol(token) {
    return this.api.getCurrentFunds().then((result) => {
      return result.get(token);
    }).catch((err) => { console.log(`getfundbysymbol ${err}`) });
  }

  getOrderbookRT(token, currency){
    return this.api.getOrderBook(token, currency);
  }

  getBestBuyPrice(token, currency) {

    let bestBuy = {};
    let pair = `${token}_${currency}`
    let orderbook = this.currentOrderbooks.get(pair);

    if (orderbook) {
      bestBuy.price = orderbook.asks[0][0];
      bestBuy.depth = orderbook.asks[0][1];
      bestBuy.ts = orderbook.ts;
    }

    return bestBuy;
  }

  getBestBuyPriceRT(token, currency) {
    return new Promise((resolve, reject) => {
      this.api.getOrderBook(token, currency).then((orderbook) => {
        //console.log("order book: " + orderbook);
        if (orderbook) {
          let bestBuy = {};
          bestBuy.price = orderbook.asks[0][0];
          bestBuy.depth = orderbook.asks[0][1];
          bestBuy.ts = orderbook.ts;

          resolve(bestBuy);
        } else {
          reject("no orderbook")
        }
      });
    });
  }

  getBestSellPrice(token, currency) {

    let bestSell = {};
    let pair = `${token}_${currency}`
    let orderbook = this.currentOrderbooks.get(pair);

    if (orderbook) {
      bestSell.price = orderbook.bids[0][0];
      bestSell.depth = orderbook.bids[0][1];
      bestSell.ts = orderbook.ts;
    }

    return bestSell;
  }

  getBestSellPriceRT(token, currency) {
    return new Promise((resolve, reject) => {
      this.api.getOrderBook(token, currency).then((orderbook) => {
        //console.log("order book: " + orderbook);
        if (orderbook) {
          let bestSell = {};
          bestSell.price = orderbook.bids[0][0];
          bestSell.depth = orderbook.bids[0][1];
          bestSell.ts = orderbook.ts;

          resolve(bestSell);
        } else {
          reject("no orderbook")
        }
      });
    });
  }

  getOutstandingOrders(token, currency) {
    this.api.getOutstandingOrders(token, currency).then((result) => {
      this.outstandingOrders = result;
    }).catch((err) => { console.log(`getoutstandingorder ${err}`) });
  }

  placeOrder(token, currency, type, price, amount){

    this.api.placeOrder(token, currency, type, price, amount).then((res)=>{
      console.log(`order placed: ${token}_${currency}, ${type}, ${price} ${amount}, ${Date.now()}, ${res.entrustId}`);
    }).catch((err)=>{console.log(`placeorder ${err}`)});
  }

  cancelOrder(token, currency, orderId) {
    this.api.cancelOrderById(token, currency, orderId).then((result) => {
      //console.log(result);
    }).catch((err) => { console.log(`cancelorder ${err}`) });
  }

  updateLatestOrder(token, currency, orderId) {
    this.api.getOrderById(token, currency, orderId).then((result) => {
      //console.log(result);
      this.latestOrder.completeAmount = result.datas.completeAmount;
    }).catch((err) => { console.log(JSON.parse(err.error)); });
  }
}

module.exports = ExService;
