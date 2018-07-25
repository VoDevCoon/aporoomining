class ExService {
  constructor(exapi){
    this.exapi = exapi;
  }

  getBestBuyPrice (token, currency){
    console.log('in service');
    let a = new Object()
    this.exapi.getOrderBook(token, currency, 10).then(result=>{
       a = result.asks[0];
    }).then(()=>{return a;});
  }

  async getBestSellPrice (token, currency){
    let orderbook = await this.exapi.getOrderBook(token, currency, 10);
    return orderbook.ask[0];
  }
}
module.exports = ExService;
