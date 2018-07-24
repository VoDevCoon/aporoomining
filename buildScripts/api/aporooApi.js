import socket from 'ws';
import chalk from 'chalk'

//onst ws = new socket('wss://ws.aporoo.com/websocket');
const ws = new socket('wss://stream.binance.com:9443/ws/bnbzil@aggTrade');

let AporooApi = {
  query : function(action, token, currency){

    ws.on('open', function(){
        //ws.send(JSON.stringify({"dataType":"90_ENTRUST_ADD_AT_USDT","dataSize":20,"action":"ADD"}  ));
        console.log(chalk.yellow("open"));
    });

    ws.on('message',function(data){
      console.log('received: ' + data);
    });
  }
}

module.exports = AporooApi;
