import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';
import { posthog } from '@/lib/posthog';

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#f5c542',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#f5c542',
  Productivity: '#b8e8d0',
  Cloud: '#d4e8f5',
  Music: '#f5d4e8',
  Other: '#e8e8e8',
};

const CreateSubscriptionModal = ({ visible, onClose, onSubmit }: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState('');

  const parsedPrice = parseFloat(price);
  const isValid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    const now = dayjs();
    const subscription: Subscription = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      price: parsedPrice,
      currency: 'USD',
      icon: icons.wallet,
      billing: frequency,
      category: category || undefined,
      status: 'active',
      startDate: now.toISOString(),
      renewalDate: now.add(1, frequency === 'Monthly' ? 'month' : 'year').toISOString(),
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
    };

    onSubmit(subscription);

    posthog.capture('subscription_created', {
      subscription_name: name.trim(),
      subscription_price: parsedPrice,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable className="modal-container" onPress={() => {}}>
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView className="modal-body" keyboardShouldPersistTaps="handled">
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="Subscription name"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <Pressable
                    className={clsx(
                      'picker-option',
                      frequency === 'Monthly' && 'picker-option-active',
                    )}
                    onPress={() => setFrequency('Monthly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Monthly' && 'picker-option-text-active',
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable
                    className={clsx(
                      'picker-option',
                      frequency === 'Yearly' && 'picker-option-active',
                    )}
                    onPress={() => setFrequency('Yearly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Yearly' && 'picker-option-text-active',
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx('category-chip', category === cat && 'category-chip-active')}
                      onPress={() => setCategory(category === cat ? '' : cat)}
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          category === cat && 'category-chip-text-active',
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                className={clsx('auth-button', !isValid && 'auth-button-disabled')}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
