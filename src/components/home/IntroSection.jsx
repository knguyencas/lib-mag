import './IntroSection.css';

function IntroSection() {
  return (
    <section className="introduction">
      <div className="our_goals">
        <h3>OUR GOALS</h3>
        <p>
          A digital library and discussion forum dedicated to literature and psychology
          <br />
          Encouraging open, respectful conversations while upholding academic and intellectual property ethics
        </p>
      </div>

      <div className="abilities">
        <h3>YOU CAN</h3>
        <ul>
          <li>Share your own articles</li>
          <li>Get notified when your favorite works, series, or users update</li>
          <li>Keep track of works you've visited and works you want to check out later</li>
          <li>Use AI assistant to help you with books</li>
        </ul>
      </div>
    </section>
  );
}

export default IntroSection;