import { Check, AlertCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: string;
}

export default function Notification({ message, type }: NotificationProps) {
  return (
    <div className={`notification ${type}`}>
      {type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
      <span>{message}</span>
    </div>
  );
}
