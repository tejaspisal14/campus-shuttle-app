// Theme and app constants
export const COLORS = {
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#7c3aed',
  background: '#f7fafc',
  surface: '#ffffff',
  text: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0',
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
};

// Supabase - Replace with your project credentials
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
