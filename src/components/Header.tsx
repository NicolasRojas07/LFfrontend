import { Shield, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-glass-blur"></div>
      <div className="header-content">
        <div className="header-icon-wrapper">
          <Shield size={40} />
        </div>
        <h1>JWT Dashboard - Nicolas Rojas & Alejandro Villanueva</h1>
      </div>
      <button onClick={toggleDarkMode} className="theme-btn">
        <div className="theme-btn-bg"></div>
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </header>
  );
}
