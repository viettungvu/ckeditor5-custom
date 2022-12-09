'use strict';
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const path = require('path');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
    mode: 'production',
    entry: {
        app: './src/app.js',
    },
    plugins:[
        new CKEditorWebpackPlugin( {
            // The main language that will be built into the main bundle.
            language: 'vi',

            // Additional languages that will be emitted to the `outputDirectory`.
            // This option can be set to an array of language codes or `'all'` to build all found languages.
            // The bundle is optimized for one language when this option is omitted.
            additionalLanguages: 'all',

            // For more advanced options see https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-webpack-plugin.
        } ),
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'ckeditor5.bundle.js',
        library: 'CKEditor',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                format: {
                  comments: false,
                },
            },
            extractComments: false,
        })],
      },
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: ['raw-loader']
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            injectType: 'singletonStyleTag',
                            attributes: {
                                'data-cke': true
                            }
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: styles.getPostCssConfig({
                                themeImporter: {
                                    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                                },
                                minify: true
                            })
                        }
                    }
                ]
            },
        ]
    },
    // Useful for debugging.
    devtool: 'source-map',

    // By default webpack logs warnings if the bundle is bigger than 200kb.
    performance: { hints: false }
};