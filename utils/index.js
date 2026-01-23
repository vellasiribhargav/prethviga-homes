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

exports.formatDate = (dateString) => {
	if (!dateString) return '';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

exports.formatDateForDisplay = (dbDateStr, includeDay = false) => {
	if (!dbDateStr || typeof dbDateStr !== 'string') return dbDateStr;
	const parts = dbDateStr.split('-');
	if (parts.length !== 3) return dbDateStr;
	const [day, month, year] = parts;
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const monthName = months[parseInt(month) - 1];
	if (!monthName) return dbDateStr;
	return includeDay ? `${monthName} ${day}, ${year}` : `${monthName} ${year}`;
};