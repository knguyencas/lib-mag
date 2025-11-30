const API_BASE = 'http://localhost:3000/api';

let currentPage = 1;
const POSTS_PER_PAGE = 12;
let totalPages = 1;

let allPosts = [];

function getToken() {
  return localStorage.getItem('pj_token');
}

function isLoggedIn() {
  return !!getToken();
}

function getCurrentUser() {
  const userData = localStorage.getItem('pj_user');
  return userData ? JSON.parse(userData) : null;
}

document.addEventListener('DOMContentLoaded', () => {
  initPage();
  loadVisualPosts();
});

function initPage() {
  const floatingBtn = document.getElementById('floatingCreateBtn');
  if (isLoggedIn()) {
    floatingBtn.style.display = 'flex';
  } else {
    floatingBtn.style.display = 'none';
  }

  updateAuthLink();
}

function updateAuthLink() {
  const authLink = document.getElementById('authLink');
  if (isLoggedIn()) {
    const user = getCurrentUser();
    authLink.textContent = user.username || 'Profile';
    authLink.href = '/profile.html';
  } else {
    authLink.textContent = 'Login';
    authLink.href = '/login.html';
  }
}

async function loadVisualPosts(page = 1) {
  showLoading();
  currentPage = page;

  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: POSTS_PER_PAGE,
      sort: 'newest'
    });

    const response = await fetch(`${API_BASE}/visual-posts?${params}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load posts');
    }

    allPosts = data.data.posts || [];
    totalPages = data.data.pagination?.totalPages || 1;
    
    renderPosts();
    renderPagination();

  } catch (error) {
    console.error('Error loading posts:', error);
    showNoResults('Failed to load themes. Please try again later.');
  } finally {
    hideLoading();
  }
}

function renderPosts() {
  const grid = document.getElementById('visualGrid');
  const noResults = document.getElementById('noResults');

  if (allPosts.length === 0) {
    grid.innerHTML = '';
    showNoResults('No visual themes found');
    return;
  }

  noResults.style.display = 'none';

  grid.innerHTML = allPosts.map(post => createVisualCard(post)).join('');

  grid.querySelectorAll('.visual-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `/visual-post.html?id=${card.dataset.postId}`;
    });
  });
}

function createVisualCard(post) {
  return `
    <div class="visual-card" data-post-id="${post.post_id}">
      <div class="card-image-container">
        <img 
          class="card-image" 
          src="${post.image.url}" 
          alt="${escapeHtml(post.title)}"
          loading="lazy"
        />
      </div>
      <div class="card-info">
        <h3 class="card-title">${escapeHtml(post.title)}</h3>
        <div class="card-meta">
          <span class="card-author">@${escapeHtml(post.author_username)}</span>
        </div>
        <div class="card-stats">
          <span class="stat">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            ${post.likes || 0}
          </span>
          <span class="stat">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            ${post.view_count || 0}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderPagination() {
  const paginationSection = document.getElementById('paginationSection');
  
  if (totalPages <= 1) {
    paginationSection.style.display = 'none';
    return;
  }

  paginationSection.style.display = 'flex';

  let pageNumbers = '';
  const maxVisible = 6;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers += `<button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  paginationSection.innerHTML = `
    ${pageNumbers}
    ${currentPage < totalPages ? '<button class="page-next" id="nextBtn">Next</button>' : ''}
  `;

  paginationSection.querySelectorAll('.page-number').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      loadVisualPosts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        loadVisualPosts(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'flex';
  document.getElementById('visualGrid').style.display = 'none';
  document.getElementById('noResults').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
  document.getElementById('visualGrid').style.display = 'grid';
}

function showNoResults(message = 'No themes found') {
  document.getElementById('noResults').style.display = 'block';
  document.getElementById('noResultsMessage').textContent = message;
  document.getElementById('visualGrid').style.display = 'none';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

let autoRefreshInterval = null;

function startAutoRefresh() {
  autoRefreshInterval = setInterval(() => {
    if (currentPage === 1) {
      loadVisualPosts(1);
    }
  }, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});

if (!document.hidden) {
  startAutoRefresh();
}