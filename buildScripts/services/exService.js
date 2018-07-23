import http from 'http';
import exApi from '../api/aprooApi'

let http = http();
let exApi = exApi();

let getBuyPrice = function (token, currency, exconfig, function(err) {

    if (err) {
        console.log(err);
    }
    else {
        let api = exApi.query('buy', token, currency);
        let data = await http.request(api);
        let price = await exApi.processResult('buyprice', data);

        return price;
    }
});
