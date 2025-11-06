/**
 * Pagination utilities
 */
const getPaginationParams = (req, defaultLimit = 10, maxLimit = 100) => {
	const page = Math.max(1, parseInt(req.query.page, 10) || 1);
	const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || defaultLimit));
	const skip = (page - 1) * limit;

	return { page, limit, skip };
};

const getPaginationMeta = (total, page, limit) => {
	const totalPages = Math.ceil(total / limit);
	return {
		currentPage: page,
		totalPages,
		totalItems: total,
		itemsPerPage: limit,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
	};
};

module.exports = {
	getPaginationParams,
	getPaginationMeta,
};
