import React, { useState, useMemo } from 'react';
import logo from '../assets/LOGO.png';

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
  method: 'text' | 'voice';
  date: string;
}

interface AdminDashboardProps {
  meals: MealData[];
  onLogout: () => void;
}

interface DashboardStats {
  totalMeals: number;
  totalUsers: number;
  averageMealDuration: number;
  textVsVoiceRatio: { text: number; voice: number };
  mealsByDay: { [date: string]: number };
  mealsByType: { [name: string]: number };
  dailyAverage: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ meals, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'users' | 'analytics'>('overview');

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const totalMeals = meals.length;
    const totalUsers = 156; // Simulated user count
    
    // Calculate average meal duration
    const totalDuration = meals.reduce((acc, meal) => {
      const duration = parseInt(meal.duration.replace(/\D/g, '')) || 0;
      return acc + duration;
    }, 0);
    const averageMealDuration = Math.round(totalDuration / totalMeals);

    // Calculate text vs voice ratio
    const textMeals = meals.filter(meal => meal.method === 'text').length;
    const voiceMeals = meals.filter(meal => meal.method === 'voice').length;
    const textVsVoiceRatio = {
      text: Math.round((textMeals / totalMeals) * 100),
      voice: Math.round((voiceMeals / totalMeals) * 100)
    };

    // Group meals by day
    const mealsByDay = meals.reduce((acc, meal) => {
      const date = meal.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [date: string]: number });

    // Group meals by type
    const mealsByType = meals.reduce((acc, meal) => {
      const type = meal.name.toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [name: string]: number });

    // Calculate daily average
    const uniqueDays = Object.keys(mealsByDay).length;
    const dailyAverage = Math.round(totalMeals / uniqueDays * 10) / 10;

    return {
      totalMeals,
      totalUsers,
      averageMealDuration,
      textVsVoiceRatio,
      mealsByDay,
      mealsByType,
      dailyAverage
    };
  }, [meals]);

  const renderStatsCard = (title: string, value: string | number, subtitle?: string, color: string = '#ffc000') => (
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '1.5rem',
      border: `2px solid ${color}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <h3 style={{ 
        color: color, 
        fontSize: '1rem', 
        margin: '0 0 0.5rem 0',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <div style={{ 
        color: '#fff', 
        fontSize: '2rem', 
        fontWeight: '700',
        margin: '0 0 0.5rem 0'
      }}>
        {value}
      </div>
      {subtitle && (
        <p style={{ 
          color: '#aaa', 
          fontSize: '0.9rem', 
          margin: 0 
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  const renderBarChart = (data: { [key: string]: number }, title: string) => {
    const maxValue = Math.max(...Object.values(data));
    const sortedData = Object.entries(data).sort(([,a], [,b]) => b - a).slice(0, 10);

    return (
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '2px solid #ffc000',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ 
          color: '#ffc000', 
          fontSize: '1.2rem', 
          margin: '0 0 1rem 0',
          fontWeight: '600'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {sortedData.map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                color: '#fff',
                fontSize: '0.9rem',
                minWidth: '100px',
                textAlign: 'left',
                textTransform: 'capitalize'
              }}>
                {key}
              </div>
              <div style={{ 
                flex: 1,
                height: '24px',
                backgroundColor: '#444',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(value / maxValue) * 100}%`,
                  backgroundColor: '#ffc000',
                  borderRadius: '12px',
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ 
                color: '#aaa',
                fontSize: '0.9rem',
                minWidth: '40px',
                textAlign: 'right'
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data: { text: number; voice: number }) => (
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '2px solid #ffc000',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ 
        color: '#ffc000', 
        fontSize: '1.2rem', 
        margin: '0 0 1rem 0',
        fontWeight: '600'
      }}>
        Input Method Distribution
      </h3>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '2rem'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `conic-gradient(#ffc000 0deg ${data.text * 3.6}deg, #666 ${data.text * 3.6}deg 360deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#2a2a2a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {data.text}%
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#ffc000',
              borderRadius: '3px'
            }} />
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>
              Text ({data.text}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#666',
              borderRadius: '3px'
            }} />
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>
              Voice ({data.voice}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLineChart = (data: { [date: string]: number }) => {
    const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    const values = sortedEntries.map(([, value]) => value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return (
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '2px solid #ffc000',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ 
          color: '#ffc000', 
          fontSize: '1.2rem', 
          margin: '0 0 1rem 0',
          fontWeight: '600'
        }}>
          Daily Meal Trends
        </h3>
        <div style={{
          height: '200px',
          position: 'relative',
          backgroundColor: '#333',
          borderRadius: '8px',
          padding: '1rem',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 150">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 30}
                x2="400"
                y2={i * 30}
                stroke="#444"
                strokeWidth="1"
              />
            ))}
            
            {/* Line chart */}
            <polyline
              fill="none"
              stroke="#ffc000"
              strokeWidth="3"
              points={values.map((value, index) => {
                const x = (index / (values.length - 1)) * 380 + 10;
                const y = 140 - ((value - minValue) / range) * 120;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {values.map((value, index) => {
              const x = (index / (values.length - 1)) * 380 + 10;
              const y = 140 - ((value - minValue) / range) * 120;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ffc000"
                  stroke="#2a2a2a"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2a2a2a',
        borderBottom: '2px solid #ffc000',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffc000'
          }}>
            <img src={logo} alt="Logo" style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }} />
          </div>
          <h1 style={{
            color: '#ffc000',
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0
          }}>
            Food Barometer Admin
          </h1>
        </div>
        
        <button
          onClick={onLogout}
          style={{
            backgroundColor: 'transparent',
            color: '#ff4444',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff4444';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ff4444';
          }}
        >
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #444',
        padding: '0 2rem',
        display: 'flex',
        gap: '2rem'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'meals', label: 'Meals Data' },
          { key: 'users', label: 'User Stats' },
          { key: 'analytics', label: 'Analytics' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? '#ffc000' : '#aaa',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #ffc000' : '3px solid transparent',
              padding: '1rem 0',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = '#ffc000';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = '#aaa';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflow: 'auto'
      }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {renderStatsCard('Total Meals', stats.totalMeals, 'Recorded entries')}
              {renderStatsCard('Active Users', stats.totalUsers, 'Registered participants', '#4CAF50')}
              {renderStatsCard('Avg Duration', `${stats.averageMealDuration} min`, 'Per meal', '#2196F3')}
              {renderStatsCard('Daily Average', stats.dailyAverage, 'Meals per day', '#FF9800')}
            </div>

            {/* Charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {renderPieChart(stats.textVsVoiceRatio)}
              {renderLineChart(stats.mealsByDay)}
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {renderBarChart(stats.mealsByType, 'Meal Types Distribution')}
            
            {/* Recent Meals Table */}
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '2px solid #ffc000',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ 
                color: '#ffc000', 
                fontSize: '1.2rem', 
                margin: '0 0 1rem 0',
                fontWeight: '600'
              }}>
                Recent Meals
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ color: '#ffc000', padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #444' }}>Date</th>
                      <th style={{ color: '#ffc000', padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #444' }}>Time</th>
                      <th style={{ color: '#ffc000', padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #444' }}>Meal</th>
                      <th style={{ color: '#ffc000', padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #444' }}>Duration</th>
                      <th style={{ color: '#ffc000', padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #444' }}>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.slice(-10).reverse().map(meal => (
                      <tr key={meal.id}>
                        <td style={{ color: '#fff', padding: '0.75rem', borderBottom: '1px solid #444' }}>
                          {new Date(meal.date).toLocaleDateString()}
                        </td>
                        <td style={{ color: '#fff', padding: '0.75rem', borderBottom: '1px solid #444' }}>
                          {new Date(meal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ color: '#fff', padding: '0.75rem', borderBottom: '1px solid #444' }}>
                          {meal.name}
                        </td>
                        <td style={{ color: '#fff', padding: '0.75rem', borderBottom: '1px solid #444' }}>
                          {meal.duration}
                        </td>
                        <td style={{ color: '#fff', padding: '0.75rem', borderBottom: '1px solid #444' }}>
                          <span style={{
                            backgroundColor: meal.method === 'text' ? '#4CAF50' : '#2196F3',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            textTransform: 'capitalize'
                          }}>
                            {meal.method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {renderStatsCard('Total Users', 156, 'Registered accounts', '#4CAF50')}
            {renderStatsCard('Active Today', 23, 'Users with activity', '#2196F3')}
            {renderStatsCard('New This Week', 8, 'New registrations', '#FF9800')}
            {renderStatsCard('Avg Sessions', '3.2', 'Per user per day', '#9C27B0')}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {renderLineChart(stats.mealsByDay)}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {renderStatsCard('Completion Rate', '87%', 'Surveys completed', '#4CAF50')}
              {renderStatsCard('Response Time', '2.3 min', 'Average per question', '#2196F3')}
              {renderStatsCard('Data Quality', '92%', 'Complete responses', '#FF9800')}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;