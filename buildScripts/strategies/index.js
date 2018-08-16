module.exports = {

  /*
  *
  */
  mining: function (ex, tradePair, precision, amount, tradeDirection, clearOrderInterval, tradeInterval) {

    setInterval(() => {

      ex.getOutstandingOrders(tradePair.token, tradePair.currency);

      //console.log(ex.outstandingOrders);
      if (ex.outstandingOrders && ex.outstandingOrders.length > 0) {
        ex.outstandingOrders.forEach(order => {
          if (Date.now() - order.createTime > 3000) {
            ex.cancelOrder(tradePair.token, tradePair.currency, order.orderId);
          }
        });
      }
    }, clearOrderInterval);


    setInterval(() => {
      ex.getOrderbookRT(tradePair.token, tradePair.currency).then((orderbook) => {
        if (orderbook) {

          let buyPrice1 = {};
          buyPrice1.price = orderbook.bids[0][0];
          buyPrice1.depth = orderbook.bids[0][1];
          buyPrice1.ts = orderbook.ts;


          let sellPrice1 = {};
          sellPrice1.price = orderbook.asks[0][0];
          sellPrice1.depth = orderbook.asks[0][1];
          sellPrice1.ts = orderbook.ts;

          let priceGap = sellPrice1.price / precision - buyPrice1.price / precision;
          let currentTs = Date.now();
          let tsGap = currentTs - sellPrice1.ts; //time lapse from the time orderbook was last updated

          if (tsGap < 1000) { //only when latest price is within 1 second then proceed, otherwise there's issue updating current orderbooks

            if (priceGap > 2) { //only if there's depth safe net then trade

              let tradePrice = tradeDirection == 0 ? (sellPrice1.price / precision - 1) * precision : (buyPrice1.price / precision + 1) * precision;
              //use middle price
              //let tradePrice = tradeDirection == 0 ? (sellPrice1.price / precision - Math.floor(priceGap/2)) * precision : (buyPrice1.price / precision + Math.floor(priceGap/2)) * precision;

              if (amount > 0) {
                ex.placeOrder(tradePair.token, tradePair.currency, tradeDirection, tradePrice, amount);
                setTimeout(() => {
                  ex.placeOrder(tradePair.token, tradePair.currency, Math.abs(tradeDirection - 1), tradePrice, amount)
                }, 100);
              } else {
                console.log("No valid trade amount available");
              }

            }
            else {

              console.log("no price gap");
            }
          }
        }
      });
    }, tradeInterval);
  },

  snatchingTheGap: function (ex, tradePair, precision, amount, boundaryAmount, checkInterval) {
    //TODO:
    //if no buy/sell order, place order
    //else
    //update sell/buy order
    //params: buy/sell boundary, latest buy/sell price and amount, current buy/sell order price and amount
    //to update sell: if latest sell price < sell order, update to new smaller sell price untill boudnary
    //if same and latest sell amount = left order amount, move up price
    //to update buy: if latest buy price  > buy order, update to new bigger buy price untill boundary
    //if same and latest buy amount = left order amount, move down price


    //trade for profit

    let testamount = 1000;
    if (!latestOrder) {

      console.log("place initial order");
      ex.placeOrder(tradePair.token, tradePair.currency, 0, sellPrice1.price, testamount);
    }
    else {


      //console.log(latestOrder);
      ex.updateLatestOrder(tradePair.token, tradePair.currency, latestOrder.id);

      let orderAmountLeft = ~~latestOrder.amount - ~~latestOrder.completeAmount;

      let lastPrice = latestOrder.price;
      if (orderAmountLeft > 0) {
        console.log(`order ${latestOrder.id} not completed, order amount left: ${orderAmountLeft}`);
      } else {
        if (latestOrder.type == 0) {
          console.log(`sell order ${latestOrder.id} is completed, place new buy order, buy@${lastPrice}`);
          ex.placeOrder(tradePair.token, tradePair.currency, 1, lastPrice, testamount);
        } else {
          console.log(`buy order ${latestOrder.id} is completed, place new sell order, sell@${lastSellPrice}`);
          ex.placeOrder(tradePair.token, tradePair.currency, 0, lastPrice, testamount);
          //ex.placeOrder('AT', 'ETH', 0, sellPrice1.price, testamount);
        }
      }
    }
  }
}

