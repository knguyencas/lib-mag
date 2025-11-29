const ADMIN_API_BASE = 'http://localhost:3000/api/admin';

function requireAdmin() {
  if (!window.AuthClient) {
    console.error('AuthClient is not available. Make sure auth-client.js is loaded.');
    window.location.href = 'login.html';
    return;
  }

  const user = AuthClient.getUser();
  const token = AuthClient.getToken();

  if (!token || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    window.location.href = 'login.html';
  }
}

function getAuthHeaders(extraHeaders = {}) {
  const token = AuthClient.getToken();
  if (!token) {
    window.location.href = 'login.html';
    return extraHeaders;
  }
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders
  };
}

function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


const state = {
  authorsExisting: [],
  authorsNew: [],

  categoriesExisting: [],
  categoriesNew: [],

  tagsExisting: [],
  tagsNew: []
};


function qs(selector) {
  return document.querySelector(selector);
}

function clearSuggestions(container) {
  container.innerHTML = '';
  container.classList.remove('visible');
}

function hideAllSuggestions() {
  document
    .querySelectorAll('.suggestions-list')
    .forEach((el) => el.classList.remove('visible'));
}

async function searchAuthorsFromApi(term) {
  if (!term.trim()) return [];

  const url = `${ADMIN_API_BASE}/meta/authors/search?q=${encodeURIComponent(term)}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (res.status === 401 || res.status === 403) {
    window.location.href = 'login.html';
    return [];
  }

  if (!res.ok) {
    console.error('Search authors error', res.status);
    return [];
  }

  const result = await res.json();
  return result.data || [];
}

function renderAuthorSuggestions(results, term, container, inputEl, chipsContainer) {
  container.innerHTML = '';

  if (!results.length && !term) {
    container.classList.remove('visible');
    return;
  }

  if (results.length === 0 && term) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = `Add new author "${term}"`;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = 'This author will be created and flagged as needs_update';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'NEW';

    item.appendChild(main);
    item.appendChild(badge);

    item.addEventListener('click', () => {
      selectNewAuthor(term, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(item);
    container.classList.add('visible');
    return;
  }

  results.forEach((a) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = a.name;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = `${a.author_id}${a.nationality ? ' · ' + a.nationality : ''}`;

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = a.needs_update ? 'NEEDS UPDATE' : 'AUTHOR';

    item.appendChild(main);
    item.appendChild(badge);

    item.addEventListener('click', () => {
      selectExistingAuthor(a, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(item);
  });
  if (term) {
    const addItem = document.createElement('div');
    addItem.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = `Add new author "${term}"`;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = 'Create a new author (needs_update)';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'NEW';

    addItem.appendChild(main);
    addItem.appendChild(badge);

    addItem.addEventListener('click', () => {
      selectNewAuthor(term, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(addItem);
  }

  container.classList.add('visible');
}

function selectExistingAuthor(author, chipsContainer) {
  state.authorsExisting = [{ author_id: author.author_id, name: author.name }];
  state.authorsNew = [];

  chipsContainer.innerHTML = '';
  const chip = document.createElement('div');
  chip.className = 'chip';

  const label = document.createElement('span');
  label.textContent = author.name;

  const idSpan = document.createElement('span');
  idSpan.className = 'chip-label-id';
  idSpan.textContent = author.author_id;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    state.authorsExisting = [];
    state.authorsNew = [];
    chipsContainer.innerHTML = '';
  });

  chip.appendChild(label);
  chip.appendChild(idSpan);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

function selectNewAuthor(name, chipsContainer) {
  state.authorsExisting = [];
  state.authorsNew = [{ name: name.trim(), needs_update: true }];

  chipsContainer.innerHTML = '';
  const chip = document.createElement('div');
  chip.className = 'chip chip-new';

  const label = document.createElement('span');
  label.textContent = name.trim();

  const flag = document.createElement('span');
  flag.className = 'chip-flag';
  flag.textContent = 'NEW – NEEDS UPDATE';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    state.authorsExisting = [];
    state.authorsNew = [];
    chipsContainer.innerHTML = '';
  });

  chip.appendChild(label);
  chip.appendChild(flag);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

async function searchCategoriesFromApi(term) {
  if (!term.trim()) return [];

  const url = `${ADMIN_API_BASE}/meta/categories/search?q=${encodeURIComponent(term)}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (res.status === 401 || res.status === 403) {
    window.location.href = 'login.html';
    return [];
  }

  if (!res.ok) {
    console.error('Search categories error', res.status);
    return [];
  }

  const result = await res.json();
  return result.data || [];
}

function renderCategorySuggestions(results, term, container, inputEl, chipsContainer) {
  container.innerHTML = '';

  if (!results.length && !term) {
    container.classList.remove('visible');
    return;
  }

  if (results.length === 0 && term) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = `Add new category "${term}"`;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = 'This category will be created (needs_update)';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'NEW';

    item.appendChild(main);
    item.appendChild(badge);

    item.addEventListener('click', () => {
      selectNewCategory(term, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(item);
    container.classList.add('visible');
    return;
  }

  results.forEach((c) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = c.name;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = c.category_id || '';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'CATEGORY';

    item.appendChild(main);
    item.appendChild(badge);

    item.addEventListener('click', () => {
      selectExistingCategory(c, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(item);
  });

  if (term) {
    const addItem = document.createElement('div');
    addItem.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = `Add new category "${term}"`;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = 'Create category (needs_update)';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'NEW';

    addItem.appendChild(main);
    addItem.appendChild(badge);

    addItem.addEventListener('click', () => {
      selectNewCategory(term, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(addItem);
  }

  container.classList.add('visible');
}

function selectExistingCategory(cat, chipsContainer) {
  const exists = state.categoriesExisting.some((c) => c.category_id === cat.category_id);
  if (exists) return;

  state.categoriesExisting.push({ category_id: cat.category_id, name: cat.name });

  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.dataset.categoryId = cat.category_id;

  const label = document.createElement('span');
  label.textContent = cat.name;

  const idSpan = document.createElement('span');
  idSpan.className = 'chip-label-id';
  idSpan.textContent = cat.category_id;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    state.categoriesExisting = state.categoriesExisting.filter(
      (c) => c.category_id !== cat.category_id
    );
    chipsContainer.removeChild(chip);
  });

  chip.appendChild(label);
  chip.appendChild(idSpan);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

function selectNewCategory(name, chipsContainer) {
  const trimmed = name.trim();
  const existsNew = state.categoriesNew.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  const existsOld = state.categoriesExisting.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existsNew || existsOld) return;

  const obj = { name: trimmed, needs_update: true };
  state.categoriesNew.push(obj);

  const chip = document.createElement('div');
  chip.className = 'chip chip-new';

  const label = document.createElement('span');
  label.textContent = trimmed;

  const flag = document.createElement('span');
  flag.className = 'chip-flag';
  flag.textContent = 'NEW';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    state.categoriesNew = state.categoriesNew.filter(
      (c) => c.name.toLowerCase() !== trimmed.toLowerCase()
    );
    chipsContainer.removeChild(chip);
  });

  chip.appendChild(label);
  chip.appendChild(flag);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

async function searchTagsFromApi(term) {
  if (!term.trim()) return [];

  const url = `${ADMIN_API_BASE}/meta/tags/search?q=${encodeURIComponent(term)}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (res.status === 401 || res.status === 403) {
    window.location.href = 'login.html';
    return [];
  }

  if (!res.ok) {
    console.error('Search tags error', res.status);
    return [];
  }

  const result = await res.json();
  return result.data || [];
}

function renderTagSuggestions(results, term, container, inputEl, chipsContainer) {
  container.innerHTML = '';

  if (!results.length && !term) {
    container.classList.remove('visible');
    return;
  }

  if (results.length === 0 && term) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = `Add new tag "${term}"`;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = 'This tag will be created (needs_update)';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'NEW';

    item.appendChild(main);
    item.appendChild(badge);

    item.addEventListener('click', () => {
      selectNewTag(term, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(item);
    container.classList.add('visible');
    return;
  }

  results.forEach((t) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = t.name;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = t.tag_id || '';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'TAG';

    item.appendChild(main);
    item.appendChild(badge);

    item.addEventListener('click', () => {
      selectExistingTag(t, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(item);
  });

  if (term) {
    const addItem = document.createElement('div');
    addItem.className = 'suggestion-item';

    const main = document.createElement('div');
    main.className = 'suggestion-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-name';
    nameEl.textContent = `Add new tag "${term}"`;

    const metaEl = document.createElement('div');
    metaEl.className = 'suggestion-meta';
    metaEl.textContent = 'Create tag (needs_update)';

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const badge = document.createElement('div');
    badge.className = 'suggestion-badge';
    badge.textContent = 'NEW';

    addItem.appendChild(main);
    addItem.appendChild(badge);

    addItem.addEventListener('click', () => {
      selectNewTag(term, chipsContainer);
      inputEl.value = '';
      clearSuggestions(container);
    });

    container.appendChild(addItem);
  }

  container.classList.add('visible');
}

function selectExistingTag(tag, chipsContainer) {
  const exists = state.tagsExisting.some((t) => t.tag_id === tag.tag_id);
  if (exists) return;

  state.tagsExisting.push({ tag_id: tag.tag_id, name: tag.name });

  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.dataset.tagId = tag.tag_id;

  const label = document.createElement('span');
  label.textContent = tag.name;

  const idSpan = document.createElement('span');
  idSpan.className = 'chip-label-id';
  idSpan.textContent = tag.tag_id;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    state.tagsExisting = state.tagsExisting.filter((t) => t.tag_id !== tag.tag_id);
    chipsContainer.removeChild(chip);
  });

  chip.appendChild(label);
  chip.appendChild(idSpan);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

function selectNewTag(name, chipsContainer) {
  const trimmed = name.trim();
  const existsNew = state.tagsNew.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  const existsOld = state.tagsExisting.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  if (existsNew || existsOld) return;

  const obj = { name: trimmed, needs_update: true };
  state.tagsNew.push(obj);

  const chip = document.createElement('div');
  chip.className = 'chip chip-new';

  const label = document.createElement('span');
  label.textContent = trimmed;

  const flag = document.createElement('span');
  flag.className = 'chip-flag';
  flag.textContent = 'NEW';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    state.tagsNew = state.tagsNew.filter(
      (t) => t.name.toLowerCase() !== trimmed.toLowerCase()
    );
    chipsContainer.removeChild(chip);
  });

  chip.appendChild(label);
  chip.appendChild(flag);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

async function handleSubmitForm(e) {
  e.preventDefault();
  hideAllSuggestions();

  const form = e.target;
  const statusBox = qs('#adminAddBookStatus');
  if (statusBox) {
    statusBox.textContent = '';
    statusBox.className = '';
  }

  const title = qs('#bookTitle')?.value.trim();
  const publisher = qs('#bookPublisher')?.value.trim();
  const year = qs('#bookYear')?.value.trim();
  const language = qs('#bookLanguage')?.value.trim() || 'en';
  const punchline = qs('#bookPunchline')?.value.trim();
  const blurb = qs('#bookBlurb')?.value.trim();
  const isbn = qs('#bookIsbn')?.value.trim();
  const pageCount = qs('#bookPageCount')?.value.trim();
  const status = qs('#bookStatus')?.value || 'draft';

  if (!title || !publisher || !year || !punchline || !blurb || !pageCount) {
    if (statusBox) {
      statusBox.className = 'form-status form-status-error';
      statusBox.textContent = 'Please fill all required fields.';
    }
    return;
  }

  if (!state.authorsExisting.length && !state.authorsNew.length) {
    if (statusBox) {
      statusBox.className = 'form-status form-status-error';
      statusBox.textContent = 'Please select or create an author.';
    }
    return;
  }

  const formData = new FormData(form);

  const authorIds = state.authorsExisting.map((a) => a.author_id);
  const newAuthors = state.authorsNew;

  const categoryNames = [
    ...state.categoriesExisting.map((c) => c.name),
    ...state.categoriesNew.map((c) => c.name)
  ];

  const tagNames = [
    ...state.tagsExisting.map((t) => t.name),
    ...state.tagsNew.map((t) => t.name)
  ];

  formData.set('title', title);
  formData.set('publisher', publisher);
  formData.set('year', Number(year) || 0);
  formData.set('language', language);
  formData.set('punchline', punchline);
  formData.set('blurb', blurb);
  if (isbn) formData.set('isbn', isbn);
  formData.set('pageCount', Number(pageCount) || 0);
  formData.set('status', status);

  formData.set('author_ids', JSON.stringify(authorIds));
  formData.set('new_authors', JSON.stringify(newAuthors));
  formData.set('categories', JSON.stringify(categoryNames));
  formData.set('tags', JSON.stringify(tagNames));

  try {
    const res = await fetch(`${ADMIN_API_BASE}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Create book error', result);
      if (statusBox) {
        statusBox.className = 'form-status form-status-error';
        statusBox.textContent =
          result.message || 'Failed to create book. Please check input.';
      }
      return;
    }

    if (statusBox) {
      statusBox.className = 'form-status form-status-success';
      statusBox.textContent = 'Book created successfully!';
    }

    form.reset();
    state.authorsExisting = [];
    state.authorsNew = [];
    state.categoriesExisting = [];
    state.categoriesNew = [];
    state.tagsExisting = [];
    state.tagsNew = [];

    const authorChips = qs('#authorChips');
    const categoryChips = qs('#categoryChips');
    const tagChips = qs('#tagChips');
    if (authorChips) authorChips.innerHTML = '';
    if (categoryChips) categoryChips.innerHTML = '';
    if (tagChips) tagChips.innerHTML = '';

  } catch (err) {
    console.error('Create book request error', err);
    if (statusBox) {
      statusBox.className = 'form-status form-status-error';
      statusBox.textContent = 'Network error. Please try again.';
    }
  }
}

function initAdminAddBookPage() {
  requireAdmin();

  const form = qs('#adminAddBookForm');
  if (form) {
    form.addEventListener('submit', handleSubmitForm);
  }

  const authorInput = qs('#authorSearch');
  const authorSuggestions = qs('#authorSuggestions');
  const authorChips = qs('#authorChips');

  if (authorInput && authorSuggestions && authorChips) {
    const debouncedAuthorSearch = debounce(async (value) => {
      if (!value.trim()) {
        clearSuggestions(authorSuggestions);
        return;
      }
      const results = await searchAuthorsFromApi(value);
      renderAuthorSuggestions(results, value, authorSuggestions, authorInput, authorChips);
    });

    authorInput.addEventListener('input', (e) => {
      debouncedAuthorSearch(e.target.value);
    });

    authorInput.addEventListener('focus', () => {
      const value = authorInput.value.trim();
      if (value) {
        debouncedAuthorSearch(value);
      }
    });
  }

  const catInput = qs('#categoryInput');
  const catSuggestions = qs('#categorySuggestions');
  const catChips = qs('#categoryChips');

  if (catInput && catSuggestions && catChips) {
    const debouncedCatSearch = debounce(async (value) => {
      if (!value.trim()) {
        clearSuggestions(catSuggestions);
        return;
      }
      const results = await searchCategoriesFromApi(value);
      renderCategorySuggestions(results, value, catSuggestions, catInput, catChips);
    });

    catInput.addEventListener('input', (e) => {
      debouncedCatSearch(e.target.value);
    });

    catInput.addEventListener('focus', () => {
      const value = catInput.value.trim();
      if (value) {
        debouncedCatSearch(value);
      }
    });
  }

  const tagInput = qs('#tagInput');
  const tagSuggestions = qs('#tagSuggestions');
  const tagChips = qs('#tagChips');

  if (tagInput && tagSuggestions && tagChips) {
    const debouncedTagSearch = debounce(async (value) => {
      if (!value.trim()) {
        clearSuggestions(tagSuggestions);
        return;
      }
      const results = await searchTagsFromApi(value);
      renderTagSuggestions(results, value, tagSuggestions, tagInput, tagChips);
    });

    tagInput.addEventListener('input', (e) => {
      debouncedTagSearch(e.target.value);
    });

    tagInput.addEventListener('focus', () => {
      const value = tagInput.value.trim();
      if (value) {
        debouncedTagSearch(value);
      }
    });
  }

  // Click bên ngoài để đóng dropdown
  document.addEventListener('click', (e) => {
    const isSuggestion =
      e.target.closest('.suggestions-list') ||
      e.target.closest('.author-field') ||
      e.target.closest('.category-field') ||
      e.target.closest('.tag-field');

    if (!isSuggestion) {
      hideAllSuggestions();
    }
  });
}

document.addEventListener('DOMContentLoaded', initAdminAddBookPage);
