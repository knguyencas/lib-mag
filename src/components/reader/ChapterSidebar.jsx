import { useState } from 'react';
import './ChapterSidebar.css';

function ChapterSidebar({ structure, currentChapter, onChapterSelect, isOpen, onClose }) {
  const [expandedParts, setExpandedParts] = useState(new Set());

  const togglePart = (partIndex) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partIndex)) {
      newExpanded.delete(partIndex);
    } else {
      newExpanded.add(partIndex);
    }
    setExpandedParts(newExpanded);
  };

  const handleChapterClick = (chapterNum) => {
    onChapterSelect(chapterNum);
    onClose();
  };

  if (!structure) {
    return (
      <aside className={`chapter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Contents</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="sidebar-content">
          <p style={{ color: '#999', padding: '20px' }}>Contents not available</p>
        </div>
      </aside>
    );
  }

  const renderStructure = () => {
    if (Array.isArray(structure)) {
      return structure.map((item, idx) => {
        if (item.type === 'part') {
          const isExpanded = expandedParts.has(idx);
          
          return (
            <div key={idx} className="part-group">
              <div 
                className="part-header"
                onClick={() => togglePart(idx)}
              >
                <span className="part-title">{item.title || 'Part'}</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              {isExpanded && Array.isArray(item.chapters) && (
                <ul className="chapter-list">
                  {item.chapters.map((ch) => {
                    const chapNum = ch.globalChapterNumber || ch.partChapterNumber;
                    const isActive = chapNum === currentChapter;
                    
                    return (
                      <li 
                        key={chapNum}
                        className={isActive ? 'active' : ''}
                        onClick={() => handleChapterClick(chapNum)}
                      >
                        {ch.title || `Chapter ${chapNum}`}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        }

        if (item.type === 'chapter') {
          const chapNum = item.globalChapterNumber || item.partChapterNumber;
          const isActive = chapNum === currentChapter;
          
          return (
            <ul key={idx} className="chapter-list">
              <li 
                className={isActive ? 'active' : ''}
                onClick={() => handleChapterClick(chapNum)}
              >
                {item.title || `Chapter ${chapNum}`}
              </li>
            </ul>
          );
        }

        return null;
      });
    }

    return <p style={{ color: '#999', padding: '20px' }}>Contents not available</p>;
  };

  return (
    <aside className={`chapter-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Contents</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        {renderStructure()}
      </div>
    </aside>
  );
}

export default ChapterSidebar;