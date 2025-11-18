console.log('Search Results JS loaded!');

let currentKeyword = '';

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Search Results Page Initialized');

    // Get search keyword from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentKeyword = urlParams.get('q') || '';

    if (!currentKeyword) {
        showNoResults('Please enter a search term');
        return;
    }

    // Set search input value
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = currentKeyword;
    }

    // Initialize search functionality
    initializeSearch();

    // Perform search
    await performSearch(currentKeyword);

    // Back button
    const backBtn = document.getElementById('backToLibrary');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'library.html';
        });
    }
});

function initializeSearch() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchError = document.getElementById('searchError');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const keyword = searchInput.value.trim();
            if (keyword) {
                window.location.href = `search-results.html?q=${encodeURIComponent(keyword)}`;
            } else if (searchError) {
                searchError.textContent = 'Please enter a search term';
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(keyword)}`;
                } else if (searchError) {
                    searchError.textContent = 'Please enter a search term';
                }
            }
        });

        searchInput.addEventListener('input', () => {
            if (searchError) {
                searchError.textContent = '';
            }
        });
    }
}

async function performSearch(keyword) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    const searchCount = document.getElementById('searchCount');
    const noResultsDiv = document.getElementById('noResults');

    try {
        resultsGrid.innerHTML = '<p style="color: white;">Searching...</p>';

        console.log('Searching for:', keyword);
        const result = await apiService.searchBooks(keyword);
        console.log('Search result:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            displayResults(result.data, keyword);
            
            if (searchCount) {
                searchCount.innerHTML = `Found <span class="search-query">${result.data.length}</span> result${result.data.length > 1 ? 's' : ''} for "<span class="search-query">${keyword}</span>"`;
            }

            if (noResultsDiv) {
                noResultsDiv.style.display = 'none';
            }
        } else {
            showNoResults(`No results found for "${keyword}"`);
        }
    } catch (error) {
        console.error('Search error:', error);
        showNoResults('Search failed. Please try again.');
    }
}

function displayResults(books, keyword) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    resultsGrid.innerHTML = '';

    books.forEach(book => {
        const card = createBookCard(book);
        resultsGrid.appendChild(card);
    });
}

function showNoResults(message) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    const searchCount = document.getElementById('searchCount');
    const noResultsDiv = document.getElementById('noResults');

    if (resultsGrid) {
        resultsGrid.innerHTML = '';
    }

    if (searchCount) {
        searchCount.textContent = message;
    }

    if (noResultsDiv) {
        noResultsDiv.style.display = 'block';
    }
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

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}