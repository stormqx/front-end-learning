/**
 * Created by qixin on 07/12/2016.
 */

var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports ={

    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './src/index.jsx'
    ],
    module: {
        loaders:[{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'react-hot!babel'
        },{
            test: /\.css$/,
            loader: 'style!css!postcss'
        }]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    pludges: [
        new webpack.HotModuleReplacementPlugin()
    ],
    postcss: function () {
        return [autoprefixer];
    }
};