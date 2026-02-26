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
		date = dbDateStr;
	} else if (typeof dbDateStr === 'string') {
		// Check if it's DD-MM-YYYY format
		if (/^\d{2}-\d{2}-\d{4}$/.test(dbDateStr)) {
			const [day, month, year] = dbDateStr.split('-');
			date = new Date(year, month - 1, day);
		} else {
			date = new Date(dbDateStr);
		}
	} else {
		return dbDateStr;
	}

	if (date && !isNaN(date.getTime())) {
		return includeDay ? date.toString() : dayjs(date).format('MMMM YYYY');
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
	return date.format('DD ddd MMM YYYY HH:mm');
};

exports.formatDateShortSimple = (dbDateStr) => {
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

exports.formatDateMonthYear = (dbDateStr) => {
	if (!dbDateStr) return '';

	// If already in "Month Day, Year" format, return as is
	if (typeof dbDateStr === 'string' && /^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(dbDateStr)) {
		return dbDateStr;
	}

	let date;
	if (dbDateStr instanceof Date) {
		date = dayjs(dbDateStr);
	} else if (typeof dbDateStr === 'string') {
		// Try DD-MM-YYYY and D-M-YYYY formats first (used by admin panel)
		const ddmmyyyy = dayjs(dbDateStr, 'DD-MM-YYYY', true);
		const dmmyyyy = dayjs(dbDateStr, 'D-M-YYYY', true);
		if (ddmmyyyy.isValid()) {
			date = ddmmyyyy;
		} else if (dmmyyyy.isValid()) {
			date = dmmyyyy;
		} else {
			date = dayjs(dbDateStr);
		}
	} else {
		return dbDateStr;
	}
	if (!date.isValid()) return dbDateStr;
	return date.format('MMMM D, YYYY');
};

exports.formatedDate = (dbDateStr) => {
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
	return date.format('DD-MMM-YYYY').toLowerCase();
};
