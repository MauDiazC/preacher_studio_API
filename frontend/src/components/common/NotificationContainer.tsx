import React from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification notification-${n.type}`}>
          <span>{n.message}</span>
          <button 
            onClick={() => removeNotification(n.id)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px' }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
