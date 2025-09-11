// Admin authentication will be handled by Supabase Auth
// For now, we'll use a simple local admin check

export const login = async (username, password) => {
  // Simple local admin check - in production, use Supabase Auth
  if (username === 'admin' && password === 'qprffo') {
    return { success: true, message: 'Login successful', token: 'admin-token' };
  }
  throw new Error('Invalid credentials');
};


