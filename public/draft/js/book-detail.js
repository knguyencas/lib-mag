// book-detail-dynamic.js - Dynamic Book Detail Renderer

document.addEventListener('DOMContentLoaded', function() {
    // Get book ID from URL: /book-detail/the-stranger
    const bookId = getBookIdFromURL();
    
    if (!bookId) {
        showError('Book ID not found in URL');
        return;
    }
    
    // Load book data from database
    const book = booksDatabase[bookId];
    
    if (!book) {
        showError(`Book "${bookId}" not found in database`);
        return;
    }
    
    // Render book details
    renderBookDetails(book);
    
    // Initialize interactions
    initializeRatingSystem(book);
    initializeSearch();
    initializeComments(book);
    initializeLogo();
    
    console.log('Book loaded:', book.title);
});

/*
   GET BOOK ID FROM URL
*/
function getBookIdFromURL() {
    const path = window.location.pathname;
    
    // Match pattern: /book-detail/the-stranger
    const match = path.match(/\/book-detail\/([^\/]+)/);
    
    if (match && match[1]) {
        return match[1];
    }
    
    // Fallback: check URL params ?id=the-stranger
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'the-stranger'; // Default fallback
}

/*
   RENDER BOOK DETAILS
*/
function renderBookDetails(book) {
    // 1. Render Book Cover
    renderBookCover(book);
    
    // 2. Render Categories (dynamic count)
    renderCategories(book.categories);
    
    // 3. Render Title & Author
    document.querySelector('.book-title').textContent = book.title;
    document.querySelector('.book-author').textContent = book.author;
    
    // 4. Render Star Rating
    renderStarRating(book.rating);
    
    // 5. Render Description (with optional punchline)
    renderDescription(book);
    
    // 6. Render Contents (smart: parts or chapters)
    renderContents(book);
    
    // 7. Render Comments
    renderComments(book.comments);
    
    // 8. Render Related Books
    renderRelatedBooks(book.relatedBooks);
    
    // 9. Update page title
    document.title = `Psyche Journey - ${book.title}`;
}

/*
   RENDER BOOK COVER
*/
function renderBookCover(book) {
    const coverContainer = document.querySelector('.book-cover');
    
    if (book.cover.type === 'svg') {
        coverContainer.innerHTML = `
            <svg class="cover-design" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="450" fill="#F5F5F5"/>
                ${book.cover.design}
                <text x="150" y="320" text-anchor="middle" class="cover-title">${book.title}</text>
                <text x="150" y="350" text-anchor="middle" class="cover-author">${book.author.toUpperCase()}</text>
            </svg>
        `;
    } else if (book.cover.type === 'image') {
        coverContainer.innerHTML = `
            <img src="${book.cover.url}" alt="${book.title}" style="width: 100%; height: auto;">
        `;
    } else {
        coverContainer.innerHTML = `
            <div style="background: #F5F5F5; height: 600px; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 40px;">
                <div style="font-size: 28px; font-weight: 500; margin-bottom: 20px; text-align: center;">${book.title}</div>
                <div style="font-size: 18px; font-weight: 300; color: #666;">${book.author.toUpperCase()}</div>
            </div>
        `;
    }
}

/*
   RENDER CATEGORIES (dynamic count)
*/
function renderCategories(categories) {
    const container = document.querySelector('.categories');
    container.innerHTML = categories.map(cat => 
        `<span class="category-tag">${cat}</span>`
    ).join('');
}

/*
   RENDER STAR RATING (with average & clickable)
*/
function renderStarRating(rating) {
    const container = document.querySelector('.star-rating');
    const avgRating = Math.round(rating.average);
    
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= avgRating ? 'filled' : '';
        starsHTML += `<span class="star ${filled}" data-rating="${i}">★</span>`;
    }
    
    starsHTML += `<span class="rating-text">(${rating.average.toFixed(1)} / ${rating.totalRatings} ratings)</span>`;
    
    container.innerHTML = starsHTML;
}

/*
   RENDER DESCRIPTION (with punchline if exists)
*/
function renderDescription(book) {
    const container = document.querySelector('.book-description');
    let html = '';
    
    // Add punchline if exists
    if (book.punchline) {
        html += `<p class="quote">"${book.punchline}"</p>`;
    }
    
    // Add summary paragraphs
    book.summary.forEach(paragraph => {
        html += `<p>${paragraph}</p>`;
    });
    
    container.innerHTML = html;
}

/*
   RENDER CONTENTS (smart: parts or chapters only)
*/
function renderContents(book) {
    const container = document.querySelector('.contents-grid');
    
    if (book.structure === 'parts') {
        // Render with Parts structure
        container.innerHTML = book.contents.map(part => `
            <div class="part-column">
                <h4 class="part-title">${part.title}</h4>
                <ul class="chapter-list">
                    ${part.chapters.map(ch => 
                        `<li><a href="${ch.url}">${ch.title}</a></li>`
                    ).join('')}
                </ul>
            </div>
        `).join('');
    } else {
        // Render chapters only (no parts)
        container.innerHTML = `
            <div class="part-column">
                <h4 class="part-title">Chapters</h4>
                <ul class="chapter-list">
                    ${book.contents.map(ch => 
                        `<li><a href="${ch.url}">${ch.title}</a></li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }
}

/*
   RENDER COMMENTS
*/
function renderComments(comments) {
    const container = document.querySelector('.comments-list');
    
    if (comments.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    container.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');
}

function createCommentHTML(comment) {
    const date = new Date(comment.date).toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-header">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIwIiBmaWxsPSIjZGRkIi8+CiAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjE1IiByPSI3IiBmaWxsPSIjOTk5Ii8+CiAgICA8ZWxsaXBzZSBjeD0iMjAiIGN5PSIzNSIgcng9IjEyIiByeT0iOCIgZmlsbD0iIzk5OSIvPgo8L3N2Zz4=" alt="User Avatar" class="comment-avatar">
                <div class="comment-meta">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <button class="comment-like-btn" data-likes="${comment.likes}">♡ ${comment.likes}</button>
            </div>
            <div class="comment-body">
                <p>${escapeHtml(comment.text)}</p>
            </div>
            <div class="comment-footer">
                <button class="comment-reply-btn">reply</button>
                ${comment.replies > 0 ? `<button class="load-replies-btn">Load ${comment.replies} Replies ▼</button>` : ''}
            </div>
        </div>
    `;
}

/*
   RENDER RELATED BOOKS
*/
function renderRelatedBooks(relatedBookIds) {
    const container = document.querySelector('.related-books-grid');
    
    container.innerHTML = relatedBookIds.map(bookId => {
        const book = booksDatabase[bookId];
        if (!book) return '';
        
        let coverStyle = '';
        if (book.cover.type === 'image') {
            coverStyle = `background: url('${book.cover.url}') center/cover;`;
        } else {
            coverStyle = `background: #E8E8E8;`;
        }
        
        return `
            <div class="related-book" onclick="navigateToBook('${bookId}')">
                <div class="related-book-cover" style="${coverStyle}">
                    ${book.cover.type !== 'image' ? book.title : ''}
                </div>
                <div class="related-book-title">${book.title}</div>
                <div class="related-book-author">${book.author}</div>
            </div>
        `;
    }).join('');
}

function navigateToBook(bookId) {
    window.location.href = `/book-detail/${bookId}`;
}

/*
   RATING SYSTEM - User can click stars
*/
function initializeRatingSystem(book) {
    const stars = document.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            submitRating(book.id, rating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', function() {
        const avgRating = Math.round(book.rating.average);
        highlightStars(avgRating);
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

function submitRating(bookId, rating) {
    console.log(`User rated ${bookId}: ${rating} stars`);
    
    // In real app: send to backend
    // fetch('/api/rate-book', { method: 'POST', body: JSON.stringify({ bookId, rating }) })
    
    // Update local data
    const book = booksDatabase[bookId];
    book.rating.distribution[rating]++;
    book.rating.totalRatings++;
    
    // Recalculate average
    let sum = 0;
    let total = 0;
    for (let [stars, count] of Object.entries(book.rating.distribution)) {
        sum += parseInt(stars) * count;
        total += count;
    }
    book.rating.average = sum / total;
    
    // Re-render rating
    renderStarRating(book.rating);
    initializeRatingSystem(book);
    
    showNotification(`Thank you! You rated ${rating} stars`);
}

/*
   INITIALIZE SEARCH
*/
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInputContainer = document.getElementById('searchInputContainer');
    const searchInput = document.querySelector('.search_input');
    
    if (!searchBtn || !searchInputContainer || !searchInput) return;
    
    searchBtn.addEventListener('click', function(e) {
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
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchText = this.value.trim();
            if (searchText) {
                performSearch(searchText);
            }
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInputContainer.contains(e.target) && !searchBtn.contains(e.target)) {
            searchInputContainer.classList.remove('active');
        }
    });
}

function performSearch(searchText) {
    console.log('Searching for:', searchText);
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

/*
   INITIALIZE COMMENTS
*/
function initializeComments(book) {
    const commentSubmitBtn = document.querySelector('.comment-submit-btn');
    const commentTextarea = document.querySelector('.comment-textarea');
    const commentsList = document.querySelector('.comments-list');
    
    if (commentSubmitBtn && commentTextarea) {
        commentSubmitBtn.addEventListener('click', function() {
            const commentText = commentTextarea.value.trim();
            
            if (commentText) {
                addComment(book.id, commentText, commentsList);
                commentTextarea.value = '';
                showNotification('Comment posted successfully!');
            } else {
                showNotification('Please enter a comment', 'error');
            }
        });
    }
    
    // Event delegation for like and reply
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('comment-like-btn')) {
            toggleLike(e.target);
        }
        
        if (e.target.classList.contains('comment-reply-btn')) {
            const comment = e.target.closest('.comment-item');
            const username = comment.querySelector('.comment-username').textContent;
            commentTextarea.value = `@${username} `;
            commentTextarea.focus();
        }
    });
}

function addComment(bookId, text, commentsList) {
    const newComment = {
        id: 'c' + Date.now(),
        username: 'Current User',
        avatar: 'default',
        date: new Date().toISOString(),
        text: text,
        likes: 0,
        replies: 0
    };
    
    // Add to database
    booksDatabase[bookId].comments.unshift(newComment);
    
    // Add to DOM
    commentsList.insertAdjacentHTML('afterbegin', createCommentHTML(newComment));
}

function toggleLike(button) {
    const currentLikes = parseInt(button.dataset.likes);
    const isLiked = button.textContent.includes('♥');
    
    if (isLiked) {
        button.textContent = `♡ ${currentLikes - 1}`;
        button.dataset.likes = currentLikes - 1;
    } else {
        button.textContent = `♥ ${currentLikes + 1}`;
        button.dataset.likes = currentLikes + 1;
        button.style.color = '#FF0000';
    }
}

/*
   INITIALIZE LOGO
*/
function initializeLogo() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
}

/*
   UTILITIES
*/
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    document.querySelector('.main-content').innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <h2 style="font-size: 48px; margin-bottom: 20px;">📚</h2>
            <h3 style="font-size: 24px; margin-bottom: 10px;">Oops!</h3>
            <p style="font-size: 16px; color: #666;">${message}</p>
            <a href="/" style="display: inline-block; margin-top: 30px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none;">Go Home</a>
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
        border-radius: 4px;
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
        transition: transform 0.2s ease;
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