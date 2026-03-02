export interface Theme {
  pageBg: string;
  cardBg: string;
  inputBg: string;
  barBg: string;
  border: string;
  borderAccent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;
  accent: string;
  danger: string;
  success: string;
  info: string;
  warning: string;
  purple: string;
  shadow: string;
  pieSecondary: string;
  overlayBg: string;
  pieCenter: string;
}

export const THEME_STORAGE_KEY = 'admin-theme-dark';

export function getTheme(isDark: boolean): Theme {
  if (isDark) {
    return {
      pageBg: '#1a1a1a',
      cardBg: '#2a2a2a',
      inputBg: '#333',
      barBg: '#444',
      border: '#444',
      borderAccent: '#ffc000',
      textPrimary: '#ffffff',
      textSecondary: '#aaa',
      textMuted: '#666',
      textOnAccent: '#000',
      accent: '#ffc000',
      danger: '#ff4444',
      success: '#4CAF50',
      info: '#2196F3',
      warning: '#FF9800',
      purple: '#9C27B0',
      shadow: 'rgba(0,0,0,0.3)',
      pieSecondary: '#666',
      overlayBg: 'rgba(0,0,0,0.8)',
      pieCenter: '#2a2a2a',
    };
  }
  return {
    pageBg: '#f0f2f5',
    cardBg: '#ffffff',
    inputBg: '#f5f5f5',
    barBg: '#e0e0e0',
    border: '#ddd',
    borderAccent: '#ffc000',
    textPrimary: '#1a1a1a',
    textSecondary: '#555',
    textMuted: '#999',
    textOnAccent: '#000',
    accent: '#ffc000',
    danger: '#ff4444',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FF9800',
    purple: '#9C27B0',
    shadow: 'rgba(0,0,0,0.08)',
    pieSecondary: '#ccc',
    overlayBg: 'rgba(0,0,0,0.5)',
    pieCenter: '#ffffff',
  };
}
