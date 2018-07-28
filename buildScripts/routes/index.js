import express from 'express';
import aporooApi from '../api/aporooApi'
import exservice from '../services/exService'
import chalk from '../../node_modules/chalk';


const router = express.Router();
const ex = new exservice(aporooApi);

setInterval(()=>{ex.updateOrderbook('AT', 'ETH')}, 500);
setInterval(()=>{
  console.log(chalk.red(JSON.stringify(ex.getBestBuyPrice('AT','ETH'))));
  console.log(chalk.green(JSON.stringify(ex.getBestSellPrice('AT','ETH'))));
}, 1000);

module.exports = router;
