import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import PaymentScreen from './src/screens/PaymentScreen';
import PaymentManagementScreen from './src/screens/PaymentManagementScreen';
import UserPaymentMethodsScreen from './src/screens/UserPaymentMethodsScreen';

import { AdminProvider } from './src/context/AdminContext';
import { UserProvider } from './src/context/UserContext';
import { ShopProvider } from './src/context/ShopContext';

export default function App() {
  return (
    <UserProvider>
    <ShopProvider>
    <AdminProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="PaymentManagement"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="PaymentManagement" component={PaymentManagementScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="UserPaymentMethods" component={UserPaymentMethodsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AdminProvider>
    </ShopProvider>
    </UserProvider>
  );
}
