import chalk from 'chalk';

class ExService {
  constructor(api) {
    this.api = api;
    this.currentOrderbooks = new Map();
  }

  updateOrderbook(token, currency) {
    try {
      this.api.getOrderBook(token, currency).then(result => {
        this.currentOrderbooks.set(result.pair, result);
      });
    } catch (error) {
      console.error(`Error updating orderbook: ${error}`);
    }
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

  placeOrder(token, currency, type, price, amount){
    //this.api.getUserInfo();
    this.api.placeOrder(token, currency, type, price, amount);
  }
}

module.exports = ExService;
