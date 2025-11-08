document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInputContainer = document.getElementById('searchInputContainer');
    const searchInput = searchInputContainer.querySelector('.search-input');
    const searchSubmit = searchInputContainer.querySelector('.search-submit');
    
    searchBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        searchInputContainer.classList.toggle('active');
        
        if (searchInputContainer.classList.contains('active')) {
            searchInput.focus();
            searchBtn.style.display = 'none';
        } else {
            searchBtn.style.display = 'block';
        }
    });
    
    searchSubmit.addEventListener('click', function() {
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            console.log('Searching for:', searchQuery);
            alert('Searching for: ' + searchQuery);
            
            searchInput.value = '';
            searchInputContainer.classList.remove('active');
            searchBtn.style.display = 'block';
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchSubmit.click();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInputContainer.contains(e.target) && !searchBtn.contains(e.target)) {
            searchInputContainer.classList.remove('active');
            searchBtn.style.display = 'block';
        }
    });

    const commentForm = document.querySelector('.comment-form');
    const commentInput = document.querySelector('.comment-input');
    const commentSubmitBtn = document.querySelector('.comment-submit');
    const commentList = document.querySelector('.comment-list');
    
    commentSubmitBtn.addEventListener('click', function() {
        const commentText = commentInput.value.trim();
        
        if (commentText) {
            const newComment = createCommentElement('Current User', 'Just now', commentText);
            
            commentList.insertBefore(newComment, commentList.firstChild);
            
            commentInput.value = '';
            
            showNotification('Comment posted successfully!');
        } else {
            showNotification('Please enter a comment before submitting.', 'error');
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('comment-like')) {
            e.target.textContent = e.target.textContent === '♡' ? '♥' : '♡';
            e.target.style.color = e.target.textContent === '♥' ? '#ff0000' : '#000';
        }
        
        if (e.target.classList.contains('comment-reply')) {
            const comment = e.target.closest('.comment');
            const username = comment.querySelector('.comment-user').textContent;
            commentInput.value = '@' + username + ' ';
            commentInput.focus();
            
            commentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    function createCommentElement(username, date, text) {
        const comment = document.createElement('div');
        comment.className = 'comment';
        
        comment.innerHTML = `
            <div class="comment-header">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIwIiBmaWxsPSIjNDQ0Ii8+CiAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjE1IiByPSI3IiBmaWxsPSIjZmZmIi8+CiAgICA8ZWxsaXBzZSBjeD0iMjAiIGN5PSIzNSIgcng9IjEyIiByeT0iOCIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=" alt="User" class="comment-avatar">
                <div class="comment-meta">
                    <span class="comment-user">${username}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <button class="comment-like">♡</button>
            </div>
            <div class="comment-body">
                <p>${text}</p>
            </div>
            <button class="comment-reply">reply</button>
        `;
        
        return comment;
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 250px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 25px;
            border-radius: 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    const relatedBooks = [
        {
            title: 'The Plague',
            author: 'Albert Camus',
            cover: '#e8e8e8'
        },
        {
            title: 'The Myth of Sisyphus',
            author: 'Albert Camus',
            cover: '#d4d4d4'
        },
        {
            title: 'No Exit',
            author: 'Jean-Paul Sartre',
            cover: '#c0c0c0'
        },
        {
            title: 'The Metamorphosis',
            author: 'Franz Kafka',
            cover: '#acacac'
        }
    ];
    
    const relatedBooksGrid = document.querySelector('.related-books-grid');
    
    relatedBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'related-book';
        bookElement.style.cssText = `
            cursor: pointer;
            transition: transform 0.3s ease;
            text-align: center;
        `;
        
        bookElement.innerHTML = `
            <div style="
                background: ${book.cover};
                height: 200px;
                border-radius: 0;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #666;
            ">
                Book Cover
            </div>
            <h4 style="
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 5px;
            ">${book.title}</h4>
            <p style="
                font-size: 12px;
                color: #666;
            ">${book.author}</p>
        `;
        
        bookElement.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        bookElement.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        bookElement.addEventListener('click', function() {
            alert(`Opening: ${book.title} by ${book.author}`);
        });
        
        relatedBooksGrid.appendChild(bookElement);
    });
    
    let lastScrollTop = 0;
    const header = document.querySelector('.sticky-header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - hide header
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show header
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #000 0%, #666 100%);
        z-index: 2000;
        transition: width 0.2s ease;
        width: 0%;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const progress = (scrollPosition / scrollHeight) * 100;
        progressBar.style.width = progress + '%';
    });
    
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Initialize page
    console.log('Book detail page initialized successfully!');
});