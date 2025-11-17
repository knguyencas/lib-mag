console.log('Library JS loaded!');

// State management
const libraryState = {
    genres: [],
    genreSections: new Map(),
    forYouBooks: [],
    popularBooks: [],
    currentGenreFilter: 'all',
    currentSortOrder: 'newest'
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing Library Page');
    
    try {
        // Initialize controls first
        await initializeControls();
        
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
 * Initialize filter controls
 */
async function initializeControls() {
    // Fetch genres first
    const genres = await apiService.getPrimaryGenres();
    libraryState.genres = genres;
    console.log('Loaded genres:', genres);
    
    const genreDropdown = document.querySelector('.dropdown-btn:nth-child(3)');
    const sortDropdown = document.querySelector('.dropdown-btn:nth-child(2)');
    
    if (genreDropdown) {
        genreDropdown.addEventListener('click', function() {
            showGenreSelector();
        });
    }
    
    if (sortDropdown) {
        sortDropdown.addEventListener('click', function() {
            showSortSelector();
        });
    }
}

/**
 * Show genre selector with modal/dropdown
 */
function showGenreSelector() {
    const genreOptions = ['All Genres', ...libraryState.genres];
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
    `;
    
    let html = '<h3 style="margin-bottom: 20px; color: #000;">Select Genre</h3>';
    genreOptions.forEach((genre, index) => {
        const value = index === 0 ? 'all' : genre;
        const isSelected = (value === 'all' && libraryState.currentGenreFilter === 'all') || 
                          (value === libraryState.currentGenreFilter);
        
        html += `
            <div style="padding: 10px; cursor: pointer; background: ${isSelected ? '#000' : '#f0f0f0'}; 
                        color: ${isSelected ? '#fff' : '#000'}; margin-bottom: 8px; border-radius: 4px;"
                 data-genre="${value}" class="genre-option">
                ${genre}
            </div>
        `;
    });
    
    container.innerHTML = html;
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    // Add click handlers
    container.querySelectorAll('.genre-option').forEach(option => {
        option.addEventListener('click', async function() {
            const selectedGenre = this.dataset.genre;
            libraryState.currentGenreFilter = selectedGenre;
            
            // Update button text
            const genreBtn = document.querySelector('.dropdown-btn:nth-child(3)');
            if (genreBtn) {
                const displayText = selectedGenre === 'all' ? 'All Genres' : selectedGenre;
                genreBtn.innerHTML = `Genre: ${displayText} <span>▼</span>`;
            }
            
            // Remove modal
            document.body.removeChild(modal);
            
            // Reload content
            await refreshLibraryContent();
        });
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Show sort selector
 */
function showSortSelector() {
    const sortOptions = {
        'newest': 'Newest First',
        'oldest': 'Oldest First',
        'rating': 'Highest Rating'
    };
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
    `;
    
    let html = '<h3 style="margin-bottom: 20px; color: #000;">Select Sort Order</h3>';
    Object.entries(sortOptions).forEach(([key, value]) => {
        const isSelected = key === libraryState.currentSortOrder;
        
        html += `
            <div style="padding: 10px; cursor: pointer; background: ${isSelected ? '#000' : '#f0f0f0'}; 
                        color: ${isSelected ? '#fff' : '#000'}; margin-bottom: 8px; border-radius: 4px;"
                 data-sort="${key}" class="sort-option">
                ${value}
            </div>
        `;
    });
    
    container.innerHTML = html;
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    // Add click handlers
    container.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', async function() {
            const selectedSort = this.dataset.sort;
            libraryState.currentSortOrder = selectedSort;
            
            // Update button text
            const sortBtn = document.querySelector('.dropdown-btn:nth-child(2)');
            if (sortBtn) {
                sortBtn.innerHTML = `Sort: ${sortOptions[selectedSort]} <span>▼</span>`;
            }
            
            // Remove modal
            document.body.removeChild(modal);
            
            // Reload content
            await refreshLibraryContent();
        });
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Refresh library content based on filters
 */
async function refreshLibraryContent() {
    console.log('=== REFRESH LIBRARY CONTENT ===');
    console.log('Current filter:', {
        genre: libraryState.currentGenreFilter,
        sort: libraryState.currentSortOrder
    });
    
    // Clear all sections first
    document.querySelectorAll('.section.genre-section').forEach(section => {
        console.log('Removing section:', section.id);
        section.remove();
    });
    
    await initializeForYouSection();
    await initializePopularSection();
    await initializeDynamicGenreSections();
    
    console.log('=== REFRESH COMPLETE ===');
}

// Initialize "For You" section with top-rated books
async function initializeForYouSection() {
    const forYouGrid = document.getElementById('forYouGrid');
    
    if (!forYouGrid) {
        console.error('forYouGrid NOT FOUND!');
        return;
    }
    
    try {
        console.log('Fetching For You books...');
        
        let books;
        if (libraryState.currentGenreFilter === 'all') {
            books = await apiService.getForYouBooks(20);
        } else {
            // Get books filtered by genre
            const result = await apiService.getBooksByGenrePaginated(
                libraryState.currentGenreFilter,
                1,
                20,
                'rating' // Always sort by rating for "For You"
            );
            books = result.books;
        }
        
        libraryState.forYouBooks = books;
        
        if (books.length === 0) {
            forYouGrid.innerHTML = '<p style="color: white;">No books available for this genre.</p>';
            return;
        }
        
        forYouGrid.innerHTML = '';
        
        books.forEach(book => {
            const card = createForYouCard(book);
            forYouGrid.appendChild(card);
        });
        
        console.log(`Created ${books.length} For You cards`);
        
        // Enable horizontal scroll with mouse wheel
        forYouGrid.removeEventListener('wheel', handleWheel);
        forYouGrid.addEventListener('wheel', handleWheel, { passive: false });
        
    } catch (error) {
        console.error('Error initializing For You section:', error);
        forYouGrid.innerHTML = '<p style="color: white;">Error loading books.</p>';
    }
}

function handleWheel(e) {
    e.preventDefault();
    this.scrollLeft += e.deltaY;
}

//Initialize "Popular" section
async function initializePopularSection() {
    const popularGrid = document.getElementById('popularGrid');
    if (!popularGrid) {
        console.error('popularGrid NOT FOUND!');
        return;
    }
    
    try {
        console.log('Fetching Popular books with filter:', libraryState.currentGenreFilter);
        
        const result = await apiService.getBooksByGenrePaginated(
            libraryState.currentGenreFilter === 'all' ? null : libraryState.currentGenreFilter,
            1,
            5,
            libraryState.currentSortOrder
        );
        
        libraryState.popularBooks = result.books;
        
        popularGrid.innerHTML = '';
        
        if (result.books.length === 0) {
            popularGrid.innerHTML = '<p style="color: white;">No books found.</p>';
        } else {
            result.books.forEach(book => {
                const card = createBookCard(book);
                popularGrid.appendChild(card);
            });
        }
        
        libraryState.genreSections.set('popular', 1);
        console.log(`Created ${result.books.length} Popular books`);
    } catch (error) {
        console.error('Error initializing Popular section:', error);
        popularGrid.innerHTML = '<p style="color: white;">Error loading books.</p>';
    }
}

// Dynamically create genre sections based on available genres
async function initializeDynamicGenreSections() {
    try {
        console.log('=== INITIALIZING GENRE SECTIONS ===');
        
        const genres = libraryState.genres;
        
        if (genres.length === 0) {
            console.warn('No genres found');
            return;
        }
        
        const mainContent = document.querySelector('.main-content');
        const popularSection = document.querySelector('.section:has(#popularGrid)');
        
        // FORCE REMOVE all existing genre sections
        console.log('Removing existing genre sections...');
        const existingSections = document.querySelectorAll('.section.genre-section');
        console.log(`Found ${existingSections.length} existing sections`);
        existingSections.forEach(section => {
            console.log('Removing:', section.id);
            section.remove();
        });
        
        // Also remove by ID pattern as backup
        genres.forEach(genre => {
            const sectionId = `section-${slugify(genre)}`;
            const section = document.getElementById(sectionId);
            if (section) {
                console.log('Force removing by ID:', sectionId);
                section.remove();
            }
        });
        
        // Determine which genres to show
        let genresToShow;
        if (libraryState.currentGenreFilter === 'all') {
            genresToShow = genres;
            console.log('Showing ALL genres:', genresToShow);
        } else {
            genresToShow = [libraryState.currentGenreFilter];
            console.log('Showing ONLY genre:', genresToShow);
        }
        
        // Create sections in order
        console.log('Creating genre sections...');
        let lastSection = popularSection;
        
        for (let i = 0; i < genresToShow.length; i++) {
            const genre = genresToShow[i];
            console.log(`Creating section ${i + 1}/${genresToShow.length}: ${genre}`);
            
            const genreSection = await createGenreSection(genre);
            
            // Insert after the last section
            if (lastSection && lastSection.nextSibling) {
                lastSection.parentNode.insertBefore(genreSection, lastSection.nextSibling);
            } else if (lastSection) {
                lastSection.parentNode.appendChild(genreSection);
            } else {
                mainContent.appendChild(genreSection);
            }
            
            // Update last section reference for next iteration
            lastSection = genreSection;
            
            // Load books for this genre
            console.log(`Loading books for ${genre}...`);
            await loadGenreBooks(genre, 1, 5);
        }
        
        console.log(`=== CREATED ${genresToShow.length} GENRE SECTIONS ===`);
        
    } catch (error) {
        console.error('Error initializing dynamic genre sections:', error);
    }
}

// Create a genre section element
async function createGenreSection(genre) {
    const section = document.createElement('section');
    section.className = 'section genre-section';
    section.id = `section-${slugify(genre)}`;
    
    const formattedTitle = formatGenreTitle(genre);
    
    section.innerHTML = `
        <h2 class="section-title">${formattedTitle}</h2>
        <div class="section-grid">
            <div class="book-grid" id="${slugify(genre)}Grid"></div>
            <div class="divider-with-button">
                <div class="divider-line"></div>
                <button class="show-more-btn" data-genre="${genre}">
                    Show more <span class="show-more-icon">▼</span>
                </button>
                <div class="divider-line"></div>
            </div>
        </div>
    `;
    
    // Initialize state
    libraryState.genreSections.set(slugify(genre), 1);
    
    // Add event listener
    const showMoreBtn = section.querySelector('.show-more-btn');
    showMoreBtn.addEventListener('click', function() {
        handleShowMore(genre, this);
    });
    
    return section;
}

// Load books for a specific genre
async function loadGenreBooks(genre, page = 1, limit = 5) {
    const gridId = `${slugify(genre)}Grid`;
    const grid = document.getElementById(gridId);
    
    if (!grid) {
        console.error(`Grid not found for genre: ${genre}`);
        return;
    }
    
    try {
        console.log(`Loading books for ${genre}, page: ${page}, limit: ${limit}, sort: ${libraryState.currentSortOrder}`);
        
        const result = await apiService.getBooksByGenrePaginated(
            genre,
            page,
            limit,
            libraryState.currentSortOrder
        );
        
        const books = result.books;
        
        console.log(`Received ${books.length} books for ${genre}`);
        
        // Clear grid if page 1
        if (page === 1) {
            grid.innerHTML = '';
        }
        
        if (books.length === 0) {
            grid.innerHTML = '<p style="color: white; grid-column: 1 / -1;">No books found in this genre.</p>';
            return;
        }
        
        books.forEach(book => {
            const card = createBookCard(book);
            grid.appendChild(card);
        });
        
        console.log(`Rendered ${books.length} books for ${genre}`);
        
    } catch (error) {
        console.error(`Error loading books for ${genre}:`, error);
        grid.innerHTML = '<p style="color: white; grid-column: 1 / -1;">Error loading books.</p>';
    }
}

/**
 * Handle "Show More" button click
 * Logic: 1 row → 2 rows → 3 rows → back to 1 row
 */
async function handleShowMore(genre, button) {
    const section = slugify(genre);
    const currentRows = libraryState.genreSections.get(section) || 1;
    
    console.log(`Show more clicked for ${genre}, current rows: ${currentRows}`);
    
    if (currentRows >= 3) {
        // Collapse to 1 row
        await loadGenreBooks(genre, 1, 5);
        libraryState.genreSections.set(section, 1);
        button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        button.classList.remove('expanded');
        console.log(`${genre} collapsed to 1 row`);
    } else {
        // Expand by 1 row
        const newRows = currentRows + 1;
        await loadGenreBooks(genre, 1, newRows * 5);
        libraryState.genreSections.set(section, newRows);
        
        if (newRows >= 3) {
            button.innerHTML = 'Show less <span class="show-more-icon">▲</span>';
            button.classList.add('expanded');
        } else {
            button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        }
        
        console.log(`${genre} expanded to ${newRows} rows`);
    }
}

// Create a "For You" card element
function createForYouCard(book) {
    const card = document.createElement('div');
    card.className = 'for-you-card';
    card.dataset.bookId = book.book_id;
    
    const coverUrl = book.coverImage_cloud?.url || '';
    const rating = '★'.repeat(Math.round(book.rating || 0)) + '☆'.repeat(5 - Math.round(book.rating || 0));
    
    card.innerHTML = `
        <div class="for-you-card-image" style="${coverUrl ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;` : 'background: #666;'}">
            ${!coverUrl ? `<strong style="color: #fff; padding: 10px;">${truncateText(book.title, 30)}</strong>` : ''}
        </div>
        <div class="for-you-card-info">
            <div class="for-you-card-title">${truncateText(book.title, 50)}</div>
            <div class="for-you-card-author">by ${book.author}</div>
            <div class="for-you-card-rating">${rating}</div>
        </div>
        <div class="for-you-card-popup">
            <div class="popup-image" style="${coverUrl ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;` : 'background: #666;'}">
                ${!coverUrl ? `<strong style="color: #fff; font-size: 20px;">${book.title}</strong><div style="color: #fff; font-size: 14px; margin-top: 15px;">by ${book.author}</div>` : ''}
            </div>
            <div class="popup-content">
                <div class="popup-title">${book.title}</div>
                <div class="popup-summary">${book.blurb || book.punchline || 'No description available.'}</div>
            </div>
        </div>
    `;
    
    card.addEventListener('mouseenter', function() {
        const popup = this.querySelector('.for-you-card-popup');
        const rect = this.getBoundingClientRect();
        
        const centerY = rect.top + (rect.height / 2);
        const popupTop = centerY - 225;
        
        popup.style.top = popupTop + 'px';
        popup.style.left = rect.left + 'px';
    });
    
    card.addEventListener('click', function() {
        viewBookDetails(book.book_id);
    });
    
    return card;
}

// Create a regular book card element
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.book_id;
    
    const coverUrl = book.coverImage_cloud?.url || '';
    
    card.innerHTML = `
        <div class="book-card-cover" style="${coverUrl ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;` : 'background: #666; display: flex; align-items: center; justify-content: center;'}">
            ${!coverUrl ? `<strong style="color: #fff; padding: 10px; text-align: center;">${truncateText(book.title, 30)}</strong>` : ''}
        </div>
        <div class="book-card-title">${truncateText(book.title, 40)}</div>
        <div class="book-card-author">${book.author}</div>
    `;
    
    card.addEventListener('click', function() {
        viewBookDetails(book.book_id);
    });
    
    return card;
}

// View book details (navigate to book detail page)
function viewBookDetails(bookId) {
    console.log('Viewing book:', bookId);
    window.location.href = `book-detail.html?id=${bookId}`;
}

// Convert text to URL-friendly slug
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Format genre title with hyphenation
function formatGenreTitle(genre) {
    const hyphenated = {
        'Psychology': 'Psycho-logy',
        'Philosophy': 'Philo-sophy',
        'Literature': 'Litera-ture',
        'Psychiatry': 'Psychi-atry',
        'Social Sciences': 'Social Scien-ces',
        'Religion & Spirituality': 'Religion & Spirit-uality',
        'Business & Economics': 'Business & Econo-mics'
    };
    
    return hyphenated[genre] || genre;
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function showErrorMessage(message) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: white; padding: 20px; text-align: center; background: rgba(255, 0, 0, 0.2); margin: 20px 0;';
        errorDiv.textContent = message;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}