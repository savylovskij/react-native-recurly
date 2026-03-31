import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('subscription_details_viewed', { subscription_id: id });
  }, [id, posthog]);

  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  );
};

export default SubscriptionDetails;
