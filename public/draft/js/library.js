console.log('Library JS loaded!');

// State management
const libraryState = {
    genres: [],
    genreSections: new Map(), // Track current rows for each genre
    forYouBooks: [],
    popularBooks: []
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing Library Page');
    
    try {
        // Initialize all sections
        await initializeForYouSection();
        await initializePopularSection();
        await initializeDynamicGenreSections();
        
        console.log('Library page fully initialized!');
    } catch (error) {
        console.error('Error initializing library:', error);
        showErrorMessage('Failed to load library content. Please refresh the page.');
    }
});

/**
 * Initialize "For You" section with top-rated books
 */
async function initializeForYouSection() {
    const forYouGrid = document.getElementById('forYouGrid');
    
    if (!forYouGrid) {
        console.error('forYouGrid NOT FOUND!');
        return;
    }
    
    try {
        console.log('Fetching For You books...');
        const books = await apiService.getForYouBooks(20);
        libraryState.forYouBooks = books;
        
        if (books.length === 0) {
            forYouGrid.innerHTML = '<p style="color: white;">No books available at the moment.</p>';
            return;
        }
        
        forYouGrid.innerHTML = ''; // Clear existing content
        
        books.forEach(book => {
            const card = createForYouCard(book);
            forYouGrid.appendChild(card);
        });
        
        console.log(`Created ${books.length} For You cards`);
        
        // Enable horizontal scroll with mouse wheel
        forYouGrid.addEventListener('wheel', function(e) {
            e.preventDefault();
            this.scrollLeft += e.deltaY;
        }, { passive: false });
        
    } catch (error) {
        console.error('Error initializing For You section:', error);
        forYouGrid.innerHTML = '<p style="color: white;">Error loading books.</p>';
    }
}

/**
 * Initialize "Popular" section with highest-rated books
 */
async function initializePopularSection() {
    const popularGrid = document.getElementById('popularGrid');
    if (!popularGrid) {
        console.error('popularGrid NOT FOUND!');
        return;
    }
    
    try {
        console.log('Fetching Popular books...');
        const result = await apiService.getBooksByGenrePaginated('all', 1, 5);
        
        // If no books with specific genre, get all books
        let books = result.books;
        if (books.length === 0) {
            const allBooksResult = await apiService.getPopularBooks(5);
            books = allBooksResult;
        }
        
        libraryState.popularBooks = books;
        
        popularGrid.innerHTML = '';
        books.forEach(book => {
            const card = createBookCard(book);
            popularGrid.appendChild(card);
        });
        
        libraryState.genreSections.set('popular', 1);
        console.log(`Created ${books.length} Popular books`);
    } catch (error) {
        console.error('Error initializing Popular section:', error);
    }
}

/**
 * Dynamically create genre sections based on available genres
 */
async function initializeDynamicGenreSections() {
    try {
        console.log('Fetching primary genres...');
        const genres = await apiService.getPrimaryGenres();
        libraryState.genres = genres;
        
        console.log('Available genres:', genres);
        
        if (genres.length === 0) {
            console.warn('No genres found in database');
            return;
        }
        
        const mainContent = document.querySelector('.main-content');
        
        // Find the popular section to insert genre sections after it
        const popularSection = document.querySelector('.section:has(#popularGrid)');
        
        // Create section for each genre
        for (const genre of genres) {
            const genreSection = await createGenreSection(genre);
            
            // Insert after popular section
            if (popularSection && popularSection.nextSibling) {
                mainContent.insertBefore(genreSection, popularSection.nextSibling);
            } else {
                mainContent.appendChild(genreSection);
            }
            
            // Initialize with first 5 books
            await loadGenreBooks(genre, 1);
        }
        
        console.log(`Created ${genres.length} dynamic genre sections`);
        
    } catch (error) {
        console.error('Error initializing dynamic genre sections:', error);
    }
}

/**
 * Create a genre section element
 */
async function createGenreSection(genre) {
    const section = document.createElement('section');
    section.className = 'section';
    section.id = `section-${slugify(genre)}`;
    
    // Format genre title (e.g., "Philosophy" -> "Philo-sophy")
    const formattedTitle = formatGenreTitle(genre);
    
    section.innerHTML = `
        <h2 class="section-title">${formattedTitle}</h2>
        <div class="section-grid">
            <div class="book-grid" id="${slugify(genre)}Grid"></div>
            <div class="divider-with-button">
                <div class="divider-line"></div>
                <button class="show-more-btn" data-section="${slugify(genre)}">
                    Show more <span class="show-more-icon">▼</span>
                </button>
                <div class="divider-line"></div>
            </div>
        </div>
    `;
    
    // Initialize state for this genre
    libraryState.genreSections.set(slugify(genre), 1);
    
    // Add event listener to show more button
    const showMoreBtn = section.querySelector('.show-more-btn');
    showMoreBtn.addEventListener('click', function() {
        handleShowMore(genre, this);
    });
    
    return section;
}

/**
 * Load books for a specific genre
 */
async function loadGenreBooks(genre, page = 1, limit = 5) {
    const gridId = `${slugify(genre)}Grid`;
    const grid = document.getElementById(gridId);
    
    if (!grid) {
        console.error(`Grid not found for genre: ${genre}`);
        return;
    }
    
    try {
        const result = await apiService.getBooksByGenrePaginated(genre, page, limit);
        const books = result.books;
        
        if (page === 1) {
            grid.innerHTML = ''; // Clear for first page
        }
        
        books.forEach(book => {
            const card = createBookCard(book);
            grid.appendChild(card);
        });
        
        console.log(`Loaded ${books.length} books for ${genre} (page ${page})`);
        
    } catch (error) {
        console.error(`Error loading books for ${genre}:`, error);
    }
}

/**
 * Handle "Show More" button click
 */
async function handleShowMore(genre, button) {
    const section = slugify(genre);
    const currentRows = libraryState.genreSections.get(section) || 1;
    
    if (button.classList.contains('expanded')) {
        // Collapse to 1 row
        await loadGenreBooks(genre, 1, 5);
        libraryState.genreSections.set(section, 1);
        button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        button.classList.remove('expanded');
        console.log(`${genre} collapsed to 1 row`);
    } else {
        // Expand by 1 row (5 more books)
        const newRows = currentRows + 1;
        await loadGenreBooks(genre, 1, newRows * 5);
        libraryState.genreSections.set(section, newRows);
        
        if (newRows >= 6) {
            button.innerHTML = 'Show less <span class="show-more-icon">▼</span>';
            button.classList.add('expanded');
        }
        console.log(`${genre} expanded to ${newRows} rows`);
    }
}

/**
 * Create a "For You" card element
 */
function createForYouCard(book) {
    const card = document.createElement('div');
    card.className = 'for-you-card';
    card.dataset.bookId = book.book_id;
    
    const coverUrl = book.coverImage_cloud?.url || '';
    const rating = '★'.repeat(Math.round(book.rating || 0)) + '☆'.repeat(5 - Math.round(book.rating || 0));
    
    card.innerHTML = `
        <div class="for-you-card-image" style="background-image: url('${coverUrl}'); background-size: cover; background-position: center;">
            ${!coverUrl ? `<strong>${book.title}</strong><div style="font-size: 12px; margin-top: 10px;">by ${book.author}</div>` : ''}
        </div>
        <div class="for-you-card-info">
            <div class="for-you-card-title">${truncateText(book.title, 50)}</div>
            <div class="for-you-card-author">by ${book.author}</div>
            <div class="for-you-card-rating">${rating}</div>
        </div>
        <div class="for-you-card-popup">
            <div class="popup-image" style="background-image: url('${coverUrl}'); background-size: cover; background-position: center;">
                ${!coverUrl ? `<strong style="font-size: 20px;">${book.title}</strong><div style="font-size: 14px; margin-top: 15px;">by ${book.author}</div>` : ''}
            </div>
            <div class="popup-content">
                <div class="popup-title">${book.title}</div>
                <div class="popup-summary">${book.blurb || book.punchline || 'No description available.'}</div>
            </div>
        </div>
    `;
    
    // Add hover event for popup positioning
    card.addEventListener('mouseenter', function() {
        const popup = this.querySelector('.for-you-card-popup');
        const rect = this.getBoundingClientRect();
        
        const centerY = rect.top + (rect.height / 2);
        const popupTop = centerY - 225;
        
        popup.style.top = popupTop + 'px';
        popup.style.left = rect.left + 'px';
    });
    
    // Add click event to view book details
    card.addEventListener('click', function() {
        viewBookDetails(book.book_id);
    });
    
    return card;
}

/**
 * Create a regular book card element
 */
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.book_id;
    
    const coverUrl = book.coverImage_cloud?.url || '';
    
    card.innerHTML = `
        <div class="book-card-cover" style="background-image: url('${coverUrl}'); background-size: cover; background-position: center;">
            ${!coverUrl ? `<strong>${book.title}</strong><div style="font-size: 12px; margin-top: 10px;">by ${book.author}</div>` : ''}
        </div>
        <div class="book-card-title">${truncateText(book.title, 40)}</div>
        <div class="book-card-author">${book.author}</div>
    `;
    
    // Add click event to view book details
    card.addEventListener('click', function() {
        viewBookDetails(book.book_id);
    });
    
    return card;
}

/**
 * View book details (navigate to book detail page)
 */
function viewBookDetails(bookId) {
    console.log('Viewing book:', bookId);
    // Navigate to book detail page
    window.location.href = `/book-detail.html?id=${bookId}`;
}

/**
 * Utility: Convert text to URL-friendly slug
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Utility: Format genre title with hyphenation
 */
function formatGenreTitle(genre) {
    // Add hyphenation for specific genres to match design
    const hyphenated = {
        'Philosophy': 'Philo-sophy',
        'Psychology': 'Psycho-logy'
    };
    
    return hyphenated[genre] || genre;
}

/**
 * Utility: Truncate text to specified length
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Utility: Show error message to user
 */
function showErrorMessage(message) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: white; padding: 20px; text-align: center; background: rgba(255, 0, 0, 0.2); margin: 20px 0;';
        errorDiv.textContent = message;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}