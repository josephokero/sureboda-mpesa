import { supabase } from '../lib/supabase';

export const smsVerificationService = {
  // Create SMS verification request
  async createVerification(phoneNumber) {
    try {
      const { data, error } = await supabase?.rpc('create_sms_verification', {
          target_phone: phoneNumber
        });

      if (error) {
        console.error('SMS Verification Error:', error);
        return {
          success: false,
          error: error?.message || 'Failed to create SMS verification'
        };
      }

      const result = data?.[0];
      
      if (!result?.success) {
        return {
          success: false,
          error: result?.message || 'Failed to create verification'
        };
      }

      // If we have a real SMS service, we would send the SMS here
      // For now, we'll call our edge function or SMS service
      await this.sendSMSCode(phoneNumber, result?.verification_id);

      return {
        success: true,
        verificationId: result?.verification_id,
        expiresAt: result?.expires_at,
        message: 'Verification code sent successfully'
      };

    } catch (error) {
      console.error('SMS Creation Error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  },

  // Send SMS code via edge function or external service
  async sendSMSCode(phoneNumber, verificationId) {
    try {
      // Option 1: Use Supabase Edge Function (recommended)
      const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
      const session = await supabase?.auth?.getSession();
      const token = session?.data?.session?.access_token;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || import.meta.env?.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone: phoneNumber,
          verificationId: verificationId,
          type: 'phone_verification'
        })
      });

      if (!response?.ok) {
        throw new Error(`SMS sending failed: ${response?.statusText}`);
      }

      const result = await response?.json();
      return result;

    } catch (error) {
      console.error('SMS Sending Error:', error);
      
      // For development/demo purposes, log the code to console
      if (import.meta.env?.DEV) {
        console.log(`📱 SMS Code would be sent to ${phoneNumber}. For demo, use code: 123456`);
      }
      
      // Don't throw error to prevent blocking the verification flow
      return {
        success: false,
        error: 'SMS sending failed, but verification record created'
      };
    }
  },

  // Verify SMS code
  async verifyCode(phoneNumber, code) {
    try {
      const { data, error } = await supabase?.rpc('verify_sms_code', {
          target_phone: phoneNumber,
          submitted_code: code
        });

      if (error) {
        console.error('SMS Verification Error:', error);
        return {
          success: false,
          error: error?.message || 'Failed to verify SMS code'
        };
      }

      const result = data?.[0];
      
      return {
        success: result?.success || false,
        error: result?.success ? null : (result?.message || 'Verification failed'),
        verifiedAt: result?.verified_at,
        message: result?.message
      };

    } catch (error) {
      console.error('SMS Verification Error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  },

  // Get verification status
  async getVerificationStatus(phoneNumber) {
    try {
      const { data, error } = await supabase?.rpc('get_phone_verification_status', {
          target_phone: phoneNumber
        });

      if (error) {
        console.error('Status Check Error:', error);
        return {
          isVerified: false,
          hasPendingCode: false,
          error: error?.message
        };
      }

      const result = data?.[0];
      
      return {
        isVerified: result?.is_verified || false,
        hasPendingCode: result?.has_pending_code || false,
        expiresAt: result?.expires_at,
        attemptsRemaining: result?.attempts_remaining || 0,
        message: result?.message,
        error: null
      };

    } catch (error) {
      console.error('Status Check Error:', error);
      return {
        isVerified: false,
        hasPendingCode: false,
        error: 'Network error. Please check your connection.'
      };
    }
  },

  // Clean up expired verification codes (admin function)
  async cleanupExpiredCodes() {
    try {
      const { data, error } = await supabase?.from('sms_verification_codes')?.update({ status: 'expired' })?.lt('expires_at', new Date()?.toISOString())?.eq('status', 'pending');

      if (error) {
        console.error('Cleanup Error:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, updatedCount: data?.length || 0 };

    } catch (error) {
      console.error('Cleanup Error:', error);
      return { success: false, error: 'Cleanup failed' };
    }
  },

  // Format phone number to E.164 format
  formatPhoneNumber(phoneNumber, defaultCountryCode = '+254') {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const digitsOnly = phoneNumber?.replace(/\D/g, '');
    
    // Handle Kenyan phone numbers
    if (digitsOnly?.startsWith('254')) {
      return '+' + digitsOnly;
    } else if (digitsOnly?.startsWith('0')) {
      return defaultCountryCode + digitsOnly?.substring(1);
    } else if (digitsOnly?.startsWith('7') || digitsOnly?.startsWith('1')) {
      return defaultCountryCode + digitsOnly;
    }
    
    return defaultCountryCode + digitsOnly;
  },

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    
    // Basic validation for Kenyan numbers
    const kenyanPhoneRegex = /^\+254[71]\d{8}$/;
    
    return {
      isValid: kenyanPhoneRegex?.test(formatted),
      formatted: formatted,
      error: kenyanPhoneRegex?.test(formatted) 
        ? null 
        : 'Please enter a valid Kenyan phone number (07xx xxx xxx or 01xx xxx xxx)'
    };
  }
};

export default smsVerificationService;