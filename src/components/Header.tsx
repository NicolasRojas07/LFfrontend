import { Shield, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <Shield size={40} />
        <h1>JWT Dashboard - Nicolas Rojas & Alejandro Villanueva</h1>
      </div>
      <button onClick={toggleDarkMode} className="theme-btn">
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </header>
  );
}
