document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupThemePills();
  setupFakeSaves();
});

function setupSidebarNavigation() {
  const links = document.querySelectorAll('.sidebar-link');

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetId = link.dataset.target;
      const target = document.querySelector(targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offset = rect.top + scrollTop - 120;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
}

function setupThemePills() {
  const pills = document.querySelectorAll('.theme-pill');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const name = pill.querySelector('input[name="theme"]')?.name;
      if (!name) return;

      const group = document.querySelectorAll(`.theme-pill input[name="${name}"]`);

      group.forEach(input => {
        input.parentElement.classList.remove('active');
      });

      const input = pill.querySelector('input');
      if (input) {
        input.checked = true;
        pill.classList.add('active');
      }
    });
  });
}

function setupFakeSaves() {
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (!saveProfileBtn) return;

  saveProfileBtn.addEventListener('click', () => {
    console.log('Mock save profile. Here you would call backend API.');
    saveProfileBtn.textContent = 'Saved ✓';
    setTimeout(() => {
      saveProfileBtn.textContent = 'Save changes';
    }, 1500);
  });
}
