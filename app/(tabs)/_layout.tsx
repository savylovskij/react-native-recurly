import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { clsx } from 'clsx';
import { View, Image } from 'react-native';
import { tabs } from '@/constants/data';
import { colors, components } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubscriptionsProvider } from '@/contexts/SubscriptionsContext';

const tabBar = components.tabBar;

const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={clsx('tabs-pill', focused && 'tabs-active')}>
          <Image source={icon} resizeMode="contain" alt="Image" className="tabs-glyph" />
        </View>
      </View>
    );
  };

  return (
    <SubscriptionsProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          height: tabBar.iconFrame,
          width: tabBar.iconFrame,
          alignItems: 'center',
        },
      }}
    >
      {tabs.map((tab, index) => (
        <Tabs.Screen
          key={index}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => {
              return <TabIcon focused={focused} icon={tab.icon} />;
            },
          }}
        />
      ))}
    </Tabs>
    </SubscriptionsProvider>
  );
};

export default TabLayout;
