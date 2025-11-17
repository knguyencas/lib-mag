console.log('Library JS loaded!');

const libraryState = {
    genres: [],
    genreSections: new Map(),
    forYouBooks: [],
    popularBooks: [],
    currentGenreFilter: 'all',
    currentSortOrder: 'newest'
};

let currentOpenDropdown = null;

document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM Content Loaded - Initializing Library Page');

    try {
        await initializeControls();
        await initializeSearch();
        await initializeForYouSection();
        await initializePopularSection();
        await initializeDynamicGenreSections();

        console.log('Library page fully initialized!');
    } catch (error) {
        console.error('Error initializing library:', error);
        showErrorMessage('Failed to load library content. Please refresh the page.');
    }
});

async function initializeControls() {
    const genres = await apiService.getPrimaryGenres();
    libraryState.genres = genres;
    console.log('Loaded genres:', genres);

    const buttons = document.querySelectorAll('.dropdown-btn');
    const panel = document.getElementById('dropdownPanel');
    const panelInner = panel.querySelector('.dropdown-panel-inner');

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.dropdown;
            openDropdownPanel(type, btn, panel, panelInner);
        });
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && ![...buttons].some(b => b.contains(e.target))) {
            closeDropdownPanel(panel);
        }
    });
}

function openDropdownPanel(type, button, panel, panelInner) {
    if (currentOpenDropdown === type && panel.classList.contains('open')) {
        closeDropdownPanel(panel);
        return;
    }

    currentOpenDropdown = type;
    panelInner.innerHTML = '';

    if (type === 'genre') {
        const options = ['all', ...libraryState.genres];

        options.forEach(value => {
            const label = value === 'all' ? 'All Genres' : value;
            const div = document.createElement('div');
            div.className = 'dropdown-option';
            if (value === libraryState.currentGenreFilter) div.classList.add('active');
            div.textContent = label;
            div.dataset.value = value;

            div.addEventListener('click', async () => {
                libraryState.currentGenreFilter = value;

                const genreBtn = document.querySelector('[data-dropdown="genre"]');
                if (genreBtn) {
                    const displayText = value === 'all' ? 'All' : value;
                    genreBtn.innerHTML = `Genre: ${displayText} <span>▼</span>`;
                }

                closeDropdownPanel(panel);
                await refreshLibraryContent();
            });

            panelInner.appendChild(div);
        });
    } else if (type === 'sort') {
        const sortOptions = {
            newest: 'Newest First',
            oldest: 'Oldest First',
            rating: 'Highest Rating'
        };

        Object.entries(sortOptions).forEach(([value, label]) => {
            const div = document.createElement('div');
            div.className = 'dropdown-option';
            if (value === libraryState.currentSortOrder) div.classList.add('active');
            div.textContent = label;
            div.dataset.value = value;

            div.addEventListener('click', async () => {
                libraryState.currentSortOrder = value;

                const sortBtn = document.querySelector('[data-dropdown="sort"]');
                if (sortBtn) {
                    sortBtn.innerHTML = `Sort: ${label} <span>▼</span>`;
                }

                closeDropdownPanel(panel);
                await refreshLibraryContent();
            });

            panelInner.appendChild(div);
        });
    } else if (type === 'view') {
        const viewOptions = {
            default: 'Default'
        };

        Object.entries(viewOptions).forEach(([value, label]) => {
            const div = document.createElement('div');
            div.className = 'dropdown-option active';
            div.textContent = label;

            div.addEventListener('click', () => {
                const viewBtn = document.querySelector('[data-dropdown="view"]');
                if (viewBtn) {
                    viewBtn.innerHTML = `View: ${label} <span>▼</span>`;
                }
                closeDropdownPanel(panel);
            });

            panelInner.appendChild(div);
        });
    }

    const rect = button.getBoundingClientRect();
    panel.style.top = rect.bottom + 5 + 'px';
    panel.style.left = rect.left + 'px';
    panel.style.minWidth = rect.width + 'px';

    panel.classList.add('open');
    button.classList.add('open');
}

function closeDropdownPanel(panel) {
    panel.classList.remove('open');
    currentOpenDropdown = null;
    
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.classList.remove('open');
    });
}

async function initializeSearch() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchError = document.getElementById('searchError');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => performSearch(searchError));
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchError);
            }
        });

        searchInput.addEventListener('input', () => {
            if (searchError) {
                searchError.textContent = '';
            }
        });
    }
}

async function performSearch(searchError) {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();

    if (!keyword) {
        if (searchError) {
            searchError.textContent = 'Please enter a search term';
        }
        return;
    }

    if (searchError) {
        searchError.textContent = '';
    }

    console.log('Redirecting to search results for:', keyword);

    window.location.href = `search-results.html?q=${encodeURIComponent(keyword)}`;
}

async function refreshLibraryContent() {
    console.log('=== REFRESH LIBRARY CONTENT ===');

    document.querySelectorAll('.section.genre-section').forEach(section => {
        section.remove();
    });

    await initializeForYouSection();
    await initializePopularSection();
    await initializeDynamicGenreSections();

    console.log('=== REFRESH COMPLETE ===');
}

// ================== FOR YOU ==================
async function initializeForYouSection() {
    const forYouGrid = document.getElementById('forYouGrid');

    if (!forYouGrid) {
        console.error('forYouGrid NOT FOUND!');
        return;
    }

    try {
        let books;
        if (libraryState.currentGenreFilter === 'all') {
            books = await apiService.getForYouBooks(20);
        } else {
            const result = await apiService.getBooksByGenrePaginated(
                libraryState.currentGenreFilter,
                1,
                20,
                'rating'
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

// ================== POPULAR ==================
// ================== POPULAR ==================
async function initializePopularSection() {
    libraryState.genreSections.set('popular', 1);
    await loadPopularBooks(1, 5); // Load 1 row (5 books)

    const popularShowMoreBtn = document.querySelector('.show-more-btn[data-section="popular"]');
    if (popularShowMoreBtn && !popularShowMoreBtn.dataset.bound) {
        popularShowMoreBtn.addEventListener('click', function () {
            handleShowMorePopular(this);
        });
        popularShowMoreBtn.dataset.bound = 'true';
    }
}

async function loadPopularBooks(page = 1, limit = 5) {
    const grid = document.getElementById('popularGrid');
    
    if (!grid) {
        console.error('popularGrid NOT FOUND!');
        return;
    }

    try {
        console.log(`Loading popular books - page: ${page}, limit: ${limit}`);
        
        // Gọi API với limit đúng
        const books = await apiService.getPopularBooks(limit);
        console.log('Popular Books Response:', books);
        
        if (page === 1) {
            grid.innerHTML = ''; // Clear grid chỉ khi load page 1
        }
        
        if (books && books.length > 0) {
            books.forEach(book => {
                const card = createBookCard(book);
                grid.appendChild(card);
            });
            console.log(`Loaded ${books.length} popular books`);
        } else {
            if (page === 1) {
                grid.innerHTML = '<p style="color: white; grid-column: 1 / -1;">No popular books available</p>';
            }
        }
    } catch (error) {
        console.error('Error loading popular books:', error);
        if (page === 1) {
            grid.innerHTML = '<p style="color: white; grid-column: 1 / -1;">Failed to load popular books</p>';
        }
    }
}

async function handleShowMorePopular(button) {
    const sectionKey = 'popular';
    const currentRows = libraryState.genreSections.get(sectionKey) || 1;

    if (currentRows >= 3) {
        await loadPopularBooks(1, 5);
        libraryState.genreSections.set(sectionKey, 1);
        button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        button.classList.remove('expanded');
    } else {
        const newRows = currentRows + 1;
        await loadPopularBooks(1, newRows * 5);
        libraryState.genreSections.set(sectionKey, newRows);

        if (newRows >= 3) {
            button.innerHTML = 'Show less <span class="show-more-icon">▲</span>';
            button.classList.add('expanded');
        } else {
            button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        }
    }
}

// ================== GENRE SECTIONS ==================
async function initializeDynamicGenreSections() {
    try {
        const genres = libraryState.genres;
        if (genres.length === 0) {
            console.warn('No genres found');
            return;
        }

        const mainContent = document.querySelector('.main-content');
        const popularSection = document.querySelector('.section:has(#popularGrid)');

        document.querySelectorAll('.section.genre-section').forEach(section => {
            section.remove();
        });

        let genresToShow;
        if (libraryState.currentGenreFilter === 'all') {
            genresToShow = genres;
        } else {
            genresToShow = [libraryState.currentGenreFilter];
        }

        let lastSection = popularSection;

        for (let i = 0; i < genresToShow.length; i++) {
            const genre = genresToShow[i];
            const genreSection = await createGenreSection(genre);

            if (lastSection && lastSection.nextSibling) {
                lastSection.parentNode.insertBefore(genreSection, lastSection.nextSibling);
            } else if (lastSection) {
                lastSection.parentNode.appendChild(genreSection);
            } else {
                mainContent.appendChild(genreSection);
            }

            lastSection = genreSection;
            await loadGenreBooks(genre, 1, 5);
        }
    } catch (error) {
        console.error('Error initializing dynamic genre sections:', error);
    }
}

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

    libraryState.genreSections.set(slugify(genre), 1);

    const showMoreBtn = section.querySelector('.show-more-btn');
    showMoreBtn.addEventListener('click', function () {
        handleShowMore(genre, this);
    });

    return section;
}

async function loadGenreBooks(genre, page = 1, limit = 5) {
    const gridId = `${slugify(genre)}Grid`;
    const grid = document.getElementById(gridId);

    if (!grid) {
        console.error(`Grid not found for genre: ${genre}`);
        return;
    }

    try {
        const result = await apiService.getBooksByGenrePaginated(
            genre,
            page,
            limit,
            libraryState.currentSortOrder
        );

        const books = result.books;

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
    } catch (error) {
        console.error(`Error loading books for ${genre}:`, error);
        grid.innerHTML = '<p style="color: white; grid-column: 1 / -1;">Error loading books.</p>';
    }
}

async function handleShowMore(genre, button) {
    const section = slugify(genre);
    const currentRows = libraryState.genreSections.get(section) || 1;

    if (currentRows >= 3) {
        await loadGenreBooks(genre, 1, 5);
        libraryState.genreSections.set(section, 1);
        button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        button.classList.remove('expanded');
    } else {
        const newRows = currentRows + 1;
        await loadGenreBooks(genre, 1, newRows * 5);
        libraryState.genreSections.set(section, newRows);

        if (newRows >= 3) {
            button.innerHTML = 'Show less <span class="show-more-icon">▲</span>';
            button.classList.add('expanded');
        } else {
            button.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
        }
    }
}

// ================== CARD HELPERS ==================
function createForYouCard(book) {
    const card = document.createElement('div');
    card.className = 'for-you-card';
    card.dataset.bookId = book.book_id;

    const coverUrl = book.coverImage_cloud?.url || '';
    const ratingValue = parseFloat(book.rating || 0);
    const fullStars = Math.floor(ratingValue);
    const fraction = ratingValue - fullStars;
    const hasHalf = fraction >= 0.25 && fraction < 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    let ratingHtml = '';

    for (let i = 0; i < fullStars; i++) {
        ratingHtml += '<span class="star full"></span>';
    }
    if (hasHalf) {
        ratingHtml += '<span class="star half"></span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        ratingHtml += '<span class="star empty"></span>';
    }

    let titleClass = 'popup-title';
    if (book.title.length > 60) {
        titleClass += ' very-long-title';
    } else if (book.title.length > 40) {
        titleClass += ' long-title';
    }

    const summaryText = book.blurb || book.punchline || 'No description available.';

    card.innerHTML = `
        <div class="for-you-card-image" style="${
            coverUrl
                ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;`
                : 'background: #666;'
        }">
            ${
                !coverUrl
                    ? `<strong style="color: #fff; padding: 10px;">${truncateText(
                          book.title,
                          30
                      )}</strong>`
                    : ''
            }
        </div>
        <div class="for-you-card-info">
            <div class="for-you-card-title">${book.title}</div>
            <div class="for-you-card-author">by ${book.author}</div>
            <div class="for-you-card-rating">
                <span class="rating-stars">${ratingHtml}</span>
                <span class="rating-number">${ratingValue ? ratingValue.toFixed(1) : ''}</span>
            </div>
        </div>
        <div class="for-you-card-popup">
            <div class="popup-image" style="${
                coverUrl
                    ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;`
                    : 'background: #666;'
            }">
                ${
                    !coverUrl
                        ? `<strong style="color: #fff; font-size: 20px;">${
                              book.title
                          }</strong><div style="color: #fff; font-size: 14px; margin-top: 15px;">by ${
                              book.author
                          }</div>`
                        : ''
                }
            </div>
            <div class="popup-content">
                <div class="${titleClass}">${book.title}</div>
                <div class="popup-summary-container">
                    <div class="popup-summary" data-full-text="${escapeHtml(summaryText)}">
                        ${summaryText}
                    </div>
                    <span class="show-more-popup" style="display: none;">Show more</span>
                </div>
            </div>
        </div>
    `;

    // Handle popup positioning and truncation check
    card.addEventListener('mouseenter', function () {
        const popup = this.querySelector('.for-you-card-popup');
        const rect = this.getBoundingClientRect();

        const centerY = rect.top + rect.height / 2;
        const popupTop = centerY - 225;

        popup.style.top = popupTop + 'px';
        popup.style.left = rect.left + 'px';

        // Check if summary needs truncation
        const summaryEl = popup.querySelector('.popup-summary');
        const showMoreBtn = popup.querySelector('.show-more-popup');
        const titleEl = popup.querySelector('.popup-title');

        if (summaryEl && showMoreBtn && titleEl) {
            // Calculate available height for summary
            const titleHeight = titleEl.offsetHeight;
            const availableHeight = 401 - titleHeight - 40; // 401px poster height - title - margins
            
            summaryEl.style.maxHeight = availableHeight + 'px';

            // Check if content overflows
            if (summaryEl.scrollHeight > availableHeight) {
                // Content is too long - show fade and "Show more"
                summaryEl.classList.add('truncated');
                showMoreBtn.style.display = 'block';
            } else {
                // Content fits - hide fade and "Show more"
                summaryEl.classList.remove('truncated');
                showMoreBtn.style.display = 'none';
            }
        }
    });

    card.addEventListener('click', function (e) {
        if (e.target.classList.contains('show-more-popup')) {
            e.stopPropagation();
            viewBookDetails(book.book_id);
        } else {
            viewBookDetails(book.book_id);
        }
    });

    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.book_id;

    const coverUrl = book.coverImage_cloud?.url || '';

    card.innerHTML = `
        <div class="book-card-cover" style="${
            coverUrl
                ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;`
                : 'background: #666; display: flex; align-items: center; justify-content: center;'
        }">
            ${
                !coverUrl
                    ? `<strong style="color: #fff; padding: 10px; text-align: center;">${truncateText(
                          book.title,
                          30
                      )}</strong>`
                    : ''
            }
        </div>
        <div class="book-card-title">${truncateText(book.title, 40)}</div>
        <div class="book-card-author">${book.author}</div>
    `;

    card.addEventListener('click', function () {
        viewBookDetails(book.book_id);
    });

    return card;
}

function viewBookDetails(bookId) {
    console.log('Viewing book:', bookId);
    window.location.href = `book-detail.html?id=${bookId}`;
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatGenreTitle(genre) {
    const hyphenated = {
        Psychology: 'Psycho-logy',
        Philosophy: 'Philo-sophy',
        Literature: 'Litera-ture',
        Psychiatry: 'Psychi-atry',
        'Social Sciences': 'Social Scien-ces',
        'Religion & Spirituality': 'Religion & Spirit-uality',
        'Business & Economics': 'Business & Econo-mics'
    };

    return hyphenated[genre] || genre;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function showErrorMessage(message) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText =
            'color: white; padding: 20px; text-align: center; background: rgba(255, 0, 0, 0.2); margin: 20px 0;';
        errorDiv.textContent = message;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}