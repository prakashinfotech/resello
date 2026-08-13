import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  checkUser,
  login,
  register,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '../store/slices/authSlice';
import Modal from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'identifier' | 'login' | 'register';

/**
 * Smart authentication modal that detects whether the user is logging in or registering
 * based on whether their email/phone already exists in the system.
 */
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [step, setStep] = useState<ModalStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const identifierRef = useRef<HTMLInputElement>(null);

  // Close modal on successful auth
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Focus identifier input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => identifierRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('identifier');
      setIdentifier('');
      setPassword('');
      setName('');
      setIdentifierError('');
      setPasswordError('');
      setNameError('');
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const validateIdentifier = (value: string): boolean => {
    if (!value.trim()) {
      setIdentifierError('Email or phone number is required');
      return false;
    }
    const isEmail = value.includes('@');
    const isPhone = /^[0-9]{10}$/.test(value.trim());
    if (!isEmail && !isPhone) {
      setIdentifierError('Enter a valid email address or 10-digit phone number');
      return false;
    }
    setIdentifierError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  // Check if user exists on identifier blur
  const handleIdentifierBlur = async () => {
    // Don't validate on blur if the modal is about to close
    if (!isOpen) return;
    if (!validateIdentifier(identifier)) return;
    setIsCheckingUser(true);
    try {
      const result = await dispatch(checkUser(identifier.trim())).unwrap();
      setStep(result.exists ? 'login' : 'register');
    } catch {
      // error handled by redux state
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'identifier') {
      await handleIdentifierBlur();
      return;
    }

    const isPasswordValid = validatePassword(password);

    if (step === 'register') {
      const isNameValid = validateName(name);
      if (!isPasswordValid || !isNameValid) return;

      await dispatch(
        register({ identifier: identifier.trim(), password, name: name.trim() })
      );
    } else {
      if (!isPasswordValid) return;
      await dispatch(login({ identifier: identifier.trim(), password }));
    }
  };

  const handleBackToIdentifier = () => {
    setStep('identifier');
    setPassword('');
    setName('');
    setPasswordError('');
    setNameError('');
    dispatch(clearError());
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelId="auth-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 id="auth-modal-title" className="text-xl font-semibold text-gray-900">
            {step === 'login' ? 'Login to ReSello' : step === 'register' ? 'Create Account' : 'Login / Register'}
          </h2>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 space-y-4">
          {/* Identifier field */}
          <div>
            <label htmlFor="auth-identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                id="auth-identifier"
                ref={identifierRef}
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (identifierError) setIdentifierError('');
                  if (step !== 'identifier') setStep('identifier');
                }}
                onBlur={handleIdentifierBlur}
                placeholder="Enter email or 10-digit phone"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  identifierError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                autoComplete="username"
              />
              {isCheckingUser && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
                </div>
              )}
            </div>
            {identifierError && (
              <p className="mt-1 text-sm text-red-600" role="alert">{identifierError}</p>
            )}
          </div>

          {/* Name field — only for registration */}
          {step === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                autoComplete="name"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600" role="alert">{nameError}</p>
              )}
            </div>
          )}

          {/* Password field — shown after identifier check */}
          {(step === 'login' || step === 'register') && (
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder={step === 'register' ? 'Create a password (min 8 chars)' : 'Enter your password'}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                autoComplete={step === 'register' ? 'new-password' : 'current-password'}
                autoFocus
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600" role="alert">{passwordError}</p>
              )}
            </div>
          )}

          {/* API error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">
              {error}
            </p>
          )}

          {/* Step hint */}
          {step === 'register' && (
            <p className="text-sm text-gray-500">
              No account found for this {identifier.includes('@') ? 'email' : 'phone number'}. Create one below.
            </p>
          )}
          {step === 'login' && (
            <p className="text-sm text-gray-500">
              Welcome back! Enter your password to continue.
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || isCheckingUser}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {step === 'register' ? 'Creating account...' : 'Logging in...'}
              </span>
            ) : step === 'identifier' ? (
              'Continue'
            ) : step === 'register' ? (
              'Create Account'
            ) : (
              'Login'
            )}
          </button>

          {/* Back link when on login/register step */}
          {step !== 'identifier' && (
            <button
              type="button"
              onClick={handleBackToIdentifier}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            >
              Use a different email or phone
            </button>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default AuthModal;
