import express from 'express';
import aporooApi from '../api/aporooApi'
import exservice from '../services/exService'
import chalk from '../../node_modules/chalk';


const router = express.Router();
const ex = new exservice(aporooApi);
let tradePair = { token: 'AT', currency: 'BTC' };
let availableToken = 0;
let availableCurrency = 0;
let precision = 0.00000001;

setInterval(() => { ex.updateOrderbook(tradePair.token, tradePair.currency) }, 800); //update orderbook for latest bid/ask price
setInterval(()=>{
  ex.getOutstandingOrders(tradePair.token, tradePair.currency);

  //console.log(ex.outstandingOrders);
  if(ex.outstandingOrders && ex.outstandingOrders.length > 0){
    ex.outstandingOrders.forEach(order => {
      if(Date.now() - order.createTime  > 3000){
        ex.cancelOrder(tradePair.token, tradePair.currency, order.orderId);
      }
    });
  }
}, 3000)
// setInterval(() => {
//   ex.getFundBySymbol(tradePair.token).then((result) => { availableToken = result.amount; });
//   ex.getFundBySymbol(tradePair.currency).then((result) => { availableCurrency = result.amount });
// }, 10000); //check available trading funds

setInterval(() => {

  let sellPrice1 = ex.getBestBuyPrice(tradePair.token, tradePair.currency);
  let buyPrice1 = ex.getBestSellPrice(tradePair.token, tradePair.currency);
  let priceGap = sellPrice1.price / precision - buyPrice1.price / precision;
  let currentTs = Date.now();
  let tsGap = currentTs - sellPrice1.ts; //time lapse from the time orderbook was last updated
  let amount = 1;//Math.floor(Math.random() * (555 - 548) + 548); //set random order amount within range 30~80
  let AggresiveTrading = true; //trade for token commission, same buy/sell price
  let tradeDirection = 0; //sets to buy first or sell first for aggresive tradeing

  let latestOrder = ex.latestOrder;

  if (tsGap < 1000) { //only when latest price is within 1 second then proceed, otherwise there's issue updating current orderbooks
    if (AggresiveTrading) {
      if (priceGap > 2) { //only if there's depth safe net then trade

        let tradePrice = tradeDirection == 0 ? (sellPrice1.price / precision - 45) * precision : (buyPrice1.price / precision + 1) * precision;

        // if (availableToken > 0 && availableCurrency > 0) {

        //   let maxPurchasibleToken = availableCurrency / tradePrice;
        //   amount = availableToken < maxPurchasibleToken ? Math.floor(availableToken) : Math.floor(maxPurchasibleToken);

        //   console.log(`available token: ${availableToken} | max purchasible token:${maxPurchasibleToken} `)
        // }

        if (amount > 0) {
          ex.placeOrder(tradePair.token, tradePair.currency, tradeDirection, tradePrice, amount);
          setTimeout(() => {
            ex.placeOrder(tradePair.token, tradePair.currency, Math.abs(tradeDirection - 1), tradePrice, amount)
          }, 500);
        }else{
          console.log("No valid trade amount available");
        }

      }
      else {

        console.log("no price gap");
      }

    } else {
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
}, 5000);

module.exports = router;
