import { useEffect, useState } from 'react';
import './LoadingScreen.css';

const loadingMessages = [
  'Ironing the jerseys...',
  'Mopping the paint...',
  'Checking the ball pressure...',
  'Warming up...',
  'Crunching the box scores...',
  'Drawing up the final play...',
  'Practicing free throws...',
  'Arguing with the refs...',
];

export default function LoadingScreen({ progress = 0 }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      // Start fade out after showing 100% for a moment
      const timer = setTimeout(() => {
        setIsFadingOut(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Rotate through loading messages with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => 
          (prevIndex + 1) % loadingMessages.length
        );
        setIsFading(false);
      }, 250); // Half of transition duration
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loading-screen ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="sk-cube-grid">
          <div className="sk-cube sk-cube1"></div>
          <div className="sk-cube sk-cube2"></div>
          <div className="sk-cube sk-cube3"></div>
          <div className="sk-cube sk-cube4"></div>
          <div className="sk-cube sk-cube5"></div>
          <div className="sk-cube sk-cube6"></div>
          <div className="sk-cube sk-cube7"></div>
          <div className="sk-cube sk-cube8"></div>
          <div className="sk-cube sk-cube9"></div>
        </div>
        <div className="loading-text">
          <h2 className="loading-title">Loading</h2>
          <p className={`loading-subtitle ${isFading ? 'fade-out' : ''}`}>
            {loadingMessages[currentMessageIndex]}
          </p>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

