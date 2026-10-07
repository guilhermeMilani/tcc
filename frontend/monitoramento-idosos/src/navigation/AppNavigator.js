import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { configurarListeners } from '../services/notificacaoService';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroIdosoScreen from '../screens/auth/CadastroIdosoScreen';
import CadastroCuidadorScreen from '../screens/auth/CadastroCuidadorScreen';
import IdosoTabs from './IdosoTabs';
import CuidadorTabs from './CuidadorTabs';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (usuario?.tipo === 'CUIDADOR') {
      const remover = configurarListeners(navigationRef);
      return remover;
    }
  }, [usuario]);

if (carregando) {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <Ionicons name="heart-circle" size={80} color={theme.branco} />
        <Text style={styles.logoTitulo}>CuidarApp</Text>
        <Text style={styles.logoSubtitulo}>Monitoramento de Idosos</Text>
      </View>
      <ActivityIndicator size="large" color={theme.branco} style={{ marginTop: 40 }} />
    </View>
  );
}

  return (
    <NavigationContainer ref={navigationRef}>
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
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: theme.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoTitulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.branco,
    letterSpacing: 2,
  },
  logoSubtitulo: {
    fontSize: 16,
    color: theme.branco,
    opacity: 0.8,
  },
});