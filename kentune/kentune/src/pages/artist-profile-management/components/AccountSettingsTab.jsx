import React, { useState } from 'react';
import { auth } from '../../../lib/firebaseAuth';
import { sendEmailVerification } from 'firebase/auth';
import { emailVerificationService } from '../../../utils/emailVerificationService';
import { resetPasswordForEmail } from '../../../utils/resetPasswordForEmail';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AccountSettingsTab = ({ profileData, onUpdateProfile, currentLanguage }) => {
  const [formData, setFormData] = useState({
    email: profileData?.email || '',
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [emailChangeStatus, setEmailChangeStatus] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('');
  const handleSendVerification = async () => {
    setVerifyStatus('');
    try {
      if (!auth.currentUser) {
        setVerifyStatus('No user session. Please log in again.');
        return;
      }
      await sendEmailVerification(auth.currentUser);
      setVerifyStatus('Verification email sent! Please check your inbox.');
    } catch (error) {
      setVerifyStatus('Failed to send verification email: ' + (error.message || 'Unknown error'));
    }
  };
  const [passwordResetStatus, setPasswordResetStatus] = useState('');



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };



  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength += 1;
    if (/[a-z]/?.test(password)) strength += 1;
    if (/[A-Z]/?.test(password)) strength += 1;
    if (/[0-9]/?.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/?.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    const texts = {
      en: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'],
      sw: ['Dhaifu Sana', 'Dhaifu', 'Wastani', 'Nzuri', 'Imara']
    };
    return texts?.[currentLanguage]?.[passwordStrength] || texts?.[currentLanguage]?.[0];
  };

  const getPasswordStrengthColor = () => {
    const colors = ['text-error', 'text-error', 'text-warning', 'text-success', 'text-success'];
    return colors?.[passwordStrength] || colors?.[0];
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex?.test(phone);
  };

  const validateMpesa = (number) => {
    const mpesaRegex = /^(\+254|0)7\d{8}$/;
    return mpesaRegex?.test(number);
  };

  const handleSave = async () => {
    const newErrors = {};
    setEmailChangeStatus('');

    // Validate required fields
    if (!formData?.email?.trim()) {
      newErrors.email = currentLanguage === 'en' ? 'Email is required' : 'Barua pepe inahitajika';
    } else if (!validateEmail(formData?.email)) {
      newErrors.email = currentLanguage === 'en' ? 'Invalid email format' : 'Muundo wa barua pepe si sahihi';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Only trigger email change if email is different
    if (formData.email !== profileData?.email) {
      setEmailChangeStatus(currentLanguage === 'en' ? 'Sending verification email...' : 'Inatuma barua pepe ya uthibitisho...');
      const { error } = await emailVerificationService.requestEmailChange(formData.email);
      if (error) {
        setEmailChangeStatus(currentLanguage === 'en' ? `Email change failed: ${error}` : `Mabadiliko ya barua pepe yameshindikana: ${error}`);
        return;
      }
      setEmailChangeStatus(currentLanguage === 'en' ? 'Verification email sent! Please check your inbox.' : 'Barua pepe ya uthibitisho imetumwa! Tafadhali angalia kikasha chako.');
    } else {
      setEmailChangeStatus('');
    }

    onUpdateProfile('account', formData);
  };

  const handlePasswordUpdate = async () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = currentLanguage === 'en' ? 'Email is required' : 'Barua pepe inahitajika';
    }
    if (!passwordData?.newPassword) {
      newErrors.newPassword = currentLanguage === 'en' ? 'New password is required' : 'Nywila mpya inahitajika';
    } else if (passwordStrength < 3) {
      newErrors.newPassword = currentLanguage === 'en' ? 'Password is too weak' : 'Nywila ni dhaifu sana';
    }
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      newErrors.confirmPassword = currentLanguage === 'en' ? 'Passwords do not match' : 'Nywila hazifanani';
    }
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }
    setPasswordResetStatus(currentLanguage === 'en' ? 'Sending password reset email...' : 'Inatuma barua pepe ya kuweka upya nenosiri...');
    const { error } = await resetPasswordForEmail(formData.email);
    if (error) {
      setPasswordResetStatus(currentLanguage === 'en' ? `Password reset failed: ${error}` : `Uwekaji upya wa nenosiri umeshindikana: ${error}`);
      return;
    }
    setPasswordResetStatus(currentLanguage === 'en' ? 'Password reset email sent! Please check your inbox.' : 'Barua pepe ya kuweka upya nenosiri imetumwa! Tafadhali angalia kikasha chako.');
    setShowPasswordChange(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordStrength(0);
  };



  return (
    <div className="space-y-6">
  {/* Password Reset Only - Email change removed */}
        {showPasswordChange && (
          <div className="bg-card rounded-lg border border-border p-6 mt-4">
            <h3 className="font-heading font-semibold text-foreground mb-4">
              {currentLanguage === 'en' ? 'Change Password' : 'Badilisha Nywila'}
            </h3>
            <div className="space-y-4">
              <Input
                label={currentLanguage === 'en' ? 'New Password' : 'Nywila Mpya'}
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
                error={errors?.newPassword}
                required
              />
              <div className="flex items-center space-x-2">
                <div className={`text-xs font-medium ${getPasswordStrengthColor()}`}>{getPasswordStrengthText()}</div>
              </div>
              <Input
                label={currentLanguage === 'en' ? 'Confirm New Password' : 'Thibitisha Nywila Mpya'}
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
                error={errors?.confirmPassword}
                required
              />
              {passwordResetStatus && (
                <div className="text-sm mt-2" style={{ color: passwordResetStatus.includes('failed') ? '#dc2626' : '#16a34a' }}>
                  {passwordResetStatus}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordChange(false)}
                >
                  {currentLanguage === 'en' ? 'Cancel' : 'Ghairi'}
                </Button>
                <Button
                  variant="default"
                  onClick={handlePasswordUpdate}
                >
                  {currentLanguage === 'en' ? 'Update Password' : 'Sasisha Nywila'}
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          variant="default"
          onClick={handleSave}
          iconName="Save"
          iconPosition="left"
        >
          {currentLanguage === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko'}
        </Button>
      </div>
    </div>
  );
};

export default AccountSettingsTab;