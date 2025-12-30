const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('css-minimizer-webpack-plugin');
const  { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const{CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = env => {
	return {
		mode: env && env.build === 'true' ? "production" : "development",
		entry: {
			home: "./public/javascript/home.js",
			enqueryform:"./public/javascript/enqueryform.js",
			admin:"./public/javascript/admin.js",
			about: "./public/javascript/about.js",
			assetsalesupload :"./public/javascript/assetsalesupload.js",
			assetsForSale:"./public/javascript/assetsForSale.js",
			connect:"./public/javascript/connect.js",
			grievance: "./public/javascript/grievance.js",
			login:"./public/javascript/login.js",
			policyupload: "./public/javascript/policyupload.js",
			policy: "./public/javascript/policy.js",
			ourbusiness: "./public/javascript/ourbusiness.js"
		  
		},
		output: {
			path: path.resolve(__dirname, "public/bundle"),
			publicPath: '/bundle/',
			filename: env && env.build === 'true' ? "[name]-[hash].js" : "[name].js",
		},
		module: {
			rules: [{
					test: [/.js$/],
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env'
							]
						}
					}
				},
				{
					test: /\.(png|svg|jpg|gif|mp4|pdf)$/,
					use: [
						'file-loader'
					]
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/,
					use: [
						'file-loader'
					]
				},
				{
					test: /\.(css)$/,
					use: [MiniCssExtractPlugin.loader, 'css-loader']
				},
			]
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].css'
			}),
			new CopyWebpackPlugin({
				patterns: [{
					from: 'public/images/',
					to: 'assets/images'
				}]
			}),
		new CleanWebpackPlugin(),
			new WebpackManifestPlugin({
				basePath: '/bundle/'
			}),
			new OptimizeCSSAssetsPlugin(),
		],
	}
};