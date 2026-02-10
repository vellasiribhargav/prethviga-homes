export function isValidDate(dateString) {
    if (!dateString) return false;

    // Check format YYYY-MM-DD
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) return false;

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    // Check ranges
    const currentYear = new Date().getFullYear();
    // Range: 1998 to Current Year + 3
    if (year < 1998 || year > currentYear + 3) return false;
    if (month < 1 || month > 12) return false;

    // Days in month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Leap year check
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
        daysInMonth[1] = 29;
    }

    return day > 0 && day <= daysInMonth[month - 1];
}

export function getDateRange() {
    const currentYear = new Date().getFullYear();
    return {
        min: '1998-01-01',
        max: `${currentYear + 3}-12-31`
    };
}