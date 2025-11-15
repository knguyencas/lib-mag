console.log('Book Detail JS loaded');

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
        
        // Fetch book data (required)
        console.log('Fetching book data...');
        const book = await ApiService.getBookById(bookId);
        console.log('Book loaded:', book.title);
        
        // Fetch structure (optional - may fail)
        console.log('Fetching book structure...');
        const structure = await ApiService.getBookStructure(bookId);
        if (structure) {
            console.log('Structure loaded:', structure);
        } else {
            console.warn('No structure available');
        }
        
        // Fetch related books (optional - may fail)
        console.log('Fetching related books...');
        const relatedBooks = await ApiService.getRelatedBooks(bookId, 4);
        console.log('Related books loaded:', relatedBooks.length);
        
        // Attach optional data to book object
        book.structure = structure;
        book.relatedBooks = relatedBooks;

        hideLoading();
        
        // Render all sections
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

function getBookIdFromURL() {
    // Try ?id=BK001 format
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    if (paramId) return paramId;

    // Fallback: /book-detail/BK001 format
    const path = window.location.pathname;
    const match = path.match(/\/book-detail\/([^\/]+)/);
    if (match && match[1]) {
        return match[1];
    }

    return null;
}

function showLoading() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <h3 style="font-size: 24px; margin-bottom: 10px;">Loading book...</h3>
            <p style="color: #666;">Please wait while we fetch the book details</p>
        </div>
    `;
}

function hideLoading() {
    // renderBookDetails will replace the content
}

function renderBookDetails(book) {
    console.log('Rendering book details for:', book.title);
    
    // Update page title
    document.title = `Psyche Journey - ${book.title}`;
    
    // Render each section
    renderBookTitle(book);
    renderAuthorInfo(book);
    renderCategories(book);
    renderBookCover(book);
    renderStarRating(book);
    renderDescription(book);
    renderContents(book);
    renderRelatedBooks(book.relatedBooks);
}

function renderBookTitle(book) {
    const titleEl = document.querySelector('.book-title');
    if (titleEl) {
        titleEl.textContent = book.title || 'Untitled';
    }
}

function renderAuthorInfo(book) {
    const authorEl = document.querySelector('.book-author');
    if (authorEl) {
        const publisher = book.publisher ? ` • ${book.publisher}` : '';
        const year = book.year ? ` (${book.year})` : '';
        authorEl.textContent = `${book.author || 'Unknown author'}${publisher}${year}`;
    }
}

function renderCategories(book) {
    const container = document.querySelector('.categories');
    if (!container) return;

    const primary = book.primary_genre ? [book.primary_genre] : [];
    const categories = Array.isArray(book.categories) ? book.categories : [];
    const allCategories = [...primary, ...categories];

    if (allCategories.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = allCategories
        .map(cat => `<span class="category-tag">${escapeHtml(cat)}</span>`)
        .join('');
}

function renderBookCover(book) {
    const coverContainer = document.querySelector('.book-cover');
    if (!coverContainer) return;

    if (book.coverImage_cloud && book.coverImage_cloud.url) {
        coverContainer.innerHTML = `
            <img src="${escapeHtml(book.coverImage_cloud.url)}" 
                 alt="${escapeHtml(book.title)}" 
                 style="width: 100%; height: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px;">
        `;
    } else if (book.coverImage) {
        coverContainer.innerHTML = `
            <img src="${escapeHtml(book.coverImage)}" 
                 alt="${escapeHtml(book.title)}" 
                 style="width: 100%; height: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px;">
        `;
    } else {
        coverContainer.innerHTML = `
            <svg class="cover-design" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="450" fill="#F5F5F5"/>
                <text x="150" y="220" text-anchor="middle" style="font-size: 22px; font-weight: 600; fill: #333;">
                    ${escapeHtml(book.title || 'No Title')}
                </text>
                <text x="150" y="255" text-anchor="middle" style="font-size: 14px; fill: #777;">
                    ${escapeHtml(book.author || 'Unknown')}
                </text>
            </svg>
        `;
    }
}

function renderStarRating(book) {
    const container = document.querySelector('.star-rating');
    if (!container) return;

    const avgRating = typeof book.rating === 'number' ? book.rating : 0;
    const rounded = Math.round(avgRating);

    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rounded ? 'filled' : '';
        starsHTML += `<span class="star ${filled}" data-rating="${i}">★</span>`;
    }

    starsHTML += `<span class="rating-text">(${avgRating.toFixed(1)} / 5.0)</span>`;
    container.innerHTML = starsHTML;
}

function initializeRatingSystem(book) {
    const container = document.querySelector('.star-rating');
    if (!container) return;

    const stars = container.querySelectorAll('.star');
    const current = Math.round(book.rating || 0);

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    stars.forEach(star => {
        star.addEventListener('click', async function () {
            const rating = parseInt(this.dataset.rating);
            try {
                await ApiService.rateBook(book.book_id, rating);
                showNotification(`Thank you! You rated ${rating} stars`);
                
                // Update UI locally
                book.rating = rating;
                renderStarRating(book);
                initializeRatingSystem(book);
            } catch (err) {
                showNotification('Failed to submit rating. Please try again.', 'error');
                console.error(err);
            }
        });

        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });

    container.addEventListener('mouseleave', () => {
        highlightStars(current);
    });
}

function renderDescription(book) {
    const container = document.querySelector('.book-description');
    if (!container) return;

    let html = '';

    if (book.punchline) {
        html += `<p class="quote">"${escapeHtml(book.punchline)}"</p>`;
    }

    if (book.blurb) {
        html += `<p>${escapeHtml(book.blurb)}</p>`;
    }

    container.innerHTML = html || '<p>No description available.</p>';
}

function renderContents(book) {
    const container = document.querySelector('.contents-grid');
    if (!container) return;

    const structure = book.structure;

    // Handle missing structure
    if (!structure || !Array.isArray(structure) || structure.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #666;">
                <p style="font-size: 16px; margin-bottom: 10px;">📖 Table of Contents not available yet</p>
                <p style="font-size: 14px;">This book's chapters are being processed.</p>
            </div>
        `;
        return;
    }

    // Check if structure has parts
    const hasParts = structure.some(item => item.type === 'part');

    if (hasParts) {
        // Render with Parts
        const parts = structure.filter(item => item.type === 'part');
        
        container.innerHTML = parts.map(part => `
            <div class="part-column">
                <h4 class="part-title">${escapeHtml(part.title)}</h4>
                <ul class="chapter-list">
                    ${Array.isArray(part.chapters) && part.chapters.length > 0
                        ? part.chapters.map(ch => `
                            <li>
                                <a href="#" onclick="openChapter('${escapeHtml(book.book_id)}', ${ch.globalChapterNumber}); return false;">
                                    ${escapeHtml(ch.title)}
                                </a>
                            </li>
                          `).join('')
                        : '<li style="color: #999;">No chapters</li>'}
                </ul>
            </div>
        `).join('');
    } else {
        // Render flat chapters
        const chapters = structure.filter(item => item.type === 'chapter');
        
        if (chapters.length === 0) {
            container.innerHTML = '<p style="color: #666;">No chapters found</p>';
            return;
        }

        container.innerHTML = `
            <div class="part-column">
                <h4 class="part-title">Chapters</h4>
                <ul class="chapter-list">
                    ${chapters.map(ch => `
                        <li>
                            <a href="#" onclick="openChapter('${escapeHtml(book.book_id)}', ${ch.globalChapterNumber}); return false;">
                                ${escapeHtml(ch.title)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
}

function openChapter(bookId, chapterNumber) {
    console.log(`Opening chapter ${chapterNumber} of book ${bookId}`);
    
    // Save reading position
    saveReadingPosition(bookId, chapterNumber);

    // Navigate to reader page (adjust URL as needed)
    window.location.href = `/reader.html?book=${bookId}&chapter=${chapterNumber}`;
}

function renderRelatedBooks(relatedBooks) {
    const container = document.querySelector('.related-books-grid');
    if (!container) return;

    if (!relatedBooks || relatedBooks.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No related books found</p>';
        return;
    }

    container.innerHTML = relatedBooks.map(book => {
        const coverUrl = book.coverImage_cloud?.url || book.coverImage || '';
        return `
            <div class="related-book" onclick="navigateToBook('${escapeHtml(book.book_id)}')">
                <div class="related-book-cover"
                     style="background: url('${escapeHtml(coverUrl)}') center/cover; background-color: #F5F5F5;">
                    ${!coverUrl ? `<span style="padding: 20px; color: #999; display: block;">${escapeHtml(book.title)}</span>` : ''}
                </div>
                <div class="related-book-title">${escapeHtml(book.title)}</div>
                <div class="related-book-author">${escapeHtml(book.author)}</div>
            </div>
        `;
    }).join('');
}

function navigateToBook(bookId) {
    // Reload current page with new book ID
    const url = new URL(window.location.href);
    url.searchParams.set('id', bookId);
    window.location.href = url.toString();
}

function initializeReadingButtons(book) {
    const startReadingBtn = document.querySelector('.btn-primary');
    const continueReadingBtn = document.querySelector('.btn-secondary');

    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', function () {
            openChapter(book.book_id, 1);
        });
    }

    if (continueReadingBtn) {
        continueReadingBtn.addEventListener('click', function () {
            const lastChapter = getLastReadingPosition(book.book_id);
            if (lastChapter) {
                openChapter(book.book_id, lastChapter);
            } else {
                openChapter(book.book_id, 1);
            }
        });
    }
}

function saveReadingPosition(bookId, chapterNumber) {
    try {
        const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '{}');
        readingHistory[bookId] = {
            chapter: chapterNumber,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
        console.log(`Saved reading position: ${bookId} - Chapter ${chapterNumber}`);
    } catch (err) {
        console.error('Error saving reading position:', err);
    }
}

function getLastReadingPosition(bookId) {
    try {
        const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '{}');
        return readingHistory[bookId]?.chapter || null;
    } catch (err) {
        console.error('Error getting reading position:', err);
        return null;
    }
}


function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInputContainer = document.getElementById('searchInputContainer');
    const searchInput = document.querySelector('.search_input');

    if (!searchBtn || !searchInputContainer || !searchInput) return;

    searchBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        const isActive = searchInputContainer.classList.contains('active');

        if (!isActive) {
            searchInputContainer.classList.add('active');
            searchInput.focus();
        } else {
            const searchText = searchInput.value.trim();
            if (searchText) {
                performSearch(searchText);
            }
        }
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const searchText = this.value.trim();
            if (searchText) {
                performSearch(searchText);
            }
        }
    });

    document.addEventListener('click', function (e) {
        if (!searchInputContainer.contains(e.target) && !searchBtn.contains(e.target)) {
            searchInputContainer.classList.remove('active');
        }
    });
}

function performSearch(searchText) {
    const searchLower = searchText.toLowerCase();
    const allElements = document.querySelectorAll('p, h1, h2, h3, h4, li, span');
    const results = [];

    allElements.forEach(el => {
        if (el.textContent.toLowerCase().includes(searchLower)) {
            results.push(el);
        }
    });

    if (results.length > 0) {
        results[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        results[0].style.backgroundColor = '#FFEB3B';
        setTimeout(() => { results[0].style.backgroundColor = ''; }, 2000);
        showNotification(`Found ${results.length} result(s)`);
    } else {
        showNotification(`No results found for "${searchText}"`, 'error');
    }
}

function initializeLogo() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function () {
            window.location.href = '../../index.html';
        });
    }
}


function showError(message) {
    const main = document.querySelector('.main-content');
    if (!main) return;

    main.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <h2 style="font-size: 48px; margin-bottom: 20px;">📚</h2>
            <h3 style="font-size: 24px; margin-bottom: 10px; color: #ef4444;">Oops!</h3>
            <p style="font-size: 16px; color: #666; margin-bottom: 30px;">${escapeHtml(message)}</p>
            <a href="../../index.html" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">Go Home</a>
        </div>
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 200px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        animation: slideInNotif 0.3s ease forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutNotif 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotif {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutNotif {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .star {
        cursor: pointer;
        transition: transform 0.2s ease, color 0.2s ease;
        font-size: 24px;
        color: #ddd;
    }
    .star.filled {
        color: #fbbf24;
    }
    .star:hover {
        transform: scale(1.2);
    }
    .rating-text {
        font-size: 14px;
        color: #666;
        margin-left: 10px;
    }
    .related-book {
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    .related-book:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);