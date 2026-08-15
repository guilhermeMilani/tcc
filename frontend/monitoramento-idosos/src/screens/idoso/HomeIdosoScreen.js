import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { buscarHistoricoSinaisVitais } from '../../api/api';

export default function HomeIdosoScreen() {
  const { usuario, logout } = useAuth();
  const [sinais, setSinais] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarSinais();
    const intervalo = setInterval(carregarSinais, 10000); // atualiza a cada 10s
    return () => clearInterval(intervalo);
  }, []);

  async function carregarSinais() {
    try {
      const resposta = await buscarHistoricoSinaisVitais(usuario.id, '1h');
      const dados = resposta.data;
      if (dados.length > 0) {
        setSinais(dados[dados.length - 1]); // pega o mais recente
      }
    } catch (e) {
      // silencioso — não interrompe o usuário
    } finally {
      setCarregando(false);
    }
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: logout, style: 'destructive' },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.olá}>Olá,</Text>
          <Text style={styles.nome}>{usuario?.sub?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={32} color={theme.primaria} />
        </TouchableOpacity>
      </View>

      <Text style={styles.secao}>Seus sinais vitais agora</Text>

      {carregando ? (
        <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
      ) : sinais ? (
        <View style={styles.cardsContainer}>
          <CardSinal
            icone="heart"
            cor="#D32F2F"
            titulo="Frequência Cardíaca"
            valor={`${sinais.frequenciaCardiaca} bpm`}
          />
          <CardSinal
            icone="water"
            cor="#1565C0"
            titulo="SpO2"
            valor={`${sinais.spO2}%`}
          />
          <CardSinal
            icone="thermometer"
            cor="#F57C00"
            titulo="Temperatura"
            valor={`${sinais.temperatura}°C`}
          />
        </View>
      ) : (
        <View style={styles.semDados}>
          <Ionicons name="watch-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Aguardando dados do dispositivo...</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color={theme.primaria} />
        <Text style={styles.infoTexto}>
          Os dados são atualizados automaticamente a cada 10 segundos.
        </Text>
      </View>
    </ScrollView>
  );
}

function CardSinal({ icone, cor, titulo, valor }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icone} size={36} color={cor} />
      <Text style={styles.cardTitulo}>{titulo}</Text>
      <Text style={[styles.cardValor, { color: cor }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.fundo,
  },
  content: {
    padding: theme.espacoGrande,
    paddingTop: 60,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.espacoGrande,
  },
  olá: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
  },
  nome: {
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
    color: theme.texto,
    textTransform: 'capitalize',
  },
  secao: {
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
    color: theme.texto,
    marginBottom: theme.espacoMedio,
  },
  cardsContainer: {
    gap: theme.espacoMedio,
  },
  card: {
    backgroundColor: theme.branco,
    borderRadius: theme.borderRadius,
    padding: theme.espacoGrande,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.espacoMedio,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitulo: {
    flex: 1,
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
  },
  cardValor: {
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
  },
  semDados: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: theme.espacoMedio,
  },
  semDadosTexto: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: theme.borderRadius,
    padding: theme.espacoMedio,
    marginTop: theme.espacoGrande,
    gap: theme.espacoPequeno,
  },
  infoTexto: {
    flex: 1,
    fontSize: theme.fontePequena,
    color: theme.primaria,
  },
});