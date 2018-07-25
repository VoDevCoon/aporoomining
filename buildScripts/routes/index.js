import express from 'express';
import exapi from '../api/aporooApi'
import exservice from '../services/exService'
import chalk from '../../node_modules/chalk';


const router = express.Router();
const ex = new exservice(exapi);

console.log(chalk.green(ex.getBestBuyPrice('AT','ETH')));
//console.log(chalk.green(ex.getBestSellPrice()));

// router.get('/', function(req, res){
//   let data = ex.getBuyPrice('eth', 'usdt', api);
//   res.json(data);
// });

module.exports = router;
