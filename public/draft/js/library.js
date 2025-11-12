console.log('Library JS loaded!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded!');
    
    initializeForYouSection();
    initializePopularSection();
    initializePhilosophySection();
    initializePsychologySection();
    initializeShowMoreButtons();
    
    console.log('Library page fully initialized!');
});

function initializeForYouSection() {
    const forYouGrid = document.getElementById('forYouGrid');
    
    if (!forYouGrid) {
        console.error('forYouGrid NOT FOUND!');
        return;
    }
    
    for (let i = 1; i <= 20; i++) {
        const card = document.createElement('div');
        card.className = 'for-you-card';
        card.innerHTML = `
            <div class="for-you-card-image">
                <strong>Book ${i}</strong>
                <div style="font-size: 12px; margin-top: 10px;">by Author ${i}</div>
            </div>
            <div class="for-you-card-info">
                <div class="for-you-card-title">Title ${i}</div>
                <div class="for-you-card-author">by Author ${i}</div>
                <div class="for-you-card-rating">★★★★★</div>
            </div>
            <div class="for-you-card-popup">
                <div class="popup-image">
                    <strong style="font-size: 20px;">Book ${i}</strong>
                    <div style="font-size: 14px; margin-top: 15px;">by Author ${i}</div>
                </div>
                <div class="popup-content">
                    <div class="popup-title">Book Title ${i}</div>
                    <div class="popup-summary">This is a detailed summary of book ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
                </div>
            </div>
        `;
        
        card.addEventListener('mouseenter', function() {
            const popup = this.querySelector('.for-you-card-popup');
            const rect = this.getBoundingClientRect();
            
            const centerY = rect.top + (rect.height / 2);
            const popupTop = centerY - 225;
            
            popup.style.top = popupTop + 'px';
            popup.style.left = rect.left + 'px';
        });
        
        forYouGrid.appendChild(card);
    }
    
    console.log('Created 20 For You cards');
    
    forYouGrid.addEventListener('wheel', function(e) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
    }, { passive: false });
    
    console.log('Scroll enabled on For You grid');
}

function initializePopularSection() {
    const popularGrid = document.getElementById('popularGrid');
    if (!popularGrid) return;
    
    createBookCards(popularGrid, 'Popular', 5);
    popularGrid.dataset.currentRows = '1';
    console.log('Created 5 Popular books');
}

function initializePhilosophySection() {
    const philosophyGrid = document.getElementById('philosophyGrid');
    if (!philosophyGrid) return;
    
    createBookCards(philosophyGrid, 'Philosophy', 5);
    philosophyGrid.dataset.currentRows = '1';
    console.log('Created 5 Philosophy books');
}

function initializePsychologySection() {
    const psychologyGrid = document.getElementById('psychologyGrid');
    if (!psychologyGrid) return;
    
    createBookCards(psychologyGrid, 'Psychology', 5);
    psychologyGrid.dataset.currentRows = '1';
    console.log('Created 5 Psychology books');
}

function createBookCards(container, category, count) {
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-card-cover">
                <strong>${category} ${i}</strong>
                <div style="font-size: 12px; margin-top: 10px;">by Author ${i}</div>
            </div>
            <div class="book-card-title">${category} Book ${i}</div>
            <div class="book-card-author">Author ${i}</div>
        `;
        container.appendChild(card);
    }
}

function initializeShowMoreButtons() {
    const buttons = document.querySelectorAll('.show-more-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            const grid = document.getElementById(`${section}Grid`);
            const currentRows = parseInt(grid.dataset.currentRows) || 1;
            
            if (this.classList.contains('expanded')) {
                const category = section.charAt(0).toUpperCase() + section.slice(1);
                createBookCards(grid, category, 5);
                grid.dataset.currentRows = '1';
                this.innerHTML = 'Show more <span class="show-more-icon">▼</span>';
                this.classList.remove('expanded');
                console.log(`${category} collapsed to 1 row`);
            } else {
                const newRows = currentRows + 1;
                const newCount = newRows * 5;
                const category = section.charAt(0).toUpperCase() + section.slice(1);
                createBookCards(grid, category, newCount);
                grid.dataset.currentRows = newRows.toString();
                
                if (newRows >= 6) {
                    this.innerHTML = 'Show less <span class="show-more-icon">▼</span>';
                    this.classList.add('expanded');
                }
                console.log(`${category} expanded to ${newRows} rows`);
            }
        });
    });
    
    console.log('Show more buttons initialized');
}