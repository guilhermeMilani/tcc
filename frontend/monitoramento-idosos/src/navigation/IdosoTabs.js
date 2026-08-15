import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeIdosoScreen from '../screens/idoso/HomeIdosoScreen';
import MedicacoesIdosoScreen from '../screens/idoso/MedicacoesIdosoScreen';
import PanicoScreen from '../screens/idoso/PanicoScreen';
import { theme } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function IdosoTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icones = {
            Início: 'home',
            Medicações: 'medkit',
            Emergência: 'alert-circle',
          };
          return <Ionicons name={icones[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primaria,
        tabBarInactiveTintColor: theme.textoSecundario,
        tabBarLabelStyle: { fontSize: 14 },
        tabBarStyle: { height: 70, paddingBottom: 10 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Início" component={HomeIdosoScreen} />
      <Tab.Screen name="Medicações" component={MedicacoesIdosoScreen} />
      <Tab.Screen name="Emergência" component={PanicoScreen} />
    </Tab.Navigator>
  );
}