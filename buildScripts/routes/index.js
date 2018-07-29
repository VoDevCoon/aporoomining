import express from 'express';
import aporooApi from '../api/aporooApi'
import exservice from '../services/exService'
import chalk from '../../node_modules/chalk';


const router = express.Router();
const ex = new exservice(aporooApi);

setInterval(() => { ex.updateOrderbook('AT', 'ETH') }, 500);
setInterval(() => {
  let price = ex.getBestBuyPrice('AT', 'ETH').price;
  if (price) {
    ex.placeOrder('AT', 'ETH', 0, price, 1);
    ex.placeOrder('AT', 'ETH', 1, price, 1);
  }
}, 10000);


module.exports = router;
