import http from 'http';

let ExService = {
  getBuyPrice: function (token, currency, exApi) {
    let data = exApi.query('buy', token, currency);
    //let data =  http.request(api);
    //let price = await exApi.processResult('buyprice', data);

    return data;
    }
  }
module.exports = ExService;
