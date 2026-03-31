import { useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'react-native-css';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/contexts/SubscriptionsContext';

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const searchQuery = search.trim().toLowerCase();

  const filtered = (() => {
    if (!searchQuery) {
      return subscriptions;
    }

    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchQuery) ||
        sub.category?.toLowerCase().includes(searchQuery) ||
        sub.plan?.toLowerCase().includes(searchQuery),
    );
  })();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary mb-4">Subscriptions</Text>

      <TextInput
        className="auth-input mb-4"
        placeholder="Search subscriptions..."
        placeholderTextColor="rgba(0,0,0,0.35)"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
          />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions found.</Text>}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
