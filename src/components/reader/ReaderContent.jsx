import { useEffect, useRef } from 'react';
import './ReaderContent.css';

function ReaderContent({ content, loading, error }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [content]);

  if (loading) {
    return (
      <div className="reader-content">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reader-content">
        <div className="error-state">
          <p>Error loading chapter</p>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="reader-content">
        <div className="empty-state">
          <p>No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-content" ref={contentRef}>
      <div 
        className="chapter-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export default ReaderContent;