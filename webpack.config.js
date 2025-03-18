const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    entry: './tests/react/App.jsx',
    output: {
      path: path.resolve(__dirname, 'benchmarks'),
      filename: 'react.js', 
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react'],
            },
          },
        },
      ],
    },
    devServer: {
      static: {
        directory: path.join(__dirname),
      },
      port: 3300,
      hot: true,
      open: true,
    },
    devtool: isProduction ? false : 'eval-source-map',
  };
};
