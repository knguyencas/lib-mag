document.addEventListener('DOMContentLoaded', async function() {
    const bookId = getBookIdFromURL();
    console.log('Book ID from URL:', bookId);

    if (!bookId) {
        showError('Book ID not found in URL. Please provide ?id=BOOK_ID or ?book_id=BOOK_ID');
        return;
    }

    try {
        showLoading();

        const book = await ApiService.getBookById(bookId);

        let structure = await ApiService.getBookStructure(bookId);

        if (!structure && book.structure) {
            console.log('Using structure from book document');
            structure = book.structure;
        }

        const relatedBooks = await ApiService.getRelatedBooks(bookId, 4);

        hideLoading();

        renderBookDetails(book);
        renderContents(structure, book.book_id);
        renderRelatedBooks(relatedBooks);

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
    const params = new URLSearchParams(window.location.search);
    // ?id=BK001 lẫn ?book_id=BK001
    return params.get('id') || params.get('book_id');
}

function showLoading() {
    const titleEl = document.querySelector('.book-title');
    const authorEl = document.querySelector('.book-author');
    const descEl = document.querySelector('.book-description');

    if (titleEl) titleEl.textContent = 'Loading...';
    if (authorEl) authorEl.textContent = '';
    if (descEl) descEl.innerHTML = '';
}

function hideLoading() {
}

function showError(message) {
    const wrapper = document.querySelector('.book-detail-wrapper');
    if (wrapper) {
        wrapper.innerHTML = `
            <div style="padding:40px 52px;">
                <h2 style="color:#c33; margin-bottom:16px;">Error</h2>
                <p style="margin-bottom:16px;">${message}</p>
                <ul style="font-size:14px; color:#666; list-style:disc; padding-left:20px;">
                    <li>Đảm bảo backend đang chạy ở http://localhost:3000</li>
                    <li>Kiểm tra xem book_id có tồn tại trong database</li>
                    <li>Mở DevTools &gt; Console để xem lỗi chi tiết</li>
                </ul>
            </div>
        `;
    } else {
        alert(message);
    }
}

function renderBookDetails(book) {
    if (!book) return;

    const coverEl = document.querySelector('.book-cover');
    const categoriesEl = document.querySelector('.categories');
    const titleEl = document.querySelector('.book-title');
    const authorEl = document.querySelector('.book-author');
    const descEl = document.querySelector('.book-description');
    const starContainer = document.querySelector('.star-rating');

    // Cover
    if (coverEl) {
        coverEl.innerHTML = '';
        if (book.coverImage_cloud && book.coverImage_cloud.url) {
            coverEl.style.backgroundImage = `url('${book.coverImage_cloud.url}')`;
            coverEl.style.backgroundSize = 'cover';
            coverEl.style.backgroundPosition = 'center';
            coverEl.style.aspectRatio = '3 / 4';
        } else if (book.coverImage) {
            coverEl.style.backgroundImage = `url('${book.coverImage}')`;
            coverEl.style.backgroundSize = 'cover';
            coverEl.style.backgroundPosition = 'center';
            coverEl.style.aspectRatio = '3 / 4';
        } else {
            coverEl.style.background = '#F5F5F5';
            coverEl.style.display = 'flex';
            coverEl.style.alignItems = 'center';
            coverEl.style.justifyContent = 'center';
            coverEl.textContent = 'No cover available';
        }
    }

    // Categories + primary_genre
    if (categoriesEl) {
        categoriesEl.innerHTML = '';

        if (book.primary_genre) {
            const pg = document.createElement('span');
            pg.className = 'primary-genre';
            pg.textContent = book.primary_genre;
            categoriesEl.appendChild(pg);
        }

        if (Array.isArray(book.categories)) {
            book.categories.forEach(cat => {
                const span = document.createElement('span');
                span.className = 'category-tag';
                span.textContent = cat;
                categoriesEl.appendChild(span);
            });
        }
    }

    if (titleEl) titleEl.textContent = book.title || 'Untitled';
    if (authorEl) authorEl.textContent = book.author ? `by ${book.author}` : '';

    // Rating
    if (starContainer) {
        starContainer.innerHTML = '';
        const rating = book.rating || 0;
        const rounded = Math.round(rating);

        for (let i = 1; i <= 5; i++) {
            const span = document.createElement('span');
            span.className = 'star' + (i <= rounded ? ' filled' : '');
            span.textContent = '★';
            starContainer.appendChild(span);
        }

        const text = document.createElement('span');
        text.style.marginLeft = '8px';
        text.style.fontSize = '14px';
        text.textContent = `${rating.toFixed(1)} / 5.0`;
        starContainer.appendChild(text);
    }

    if (descEl) {
        const parts = [];
        if (book.punchline) {
            parts.push(`<p class="quote">${book.punchline}</p>`);
        }
        if (book.blurb) {
            parts.push(`<p>${book.blurb}</p>`);
        }
        descEl.innerHTML = parts.join('');
    }
}

function renderContents(structure, bookId) {
    const container = document.querySelector('.contents-grid');
    if (!container) return;

    container.innerHTML = '';

    if (!structure) {
        container.innerHTML = '<p style="color:#999;">Contents not available yet.</p>';
        console.log('No structure found');
        return;
    }

    if (Array.isArray(structure)) {
        console.log('Rendering split structure (array):', structure);

        structure.forEach(item => {
            if (item.type === 'part') {
                const partDiv = document.createElement('div');

                const title = document.createElement('h4');
                title.className = 'part-title';
                title.textContent = item.title || 'Part';
                partDiv.appendChild(title);

                if (Array.isArray(item.chapters) && item.chapters.length > 0) {
                    const ul = document.createElement('ul');
                    ul.className = 'chapter-list';

                    item.chapters.forEach(ch => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        const chapNum = ch.globalChapterNumber || ch.partChapterNumber;

                        a.href = `reader.html?id=${bookId}&chapter=${chapNum}`;
                        a.textContent = ch.title || `Chapter ${chapNum}`;

                        li.appendChild(a);
                        ul.appendChild(li);
                    });

                    partDiv.appendChild(ul);
                }

                container.appendChild(partDiv);
            }

            if (item.type === 'chapter') {
                let miscDiv = container.querySelector('.misc-chapters');
                if (!miscDiv) {
                    miscDiv = document.createElement('div');
                    miscDiv.className = 'misc-chapters';

                    const title = document.createElement('h4');
                    title.className = 'part-title';
                    title.textContent = 'Chapters';
                    miscDiv.appendChild(title);

                    const ul = document.createElement('ul');
                    ul.className = 'chapter-list';
                    miscDiv.appendChild(ul);

                    container.appendChild(miscDiv);
                }

                const ul = miscDiv.querySelector('.chapter-list');
                const li = document.createElement('li');
                const a = document.createElement('a');
                const chapNum = item.globalChapterNumber || item.partChapterNumber;

                a.href = `reader.html?id=${bookId}&chapter=${chapNum}`;
                a.textContent = item.title || `Chapter ${chapNum}`;

                li.appendChild(a);
                ul.appendChild(li);
            }
        });

        return;
    }

    console.log('Rendering book.structure (object):', structure);

    if (Array.isArray(structure.parts) && structure.parts.length > 0) {
        structure.parts.forEach(part => {
            const partDiv = document.createElement('div');

            const title = document.createElement('h4');
            title.className = 'part-title';
            title.textContent = part.title || `Part ${part.part_number || ''}`;
            partDiv.appendChild(title);

            if (Array.isArray(part.chapters) && part.chapters.length > 0) {
                const ul = document.createElement('ul');
                ul.className = 'chapter-list';

                part.chapters.forEach(chap => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');

                    const chapNum = chap.globalChapterNumber || chap.chapter_number;
                    a.href = `reader.html?id=${bookId}&chapter=${chapNum}`;
                    a.textContent = chap.title || `Chapter ${chapNum}`;

                    li.appendChild(a);
                    ul.appendChild(li);
                });

                partDiv.appendChild(ul);
            }

            container.appendChild(partDiv);
        });
        return;
    }

    if (structure.total_chapters && structure.total_chapters > 0) {
        const partDiv = document.createElement('div');

        const title = document.createElement('h4');
        title.className = 'part-title';
        title.textContent = 'Chapters';
        partDiv.appendChild(title);

        const ul = document.createElement('ul');
        ul.className = 'chapter-list';

        for (let i = 1; i <= structure.total_chapters; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `reader.html?id=${bookId}&chapter=${i}`;
            a.textContent = `Chapter ${i}`;
            li.appendChild(a);
            ul.appendChild(li);
        }

        partDiv.appendChild(ul);
        container.appendChild(partDiv);
        return;
    }

    container.innerHTML = '<p style="color:#999;">Contents not available yet.</p>';
}

function renderRelatedBooks(books) {
    const container = document.querySelector('.related-books-grid');
    if (!container) return;

    container.innerHTML = '';

    if (!books || books.length === 0) {
        container.innerHTML = '<p style="color:#999;">No related books to display.</p>';
        return;
    }

    books.forEach(book => {
        const wrapper = document.createElement('div');
        wrapper.className = 'related-book';
        wrapper.addEventListener('click', () => {
            window.location.href = `book-detail.html?id=${book.book_id}`;
        });

        const cover = document.createElement('div');
        cover.className = 'related-book-cover';

        if (book.coverImage_cloud && book.coverImage_cloud.url) {
            cover.style.backgroundImage = `url('${book.coverImage_cloud.url}')`;
            cover.style.backgroundSize = 'cover';
            cover.style.backgroundPosition = 'center';
        } else if (book.coverImage) {
            cover.style.backgroundImage = `url('${book.coverImage}')`;
            cover.style.backgroundSize = 'cover';
            cover.style.backgroundPosition = 'center';
        } else {
            cover.textContent = 'No cover';
        }

        const title = document.createElement('div');
        title.className = 'related-book-title';
        title.textContent = book.title;

        const author = document.createElement('div');
        author.className = 'related-book-author';
        author.textContent = book.author;

        wrapper.appendChild(cover);
        wrapper.appendChild(title);
        wrapper.appendChild(author);

        container.appendChild(wrapper);
    });
}

function initializeRatingSystem(book) {
}

function initializeSearch() {
    const input = document.querySelector('.search_input');
    const btn = document.querySelector('.search_btn');

    if (!input || !btn) return;

    btn.addEventListener('click', () => {
        const q = input.value.trim();
        if (!q) return;

        window.location.href = `search-results.html?search=${encodeURIComponent(q)}`;
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btn.click();
        }
    });
}

function initializeReadingButtons(book) {
    const startBtn = document.querySelector('.btn-primary');
    const continueBtn = document.querySelector('.btn-secondary');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            window.location.href = `reader.html?id=${book.book_id}&chapter=1`;
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // sau này có thể lưu last_chapter trong localStorage / user profile
            window.location.href = `reader.html?id=${book.book_id}&chapter=1`;
        });
    }
}

function initializeLogo() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}
