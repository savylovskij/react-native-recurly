import { useSignIn } from '@clerk/expo';
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
import { mapSignInError } from '@/lib/utils';

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const isSubmitting = fetchStatus === 'fetching';

  const validate = () => {
    const next: typeof errors = {};
    const trimmed = email.trim();

    if (!trimmed) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
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

  const handleSignIn = async () => {
    if (!validate()) return;

    setErrors({});

    try {
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        setErrors(mapSignInError(error));
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl('/');
            router.replace(url as any);
          },
        });
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        setErrors({ general: clerkError.longMessage || clerkError.message });
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

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

            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">Sign in to continue managing your subscriptions</Text>
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
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  editable={!isSubmitting}
                />
                {errors.password && <Text className="auth-error">{errors.password}</Text>}
              </View>

              {/* Submit */}
              <Pressable
                className={clsx('auth-button', !canSubmit && 'auth-button-disabled')}
                onPress={handleSignIn}
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>
            </View>

            {/* Link to sign-up */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
