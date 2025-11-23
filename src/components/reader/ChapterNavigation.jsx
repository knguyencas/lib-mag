import './ChapterNavigation.css';

function ChapterNavigation({ 
  currentChapter, 
  totalChapters, 
  onPrevious, 
  onNext,
  hasPrevious,
  hasNext 
}) {
  return (
    <div className="chapter-navigation">
      <button
        className="nav-btn prev-btn"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous chapter"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Previous</span>
      </button>

      <div className="chapter-indicator">
        <span className="current">{currentChapter}</span>
        <span className="separator">/</span>
        <span className="total">{totalChapters}</span>
      </div>

      <button
        className="nav-btn next-btn"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next chapter"
      >
        <span>Next</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default ChapterNavigation;