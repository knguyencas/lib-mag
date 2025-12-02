import { useEffect } from 'react';
import Header from '../components/layout/Header';
import SearchBar from '../components/layout/SearchBar';
import '../styles/about.css';

function AboutPage() {
  useEffect(() => {
    document.title = 'About – Psyche Journey';
    document.body.classList.add('about');
    document.body.classList.remove('home', 'library', 'book-detail', 'search-results', 'themes', 'reader');

    return () => {
      document.body.classList.remove('about');
    };
  }, []);

  return (
    <div className="about-page">
      <Header />
      
      <div className="page-search-wrapper">
        <SearchBar placeholder="Search books, themes, perspectives..." />
      </div>

      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero-text">
            <h1 className="about-title">A quiet place for minds that think too much.</h1>
            <p className="about-subtitle">
              Psyche Journey is a small corner of the internet for people who love psychology-heavy stories,
              existential questions, and the feeling of being quietly understood through books.
            </p>
          </div>
          <div className="about-hero-card">
            <p className="about-hero-label">What is this?</p>
            <p className="about-hero-body">
              A curated digital library where each book is not just a file to download, but a starting point:
              notes, themes, perspectives, and conversations layered on top of the text.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-header">
            <h2>Why Psyche Journey exists</h2>
            <p>
              Because some books don&apos;t just entertain—<span>they rearrange your inner world</span>.
              This space is built for those books, and for the people who are changed by them.
            </p>
          </div>

          <div className="about-grid about-grid-3">
            <div className="about-card">
              <h3>For slow, deep reading</h3>
              <p>
                Not everything has to be skimmed. Here, it&apos;s okay to sit with one paragraph,
                highlight a line, and come back days later with a different version of yourself.
              </p>
            </div>

            <div className="about-card">
              <h3>For layered perspectives</h3>
              <p>
                Books live longer when people think about them out loud. 
                <span> Themes</span> and <span>Perspective</span> posts are places to unpack 
                characters, ideas, and messy emotions.
              </p>
            </div>

            <div className="about-card">
              <h3>For quiet connection</h3>
              <p>
                You don&apos;t have to be loud to belong here. 
                A simple comment, a saved book, or a short reflection is already a conversation.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-header">
            <h2>What you&apos;ll find here</h2>
          </div>

          <div className="about-grid about-grid-2">
            <div className="about-block">
              <h3>Library</h3>
              <p>
                A curated list of books, with attention to <span>psychology</span>, 
                <span> philosophy</span>, <span>literature</span>, and <span>human behavior</span>.
              </p>
              <ul className="about-list">
                <li>Clean metadata &amp; primary genres</li>
                <li>Structured contents for easier navigation</li>
                <li>Space for notes, highlights &amp; future features</li>
              </ul>
            </div>

            <div className="about-block">
              <h3>Themes &amp; Perspective</h3>
              <p>
                Two complementary ways to think out loud:
              </p>
              <ul className="about-list">
                <li><strong>Themes</strong> – visual posts capturing one mood, concept, or emotional frame</li>
                <li><strong>Perspective</strong> – long-form reflections, analysis, or personal essays</li>
                <li>Upvotes, views, and tags to explore related thoughts</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section about-section-muted">
          <div className="about-section-header">
            <h2>How to use this space</h2>
            <p>There&apos;s no &quot;correct&quot; way to be here, but if you like structure…</p>
          </div>

          <ol className="about-steps">
            <li>
              <span className="step-number">01</span>
              <div className="step-content">
                <h3>Start from curiosity</h3>
                <p>
                  Search for a feeling, a topic, or a name that has been stuck in your mind. 
                  Let the search bar be a starting point, not a constraint.
                </p>
              </div>
            </li>
            <li>
              <span className="step-number">02</span>
              <div className="step-content">
                <h3>Let books open doors</h3>
                <p>
                  Open a book, skim the structure, and see which part of it pulls you in first—
                  sometimes it&apos;s not the first chapter.
                </p>
              </div>
            </li>
            <li>
              <span className="step-number">03</span>
              <div className="step-content">
                <h3>Write your own trace</h3>
                <p>
                  Use <strong>Perspective</strong> to write what the book did to you. 
                  It doesn&apos;t have to be smart. It just has to be honest.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="about-section">
          <div className="about-quote-card">
            <p className="about-quote">
              &quot;Some books are not read once. They stay in the room with you, even when they&apos;re closed.&quot;
            </p>
            <p className="about-quote-meta">
              Psyche Journey is built for those books—and for the version of you that meets them.
            </p>
          </div>
        </section>

        <section className="about-section about-bottom-note">
          <p>
            Built slowly, with care, by someone who grew up collecting thoughts, 
            not just titles. This project will keep evolving—features may change, 
            but the intention stays the same: <span>a gentle, honest place to read and think</span>.
          </p>
        </section>
      </main>

      <footer className="footer about-footer">
        <p>© 2025 Psyche Journey. Designed for quiet readers with loud inner worlds.</p>
      </footer>
    </div>
  );
}

export default AboutPage;
