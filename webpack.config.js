const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');

const config = {
        context: path.resolve(__dirname, 'src', 'js'),
        entry: {
            content: './Content.js',
            background: './Background.js',
            popup: './PopupPage.js'
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, 'src'),
                    // exclude: /(node_modules|bower_components)/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['es2015', {modules: false}]
                            ]
                        }
                    }]
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        },
        resolve: {
            alias: {
                content: path.resolve(__dirname, 'src/js/content'),
                background: path.resolve(__dirname, 'src/js/background'),
                shared: path.resolve(__dirname, 'src/js/shared'),
                'text-analysis': path.resolve(__dirname, 'src/js/text-analysis')
            },
            modules: ['node_modules'],
            extensions: [".js"]
        },
        devServer: {
            contentBase: path.resolve(__dirname, 'dist'),
            port: 3333,
        },
        plugins: [
            new HtmlPlugin({
                title: 'Popup',
                filename: 'popup.html',
                template: path.join(__dirname, 'src/html', 'popup.html'),
                chunks: ['popup']
            })
        ]
        ,
        node: {
            fs: "empty"
        }
    }
    ;

module.exports = config;