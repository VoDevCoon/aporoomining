import socket from 'ws';
import chalk from 'chalk'

const ws = new socket('wss://ws.aporoo.com/websocket');
//const ws = new socket('wss://stream.binance.com:9443/ws/zileth@depth20');

let AporooApi = {
  query : function(action, token, currency){

    ws.on('open', function(){
        ws.send(JSON.stringify({"dataType":"482_ENTRUST_ADD_AT_ETH","dataSize":50,"action":"ADD"}  ));
        console.log(chalk.yellow("open"));
    });

    ws.on('message',function(data){
      console.log('received: ' + data);
    });
  }
}

module.exports = AporooApi;
