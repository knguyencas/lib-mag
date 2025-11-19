const mockThemes = [
  { id: 1, title: "Understanding Psychology", user: "john_doe", likes: 128 },
  { id: 2, title: "Modern Philosophy", user: "jane_smith", likes: 95 },
  { id: 3, title: "Human Behavior", user: "alex_wong", likes: 210 },
  { id: 4, title: "Cognitive Science", user: "sarah_lee", likes: 64 },
  { id: 5, title: "Social Dynamics", user: "mike_chen", likes: 182 },
  { id: 6, title: "Mental Health", user: "emma_davis", likes: 140 },
  { id: 7, title: "Emotional Intelligence", user: "david_park", likes: 99 },
  { id: 8, title: "Mindfulness Practice", user: "lisa_kim", likes: 156 },
  { id: 9, title: "Self Discovery", user: "tom_brown", likes: 88 },
  { id: 10, title: "Personal Growth", user: "amy_wilson", likes: 203 },
  { id: 11, title: "Consciousness Studies", user: "peter_han", likes: 175 },
  { id: 12, title: "Dream Analysis", user: "sofia_garcia", likes: 192 },
  { id: 13, title: "Memory & Learning", user: "ryan_lee", likes: 134 },
  { id: 14, title: "Motivation Theory", user: "nina_patel", likes: 167 },
  { id: 15, title: "Decision Making", user: "chris_martin", likes: 145 },
  { id: 16, title: "Creative Thinking", user: "julia_wong", likes: 198 },
  { id: 17, title: "Stress Management", user: "mark_johnson", likes: 122 },
  { id: 18, title: "Positive Psychology", user: "anna_kim", likes: 211 },
  { id: 19, title: "Relationship Patterns", user: "eric_davis", likes: 89 },
  { id: 20, title: "Inner Peace", user: "maya_chen", likes: 176 },
  { id: 21, title: "Life Purpose", user: "james_park", likes: 154 },
  { id: 22, title: "Resilience Building", user: "sophia_lee", likes: 188 },
  { id: 23, title: "Habit Formation", user: "daniel_kim", likes: 142 },
  { id: 24, title: "Mindset Shifts", user: "olivia_wang", likes: 195 },
  { id: 25, title: "Self Compassion", user: "lucas_chen", likes: 163 }
];

const POSTS_PER_PAGE = 12;
let currentPage = 1;
let totalPages = Math.ceil(mockThemes.length / POSTS_PER_PAGE);

document.addEventListener('DOMContentLoaded', () => {
  renderPage(currentPage);
  renderPagination();
  setupLikeButtons();
});

function renderPage(page) {
  const grid = document.getElementById('themesGrid');
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const pageThemes = mockThemes.slice(startIndex, endIndex);
  
  grid.innerHTML = '';
  
  for (let i = 0; i < pageThemes.length; i += 2) {
    const row = createRow(pageThemes[i], pageThemes[i + 1]);
    grid.appendChild(row);
  }
  
  setupLikeButtons();
}

function createRow(leftPost, rightPost) {
  const row = document.createElement('div');
  row.className = 'themes-row';
  
  if (leftPost) {
    row.appendChild(createPostCard(leftPost, 'left'));
  }
  
  if (rightPost) {
    row.appendChild(createPostCard(rightPost, 'right'));
  }
  
  return row;
}

function createPostCard(post, position) {
  const article = document.createElement('article');
  article.className = `theme-post theme-post--${position}`;
  
  article.innerHTML = `
    <div class="theme-thumb"></div>
    <div class="theme-meta">
      <div class="meta-info">
        <h3 class="theme-title">${post.title}</h3>
        <p class="theme-user">@${post.user}</p>
      </div>
      <div class="theme-votes">
        <button class="like-button" type="button" data-post-id="${post.id}" data-count="${post.likes}">
          <svg class="like-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 4C4.46244 4 2 6.46244 2 9.5C2 15 8.5 20 12 21.163C15.5 20 22 15 22 9.5C22 6.46244 19.5376 4 16.5 4C14.6398 4 13.0343 4.95434 12 6.41548C10.9657 4.95434 9.36023 4 7.5 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="like-count">${post.likes}</span>
        </button>
      </div>
    </div>
  `;
  
  return article;
}

function renderPagination() {
  const paginationEl = document.getElementById('pagination');
  
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
  if (page < 1 || page > totalPages || page === currentPage) return;
  
  currentPage = page;
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  setTimeout(() => {
    renderPage(currentPage);
    renderPagination();
  }, 300);
}

function setupLikeButtons() {
  const likeButtons = document.querySelectorAll('.like-button');
  
  likeButtons.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    const postId = newButton.dataset.postId;
    const initialCount = parseInt(newButton.dataset.count);
    let currentCount = initialCount;
    let isLiked = false;
    
    newButton.addEventListener('click', () => {
      const countSpan = newButton.querySelector('.like-count');
      const icon = newButton.querySelector('.like-icon');
      
      isLiked = !isLiked;
      
      if (isLiked) {
        currentCount++;
        newButton.classList.add('liked');
        icon.style.fill = '#fff';
        
        countSpan.classList.remove('flip-down');
        countSpan.classList.add('flip-up');
      } else {
        currentCount--;
        newButton.classList.remove('liked');
        icon.style.fill = 'none';
        
        countSpan.classList.remove('flip-up');
        countSpan.classList.add('flip-down');
      }
      
      countSpan.textContent = currentCount;
      
      setTimeout(() => {
        countSpan.classList.remove('flip-up', 'flip-down');
      }, 400);
    });
  });
}