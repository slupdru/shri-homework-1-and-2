/* global require, process, module, __dirname */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
const inProduction = process.env.NODE_ENV === 'production';

const plugins = [
  new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
  }),
];
let optimization={};
if (inProduction) {
  optimization = {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true,
        },
        sourceMap: true,
      }),
    ],
  };
}

module.exports = {
  plugins,
  optimization,
  watch: !inProduction,
  devtool: !inProduction && 'source-map',
  entry: {
    main: './ts/mainPage/main.ts',
    video: './ts/videoPage/video.ts',
},
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': `${__dirname}`,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer({
                    browsers: [
                      '> 1%',
                      'last 4 version',
                      'not ie <= 8',
                    ],
                  }),
                ],
              },
            },
            'sass-loader',
          ],
        },
      {
        test: /\.(png|svg|jpg|gif)$/,
        include: path.join(__dirname, '/images'),
        exclude: /(node_modules)/,
        loader: 'url-loader',
    },
    ],
  },
};
