import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export function parseDate(dateStr, formats) {
    if (!dateStr) return null;
    for (const format of formats) {
        const parsed = dayjs(dateStr, format);
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