import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import CartScreen from './src/screens/CartScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import UserAdminScreen from './src/screens/UserAdminScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import PaymentManagementScreen from './src/screens/PaymentManagementScreen';
import ReviewManagementScreen from './src/screens/ReviewManagementScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import UserPaymentMethodsScreen from './src/screens/UserPaymentMethodsScreen';
import DeliveryAddressesScreen from './src/screens/DeliveryAddressesScreen';
import ConsultationScreen from './src/screens/ConsultationScreen';
import SeasonalManagementScreen from './src/screens/SeasonalManagementScreen';
import SeasonalCollectionScreen from './src/screens/SeasonalCollectionScreen';
import OrderManagementScreen from './src/screens/OrderManagementScreen';
import CheckoutOverviewScreen from './src/screens/CheckoutOverviewScreen';
import { AdminProvider } from './src/context/AdminContext';
import { UserProvider } from './src/context/UserContext';
import { ShopProvider, useShop } from './src/context/ShopContext';

const styles = StyleSheet.create({
  tabBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#00332B',
    borderRadius: 9,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  tabBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

const BagIcon = ({ color }) => {
  const { cart } = useShop();
  return (
    <View>
      <ShoppingBag size={22} color={color} />
      {cart.length > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{cart.length}</Text>
        </View>
      )}
    </View>
  );
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00332B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 80,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 0.5,
          borderTopColor: '#EEE',
          backgroundColor: '#FFF',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'STORE') return <Home size={22} color={color} />;
          if (route.name === 'SHOP') return <Search size={22} color={color} />;
          if (route.name === 'BAG') return <BagIcon color={color} />;
          if (route.name === 'WISHLIST') return <Heart size={22} color={color} />;
          if (route.name === 'ME') return <User size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="STORE" component={HomeScreen} />
      <Tab.Screen name="SHOP" component={ShopScreen} />
      <Tab.Screen name="BAG" component={CartScreen} />
      <Tab.Screen name="WISHLIST" component={WishlistScreen} />
      <Tab.Screen name="ME" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
    <ShopProvider>
    <AdminProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="HomeMain" component={MainTabNavigator} />
        <Stack.Screen name="CheckoutOverview" component={CheckoutOverviewScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} />
        <Stack.Screen name="UserPaymentMethods" component={UserPaymentMethodsScreen} />
        <Stack.Screen name="DeliveryAddresses" component={DeliveryAddressesScreen} />
        <Stack.Screen name="Consultation" component={ConsultationScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="UserAdmin" component={UserAdminScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="PaymentManagement" component={PaymentManagementScreen} />
        <Stack.Screen name="ReviewManagement" component={ReviewManagementScreen} />
        <Stack.Screen name="SeasonalManagement" component={SeasonalManagementScreen} />
        <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
        <Stack.Screen name="SeasonalCollection" component={SeasonalCollectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AdminProvider>
    </ShopProvider>
    </UserProvider>
  );
}

