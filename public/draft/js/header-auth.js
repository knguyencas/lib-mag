function initHeaderAuth() {
  const isLoggedIn = AuthClient.isLoggedIn();
  
  if (isLoggedIn) {
    renderLoggedInHeader();
  } else {
    renderLoggedOutHeader();
  }
}

function renderLoggedInHeader() {
  const user = AuthClient.getUser();
  
  if (!user) {
    AuthClient.clearSession();
    renderLoggedOutHeader();
    return;
  }
  
  const firstHeader = document.querySelector('.first_header');
  if (!firstHeader) return;
  
  const oldLinks = firstHeader.querySelectorAll('a[href="contact.html"], a[href="login.html"]');
  oldLinks.forEach(link => link.remove());
  
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';
  userMenu.style.cssText = 'position: relative; display: flex; align-items: center; gap: 12px;';
  
  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  avatar.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #3d3f5c;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  const initials = (user.username || user.displayName || 'U').substring(0, 2).toUpperCase();
  avatar.textContent = initials;
  
  const usernameDisplay = document.createElement('span');
  usernameDisplay.textContent = user.username || user.displayName || 'User';
  usernameDisplay.style.cssText = `
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  const dropdown = document.createElement('div');
  dropdown.className = 'user-dropdown';
  dropdown.style.cssText = `
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    min-width: 200px;
    display: none;
    z-index: 1000;
  `;
  
  dropdown.innerHTML = `
    <div style="padding: 12px 16px; border-bottom: 1px solid #eee;">
      <div style="font-weight: 600; font-size: 14px;">${user.username || 'User'}</div>
      <div style="font-size: 12px; color: #666; margin-top: 2px;">${user.email || ''}</div>
    </div>
    <a href="settings.html" style="display: block; padding: 10px 16px; color: #000; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">⚙️ Settings</a>
    <a href="perspective.html" style="display: block; padding: 10px 16px; color: #000; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">✍️ My Posts</a>
    <a href="#" id="logoutBtn" style="display: block; padding: 10px 16px; color: #c33; text-decoration: none; font-size: 14px; border-top: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#fff0f0'" onmouseout="this.style.background='white'">🚪 Logout</a>
  `;
  
  let isDropdownOpen = false;
  
  const toggleDropdown = () => {
    isDropdownOpen = !isDropdownOpen;
    dropdown.style.display = isDropdownOpen ? 'block' : 'none';
  };
  
  avatar.addEventListener('click', toggleDropdown);
  usernameDisplay.addEventListener('click', toggleDropdown);
  
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      isDropdownOpen = false;
      dropdown.style.display = 'none';
    }
  });
  
  avatar.addEventListener('mouseenter', () => {
    avatar.style.transform = 'scale(1.1)';
  });
  
  avatar.addEventListener('mouseleave', () => {
    avatar.style.transform = 'scale(1)';
  });
  
  setTimeout(() => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          await AuthClient.logout();
        }
      });
    }
  }, 100);
  
  userMenu.appendChild(avatar);
  userMenu.appendChild(usernameDisplay);
  userMenu.appendChild(dropdown);
  firstHeader.appendChild(userMenu);
}

function renderLoggedOutHeader() {
  const firstHeader = document.querySelector('.first_header');
  if (!firstHeader) return;
  
  const userMenu = firstHeader.querySelector('.user-menu');
  if (userMenu) {
    userMenu.remove();
  }
  
  const existingLoginLink = firstHeader.querySelector('a[href="login.html"]');
  if (existingLoginLink) return;
  
  const contactLink = document.createElement('a');
  contactLink.href = 'contact.html';
  contactLink.textContent = 'Contact';
  
  const loginLink = document.createElement('a');
  loginLink.href = 'login.html';
  loginLink.textContent = 'Login';
  
  firstHeader.appendChild(contactLink);
  firstHeader.appendChild(loginLink);
}

function requireAuth() {
  if (!AuthClient.isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function preventAuthPageAccess() {
  const currentPage = window.location.pathname.split('/').pop();
  
  if ((currentPage === 'login.html' || currentPage === 'register.html') && AuthClient.isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeaderAuth();
  preventAuthPageAccess();
});

window.initHeaderAuth = initHeaderAuth;
window.requireAuth = requireAuth;