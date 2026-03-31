import '@/global.css';
import { View, Image, Text, FlatList } from 'react-native';
import { useState } from 'react';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'react-native-css';
import images from '@/constants/images';
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
  HOME_SUBSCRIPTIONS,
} from '@/constants/data';
import { icons } from '@/constants/icons';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import ListHeading from '@/components/ListHeading';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useUser } from '@clerk/expo';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Image source={icons.add} className="home-add-icon" />
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">No upcoming renewals yet</Text>
                }
              />
            </View>

            <ListHeading title="All subscriptions" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) => {
                return currentId === item.id ? null : item.id;
              })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
