import { useEffect } from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import IntroSection from '../components/home/IntroSection';
import MostReadSection from '../components/home/MostReadSection';
import '../styles/home.css';

function HomePage() {
  useEffect(() => {
    document.body.classList.add('home');
    document.body.classList.remove('library');
    
    return () => {
      document.body.classList.remove('home');
    };
  }, []);

  return (
    <div className="home-page">
      <Header />
      
      <main>
        <div className="first_impression_wrapped">
          <HeroSection />
          <IntroSection />
        </div>
        
        <MostReadSection />
      </main>
    </div>
  );
}

export default HomePage;