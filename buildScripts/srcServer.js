import express from 'express';
import open from 'open';
import path from 'path'
import webpack from 'webpack';
import config from '../webpack.config.dev'
import routes from './routes/index';

const app = express();
const port = 3000;
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use('/', routes);

app.listen(port, function(err){
  if (err){
    console.log(err)
  }else{
    open('http://localhost:' + port);
  }
});




