import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeCuidadorScreen from '../screens/cuidador/HomeCuidadorScreen';
import SinaisVitaisScreen from '../screens/cuidador/SinaisVitaisScreen';
import LocalizacaoScreen from '../screens/cuidador/LocalizacaoScreen';
import AlertasScreen from '../screens/cuidador/AlertasScreen';
import MedicacoesCuidadorScreen from '../screens/cuidador/MedicacoesCuidadorScreen';
import { theme } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function CuidadorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icones = {
            Início: 'home',
            'Sinais Vitais': 'heart',
            Localização: 'location',
            Alertas: 'notifications',
            Medicações: 'medkit',
          };
          return <Ionicons name={icones[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primaria,
        tabBarInactiveTintColor: theme.textoSecundario,
        tabBarLabelStyle: { fontSize: 13 },
        tabBarStyle: { height: 70, paddingBottom: 10 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Início" component={HomeCuidadorScreen} />
      <Tab.Screen name="Sinais Vitais" component={SinaisVitaisScreen} />
      <Tab.Screen name="Localização" component={LocalizacaoScreen} />
      <Tab.Screen name="Alertas" component={AlertasScreen} />
      <Tab.Screen name="Medicações" component={MedicacoesCuidadorScreen} />
    </Tab.Navigator>
  );
}