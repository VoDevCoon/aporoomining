import express from 'express';
import api from '../api/aporooApi'
import ex from '../services/exService'


const router = express.Router();

router.get('/', function(req, res){
  let data = ex.getBuyPrice('eth', 'usdt', api);
  res.json(data);
});

module.exports = router;
