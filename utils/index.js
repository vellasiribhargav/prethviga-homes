const manifest = require("../public/bundle/manifest.json"),
	Promise = require("bluebird"),
	multiparty = require("multiparty");

exports.assetPath = path => {
	return manifest[path] ? manifest[path] : path;
};

exports.getFiles = (req) => {
	return new Promise((resolve) => {
			var form = new multiparty.Form();

			form.parse(req, (err, fields, files) => {
					resolve([fields, files]);
			});
	});
};