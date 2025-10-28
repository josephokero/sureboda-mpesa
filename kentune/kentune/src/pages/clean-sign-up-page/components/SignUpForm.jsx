import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SignUpForm = ({ onSubmit, isSubmitting, disabled }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    stageName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors?.[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Update password strength
    if (name === 'password') {
      updatePasswordStrength(value);
    }
  };

  const updatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength += 1;
    if (/[A-Z]/?.test(password)) strength += 1;
    if (/[a-z]/?.test(password)) strength += 1;
    if (/\d/?.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/?.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'text-destructive';
    if (passwordStrength <= 3) return 'text-warning';
    if (passwordStrength <= 4) return 'text-primary';
    return 'text-success';
  };

  const validateForm = () => {
    const errors = {};
    if (!formData?.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData?.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData?.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData?.password?.trim()) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!formData?.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm() || disabled) {
      return;
    }
    
    onSubmit?.(formData);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name Field */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
          Full Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={formData?.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          disabled={disabled}
          className={`w-full ${formErrors?.fullName ? 'border-destructive focus:ring-destructive' : ''}`}
          autoComplete="name"
          required
        />
        {formErrors?.fullName && (
          <p className="text-sm text-destructive">{formErrors?.fullName}</p>
        )}
      </div>
      {/* Stage Name Field (Optional) */}
      <div className="space-y-2">
        <label htmlFor="stageName" className="block text-sm font-medium text-foreground">
          Stage Name <span className="text-muted-foreground text-xs">(Optional)</span>
        </label>
        <Input
          id="stageName"
          name="stageName"
          type="text"
          value={formData?.stageName}
          onChange={handleInputChange}
          placeholder="Enter your artist/stage name"
          disabled={disabled}
          className="w-full"
        />
      </div>
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email Address <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData?.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          disabled={disabled}
          className={`w-full ${formErrors?.email ? 'border-destructive focus:ring-destructive' : ''}`}
          autoComplete="email"
          required
        />
        {formErrors?.email && (
          <p className="text-sm text-destructive">{formErrors?.email}</p>
        )}
      </div>
      {/* Phone Field (Optional) */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
          Phone Number <span className="text-error text-xs font-semibold">*</span>
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData?.phone}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          disabled={disabled}
          className="w-full"
          autoComplete="tel"
          required
        />
      </div>
      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Create a secure password"
            disabled={disabled}
            className={`w-full pr-12 ${formErrors?.password ? 'border-destructive focus:ring-destructive' : ''}`}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('password')}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <div className="w-5 h-5">
              {showPassword ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData?.password && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    passwordStrength <= 2 ? 'bg-destructive' :
                    passwordStrength <= 3 ? 'bg-warning' :
                    passwordStrength <= 4 ? 'bg-primary' : 'bg-success'
                  }`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                {getPasswordStrengthText()}
              </span>
            </div>
          </div>
        )}
        
        {formErrors?.password && (
          <p className="text-sm text-destructive">{formErrors?.password}</p>
        )}
      </div>
      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
          Confirm Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData?.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            disabled={disabled}
            className={`w-full pr-12 ${formErrors?.confirmPassword ? 'border-destructive focus:ring-destructive' : ''}`}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirmPassword')}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            <div className="w-5 h-5">
              {showConfirmPassword ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
          </button>
        </div>
        {formErrors?.confirmPassword && (
          <p className="text-sm text-destructive">{formErrors?.confirmPassword}</p>
        )}
      </div>
      {/* Create Account Button */}
      <Button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </Button>
      {/* Terms & Conditions Checkbox */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="acceptTerms"
          name="acceptTerms"
          required
          checked={formData?.acceptTerms || false}
          onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
          className="w-4 h-4 mr-2 accent-orange-500"
        />
        <label htmlFor="acceptTerms" className="text-xs text-muted-foreground">
          I accept the <a href="/terms-and-conditions" className="text-primary hover:underline">Terms and Conditions</a> and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
        </label>
      </div>
    </form>
  );
};

export default SignUpForm;