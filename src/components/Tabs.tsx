import { Code, AlertCircle, Shield, TestTube } from 'lucide-react';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'encode', icon: Code, label: 'Encode' },
    { id: 'decode', icon: AlertCircle, label: 'Decode' },
    { id: 'verify', icon: Shield, label: 'Verify' },
    { id: 'tests', icon: TestTube, label: 'Tests' },
  ];

  return (
    <nav className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          <tab.icon size={20} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
