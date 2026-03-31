import dayjs from 'dayjs';

export const formatCurrency = (value: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) {
    return 'Not provided';
  }

  const parsedDate = dayjs(value);

  return parsedDate.isValid() ? parsedDate.format('MM/DD/YYYY') : 'Not provided';
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) {
    return 'Unknown';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

type AuthErrors = Record<string, string>;

const SIGN_UP_ERROR_MAP: Record<string, AuthErrors> = {
  form_identifier_exists: { email: 'An account with this email already exists' },
  form_password_pwned: { password: 'This password has been compromised. Choose a stronger one.' },
  form_password_length_too_short: { password: 'Password must be at least 8 characters' },
};

const SIGN_IN_ERROR_MAP: Record<string, AuthErrors> = {
  form_identifier_not_found: { email: 'No account found with this email' },
  form_password_incorrect: { password: 'Incorrect password' },
  strategy_for_user_invalid: { general: 'This account uses a different sign-in method' },
};

const mapClerkError = (
  error: { code?: string; longMessage?: string; message?: string },
  errorMap: Record<string, AuthErrors>,
): AuthErrors => {
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }
  return { general: error.longMessage || error.message || 'Something went wrong' };
};

export const mapSignUpError = (error: { code?: string; longMessage?: string; message?: string }) =>
  mapClerkError(error, SIGN_UP_ERROR_MAP);

export const mapSignInError = (error: { code?: string; longMessage?: string; message?: string }) =>
  mapClerkError(error, SIGN_IN_ERROR_MAP);
