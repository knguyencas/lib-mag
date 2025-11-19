const API_BASE_URL = 'http://localhost:3000/api';

const CURRENT_USER_ID = window.localStorage.getItem('pj_user_id') || null;

const PerspectiveApi = {
  async getPrimaryGenres() {
    try {
      const res = await fetch(`${API_BASE_URL}/primarygenres`);
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      return json.data || json.genres || [];
    } catch (err) {
      console.warn('Genres API failed:', err);
      return [];
    }
  },

  async getPerspectivePosts() {
    try {
      const res = await fetch(`${API_BASE_URL}/perspectivepost`);
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      const raw = json.data || json.posts || [];
      return raw.map(normalizePostFromApi);
    } catch (err) {
      console.warn('Perspective posts API failed, using mock data:', err);
      return mockPosts;
    }
  },

  async getUserPerspectiveState(userId) {
    if (!userId) {
      console.warn('No CURRENT_USER_ID, skip user state.');
      return { votes: {}, favorites: [] };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/perspective-state`);
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      return {
        votes: json.votes || {},
        favorites: json.favorites || []
      };
    } catch (err) {
      console.warn('User perspective state API failed:', err);
      return { votes: {}, favorites: [] };
    }
  },

  async votePost(postId, value) {
    if (!CURRENT_USER_ID) {
      console.warn('No user logged in, vote skipped.');
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          targetType: 'perspectivepost',
          targetId: postId,
          value
        })
      });
    } catch (err) {
      console.error('Error voting post:', err);
    }
  },

  async toggleFavorite(postId) {
    if (!CURRENT_USER_ID) {
      console.warn('No user logged in, favorite skipped.');
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          targetType: 'perspectivepost',
          targetId: postId
        })
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  },

  async getComments(postId) {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/perspective/${postId}`);
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Get comments failed:', err);
      return [];
    }
  },

  async addComment(postId, content) {
    if (!CURRENT_USER_ID) {
      console.warn('No user logged in, addComment skipped.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/comments/perspective/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          content
        })
      });
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }
};

function normalizePostFromApi(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw._id || raw.post_id || Math.random().toString(36).slice(2),
    title: raw.title || raw.topic || 'Untitled',
    author: raw.author || (raw.user && raw.user.username) || raw.username || 'anonymous',
    tags: raw.tags || raw.tag || [],
    primary_genre: raw.primary_genre || raw.primaryGenre || raw.genre || 'General',
    updatedAt: raw.updatedAt || raw.lastUpdated || raw.createdAt || new Date().toISOString(),
    upvotes: raw.upvotes || raw.votes || raw.likeCount || 0
  };
}

const mockPosts = [
  {
    id: '1',
    title: "On Loneliness and Modern Cities",
    author: "user_aster",
    tags: ["Psychology", "Urban life"],
    primary_genre: "Psychology",
    updatedAt: "2025-11-18T10:00:00Z",
    upvotes: 23
  },
  {
    id: '2',
    title: "When Thinking Too Much Becomes a Habit",
    author: "stckww",
    tags: ["Overthinking"],
    primary_genre: "Self-help",
    updatedAt: "2025-11-17T16:20:00Z",
    upvotes: 45
  },
  {
    id: '3',
    title: "Existential Dread at 2AM",
    author: "dulce_de_cas",
    tags: ["Existentialism", "Night thoughts"],
    primary_genre: "Philosophy",
    updatedAt: "2025-11-16T08:30:00Z",
    upvotes: 12
  },
  {
    id: '4',
    title: "Learning to Sit with Discomfort",
    author: "psyche_reader",
    tags: ["Mindfulness"],
    primary_genre: "Psychology",
    updatedAt: "2025-11-15T13:15:00Z",
    upvotes: 31
  },
  {
    id: '5',
    title: "Why Do We Need Others to See Us?",
    author: "inner_child",
    tags: ["Attachment", "Relationships"],
    primary_genre: "Psychology",
    updatedAt: "2025-11-14T09:10:00Z",
    upvotes: 19
  },
  {
    id: '6',
    title: "Notes from a Tired Student",
    author: "cas",
    tags: ["Burnout"],
    primary_genre: "Self-help",
    updatedAt: "2025-11-13T21:05:00Z",
    upvotes: 40
  }
];

const POSTS_PER_PAGE = 5;
let allPosts = [];
let currentPage = 1;
let currentSort = 'newest';
let currentGenre = 'all';

let userState = {
  votes: {}, 
  favorites: new Set()
};

let contentRevealed = false;

document.addEventListener('DOMContentLoaded', async () => {
  setupSearchToggle();
  setupSortAndFilter();
  setupScrollAnimations();

  await Promise.all([
    loadGenres(),
    loadUserState(),
    loadPosts()
  ]);

  renderPostsAndPagination();

  if (window.scrollY > 80) {
    contentRevealed = true;
    revealContentRow();
  }
});

function setupSearchToggle() {
  const toggleBtn = document.getElementById('searchToggle');
  const group = document.getElementById('searchInputGroup');
  const input = document.getElementById('perspectiveSearchInput');
  const btn = document.getElementById('perspectiveSearchBtn');
  const errorSpan = document.getElementById('searchError');

  if (!toggleBtn || !group || !input || !btn) return;

  toggleBtn.style.display = 'inline-block';
  group.classList.remove('visible');

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleBtn.style.display = 'none';
    group.classList.add('visible');
    setTimeout(() => input.focus(), 100);
  });

  btn.addEventListener('click', () => handleSearch(input, errorSpan));
  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch(input, errorSpan);
  });
}

function handleSearch(input, errorSpan) {
  const query = input.value.trim();

  if (!query) {
    if (errorSpan) errorSpan.textContent = 'Please enter a keyword.';
    return;
  }

  if (errorSpan) errorSpan.textContent = '';
  window.location.href = `search-results.html?search=${encodeURIComponent(query)}`;
}


async function loadGenres() {
  const select = document.getElementById('genreSelect');
  if (!select) return;

  const genres = await PerspectiveApi.getPrimaryGenres();

  if (!genres || genres.length === 0) {
    const fallback = ["Psychology", "Philosophy", "Self-help", "Literature"];
    fallback.forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      select.appendChild(opt);
    });
    return;
  }

  genres.forEach((item) => {
    const name = typeof item === 'string'
      ? item
      : (item.name || item.primary_genre || item.genre || '');
    if (!name) return;
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

async function loadUserState() {
  const state = await PerspectiveApi.getUserPerspectiveState(CURRENT_USER_ID);
  userState.votes = state.votes || {};
  userState.favorites = new Set(state.favorites || []);
}

async function loadPosts() {
  const posts = await PerspectiveApi.getPerspectivePosts();
  allPosts = posts || [];
}

function setupSortAndFilter() {
  const sortSelect = document.getElementById('sortSelect');
  const genreSelect = document.getElementById('genreSelect');
  const clearBtn = document.getElementById('clearFilterBtn');

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      currentPage = 1;
      renderPostsAndPagination();
    });
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', () => {
      currentGenre = genreSelect.value;
      currentPage = 1;
      renderPostsAndPagination();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentGenre = 'all';
      currentSort = 'newest';
      currentPage = 1;
      if (sortSelect) sortSelect.value = 'newest';
      if (genreSelect) genreSelect.value = 'all';
      renderPostsAndPagination();
    });
  }
}

function getFilteredAndSortedPosts() {
  let posts = [...allPosts];

  if (currentGenre !== 'all') {
    posts = posts.filter((p) => p.primary_genre === currentGenre);
  }

  if (currentSort === 'newest') {
    posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } else if (currentSort === 'upvotes') {
    posts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }

  return posts;
}

function renderPostsAndPagination() {
  const postsColumn = document.getElementById('postsColumn');
  if (!postsColumn) return;

  const posts = getFilteredAndSortedPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;

  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  postsColumn.innerHTML = '';

  pagePosts.forEach((post) => {
    const card = createPostCard(post);
    postsColumn.appendChild(card);
  });

  renderPagination(totalPages);

  if (contentRevealed) {
    revealContentRow();
  }
}

function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card';

  const updatedDate = formatShortDate(post.updatedAt);
  const baseUpvotes = post.upvotes || 0;
  const userVote = userState.votes[post.id] || 0;
  const totalUpvotes = baseUpvotes + userVote;

  const isFav = userState.favorites.has(post.id);

  article.innerHTML = `
    <div class="post-date">${updatedDate}</div>
    <div class="post-header">
      <div class="post-avatar"></div>
      <div class="post-title-wrapper">
        <div class="post-topic-line">
          <span class="post-topic">${escapeHtml(post.title || 'Post Topic')}</span>
          <span class="post-by">By @${escapeHtml(post.author || 'user_name')}</span>
        </div>
        <div class="post-tag">
          ${Array.isArray(post.tags) ? escapeHtml(post.tags.join(", ")) : ""}
        </div>
      </div>
    </div>
    <div class="post-content">
      <p>This is the content of the post, when you click on the topic name above, you can see all the pages and allowed to comment.</p>
      <p>This is the content of the post, when you click on the topic name above, you can see all the pages and allowed to comment.</p>
      <p>This is the content of the post, when you click on the topic name above, you can see all the pages and allowed to comment.</p>
      <p>This is the content of the post, when you click on the topic name above, you can see all the pages and allowed to comment.</p>
      <p>This is the content of the post, when you click on the topic name above, you can see all the pages and allowed to comment.</p>
    </div>
    <div class="post-footer">
      <span class="vote-link vote-up">Upvote (${totalUpvotes})</span>
      <span class="vote-link vote-down">Downvote</span>
      <span class="vote-link vote-fav ${isFav ? 'favorite-active' : ''}">Favorite</span>
    </div>
  `;

  attachPostInteractions(article, post.id, baseUpvotes);
  return article;
}

function attachPostInteractions(cardEl, postId, baseUpvotes) {
  const upEl = cardEl.querySelector('.vote-up');
  const downEl = cardEl.querySelector('.vote-down');
  const favEl = cardEl.querySelector('.vote-fav');

  let userVote = userState.votes[postId] || 0;
  let currentUpvotes = baseUpvotes + userVote;

  function updateUpvoteText() {
    if (!upEl) return;
    upEl.textContent = `Upvote (${currentUpvotes})`;
  }

  updateUpvoteText();

  if (upEl) {
    upEl.addEventListener('click', async () => {
      const previous = userVote;
      userVote = userVote === 1 ? 0 : 1;

      currentUpvotes += (userVote - previous);
      userState.votes[postId] = userVote;
      updateUpvoteText();

      await PerspectiveApi.votePost(postId, userVote);
    });
  }

  if (downEl) {
    downEl.addEventListener('click', async () => {
      const previous = userVote;
      // Toggle -1 <-> 0
      userVote = userVote === -1 ? 0 : -1;

      currentUpvotes += (userVote - previous);
      userState.votes[postId] = userVote;
      updateUpvoteText();

      await PerspectiveApi.votePost(postId, userVote);
    });
  }

  if (favEl) {
    if (userState.favorites.has(postId)) {
      favEl.classList.add('favorite-active');
    }

    favEl.addEventListener('click', async () => {
      const isFav = userState.favorites.has(postId);
      if (isFav) {
        userState.favorites.delete(postId);
        favEl.classList.remove('favorite-active');
      } else {
        userState.favorites.add(postId);
        favEl.classList.add('favorite-active');
      }
      await PerspectiveApi.toggleFavorite(postId);
    });
  }
}

function renderPagination(totalPages) {
  const paginationEl = document.getElementById('perspectivePagination');
  if (!paginationEl) return;

  if (totalPages <= 1) {
    paginationEl.style.display = 'none';
    return;
  }

  paginationEl.style.display = 'flex';

  const inner = document.createElement('div');
  inner.className = 'pagination-inner';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-prev';
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => goToPage(currentPage - 1);
  inner.appendChild(prevBtn);

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      const dot = document.createElement('div');
      dot.className = 'page-dot';
      dot.textContent = i;
      inner.appendChild(dot);
    } else {
      const btn = document.createElement('button');
      btn.className = 'page-number';
      btn.textContent = i;
      btn.onclick = () => goToPage(i);
      inner.appendChild(btn);
    }
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-next';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => goToPage(currentPage + 1);
  inner.appendChild(nextBtn);

  paginationEl.innerHTML = '';
  paginationEl.appendChild(inner);

  setTimeout(() => {
    paginationEl.classList.add('visible');
  }, 100);
}

function goToPage(page) {
  const posts = getFilteredAndSortedPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;
  if (page < 1 || page > totalPages || page === currentPage) return;

  currentPage = page;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  setTimeout(() => {
    renderPostsAndPagination();
    contentRevealed = true;
    revealContentRow();
  }, 300);
}

function setupScrollAnimations() {
  const reminder = document.querySelector('.reminder-overlay');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    if (reminder) {
      const alpha = Math.max(0, Math.min(1, 1 - y / 400));
      reminder.style.opacity = alpha;
    }

    if (!contentRevealed && y > 80) {
      contentRevealed = true;
      revealContentRow();
    }
  });
}

function revealContentRow() {
  const postCards = document.querySelectorAll('.post-card');
  postCards.forEach((card) => card.classList.add('visible'));

  const sortPanel = document.querySelector('.sort-panel');
  if (sortPanel) sortPanel.classList.add('visible');
}

function formatShortDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
