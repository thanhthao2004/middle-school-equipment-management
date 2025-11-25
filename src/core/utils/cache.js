/**
 * Simple in-memory cache utility
 * Sử dụng Map để O(1) lookup thay vì Object hoặc Array
 */
class Cache {
	constructor(defaultTTL = 300000) { // 5 phút mặc định
		this.cache = new Map(); // Dùng Map thay vì Object để performance tốt hơn
		this.defaultTTL = defaultTTL;
	}

	/**
	 * Lấy giá trị từ cache
	 * @param {string} key 
	 * @returns {any|null}
	 */
	get(key) {
		const item = this.cache.get(key);
		
		if (!item) {
			return null;
		}

		// Kiểm tra TTL
		if (Date.now() > item.expiry) {
			this.cache.delete(key);
			return null;
		}

		return item.value;
	}

	/**
	 * Lưu giá trị vào cache
	 * @param {string} key 
	 * @param {any} value 
	 * @param {number} ttl - Time to live in milliseconds
	 */
	set(key, value, ttl = null) {
		const expiry = Date.now() + (ttl || this.defaultTTL);
		this.cache.set(key, { value, expiry });
	}

	/**
	 * Xóa một key khỏi cache
	 * @param {string} key 
	 */
	delete(key) {
		this.cache.delete(key);
	}

	/**
	 * Xóa tất cả cache
	 */
	clear() {
		this.cache.clear();
	}

	/**
	 * Xóa các item đã hết hạn
	 */
	cleanup() {
		const now = Date.now();
		for (const [key, item] of this.cache.entries()) {
			if (now > item.expiry) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Lấy số lượng items trong cache
	 * @returns {number}
	 */
	size() {
		return this.cache.size;
	}

	/**
	 * Kiểm tra key có tồn tại không
	 * @param {string} key 
	 * @returns {boolean}
	 */
	has(key) {
		const item = this.cache.get(key);
		if (!item) return false;
		
		if (Date.now() > item.expiry) {
			this.cache.delete(key);
			return false;
		}
		
		return true;
	}
}

// Singleton instance
const cache = new Cache();

// Auto cleanup mỗi 10 phút
setInterval(() => {
	cache.cleanup();
}, 600000);

module.exports = cache;

