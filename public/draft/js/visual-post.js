const API_BASE = 'http://localhost:3000/api';
let currentPost = null;
let currentPostId = null;

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
  updateAuthLink();
  
  initPage();
  setupEventListeners();
});

function updateAuthLink() {
  const authLink = document.getElementById('authLink');
  if (!authLink) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    authLink.textContent = user.username || 'Profile';
    authLink.href = 'settings.html';
  } else {
    authLink.textContent = 'Login';
    authLink.href = 'login.html';
  }
}

function initPage() {
  const urlParams = new URLSearchParams(window.location.search);
  currentPostId = urlParams.get('id');

  if (!currentPostId) {
    showNotFound();
    return;
  }

  loadPost();
}

function setupEventListeners() {
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', handleLike);
  }

  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', handleShare);
  }

  const editBtn = document.getElementById('editPostBtn');
  if (editBtn) {
    editBtn.addEventListener('click', openEditModal);
  }

  const deleteBtn = document.getElementById('deletePostBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', openDeleteModal);
  }

  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  const editForm = document.getElementById('editPostForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditSubmit);
  }

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleDelete);
  }

  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeModals);
  }

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModals();
    }
  });
}

async function loadPost() {
  showLoading();

  try {
    const response = await fetch(`${API_BASE}/visual-posts/${currentPostId}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load post');
    }

    currentPost = data.data;
    renderPost(currentPost);
    
    incrementViewCount();
    
    if (isLoggedIn()) {
      loadLikeStatus();
    }

    loadRelatedPosts();

  } catch (error) {
    console.error('Error loading post:', error);
    showNotFound();
  }
}

async function incrementViewCount() {
  try {
    await fetch(`${API_BASE}/visual-posts/${currentPostId}/view`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

function renderPost(post) {
  hideLoading();
  document.getElementById('visualPostContainer').style.display = 'block';

  const authorAvatar = document.getElementById('authorAvatar');
  authorAvatar.textContent = post.author_username.charAt(0).toUpperCase();
  
  document.getElementById('authorName').textContent = `@${post.author_username}`;
  document.getElementById('postDate').textContent = formatDate(post.createdAt);

  const currentUser = getCurrentUser();
  if (currentUser) {
    const isOwner = currentUser.id === post.author_id;
    const isAdmin = ['admin', 'super_admin'].includes(currentUser.role);
    
    if (isOwner || isAdmin) {
      document.getElementById('postActions').style.display = 'flex';
    }
  }

  document.getElementById('postTitle').textContent = post.title;
  
  const tagsContainer = document.getElementById('postTags');
  if (post.tags && post.tags.length > 0) {
    tagsContainer.innerHTML = post.tags.map(tag => 
      `<span class="tag">#${escapeHtml(tag)}</span>`
    ).join('');
  } else {
    tagsContainer.innerHTML = '';
  }

  const genreContainer = document.getElementById('postGenre');
  if (post.primary_genre) {
    genreContainer.textContent = post.primary_genre;
    genreContainer.style.display = 'inline-block';
  } else {
    genreContainer.style.display = 'none';
  }

  const postImage = document.getElementById('postImage');
  postImage.src = post.image.url;
  postImage.alt = post.title;

  const descriptionSection = document.getElementById('descriptionSection');
  const descriptionText = document.getElementById('postDescription');
  
  if (post.description && post.description.trim()) {
    descriptionText.textContent = post.description;
    descriptionSection.style.display = 'block';
  } else {
    descriptionSection.style.display = 'none';
  }

  document.getElementById('likesCount').textContent = post.likes || 0;
  document.getElementById('viewsCount').textContent = post.view_count || 0;
}

async function loadLikeStatus() {
  try {
    const response = await fetch(`${API_BASE}/visual-posts/${currentPostId}/like-status`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (data.success && data.data.user_liked) {
      const likeBtn = document.getElementById('likeBtn');
      likeBtn.classList.add('liked');
      likeBtn.querySelector('.like-text').textContent = 'Liked';
    }
  } catch (error) {
    console.error('Error loading like status:', error);
  }
}

async function handleLike() {
  if (!isLoggedIn()) {
    alert('Please login to like this post');
    window.location.href = '/login.html';
    return;
  }

  const likeBtn = document.getElementById('likeBtn');
  const wasLiked = likeBtn.classList.contains('liked');

  try {
    const response = await fetch(`${API_BASE}/visual-posts/${currentPostId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to like post');
    }

    if (data.data.user_liked) {
      likeBtn.classList.add('liked');
      likeBtn.querySelector('.like-text').textContent = 'Liked';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.querySelector('.like-text').textContent = 'Like';
    }

    document.getElementById('likesCount').textContent = data.data.likes;

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

  } catch (error) {
    console.error('Error liking post:', error);
    alert('Failed to like post. Please try again.');
  }
}

async function handleShare() {
  const shareData = {
    title: currentPost.title,
    text: currentPost.description || 'Check out this visual on Psyche Journey',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      
      const shareBtn = document.getElementById('shareBtn');
      const originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;
      
      setTimeout(() => {
        shareBtn.innerHTML = originalText;
      }, 2000);
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
}

function openEditModal() {
  document.getElementById('editTitle').value = currentPost.title;
  document.getElementById('editDescription').value = currentPost.description || '';
  document.getElementById('editTags').value = currentPost.tags ? currentPost.tags.join(', ') : '';
  
  document.getElementById('editModal').style.display = 'block';
}

async function handleEditSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('editTitle').value.trim();
  const description = document.getElementById('editDescription').value.trim();
  const tagsInput = document.getElementById('editTags').value.trim();
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

  try {
    const response = await fetch(`${API_BASE}/visual-posts/${currentPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ title, description, tags })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update post');
    }

    currentPost = data.data;
    renderPost(currentPost);
    closeModals();

    alert('Post updated successfully!');

  } catch (error) {
    console.error('Error updating post:', error);
    alert('Failed to update post. Please try again.');
  }
}

function openDeleteModal() {
  document.getElementById('deleteModal').style.display = 'block';
}

async function handleDelete() {
  try {
    const response = await fetch(`${API_BASE}/visual-posts/${currentPostId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete post');
    }

    alert('Post deleted successfully');
    window.location.href = '/themes.html';

  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post. Please try again.');
  }
}

async function loadRelatedPosts() {
  const container = document.getElementById('relatedPostsGrid');
  
  try {
    const params = new URLSearchParams({
      limit: 6,
      primary_genre: currentPost.primary_genre || ''
    });

    const response = await fetch(`${API_BASE}/visual-posts?${params}`);
    const data = await response.json();

    if (data.success && data.data.posts.length > 0) {
      const relatedPosts = data.data.posts.filter(p => p.post_id !== currentPostId);
      
      if (relatedPosts.length > 0) {
        container.innerHTML = relatedPosts.map(post => `
          <div class="related-post-card" data-post-id="${post.post_id}">
            <img src="${post.image.url}" alt="${escapeHtml(post.title)}">
            <div class="related-post-overlay">
              <h3>${escapeHtml(post.title)}</h3>
              <p>❤️ ${post.likes}</p>
            </div>
          </div>
        `).join('');

        container.querySelectorAll('.related-post-card').forEach(card => {
          card.addEventListener('click', () => {
            window.location.href = `/visual-post.html?id=${card.dataset.postId}`;
          });
        });
      } else {
        document.getElementById('relatedPostsSection').style.display = 'none';
      }
    } else {
      document.getElementById('relatedPostsSection').style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading related posts:', error);
    document.getElementById('relatedPostsSection').style.display = 'none';
  }
}

function closeModals() {
  document.getElementById('editModal').style.display = 'none';
  document.getElementById('deleteModal').style.display = 'none';
}

function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'flex';
  document.getElementById('postNotFound').style.display = 'none';
  document.getElementById('visualPostContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

function showNotFound() {
  hideLoading();
  document.getElementById('postNotFound').style.display = 'block';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModals();
  }
  
  if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      handleLike();
    }
  }
});

const postImage = document.getElementById('postImage');
if (postImage) {
  postImage.addEventListener('click', () => {
    if (postImage.requestFullscreen) {
      postImage.requestFullscreen();
    } else if (postImage.webkitRequestFullscreen) {
      postImage.webkitRequestFullscreen();
    } else if (postImage.msRequestFullscreen) {
      postImage.msRequestFullscreen();
    }
  });
}