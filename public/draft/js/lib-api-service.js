const API_BASE_URL = 'http://localhost:3000/api';

const apiService = {
    // Get all primary genres
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

    // Get "For You" books - top rated books
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

    // Get popular books
    async getPopularBooks(limit = 20) {
        try {
            const response = await fetch(`${API_BASE_URL}/books?limit=${limit}&sortBy=rating&status=published`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching popular books:', error);
            return [];
        }
    },

    // Get books by genre with pagination
    async getBooksByGenrePaginated(genre, page = 1, limit = 5) {
        try {
            const response = await fetch(`${API_BASE_URL}/books?primary_genre=${encodeURIComponent(genre)}&page=${page}&limit=${limit}&sortBy=rating&status=published`);
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
    }
};

window.apiService = apiService;