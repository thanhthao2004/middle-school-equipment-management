/**
 * Date utilities
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
	if (!date) return '';
	const d = new Date(date);
	if (isNaN(d.getTime())) return '';

	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	const seconds = String(d.getSeconds()).padStart(2, '0');

	return format
		.replace('DD', day)
		.replace('MM', month)
		.replace('YYYY', year)
		.replace('HH', hours)
		.replace('mm', minutes)
		.replace('ss', seconds);
};

const isValidDate = (date) => {
	return date instanceof Date && !isNaN(date.getTime());
};

const addDays = (date, days) => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

const isPast = (date) => {
	return new Date(date) < new Date();
};

const isFuture = (date) => {
	return new Date(date) > new Date();
};

module.exports = {
	formatDate,
	isValidDate,
	addDays,
	isPast,
	isFuture,
};

