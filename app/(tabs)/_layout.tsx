import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Bookmark, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: '#222',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="browse"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="watchlist"
        options={{
          title: 'Mi Lista',
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
