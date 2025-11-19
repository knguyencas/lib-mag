const API_BASE_URL = "http://localhost:3000/api";

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");
let currentChapter = parseInt(params.get("chapter") || "1", 10);

const bookTitleEl = document.getElementById("bookTitle");
const chapterPositionEl = document.getElementById("chapterPosition");
const chapterTitleEl = document.getElementById("chapterTitle");
const chapterContentEl = document.getElementById("chapterContent");

const prevBtnTop = document.getElementById("prevBtnTop");
const nextBtnTop = document.getElementById("nextBtnTop");
const prevBtnBottom = document.getElementById("prevBtnBottom");
const nextBtnBottom = document.getElementById("nextBtnBottom");

const selectTop = document.getElementById("chapterSelectTop");
const selectBottom = document.getElementById("chapterSelectBottom");

const backBtn = document.getElementById("backToBookBtn");

let totalChapters = null;
let structureCache = null;

if (!bookId) {
    chapterTitleEl.textContent = "Error";
    chapterContentEl.textContent = "Missing book id";
} else {
    initReader();
}

async function initReader() {
    try {
        const bookRes = await fetch(`${API_BASE_URL}/books/${bookId}`);
        const bookJson = await bookRes.json();
        const book = bookJson.data;

        bookTitleEl.textContent = book.title || "Untitled";

        backBtn.addEventListener("click", () => {
            window.location.href = `book-detail.html?id=${bookId}`;
        });

        structureCache = await fetchStructure(bookId, book.structure);
        totalChapters = computeTotalChapters(structureCache);

        buildChapterSelects(structureCache, totalChapters);

        await loadChapter(currentChapter);
        attachNavEvents();

    } catch (err) {
        console.error(err);
        chapterContentEl.textContent = "Failed to init reader.";
    }
}

async function fetchStructure(bookId, existing) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/split/structure`);
        const json = await response.json();
        if (json.structure) return json.structure;
    } catch (e) {}

    if (existing && existing.parts?.length > 0) return existing.parts;

    return [];
}

function computeTotalChapters(structure) {
    let max = 0;
    structure.forEach(item => {
        if (item.type === "part") {
            item.chapters.forEach(c => {
                if (c.globalChapterNumber > max) max = c.globalChapterNumber;
            });
        }
        if (item.type === "chapter") {
            if (item.globalChapterNumber > max) max = item.globalChapterNumber;
        }
    });
    return max;
}

function buildChapterSelects(struct, total) {
    for (let i = 1; i <= total; i++) {
        const opt1 = document.createElement("option");
        opt1.value = i;
        opt1.textContent = `Chapter ${i}`;
        selectTop.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = i;
        opt2.textContent = `Chapter ${i}`;
        selectBottom.appendChild(opt2);
    }
    syncSelects();
}

async function loadChapter(num) {
    chapterTitleEl.textContent = "Loading...";
    chapterContentEl.innerHTML = "Loading content...";

    try {
        const res = await fetch(`${API_BASE_URL}/books/${bookId}/split/chapter/${num}`);
        const chapter = await res.json();

        chapterTitleEl.textContent = chapter.title || `Chapter ${num}`;
        chapterContentEl.innerHTML = chapter.content;

        chapterPositionEl.textContent = `Chapter ${num} of ${totalChapters}`;

        currentChapter = num;
        syncSelects();
        updateButtons();
        updateUrl();
    } catch (err) {
        chapterContentEl.textContent = "Failed to load chapter.";
    }
}

function syncSelects() {
    selectTop.value = currentChapter;
    selectBottom.value = currentChapter;
}

function attachNavEvents() {
    prevBtnTop.addEventListener("click", () => goToChapter(currentChapter - 1));
    nextBtnTop.addEventListener("click", () => goToChapter(currentChapter + 1));

    prevBtnBottom.addEventListener("click", () => goToChapter(currentChapter - 1));
    nextBtnBottom.addEventListener("click", () => goToChapter(currentChapter + 1));

    selectTop.addEventListener("change", () => goToChapter(parseInt(selectTop.value)));
    selectBottom.addEventListener("change", () => goToChapter(parseInt(selectBottom.value)));
}

function goToChapter(num) {
    if (num < 1 || num > totalChapters) return;
    loadChapter(num);
}

function updateButtons() {
    prevBtnTop.disabled = currentChapter <= 1;
    prevBtnBottom.disabled = currentChapter <= 1;
    nextBtnTop.disabled = currentChapter >= totalChapters;
    nextBtnBottom.disabled = currentChapter >= totalChapters;
}

function updateUrl() {
    window.history.replaceState({}, "", `reader.html?id=${bookId}&chapter=${currentChapter}`);
}
