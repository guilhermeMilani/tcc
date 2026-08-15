import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { acionarPanico } from '../../api/api';

export default function PanicoScreen() {
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(false);

  async function handlePanico() {
    Alert.alert(
      '🚨 Confirmar Emergência',
      'Seu cuidador será notificado imediatamente com sua localização. Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: enviarPanico },
      ]
    );
  }

  async function enviarPanico() {
    setCarregando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let latitude = -23.5505;
      let longitude = -46.6333;

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }

      await acionarPanico({ idosoId: usuario.id, latitude, longitude });

      Alert.alert(
        '✅ Alerta Enviado',
        'Seu cuidador foi notificado e receberá sua localização.'
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar o alerta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Emergência</Text>
      <Text style={styles.instrucao}>
        Pressione o botão abaixo se precisar de ajuda urgente.
        Seu cuidador será avisado imediatamente.
      </Text>

      <TouchableOpacity
        style={styles.botaoPanico}
        onPress={handlePanico}
        disabled={carregando}
        activeOpacity={0.8}
      >
        {carregando ? (
          <ActivityIndicator size="large" color={theme.branco} />
        ) : (
          <>
            <Ionicons name="alert-circle" size={64} color={theme.branco} />
            <Text style={styles.botaoPanicoTexto}>PEDIR AJUDA</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.aviso}>
        Use apenas em situações de emergência real.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.espacoGrande,
  },
  titulo: {
    fontSize: theme.fonteTitulo,
    fontWeight: 'bold',
    color: theme.texto,
    marginBottom: theme.espacoMedio,
  },
  instrucao: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
    textAlign: 'center',
    marginBottom: theme.espacoGrande * 2,
    lineHeight: 30,
  },
  botaoPanico: {
    backgroundColor: theme.perigo,
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.espacoMedio,
    elevation: 8,
    shadowColor: theme.perigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  botaoPanicoTexto: {
    color: theme.branco,
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  aviso: {
    fontSize: theme.fontePequena,
    color: theme.textoSecundario,
    textAlign: 'center',
    marginTop: theme.espacoGrande * 2,
  },
});