document.addEventListener('DOMContentLoaded', function() {
  // Logo click
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }

  // Buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    if (btn.textContent.trim() === 'Login') {
      btn.addEventListener('click', function() {
        window.location.href = 'login.html';
      });
    } else if (btn.textContent.trim() === 'Explore library') {
      btn.addEventListener('click', function() {
        window.location.href = 'library.html';
      });
    }
  });

  // Search
  const searchBtn = document.querySelector('.search_btn');
  const searchInput = document.querySelector('.search_bar input');
  let searchError = document.querySelector('.search_error');
  
  // Create error element if it doesn't exist
  if (!searchError) {
    searchError = document.createElement('div');
    searchError.className = 'search_error';
    const subNav = document.querySelector('.sub_nav');
    if (subNav) {
      subNav.appendChild(searchError);
    }
  }
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // Clear error when typing
    searchInput.addEventListener('input', function() {
      if (searchError) {
        searchError.textContent = '';
      }
    });
  }

  async function performSearch() {
    const searchText = searchInput.value.trim();
    
    if (searchText === '') {
      if (searchError) {
        searchError.textContent = 'Please enter search term';
      }
      return;
    }
    
    if (searchError) {
      searchError.textContent = '';
    }

    // Redirect to search results page
    window.location.href = `search-results.html?q=${encodeURIComponent(searchText)}`;
  }

  // Most Read Books Section - Load from Database
  const mostReadGrid = document.querySelector('.most_read_grid');
  
  if (mostReadGrid) {
    loadMostReadBooks();
  }

  async function loadMostReadBooks() {
    try {
      // Show loading state
      mostReadGrid.innerHTML = '<div style="color: #666; padding: 20px;">Loading books...</div>';

      // Load API service if not already loaded
      if (typeof apiService === 'undefined') {
        console.error('API Service not loaded');
        mostReadGrid.innerHTML = '<div style="color: #666; padding: 20px;">Unable to load books</div>';
        return;
      }

      const books = await apiService.getMostReadBooks(30);
      
      if (books.length === 0) {
        console.warn('No books found');
        mostReadGrid.innerHTML = '<div style="color: #666; padding: 20px;">No books available</div>';
        return;
      }

      // Clear loading message
      mostReadGrid.innerHTML = '';

      // Add all books from database
      books.forEach(book => {
        const bookEl = document.createElement('a');
        bookEl.href = `book-detail.html?id=${book.book_id}`;
        bookEl.className = 'book';
        
        const coverUrl = book.coverImage_cloud?.url || '';
        
        if (coverUrl) {
          bookEl.innerHTML = `<img src="${coverUrl}" alt="${book.title}">`;
        } else {
          bookEl.innerHTML = `
            <div style="
              width: 240px;
              height: 360px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              padding: 20px;
              text-align: center;
              font-weight: bold;
              font-size: 18px;
            ">${book.title}</div>
          `;
        }
        
        mostReadGrid.appendChild(bookEl);
      });

      const bookElements = mostReadGrid.querySelectorAll('.book');
      let isHovering = false;
      let scrollPosition = 0;

      // Set initial state - books evenly spaced with no gap
      function setDefaultState() {
        bookElements.forEach((book, index) => {
          book.style.marginRight = '0px';
          book.style.transform = 'scale(1) translateY(0)';
          book.style.zIndex = index;
        });
      }

      setDefaultState();

      // Mouse enter grid - enable overlapping mode
      mostReadGrid.addEventListener('mouseenter', function() {
        isHovering = true;
        scrollPosition = 0;
        updateBookPositions();
      });

      // Scroll handler
      mostReadGrid.addEventListener('wheel', function(e) {
        if (!isHovering) return;
        
        e.preventDefault();
        
        // Determine scroll direction
        if (e.deltaY > 0) {
          // Scroll down - increase overlap
          scrollPosition = Math.min(scrollPosition + 1, bookElements.length - 1);
        } else {
          // Scroll up - decrease overlap
          scrollPosition = Math.max(scrollPosition - 1, 0);
        }
        
        updateBookPositions();
      });

      function updateBookPositions() {
        bookElements.forEach((book, index) => {
          let marginRight;
          let zIndex;
          
          if (index < scrollPosition) {
            // Books before scroll position - fully overlapped
            const overlapPercent = 80;
            marginRight = -(240 * overlapPercent / 100);
            zIndex = index;
          } else if (index === scrollPosition) {
            // Current focused book
            marginRight = 0;
            zIndex = 100;
            book.style.transform = 'scale(1.05) translateY(-10px)';
          } else if (index === scrollPosition + 1) {
            // Next book - 25% overlap
            marginRight = -(240 * 0.25);
            zIndex = scrollPosition + 1 - index + 50;
          } else if (index === scrollPosition + 2) {
            // Second next - 50% overlap
            marginRight = -(240 * 0.5);
            zIndex = scrollPosition + 2 - index + 50;
          } else if (index === scrollPosition + 3) {
            // Third next - 75% overlap
            marginRight = -(240 * 0.75);
            zIndex = scrollPosition + 3 - index + 50;
          } else {
            // Rest - 80% overlap
            marginRight = -(240 * 0.8);
            zIndex = scrollPosition + 4 - index + 50;
          }
          
          book.style.marginRight = marginRight + 'px';
          book.style.zIndex = zIndex;
          
          if (index !== scrollPosition) {
            book.style.transform = 'scale(1) translateY(0)';
          }
        });
      }

      // Individual book hover effect
      bookElements.forEach(book => {
        book.addEventListener('mouseenter', function() {
          if (!isHovering) {
            this.style.transform = 'scale(1.05) translateY(-10px)';
            this.style.zIndex = '100';
          }
        });

        book.addEventListener('mouseleave', function() {
          if (!isHovering) {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.zIndex = '';
          }
        });
      });

    } catch (error) {
      console.error('Error loading most read books:', error);
      mostReadGrid.innerHTML = '<div style="color: #666; padding: 20px;">Error loading books</div>';
    }
  }
});