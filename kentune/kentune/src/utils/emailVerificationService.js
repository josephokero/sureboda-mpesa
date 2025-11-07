import { auth } from '../lib/firebaseAuth';
import { updateEmail, sendEmailVerification, sendSignInLinkToEmail } from 'firebase/auth';

export const emailVerificationService = {
  async requestEmailChange(newEmail) {
    try {
      if (!auth.currentUser) {
        console.log('[Firebase Debug] No current user:', auth.currentUser);
        return { data: null, error: 'Auth session missing!' };
      }
      // Debug: log user info and provider
      console.log('[Firebase Debug] Current user:', auth.currentUser);
      if (auth.currentUser.providerData) {
        console.log('[Firebase Debug] Provider data:', auth.currentUser.providerData);
      }
      // Check if current email is verified
      if (!auth.currentUser.emailVerified) {
        return { data: null, error: 'Please verify your current email before changing to a new one.' };
      }
      // Update email to new email
      await updateEmail(auth.currentUser, newEmail);
      // Send verification to new email
      await sendEmailVerification(auth.currentUser);
      return { data: true, error: null };
    } catch (error) {
      console.error('[Firebase Debug] Email change error:', error);
      return { data: null, error: error.message || 'Failed to request email change.' };
    }
  }
};
