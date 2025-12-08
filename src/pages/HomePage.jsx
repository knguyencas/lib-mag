import { useEffect } from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/home/HeroSection';
import IntroSection from '../components/home/IntroSection';
import MostReadSection from '../components/home/MostReadSection';
import FriendlyReminder from '../components/home/FriendlyReminder';
import HomeFooter from '../components/layout/HomeFooter';
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
        
        <FriendlyReminder />
      </main>

      <HomeFooter />
    </div>
  );
}

export default HomePage;