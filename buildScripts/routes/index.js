import express from 'express';
import aporooApi from '../api/aporooApi'
import exservice from '../services/exService'
import chalk from '../../node_modules/chalk';


const router = express.Router();
const ex = new exservice(aporooApi);
let AgressiveTrading = false;

setInterval(() => { ex.updateOrderbook('AT', 'ETH') }, 500); //update orderbook for latest bid/ask price
setInterval(() => {

  let precision = 0.000001;
  let sellPrice1 = ex.getBestBuyPrice('AT', 'ETH');
  let buyPrice1 = ex.getBestSellPrice('AT', 'ETH');
  let priceGap = sellPrice1.price / precision - buyPrice1.price / precision;
  let tsGap = sellPrice1.ts - buyPrice1.ts >= 0 ? sellPrice1.ts - Date().now : buyPrice1 - Date().now; //time lapse from the time orderbook was last updated
  let amount = Math.floor(Math.random() * (80 - 30) + 30); //set random order amount within range 30~80

  if (priceGap >= 2 && tsGap < 1000) {
    //trade for token commission
    let tradePrice = (sellPrice1.price / precision - 1) * precision;
    ex.placeOrder('AT', 'ETH', 0, tradePrice, amount);
    ex.placeOrder('AT', 'ETH', 1, tradePrice, amount);
  } else if (AgressiveTrading) {
    //trade for unlocking token with loss
    ex.placeOrder('AT', 'ETH', 0, buyPrice1.price, amount);
    ex.placeOrder('AT', 'ETH', 1, sellPrice1.price, amount);
  } else {
    //trade for profit
    let latestOrder = ex.latestOrder;

    if (!latestOrder) {

      console.log("place initial order");
      ex.placeOrder('AT', 'ETH', 0, sellPrice1.price, 1);
    }
    else {

      ex.updateLatestOrder();

      let orderAmountLeft = ~~latestOrder.amount - ~~latestOrder.completedAmount;
      if (orderAmountLeft > 0 ) {
        console.log(`order ${latestOrder.id} not completed, order amount left: ${orderAmountLeft}`);
      } else {
        if (latestOrder.type == 0) {
          console.log(`sell order ${latestOrder.id} is completed, place new buy order`);
          ex.placeOrder('AT', 'ETH', 1, buyPrice1.price, 1);
        } else {

          console.log(`buy order ${latestOrder.id} is completed, place new sell order`);
          ex.placeOrder('AT', 'ETH', 0, sellPrice1.price, 1);
        }
      }
    }
  }

}, 6000);


module.exports = router;
