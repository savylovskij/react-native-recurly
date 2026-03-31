import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'react-native-css';
import { clsx } from 'clsx';
import { mapSignUpError } from '@/lib/utils';
import { usePostHog } from 'posthog-react-native';

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUp() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    code?: string;
    general?: string;
  }>({});

  const isSubmitting = fetchStatus === 'fetching';

  const validate = () => {
    const next: typeof errors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      next.name = 'Full name is required';
    }

    if (!trimmedEmail) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = 'Enter a valid email address';
    }

    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setErrors({});

    try {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName,
        lastName,
      });

      if (error) {
        setErrors(mapSignUpError(error));
        posthog.capture('sign_up_failed', { error_code: error.code, error_message: error.message });
        return;
      }

      await signUp.verifications.sendEmailCode();
      posthog.capture('email_verification_sent', { email: email.trim() });
      setPendingVerification(true);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        setErrors({ general: clerkError.longMessage || clerkError.message });
        posthog.capture('sign_up_failed', {
          error_code: clerkError.code,
          error_message: clerkError.message,
        });
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
        posthog.capture('sign_up_failed', { error_message: 'unknown_error' });
      }
    }
  };

  const handleVerify = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setErrors({ code: 'Enter the verification code' });
      return;
    }
    if (trimmedCode.length < 6) {
      setErrors({ code: 'Code must be 6 digits' });
      return;
    }

    setErrors({});

    try {
      await signUp.verifications.verifyEmailCode({ code: trimmedCode });

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            const userId = session?.user?.id;
            const userEmail = session?.user?.emailAddresses?.[0]?.emailAddress;
            if (userId) {
              posthog.identify(userId, {
                $set: { email: userEmail ?? null },
                $set_once: { signup_date: new Date().toISOString() },
              });
            }
            posthog.capture('user_signed_up', { method: 'password' });
            const url = decorateUrl('/');
            router.replace(url as any);
          },
        });
      } else {
        setErrors({ general: 'Verification could not be completed. Please try again.' });
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        const errCode = clerkError.code;
        if (errCode === 'form_code_incorrect') {
          setErrors({ code: 'Incorrect code. Please check and try again.' });
        } else if (errCode === 'verification_expired') {
          setErrors({ code: 'Code expired. Request a new one.' });
        } else {
          setErrors({ general: clerkError.longMessage || clerkError.message });
        }
        posthog.capture('email_verification_failed', { error_code: errCode ?? clerkError.code });
      } else {
        setErrors({ general: 'Verification failed. Please try again.' });
        posthog.capture('email_verification_failed', { error_message: 'unknown_error' });
      }
    }
  };

  const handleResendCode = async () => {
    setErrors({});
    try {
      await signUp.verifications.sendEmailCode();
      posthog.capture('verification_code_resent', { email: email.trim() });
    } catch {
      setErrors({ general: 'Could not resend code. Please try again.' });
    }
  };

  // ─── Verification screen ───
  if (pendingVerification) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          className="auth-screen"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>

              <Text className="auth-title">Check your email</Text>
              <Text className="auth-subtitle">We sent a 6-digit code to {email.trim()}</Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                {errors.general && (
                  <View className="rounded-xl bg-destructive/10 px-4 py-3">
                    <Text className="text-sm font-sans-medium text-destructive">
                      {errors.general}
                    </Text>
                  </View>
                )}

                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={clsx('auth-input', errors.code && 'auth-input-error')}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={code}
                    onChangeText={(t) => {
                      setCode(t.replace(/[^0-9]/g, '').slice(0, 6));
                      if (errors.code) setErrors((e) => ({ ...e, code: undefined }));
                    }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    returnKeyType="done"
                    onSubmitEditing={handleVerify}
                    editable={!isSubmitting}
                    maxLength={6}
                  />
                  {errors.code && <Text className="auth-error">{errors.code}</Text>}
                </View>

                <Pressable
                  className={clsx(
                    'auth-button',
                    (!code.trim() || isSubmitting) && 'auth-button-disabled',
                  )}
                  onPress={handleVerify}
                  disabled={!code.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify email</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={handleResendCode}
                  disabled={isSubmitting}
                >
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Wrong email?</Text>
                <Pressable
                  onPress={async () => {
                    await signUp.reset();
                    setErrors({});
                    setCode('');
                    setPendingVerification(false);
                  }}
                >
                  <Text className="auth-link">Go back</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── Registration form ───
  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && !isSubmitting;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand block */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>

            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Start tracking and managing all your subscriptions
            </Text>
          </View>

          {/* Form card */}
          <View className="auth-card">
            <View className="auth-form">
              {errors.general && (
                <View className="rounded-xl bg-destructive/10 px-4 py-3">
                  <Text className="text-sm font-sans-medium text-destructive">
                    {errors.general}
                  </Text>
                </View>
              )}

              {/* Full name */}
              <View className="auth-field">
                <Text className="auth-label">Full name</Text>
                <TextInput
                  className={clsx('auth-input', errors.name && 'auth-input-error')}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                  }}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  editable={!isSubmitting}
                />
                {errors.name && <Text className="auth-error">{errors.name}</Text>}
              </View>

              {/* Email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={clsx('auth-input', errors.email && 'auth-input-error')}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                  }}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  editable={!isSubmitting}
                />
                {errors.email && <Text className="auth-error">{errors.email}</Text>}
              </View>

              {/* Password */}
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={clsx('auth-input', errors.password && 'auth-input-error')}
                  placeholder="At least 8 characters"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  editable={!isSubmitting}
                />
                {errors.password && <Text className="auth-error">{errors.password}</Text>}
              </View>

              {/* Submit */}
              <Pressable
                className={clsx('auth-button', !canSubmit && 'auth-button-disabled')}
                onPress={handleSignUp}
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>
            </View>

            {/* Link to sign-in */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
