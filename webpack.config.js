
/**
 * Dependencies
 */

const watch = process.env.WATCH ? Boolean(process.env.WATCH) : false;
const brand = process.env.BRAND;
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const TerserPlugin = require('terser-webpack-plugin');
const fsx = require('fs-extra');

/**
 * Input/Output file paths
 */
var outputFileName = '[name]/[name].min.js';
var sourceMapOutputFileName = '[name]/[name].map';

const entryConfig = {
  // All background scripts
  background: "./src/background.ts",
  popup: "./src/popup.tsx"
};

module.exports = {
  watch: watch,
  plugins: [
    new NodePolyfillPlugin()
  ],
  mode: 'development',
  optimization: {
    moduleIds: 'named',
    minimize: false,
    minimizer: [
      new TerserPlugin(
        {
          cache:         true,
          parallel:      true,
          sourceMap:     false, // Must be set to true if using source-maps in production
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          terserOptions: {
            extractComments: (astNode, comment) => { return false },
            output: {
              comments: false,
            }
          }
        }
      ),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/, // Only pull in modules from node_modules
          name: 'vendor',
          minChunks: 2, // Module must be used by at least 2 entry points before being included
          chunks: 'all', // Include all module types
          priority: 2 // Prioritise putting modules in 'vendor' over 'shared'
        },
        shared: {
          name: 'shared',
          minChunks: 2, // Module must be used by at least 2 entry points before being included
          chunks: 'all', // Include all module types
          priority: 1, // Prioritise putting modules in 'vendor' over 'shared'
          reuseExistingChunk: true
        }
      }
    }
  },
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules\/(?!ext-framework)/
  },
  entry: entryConfig,
  devtool: 'inline-source-map',
  output:       {
    path:              `${__dirname}/public/js` ,
    filename:          outputFileName,
    sourceMapFilename: sourceMapOutputFileName
  },
  resolve:      {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  externals:    {
    "jquery": "jQuery",
    //    "react": "React",
    //    "react-dom": "ReactDOM"
  },
  module:       {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },

      // .scss files
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                    {
                      // Options
                    },
                  ],
                  [
                    'postcss-pxtorem',
                    {
                      rootValue: 15,
                      propList: [
                        'font',
                        'font-size',
                        'line-height',
                        'letter-spacing',
                        'margin',
                        'margin-top',
                        'margin-bottom',
                        'margin-left',
                        'margin-right',
                        'padding',
                        'padding-top',
                        'padding-bottom',
                        'padding-left',
                        'padding-right',
                        'height',
                        'width',
                        'right',
                        'left',
                        'top',
                        'bottom',
                        'min-height',
                        'max-height',
                        'min-width',
                        'max-width',
                      ],
                      exclude: /src\/app\/background\/InjectableContent/
                    },
                  ],
                ],
              },
            },
          },
          {
            loader: "sass-loader",
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                './node_modules/ext-framework/src/scss/mixin/mixins.scss',
                './node_modules/ext-framework/src/scss/_shared-settings.scss',
                './src/brands/' + process.env.BRAND + '/settings.scss' // Include scss overrides for React components
              ]
            },
          }
        ]
      },
      // .css files
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ]
      },

      // images
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              publicPath: '/app/img',
              outputPath: 'img',
            },
          },
        ],
      },
      // SVGs
      {
        test: /\.svg$/,
        use: [
          '@svgr/webpack', 'file-loader'
        ],
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  }
};
