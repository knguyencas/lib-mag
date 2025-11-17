const API_BASE_URL = 'http://localhost:3000/api';

const apiService = {
    baseURL: API_BASE_URL,

    async searchBooks(keyword) {
        try {
            const response = await fetch(`${this.baseURL}/books/search?keyword=${encodeURIComponent(keyword)}&status=published`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result;
            } else {
                throw new Error(result.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search API error:', error);
            throw error;
        }
    },

    async getPrimaryGenres() {
        try {
            const response = await fetch(`${API_BASE_URL}/books/metadata/genres`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching primary genres:', error);
            return [];
        }
    },

    async getForYouBooks(limit = 20) {
        try {
            const response = await fetch(`${API_BASE_URL}/books?limit=${limit}&sortBy=rating&status=published`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching For You books:', error);
            return [];
        }
    },

    async getPopularBooks(limit = 10) {
        try {
            const response = await fetch(`${API_BASE_URL}/books/popular?limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success) {
                return data.data || [];
            } else {
                throw new Error(data.message || 'Failed to fetch popular books');
            }
        } catch (error) {
            console.error('Error fetching popular books:', error);
            return [];
        }
    },

    async getBooksByGenrePaginated(genre, page = 1, limit = 5, sortBy = 'newest') {
        try {
            let url = `${API_BASE_URL}/books?page=${page}&limit=${limit}&status=published`;
            
            if (genre && genre !== 'all') {
                url += `&primary_genre=${encodeURIComponent(genre)}`;
            }
            
            url += `&sortBy=${sortBy}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
                books: data.data || [],
                pagination: data.pagination || {}
            };
        } catch (error) {
            console.error(`Error fetching books for genre ${genre}:`, error);
            return { books: [], pagination: {} };
        }
    },

    async getMostReadBooks(limit = 30) {
        try {
            const response = await fetch(`${API_BASE_URL}/books?limit=${limit}&sortBy=views&status=published`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching most read books:', error);
            return [];
        }
    }
};

window.apiService = apiService;