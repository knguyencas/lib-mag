// Navigation and Page Routing
document.addEventListener('DOMContentLoaded', function() {
  
  // Logo click handler
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }

  // Header links routing
  const contactLinks = document.querySelectorAll('a[href="#"]');
  contactLinks.forEach(link => {
    if (link.textContent.trim() === 'Contact') {
      link.href = 'contact.html';
    } else if (link.textContent.trim() === 'Login') {
      link.href = 'login.html';
    }
  });

  // Navigation bar links
  const navLinks = document.querySelectorAll('.nav_bar a');
  navLinks.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    if (text === 'home') {
      link.href = 'index.html';
    } else if (text === 'library') {
      link.href = 'library.html';
    } else if (text === 'themes') {
      link.href = 'themes.html';
    } else if (text === 'perspective') {
      link.href = 'perspective.html';
    } else if (text === 'about') {
      link.href = 'about.html';
    }
  });

  // Button handlers
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

  // Search functionality
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
  }

  function performSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    
    if (searchText === '') {
      if (searchError) {
        searchError.textContent = 'Please enter search term';
      }
      return;
    }
    
    if (searchError) {
      searchError.textContent = '';
    }

    // Search through all elements with IDs and their content
    const allElements = document.querySelectorAll('[id]');
    const results = [];

    allElements.forEach(el => {
      const id = el.id.toLowerCase();
      const content = el.textContent.toLowerCase();
      
      if (id.includes(searchText) || content.includes(searchText)) {
        results.push({
          id: el.id,
          element: el,
          content: el.textContent.substring(0, 100)
        });
      }
    });

    if (results.length > 0) {
      console.log('Search results:', results);
      // Scroll to first result
      results[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      results[0].element.style.backgroundColor = '#ffeb3b';
      setTimeout(() => {
        results[0].element.style.backgroundColor = '';
      }, 2000);
    } else {
      if (searchError) {
        searchError.textContent = `No results found for: '${searchText}'`;
      }
    }
  }

  // Most Read Books Section - Enhanced Scroll Effect
  const mostReadGrid = document.querySelector('.most_read_grid');
  
  if (mostReadGrid) {
    // Create 20 books (4 visible + 16 more)
    const bookImages = [
      { img: 'images/book1.png', alt: 'The Stranger', link: 'books/the-stranger.html' },
      { img: 'images/book2.jpg', alt: "Man's Search for Meaning", link: 'books/mans-search.html' },
      { img: 'images/book3.jpg', alt: 'Crime and Punishment', link: 'books/crime-and-punishment.html' },
      { img: 'images/book4.jpg', alt: 'The Bell Jar', link: 'books/the-bell-jar.html' },
      { img: 'images/book5.jpg', alt: 'The Catcher in the Rye', link: 'books/catcher-rye.html' },
      { img: 'images/book6.jpg', alt: '1984', link: 'books/1984.html' },
      { img: 'images/book7.jpg', alt: 'Brave New World', link: 'books/brave-new-world.html' },
      { img: 'images/book8.jpg', alt: 'The Great Gatsby', link: 'books/great-gatsby.html' },
      { img: 'images/book9.jpg', alt: 'To Kill a Mockingbird', link: 'books/mockingbird.html' },
      { img: 'images/book10.jpg', alt: 'One Flew Over the Cuckoos Nest', link: 'books/cuckoos-nest.html' },
      { img: 'images/book11.jpg', alt: 'The Picture of Dorian Gray', link: 'books/dorian-gray.html' },
      { img: 'images/book12.jpg', alt: 'Siddhartha', link: 'books/siddhartha.html' },
      { img: 'images/book13.jpg', alt: 'The Trial', link: 'books/the-trial.html' },
      { img: 'images/book14.jpg', alt: 'Notes from Underground', link: 'books/notes-underground.html' },
      { img: 'images/book15.jpg', alt: 'The Metamorphosis', link: 'books/metamorphosis.html' },
      { img: 'images/book16.jpg', alt: 'Nausea', link: 'books/nausea.html' },
      { img: 'images/book17.jpg', alt: 'Steppenwolf', link: 'books/steppenwolf.html' },
      { img: 'images/book18.jpg', alt: 'The Plague', link: 'books/the-plague.html' },
      { img: 'images/book19.jpg', alt: 'Demian', link: 'books/demian.html' },
      { img: 'images/book20.jpg', alt: 'The Fall', link: 'books/the-fall.html' }
    ];

    // Clear existing books and add all 20
    mostReadGrid.innerHTML = '';
    bookImages.forEach(book => {
      const bookEl = document.createElement('a');
      bookEl.href = book.link;
      bookEl.className = 'book';
      bookEl.innerHTML = `<img src="${book.img}" alt="${book.alt}">`;
      mostReadGrid.appendChild(bookEl);
    });

    const books = mostReadGrid.querySelectorAll('.book');
    let isHovering = false;
    let scrollPosition = 0;

    // Set initial state - books evenly spaced with no gap
    function setDefaultState() {
      books.forEach((book, index) => {
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

    // Mouse leave grid - return to default state
    mostReadGrid.addEventListener('mouseleave', function() {
      isHovering = false;
      setDefaultState();
    });

    // Scroll handler
    mostReadGrid.addEventListener('wheel', function(e) {
      if (!isHovering) return;
      
      e.preventDefault();
      
      // Determine scroll direction
      if (e.deltaY > 0) {
        // Scroll down - increase overlap
        scrollPosition = Math.min(scrollPosition + 1, books.length - 1);
      } else {
        // Scroll up - decrease overlap
        scrollPosition = Math.max(scrollPosition - 1, 0);
      }
      
      updateBookPositions();
    });

    function updateBookPositions() {
      books.forEach((book, index) => {
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
    books.forEach(book => {
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
  }
});