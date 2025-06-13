// Supabase Configuration
// For production, these should be set as environment variables

export const SUPABASE_CONFIG = {
  url: 'https://lvacourlbrjwlvioqrqc.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWNvdXJsYnJqd2x2aW9xcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDE4NzgsImV4cCI6MjA2MjM3Nzg3OH0.JRdCHr7sEdZPw7OtKgpEDcpnOGEtUPEE_vgRleLszhA',
};

// For Expo managed workflow, you can also use:
// export const SUPABASE_CONFIG = {
//   url: process.env.EXPO_PUBLIC_SUPABASE_URL,
//   anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
// };

export default SUPABASE_CONFIG; 