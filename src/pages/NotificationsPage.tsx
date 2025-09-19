import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface NotificationsPageProps {
  language: Language;
  onBack: () => void;
}

const translations = {
  fr: {
    notifications: "Notifications",
    markAllRead: "Tout marquer comme lu",
    clear: "Effacer",
    today: "Aujourd'hui",
    yesterday: "Hier",
    thisWeek: "Cette semaine",
    mealReminder: "Rappel de repas",
    waterReminder: "Rappel d'hydratation",
    goalAchieved: "Objectif atteint",
    weeklyReport: "Rapport hebdomadaire",
    newTip: "Nouveau conseil",
    mealReminderText: "Il est temps de prendre votre déjeuner !",
    waterReminderText: "N'oubliez pas de boire de l'eau",
    goalAchievedText: "Félicitations ! Vous avez atteint votre objectif calorique",
    weeklyReportText: "Votre rapport hebdomadaire est disponible",
    newTipText: "Nouveau conseil nutrition : Mangez des légumes colorés",
    noNotifications: "Aucune notification",
    time: {
      "12:30": "12h30",
      "10:15": "10h15", 
      "18:45": "18h45",
      "09:00": "09h00",
      "14:20": "14h20"
    }
  },
  en: {
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    clear: "Clear",
    today: "Today",
    yesterday: "Yesterday", 
    thisWeek: "This week",
    mealReminder: "Meal reminder",
    waterReminder: "Water reminder",
    goalAchieved: "Goal achieved",
    weeklyReport: "Weekly report",
    newTip: "New tip",
    mealReminderText: "Time for your lunch!",
    waterReminderText: "Don't forget to drink water",
    goalAchievedText: "Congratulations! You reached your calorie goal",
    weeklyReportText: "Your weekly report is available", 
    newTipText: "New nutrition tip: Eat colorful vegetables",
    noNotifications: "No notifications",
    time: {
      "12:30": "12:30",
      "10:15": "10:15",
      "18:45": "18:45", 
      "09:00": "09:00",
      "14:20": "14:20"
    }
  },
  mfe: {
    notifications: "Notifikasyon",
    markAllRead: "Mark tou kouma li",
    clear: "Efas",
    today: "Zordi",
    yesterday: "Yer",
    thisWeek: "Sa lasemen",
    mealReminder: "Rapel manze",
    waterReminder: "Rapel dilo",
    goalAchieved: "Objetif arive",
    weeklyReport: "Rapor lasemen",
    newTip: "Nouvo konsey",
    mealReminderText: "Li letan pou ou dine!",
    waterReminderText: "Bliye pa bwar dilo",
    goalAchievedText: "Bravo! Ou finn arive ou objetif kalori",
    weeklyReportText: "Ou rapor lasemen pe kouma",
    newTipText: "Nouvo konsey nitrisyon: Manze legim koulèr",
    noNotifications: "Pa ena notifikasyon",
    time: {
      "12:30": "12h30",
      "10:15": "10h15",
      "18:45": "18h45",
      "09:00": "09h00", 
      "14:20": "14h20"
    }
  },
  rcf: {
    notifications: "Notifikasyon",
    markAllRead: "Mark tou koma li",
    clear: "Èfas",
    today: "Zordi",
    yesterday: "Yèr",
    thisWeek: "Sa lasmèn",
    mealReminder: "Rapèl manzé",
    waterReminder: "Rapèl dilo",
    goalAchieved: "Objetif arivé",
    weeklyReport: "Rapor lasmèn",
    newTip: "Nouvo konsèy",
    mealReminderText: "Li lètan pou ou diné!",
    waterReminderText: "Bliyé pa bwar dilo",
    goalAchievedText: "Bravo! Ou finn arivé aou objetif kalori",
    weeklyReportText: "Aou rapor lasmèn pé koma",
    newTipText: "Nouvo konsèy nitrisyon: Manzé légim koulèr",
    noNotifications: "Pa èna notifikasyon",
    time: {
      "12:30": "12h30",
      "10:15": "10h15",
      "18:45": "18h45",
      "09:00": "09h00",
      "14:20": "14h20"
    }
  }
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ language, onBack }) => {
  const t = translations[language];
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'meal',
      title: t.mealReminder,
      message: t.mealReminderText,
      time: '12:30',
      date: 'today',
      read: false,
      icon: '🍽️'
    },
    {
      id: 2,
      type: 'water',
      title: t.waterReminder,
      message: t.waterReminderText,
      time: '10:15',
      date: 'today',
      read: false,
      icon: '💧'
    },
    {
      id: 3,
      type: 'goal',
      title: t.goalAchieved,
      message: t.goalAchievedText,
      time: '18:45',
      date: 'yesterday',
      read: true,
      icon: '🎯'
    },
    {
      id: 4,
      type: 'report',
      title: t.weeklyReport,
      message: t.weeklyReportText,
      time: '09:00',
      date: 'yesterday',
      read: false,
      icon: '📊'
    },
    {
      id: 5,
      type: 'tip',
      title: t.newTip,
      message: t.newTipText,
      time: '14:20',
      date: 'thisWeek',
      read: true,
      icon: '💡'
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const groupedNotifications = {
    today: notifications.filter(n => n.date === 'today'),
    yesterday: notifications.filter(n => n.date === 'yesterday'),
    thisWeek: notifications.filter(n => n.date === 'thisWeek')
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
          ←
        </button>
        <h1 style={{ margin: '0 auto', fontSize: '1.5rem', color: '#667eea' }}>
          {t.notifications}
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </h1>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={markAllAsRead}
            className="btn btn-secondary btn-sm"
            disabled={unreadCount === 0}
          >
            ✓ {t.markAllRead}
          </button>
        </div>
      )}

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          color: '#666' 
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
          <p>{t.noNotifications}</p>
        </div>
      ) : (
        <>
          {/* Today */}
          {groupedNotifications.today.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem' }}>
                {t.today}
              </h3>
              {groupedNotifications.today.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {t.time[notification.time as keyof typeof t.time]}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    className="notification-clear"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Yesterday */}
          {groupedNotifications.yesterday.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem' }}>
                {t.yesterday}
              </h3>
              {groupedNotifications.yesterday.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {t.time[notification.time as keyof typeof t.time]}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    className="notification-clear"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* This week */}
          {groupedNotifications.thisWeek.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem' }}>
                {t.thisWeek}
              </h3>
              {groupedNotifications.thisWeek.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {t.time[notification.time as keyof typeof t.time]}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    className="notification-clear"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;