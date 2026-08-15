import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { listarIdososDoCuidador, buscarAlertas } from '../../api/api';

export default function HomeCuidadorScreen() {
  const { usuario, logout } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [alertasNaoLidos, setAlertasNaoLidos] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const resposta = await listarIdososDoCuidador(usuario.id);
      setIdosos(resposta.data);

      let total = 0;
      for (const idoso of resposta.data) {
        const alertas = await buscarAlertas(idoso.id);
        total += alertas.data.filter(a => !a.lido).length;
      }
      setAlertasNaoLidos(total);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
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
          <Text style={styles.ola}>Olá,</Text>
          <Text style={styles.nome}>{usuario?.sub?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={32} color={theme.primaria} />
        </TouchableOpacity>
      </View>

      {alertasNaoLidos > 0 && (
        <View style={styles.bannerAlerta}>
          <Ionicons name="notifications" size={24} color={theme.branco} />
          <Text style={styles.bannerTexto}>
            {alertasNaoLidos} alerta{alertasNaoLidos > 1 ? 's' : ''} não lido{alertasNaoLidos > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <Text style={styles.secao}>Idosos monitorados</Text>

      {carregando ? (
        <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
      ) : idosos.length === 0 ? (
        <View style={styles.semDados}>
          <Ionicons name="people-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>
            Nenhum idoso vinculado ainda.
          </Text>
        </View>
      ) : (
        idosos.map((idoso) => (
          <View key={idoso.id} style={styles.card}>
            <View style={styles.cardIcone}>
              <Ionicons name="person" size={32} color={theme.primaria} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{idoso.nome}</Text>
              <Text style={styles.cardEmail}>{idoso.email}</Text>
              {idoso.condicoesSaude ? (
                <Text style={styles.cardCondicao}>{idoso.condicoesSaude}</Text>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
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
  ola: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
  },
  nome: {
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
    color: theme.texto,
    textTransform: 'capitalize',
  },
  bannerAlerta: {
    backgroundColor: theme.alerta,
    borderRadius: theme.borderRadius,
    padding: theme.espacoMedio,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.espacoMedio,
    marginBottom: theme.espacoGrande,
  },
  bannerTexto: {
    color: theme.branco,
    fontSize: theme.fonteMédia,
    fontWeight: 'bold',
  },
  secao: {
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
    color: theme.texto,
    marginBottom: theme.espacoMedio,
  },
  card: {
    backgroundColor: theme.branco,
    borderRadius: theme.borderRadius,
    padding: theme.espacoGrande,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.espacoMedio,
    marginBottom: theme.espacoMedio,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardIcone: {
    backgroundColor: '#E3F2FD',
    borderRadius: 40,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: theme.fonteMédia,
    fontWeight: 'bold',
    color: theme.texto,
  },
  cardEmail: {
    fontSize: theme.fontePequena,
    color: theme.textoSecundario,
  },
  cardCondicao: {
    fontSize: theme.fontePequena,
    color: theme.alerta,
    marginTop: 2,
  },
  semDados: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: theme.espacoMedio,
  },
  semDadosTexto: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
    textAlign: 'center',
  },
});