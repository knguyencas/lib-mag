document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== BOOK DETAIL PAGE INITIALIZED ===');
    
    const bookId = getBookIdFromURL();
    console.log('Book ID from URL:', bookId);
    
    if (!bookId) {
        showError('Book ID not found in URL. Please provide ?id=BOOK_ID');
        return;
    }
    
    try {
        showLoading();
        
        // TEMPORARY: Use mock data for testing
        const book = {
            book_id: "BK001",
            title: "Crime and Punishment",
            author: "Fyodor Dostoevsky",
            author_id: "AU001",
            year: 1866,
            publisher: "Penguin Classics",
            primary_genre: "Literature",
            categories: ["Psychological Fiction", "Classic Literature", "Existentialism"],
            punchline: "A young man's conscience becomes his tormentor.",
            blurb: "A desperate young man plans the perfect crime...",
            coverImage_cloud: {
                url: "https://res.cloudinary.com/dcnw2lsxt/image/upload/v1763100196/81bAXZAp-GL._AC_UF1000_1000_QL80__zy00qa.jpg"
            },
            rating: 4.7,
            structure: [],
            relatedBooks: []
        };
        
        hideLoading();
        renderBookDetails(book);
        initializeRatingSystem(book);
        initializeSearch();
        initializeReadingButtons(book);
        initializeLogo();
        
        console.log('Page rendered successfully');
        
    } catch (error) {
        hideLoading();
        showError('Failed to load book: ' + error.message);
        console.error('Error loading book:', error);
    }
});