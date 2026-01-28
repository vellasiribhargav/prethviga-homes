const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = env => {
	return {
		mode: env && env.build === 'true' ? "production" : "development",
		entry: {
			// client entries
			home: "./public/javascript/home.js",
			OnGoingPage: "./public/javascript/OnGoingPage.js",
			ProjectPage: "./public/javascript/ProjectPage.js",
			discoverUs: "./public/javascript/discoverUs.js",

			// Admin entries
			upcoming: "./public/javascript/admin/upcoming.js",
			upcoming_projects: "./public/javascript/admin/upcoming_projects.js",
			gallery: "./public/javascript/admin/gallery.js",
			completed: "./public/javascript/admin/completed.js",
			banner: "./public/javascript/admin/banner.js",
			blog: "./public/javascript/admin/blog.js",
			contacts_list: './public/javascript/admin/contacts_list.js',
			login: './public/javascript/admin/login.js'
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