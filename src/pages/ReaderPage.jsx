import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReaderHeader from '../components/reader/ReaderHeader';
import ReaderContent from '../components/reader/ReaderContent';
import ChapterNavigation from '../components/reader/ChapterNavigation';
import ChapterSidebar from '../components/reader/ChapterSidebar';
import ChatbotWidget from '../components/reader/ChatbotWidget';
import { readerService } from '../services/readerService';
import '../styles/reader.css';

function ReaderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookId = searchParams.get('id');
  const chapterParam = searchParams.get('chapter');

  const [book, setBook] = useState(null);
  const [structure, setStructure] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(parseInt(chapterParam) || 1);
  const [chapterContent, setChapterContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalChapters, setTotalChapters] = useState(0);

  useEffect(() => {
    if (!bookId) return;

    const loadBookData = async () => {
      try {
        const [bookData, structureData] = await Promise.all([
          readerService.getBookInfo(bookId),
          readerService.getBookStructure(bookId)
        ]);

        setBook(bookData);
        setStructure(structureData);

        if (Array.isArray(structureData)) {
          let total = 0;
          structureData.forEach(item => {
            if (item.type === 'chapter') {
              total++;
            } else if (item.type === 'part' && Array.isArray(item.chapters)) {
              total += item.chapters.length;
            }
          });
          setTotalChapters(total);
        }

        document.title = `${bookData.title} - Reader`;
      } catch (err) {
        console.error('Error loading book data:', err);
      }
    };

    loadBookData();
  }, [bookId]);

  useEffect(() => {
    if (!bookId || !currentChapter) return;

    const loadChapter = async () => {
      try {
        setLoading(true);
        setError(null);

        const content = await readerService.getChapterContent(bookId, currentChapter);
        setChapterContent(content);

        setSearchParams({ id: bookId, chapter: currentChapter });

        readerService.updateProgress(bookId, currentChapter, 0);

      } catch (err) {
        console.error('Error loading chapter:', err);
        setError(err.message || 'Failed to load chapter');
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [bookId, currentChapter]);

  useEffect(() => {
    document.body.classList.add('reader');
    document.body.classList.remove('home', 'library', 'book-detail');

    return () => {
      document.body.classList.remove('reader');
    };
  }, []);

  const handlePrevious = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentChapter < totalChapters) {
      setCurrentChapter(prev => prev + 1);
    }
  };

  const handleChapterSelect = (chapterNum) => {
    setCurrentChapter(chapterNum);
  };

  const getCurrentChapterInfo = () => {
    if (!structure) return null;

    for (const item of structure) {
      if (item.type === 'chapter') {
        const chapNum = item.globalChapterNumber || item.partChapterNumber;
        if (chapNum === currentChapter) {
          return item;
        }
      } else if (item.type === 'part' && Array.isArray(item.chapters)) {
        for (const ch of item.chapters) {
          const chapNum = ch.globalChapterNumber || ch.partChapterNumber;
          if (chapNum === currentChapter) {
            return ch;
          }
        }
      }
    }

    return { chapterNumber: currentChapter, title: `Chapter ${currentChapter}` };
  };

  return (
    <div className="reader-page">
      <ReaderHeader
        book={book}
        currentChapter={getCurrentChapterInfo()}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="reader-layout">
        <ChapterSidebar
          structure={structure}
          currentChapter={currentChapter}
          onChapterSelect={handleChapterSelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="reader-main">
          <ReaderContent
            content={chapterContent?.content}
            loading={loading}
            error={error}
          />

          <ChapterNavigation
            currentChapter={currentChapter}
            totalChapters={totalChapters}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={currentChapter > 1}
            hasNext={currentChapter < totalChapters}
          />
        </main>
      </div>
      {book && (
        <ChatbotWidget
          bookTitle={book.title}
          currentChapter={getCurrentChapterInfo()}
          chapterContent={chapterContent}
        />
      )}
    </div>
  );
}

export default ReaderPage;