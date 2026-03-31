import { Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'react-native-css';
import { useAuth, useUser } from '@clerk/expo';
import images from '@/constants/images';
import { usePostHog } from 'posthog-react-native';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const posthog = usePostHog();

  const displayName =
    user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';
  const email = user?.emailAddresses[0]?.emailAddress || '';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          posthog.capture('user_signed_out');
          posthog.reset();
          signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary mb-5">Settings</Text>

      <View className="rounded-3xl border border-border bg-card p-5">
        <View className="flex-row items-center mb-5">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="size-16 rounded-full"
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-sans-bold text-primary">{displayName}</Text>
            {email ? (
              <Text className="text-sm font-sans-medium text-muted-foreground mt-1">{email}</Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="items-center rounded-2xl bg-accent py-4"
          activeOpacity={0.8}
        >
          <Text className="text-base font-sans-bold text-primary">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
