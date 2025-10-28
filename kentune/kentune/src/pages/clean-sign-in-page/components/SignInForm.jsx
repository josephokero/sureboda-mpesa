import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SignInForm = ({ onSubmit, isSubmitting, disabled }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password?.trim()) {
      errors.password = 'Password is required';
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-orange-600 tracking-wide">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData?.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          disabled={disabled}
          className={`w-full bg-white border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 transition-all duration-200 shadow-sm ${formErrors?.email ? 'border-destructive focus:ring-destructive animate-shake' : ''}`}
          autoComplete="email"
          required
        />
        {formErrors?.email && (
          <p className="text-sm text-destructive animate-shake">{formErrors?.email}</p>
        )}
      </div>
      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-orange-600 tracking-wide">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            disabled={disabled}
            className={`w-full pr-12 bg-white border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 transition-all duration-200 shadow-sm ${formErrors?.password ? 'border-destructive focus:ring-destructive animate-shake' : ''}`}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-orange-400 hover:text-orange-600 transition-colors disabled:opacity-50"
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
        {formErrors?.password && (
          <p className="text-sm text-destructive">{formErrors?.password}</p>
        )}
      </div>
      {/* Sign In Button */}
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-1000 disabled:opacity-50 disabled:cursor-not-allowed animate-soft-fade-slow"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            <span>Signing In...</span>
          </div>
        ) : (
          'Sign In'
        )}
      </Button>
      {/* Forgot Password Link */}
      <div className="text-center">
        <Link 
          to="/forgot-password" 
          className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors underline underline-offset-2"
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  );
};

export default SignInForm;