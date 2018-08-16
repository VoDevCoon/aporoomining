import express from 'express';
import aporooApi from '../api/aporooApi'
import exservice from '../services/exService'
import strategies from '../strategies'
import chalk from 'chalk';


const router = express.Router();
const ex = new exservice(aporooApi);
const tradePair = { token: 'AT', currency: 'BTC' };
const precision = 0.00000001;
const clearOrderInterval = 3000;
const tradeInterval = 2000;
const amount = 1; //Math.floor(Math.random() * (100 - 90) + 90); //set random order amount within range 30~80
const tradeDirection = 1; //sets to buy first or sell first for aggresive tradeing 0:sell 1:buy
let availableToken = 0;
let availableCurrency = 0;

//setInterval(() => { ex.updateOrderbook(tradePair.token, tradePair.currency) }, 800); //update orderbook for latest bid/ask price
ex.init().then(result => {
  if (result == true) {
    strategies.mining(ex, tradePair, precision, amount, tradeDirection, clearOrderInterval, tradeInterval);
  }
}).catch(err => { console.log(chalk.red(err)); });


module.exports = router;
