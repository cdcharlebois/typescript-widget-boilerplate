const pkg = require('./package.json');
const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const copyArray = [
    { from: "src/**/*.js" },
    { from: "src/**/*.xml" }
];

if (pkg.widget.preview) {
    copyArray.push({ from: pkg.widget.preview, to: `src/${pkg.widget.name}/widget/preview.png` });
}

const config = {
    entry: `./src/${pkg.widget.name}/widget/${pkg.widget.name}.ts`,
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `src/${pkg.widget.name}/widget/${pkg.widget.name}.js`,
        libraryTarget: "amd"
    },
    resolve: {
        extensions: [ ".ts", ".js", ".json" ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        { loader: "css-loader" },
                        { loader: "sass-loader" }
                    ]
                })
            }
        ]
    },
    devtool: "source-map",
    externals: [ /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new CopyWebpackPlugin(copyArray, {
            copyUnmodified: true
        }),
        new ExtractTextPlugin({
            filename: `./src/${pkg.widget.name}/widget/ui/${pkg.widget.name}.css` }),
            new webpack.LoaderOptionsPlugin({
                debug: true
            })
    ]
};

module.exports = config;
