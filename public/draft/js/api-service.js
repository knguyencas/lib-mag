const API_BASE_URL = 'http://localhost:3000/api/books';

const ApiService = {
    // Get book by ID
    async getBookById(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${bookId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching book:', error);
            throw error;
        }
    },

    async getBookStructure(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${bookId}/split/structure`);
            
            if (!response.ok) {
                console.warn(`Structure API failed with status ${response.status}`);
                return null;
            }
            
            const result = await response.json();
            
            if (result.success === false) {
                console.warn('Structure API returned error:', result.message);
                return null;
            }
            
            if (result.data && result.data.structure) {
                return result.data.structure;
            }
            
            if (result.structure) {
                return result.structure;
            }
            
            return null;
            
        } catch (error) {
            console.error('Error fetching book structure:', error);
            return null; 
        }
    },

    // Get chapter content
    async getChapterContent(bookId, chapterNumber) {
        try {
            const response = await fetch(`${API_BASE_URL}/${bookId}/split/chapter/${chapterNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching chapter:', error);
            throw error;
        }
    },

    // Get related books
    async getRelatedBooks(bookId, limit = 4) {
        try {
            const response = await fetch(`${API_BASE_URL}/${bookId}/related?limit=${limit}`);
            if (!response.ok) {
                console.warn(`Related books API failed with status ${response.status}`);
                return []; // ✅ Trả về empty array
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching related books:', error);
            return []; // ✅ Trả về empty array
        }
    },

    // Update book rating
    async rateBook(bookId, rating) {
        try {
            const response = await fetch(`${API_BASE_URL}/${bookId}/rating`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error rating book:', error);
            throw error;
        }
    },

    // Increment download count
    async incrementDownload(bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${bookId}/download`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error incrementing download:', error);
            throw error;
        }
    }
};