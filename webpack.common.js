const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    // Membersihkan direktori 'dist' sebelum setiap build baru
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext][query]',
        },
      }, // Loader untuk CSS 
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },// Loader untuk JavaScript dengan Babel 
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: 'public', // Akan disalin ke 'dist/public/'
        },
         {
          from: path.resolve(__dirname, 'src/scripts/pages'),
          to: 'pages', // Akan disalin ke 'dist/pages/'
          globOptions: {
            ignore: ['**/*.js'], // Abaikan file JS karena sudah di-bundle  babel
          },
          noErrorOnMissing: true,
        },{
          // membuat manifest.json ke root direktori output
          from: path.resolve(__dirname, 'src/public/manifest.json'),
          to: 'manifest.json', // Akan menjadi 'dist/manifest.json'
          noErrorOnMissing: true,
        },
        {
          // Menyalin service worker ke root direktori output
          from: path.resolve(__dirname, 'src/sw.js'),
          to: 'sw.js', // Akan menjadi 'dist/sw.js'
          noErrorOnMissing: true,
        },
      ],
    }),
    new InjectManifest({
        swSrc: path.resolve(__dirname, 'src/sw-source.js'), // Path ke file source SW 
        swDest: 'sw.js', // file Service Worker output di direktori 'dist'
    }),
  ],
};
