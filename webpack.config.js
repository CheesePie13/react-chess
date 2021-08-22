const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
	entry: "./src/index.tsx",
	output: {
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({template: "index.html"})
	],
	module: {
		rules: [
			{ test: /\.(ts|tsx)$/i, loader: "ts-loader" },
			{ test: /\.css$/i, use: ["style-loader", "css-loader"] },
			{ test: /\.s[ac]ss$/i, use: ["style-loader", "css-loader", "sass-loader"] },
			{ test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i, type: "asset" }
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	}
};

module.exports = (env, argv) => {
	if (argv.mode === "development") {
		config.devtool = "inline-source-map";
	}

	return config;
};
