const API_BASE = 'http://localhost:3000/api';

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
  if (!isLoggedIn()) {
    alert('Please login to create a visual post');
    window.location.href = 'login.html';
    return;
  }

  updateAuthLink();
  
  setupEventListeners();
  setupCharCounters();
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

function setupEventListeners() {
  const imageUploadArea = document.getElementById('imageUploadArea');
  const imageInput = document.getElementById('postImage');
  const removeImageBtn = document.getElementById('removeImage');

  imageUploadArea.addEventListener('click', (e) => {
    if (e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
      imageInput.click();
    }
  });

  imageInput.addEventListener('change', handleImageSelect);

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeImage();
    });
  }

  imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.6)';
  });

  imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });

  imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      imageInput.files = files;
      handleImageSelect({ target: imageInput });
    }
  });

  const createForm = document.getElementById('createPostForm');
  createForm.addEventListener('submit', handleCreatePost);
}

function setupCharCounters() {
  const titleInput = document.getElementById('postTitle');
  const descInput = document.getElementById('postDescription');
  const titleCount = document.getElementById('titleCount');
  const descCount = document.getElementById('descCount');

  titleInput.addEventListener('input', () => {
    titleCount.textContent = `${titleInput.value.length}/200`;
  });

  descInput.addEventListener('input', () => {
    descCount.textContent = `${descInput.value.length}/1000`;
  });
}

function handleImageSelect(e) {
  const file = e.target.files[0];
  
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Please select a valid image file (JPG, PNG, or WEBP)');
    e.target.value = '';
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('Image size must be less than 5MB');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('imagePreview').style.display = 'flex';
    document.getElementById('previewImg').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  document.getElementById('postImage').value = '';
  document.getElementById('uploadPlaceholder').style.display = 'block';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('previewImg').src = '';
}

async function handleCreatePost(e) {
  e.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const description = document.getElementById('postDescription').value.trim();
  const genre = document.getElementById('postGenre').value;
  const tagsInput = document.getElementById('postTags').value.trim();
  const imageFile = document.getElementById('postImage').files[0];

  if (!title) {
    alert('Please enter a title');
    document.getElementById('postTitle').focus();
    return;
  }

  if (!genre) {
    alert('Please select a genre');
    document.getElementById('postGenre').focus();
    return;
  }

  if (!imageFile) {
    alert('Please upload an image');
    return;
  }

  const tags = tagsInput 
    ? tagsInput.split(',').map(t => t.trim()).filter(t => t) 
    : [];

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.btn-loading').style.display = 'flex';

  try {
    const formData = new FormData();
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    formData.append('primary_genre', genre);
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE}/visual-posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create post');
    }

    const postId = data.data.post_id;
    
    alert('Visual post created successfully!');
    
    window.location.href = `/visual-post.html?id=${postId}`;

  } catch (error) {
    console.error('Error creating post:', error);
    alert(error.message || 'Failed to create post. Please try again.');
    
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').style.display = 'block';
    submitBtn.querySelector('.btn-loading').style.display = 'none';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      window.location.href = '/themes.html';
    }
  }
});

let formChanged = false;

document.getElementById('createPostForm').addEventListener('input', () => {
  formChanged = true;
});

window.addEventListener('beforeunload', (e) => {
  if (formChanged) {
    e.preventDefault();
    e.returnValue = '';
  }
});