import { authService } from './authService';

// Wrapper for password reset for easier import
export async function resetPasswordForEmail(email) {
  return await authService.resetPassword(email);
}
