import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export function parseDate(dateStr, formats) {
    if (!dateStr) return null;
    for (const format of formats) {
        let testStr = dateStr;
        // Normalize case for month names (MMM or MMMM) to ensure dayjs can parse it
        if (format.includes('MMM')) {
            testStr = dateStr.replace(/[a-z]{3,}/gi, (match) =>
                match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
            );
        }
        const parsed = dayjs(testStr, format);
        if (parsed.isValid()) return parsed;
    }
    return null;
}

export function getSearchValue(input) {
    return input ? input.value.toLowerCase().trim() : '';
}

export function getDateValue(input) {
    return input ? input.value : '';
}

export function getDateRangeValues(fromInput, toInput) {
    return {
        fromDate: fromInput ? fromInput.value : '',
        toDate: toInput ? toInput.value : ''
    };
}


export function matchesSearch(searchValue, ...fields) {
    if (!searchValue) return true;
    return fields.some(field =>
        field && field.toLowerCase().includes(searchValue)
    );
}

export function matchesDate(dateValue, rowDateStr, dateFormat) {
    if (!dateValue || !rowDateStr) return true;
    const rowDate = parseDate(rowDateStr, dateFormat);
    const filterDate = dayjs(dateValue);
    return rowDate && rowDate.isValid() && filterDate.isValid() &&
        rowDate.isSame(filterDate, 'day');
}

export function matchesDateRange(fromDate, toDate, rowDateStr, dateFormat) {
    if ((!fromDate && !toDate) || !rowDateStr) return true;

    const rowDate = parseDate(rowDateStr, dateFormat);
    if (!rowDate || !rowDate.isValid()) return false;

    if (fromDate) {
        const from = dayjs(fromDate).startOf('day');
        if (from.isValid() && rowDate.isBefore(from)) return false;
    }

    if (toDate) {
        const to = dayjs(toDate).endOf('day');
        if (to.isValid() && rowDate.isAfter(to)) return false;
    }

    return true;
}
