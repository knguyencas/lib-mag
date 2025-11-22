import { useNavigate } from 'react-router-dom';
import './ContentsSection.css';

function ContentsSection({ structure, bookId }) {
  const navigate = useNavigate();

  if (!structure) {
    return (
      <section className="contents-section">
        <h3 className="section-title">Contents</h3>
        <div className="contents-grid">
          <p style={{ color: '#999' }}>Contents not available yet.</p>
        </div>
      </section>
    );
  }

  const handleChapterClick = (chapterNum) => {
    console.log('Navigating to chapter:', chapterNum);
    navigate(`/reader?id=${bookId}&chapter=${chapterNum}`);
  };

  const renderStructure = () => {
    if (Array.isArray(structure)) {
      return structure.map((item, idx) => {
        if (item.type === 'part') {
          return (
            <div key={idx}>
              <h4 className="part-title">{item.title || 'Part'}</h4>
              {Array.isArray(item.chapters) && item.chapters.length > 0 && (
                <ul className="chapter-list">
                  {item.chapters.map((ch) => {
                    const chapNum = ch.globalChapterNumber || ch.partChapterNumber;
                    return (
                      <li key={chapNum}>
                        <a onClick={() => handleChapterClick(chapNum)}>
                          {ch.title || `Chapter ${chapNum}`}
                        </a>
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
          return (
            <div key={idx}>
              <ul className="chapter-list">
                <li>
                  <a onClick={() => handleChapterClick(chapNum)}>
                    {item.title || `Chapter ${chapNum}`}
                  </a>
                </li>
              </ul>
            </div>
          );
        }

        return null;
      });
    }

    if (structure.parts && Array.isArray(structure.parts)) {
      return structure.parts.map((part, idx) => (
        <div key={idx}>
          <h4 className="part-title">
            {part.title || `Part ${part.part_number || ''}`}
          </h4>
          {Array.isArray(part.chapters) && part.chapters.length > 0 && (
            <ul className="chapter-list">
              {part.chapters.map((chap) => {
                const chapNum = chap.globalChapterNumber || chap.chapter_number;
                return (
                  <li key={chapNum}>
                    <a onClick={() => handleChapterClick(chapNum)}>
                      {chap.title || `Chapter ${chapNum}`}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ));
    }

    return <p style={{ color: '#999' }}>Contents not available.</p>;
  };

  return (
    <section className="contents-section">
      <h3 className="section-title">Contents</h3>
      <div className="contents-grid">{renderStructure()}</div>
    </section>
  );
}

export default ContentsSection;