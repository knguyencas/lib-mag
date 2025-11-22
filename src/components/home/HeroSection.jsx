import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const floatingWords = ['Where', 'Perspectives', 'Grow', 'Into', 'Mindful', 'Thoughts'];

  return (
    <section className="slogan">
      <div className="maintext">
        <h2>
          <span className={`slide-from-left ${isVisible ? 'visible' : ''}`}>
            Unlock The Mind
          </span>
          <br />
          <span className={`slide-from-right ${isVisible ? 'visible' : ''}`}>
            Through Words
          </span>
        </h2>

        <p className="subtext">
          {floatingWords.map((word, index) => (
            <span 
              key={index}
              className="float-word" 
              data-index={index}
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              {word}
            </span>
          ))}
        </p>

        <div className="default_home_buttons">
          <button 
            className="btn black"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn white"
            onClick={() => navigate('/library')}
          >
            Explore library
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;