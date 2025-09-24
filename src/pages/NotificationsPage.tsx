import React from "react";

type Language = "fr" | "en" | "mfe" | "rcf";
type Page = "splash" | "auth" | "register" | "home" | "addMeal" | "profile" | "notifications" | "supplies";

interface NotificationsPageProps {
  language: Language;
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const translations = {
  fr: {
    notifications: "Notifications",
    today: "Aujourd'hui",
    yesterday: "Hier", 
    thisWeek: "Cette semaine",
    mealReminder: "Rappel d'ajout de repas",
    addMealToday: "Il est temps d'ajouter votre repas d'hier",
    addMealYesterday: "Il est temps d'ajouter votre repas d'hier",
    supplies: "Approvisionnements",
    suppliesDescription: "Participer à l'enquête sur vos habitudes d'achat alimentaire",
    noNotifications: "Aucune notification pour le moment"
  },
  en: {
    notifications: "Notifications",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week", 
    mealReminder: "Meal reminder",
    addMealToday: "It's time to add your meal for yesterday",
    addMealYesterday: "It's time to add your meal for yesterday",
    supplies: "Supplies",
    suppliesDescription: "Participate in the survey about your food shopping habits",
    noNotifications: "No notifications at the moment"
  },
  mfe: {
    notifications: "Notifikasyon",
    today: "Zordi",
    yesterday: "Yer",
    thisWeek: "Lasmen sa",
    mealReminder: "Rapel azout manze",
    addMealToday: "Letan pou azout to manze yer",
    addMealYesterday: "Letan pou azout to manze yer",
    supplies: "Aprovizyon",
    suppliesDescription: "Partisip dan lenket lor to fason aste manze",
    noNotifications: "Pa ena notifikasyon pou lomoment"
  },
  rcf: {
    notifications: "Notifikasyon",
    today: "Zordi",
    yesterday: "Yèr", 
    thisWeek: "Lasmèn-la",
    mealReminder: "Rapèl azout manzé",
    addMealToday: "Lètan pou azout ou manzé yèr",
    addMealYesterday: "Lètan pou azout ou manzé yèr", 
    supplies: "Aprovizyon",
    suppliesDescription: "Partisipé dan lenquèt lor ou fason astè manzé",
    noNotifications: "Pa éna notifikasyon pou lomoment"
  }
};

// Helper function to get date strings
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  language,
  onBack,
  onNavigate,
}) => {
  const t = translations[language];
  
  const yesterdayDate = getDateString(1);
  const dayBeforeYesterdayDate = getDateString(2);

  const NotificationItem = ({ 
    icon, 
    title, 
    description, 
    onClick 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    onClick?: () => void;
  }) => (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0',
        marginBottom: '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        fontSize: '1.5rem',
        padding: '0.5rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        minWidth: '50px',
        textAlign: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ 
          margin: '0 0 0.25rem 0', 
          color: '#333', 
          fontSize: '1rem',
          fontWeight: '600' 
        }}>
          {title}
        </h4>
        <p style={{ 
          margin: 0, 
          color: '#666', 
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      </div>
      {onClick && (
        <div style={{
          color: '#667eea',
          fontSize: '1.2rem'
        }}>
          →
        </div>
      )}
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 style={{
      margin: '2rem 0 1rem 0',
      color: '#333',
      fontSize: '1.2rem',
      fontWeight: '600',
      paddingLeft: '0.5rem',
      borderLeft: '3px solid #667eea'
    }}>
      {title}
    </h3>
  );

  return (
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">
          {t.notifications}
        </h1>
        <div></div>
      </div>
      
      <div className="page-content-full">
        {/* Today Section */}
        <SectionHeader title={t.today} />
        <NotificationItem
          icon="🍽️"
          title={t.mealReminder}
          description={`${t.addMealToday}, ${yesterdayDate}`}
        />

        {/* Yesterday Section */}
        <SectionHeader title={t.yesterday} />
        <NotificationItem
          icon="🍽️"
          title={t.mealReminder}
          description={`${t.addMealYesterday}, ${dayBeforeYesterdayDate}`}
        />

        {/* This Week Section */}
        <SectionHeader title={t.thisWeek} />
        <NotificationItem
          icon="🛒"
          title={t.supplies}
          description={t.suppliesDescription}
          onClick={() => onNavigate("supplies")}
        />
      </div>
    </>
  );
};

export default NotificationsPage;