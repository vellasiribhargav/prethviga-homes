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

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

exports.formatDate = (dateString, format = 'MMMM D, YYYY') => {
	if (!dateString) return '';
	const date = dayjs(dateString);
	if (!date.isValid()) return dateString;
	return date.format(format);
};

exports.formatDateForDisplay = (dbDateStr, includeDay = false) => {
	if (!dbDateStr) return '';

	let date;
	if (dbDateStr instanceof Date) {
		date = dayjs(dbDateStr);
	} else if (typeof dbDateStr === 'string') {
		// Try parsing common formats
		const formats = ['YYYY-MM-DD', 'DD-MM-YYYY', 'ISO 8601'];
		date = dayjs(dbDateStr, formats);
	} else {
		return dbDateStr;
	}

	if (date.isValid()) {
		return includeDay ? date.format('DD ddd MMM YYYY HH:mm') : date.format('MMMM YYYY');
	}

	return dbDateStr;
};

exports.formatDateShort = (dbDateStr) => {
	if (!dbDateStr) return '';
	let date;
	if (dbDateStr instanceof Date) {
		date = dayjs(dbDateStr);
	} else if (typeof dbDateStr === 'string') {
		date = dayjs(dbDateStr);
	} else {
		return dbDateStr;
	}
	if (!date.isValid()) return dbDateStr;
	return date.format('DD MMM...');
};