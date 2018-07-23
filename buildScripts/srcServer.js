import express from 'express';
import open from 'open';
import path from 'path'
import webpack from 'webpack';
import config from '../webpack.config.dev'

const app = express();
const port = 3000;
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname, '../src/index.html'));
});

app.listen(port, function(err){
  if (err){
    console.log(err)
  }else{
    open('http://localhost:' + port);
  }
});

// let exService = exService();
// let token = "at";
// let currency = "eth";




