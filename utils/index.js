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
	let day, month, year;
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	if (/^\d{4}-\d{2}-\d{2}$/.test(dbDateStr)) {
		// YYYY-MM-DD
		[year, month, day] = dbDateStr.split('-');
	} else if (/^\d{2}-\d{2}-\d{4}$/.test(dbDateStr)) {
		// DD-MM-YYYY
		[day, month, year] = dbDateStr.split('-');
	} else {
		// Fallback for other formats (like "November 2024" which is already formatted)
		return dbDateStr;
	}

	const monthName = months[parseInt(month) - 1];
	if (!monthName) return dbDateStr;
	return includeDay ? `${monthName} ${parseInt(day)}, ${year}` : `${monthName} ${year}`;
};