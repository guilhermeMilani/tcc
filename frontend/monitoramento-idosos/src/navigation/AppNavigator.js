import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroIdosoScreen from '../screens/auth/CadastroIdosoScreen';
import CadastroCuidadorScreen from '../screens/auth/CadastroCuidadorScreen';
import IdosoTabs from './IdosoTabs';
import CuidadorTabs from './CuidadorTabs';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E75B6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!usuario ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CadastroIdoso" component={CadastroIdosoScreen} />
            <Stack.Screen name="CadastroCuidador" component={CadastroCuidadorScreen} />
          </>
        ) : usuario.tipo === 'IDOSO' ? (
          <Stack.Screen name="IdosoTabs" component={IdosoTabs} />
        ) : (
          <Stack.Screen name="CuidadorTabs" component={CuidadorTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}