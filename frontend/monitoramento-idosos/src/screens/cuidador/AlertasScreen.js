import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { listarIdososDoCuidador, buscarAlertas, marcarAlertaComoLido } from '../../api/api';

const ICONES = {
  FREQUENCIA_ALTA: { icone: 'heart', cor: theme.perigo },
  FREQUENCIA_BAIXA: { icone: 'heart-outline', cor: theme.alerta },
  SPO2_BAIXO: { icone: 'water', cor: theme.perigo },
  TEMPERATURA_ALTA: { icone: 'thermometer', cor: theme.perigo },
  PANICO: { icone: 'alert-circle', cor: theme.perigo },
};

export default function AlertasScreen() {
  const { usuario } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAlertas();
    const intervalo = setInterval(carregarAlertas, 15000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarAlertas() {
    try {
      const idosos = await listarIdososDoCuidador(usuario.id);
      const todos = [];
      for (const idoso of idosos.data) {
        const resposta = await buscarAlertas(idoso.id);
        resposta.data.forEach(a => todos.push({ ...a, nomeIdoso: idoso.nome }));
      }
      todos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
      setAlertas(todos);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os alertas.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleMarcarLido(alertaId) {
    try {
      await marcarAlertaComoLido(alertaId);
      setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, lido: true } : a));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível marcar como lido.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Alertas</Text>

      {carregando ? (
        <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
      ) : alertas.length === 0 ? (
        <View style={styles.semDados}>
          <Ionicons name="notifications-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Nenhum alerta registrado.</Text>
        </View>
      ) : (
        alertas.map((alerta) => {
          const config = ICONES[alerta.tipo] || { icone: 'alert', cor: theme.alerta };
          return (
            <View key={alerta.id} style={[styles.card, alerta.lido && styles.cardLido]}>
              <View style={[styles.cardIcone, { backgroundColor: config.cor + '20' }]}>
                <Ionicons name={config.icone} size={28} color={config.cor} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNomeIdoso}>{alerta.nomeIdoso}</Text>
                <Text style={styles.cardDescricao}>{alerta.descricao}</Text>
                <Text style={styles.cardHora}>
                  {new Date(alerta.dataHora).toLocaleString('pt-BR')}
                </Text>
              </View>
              {!alerta.lido && (
                <TouchableOpacity onPress={() => handleMarcarLido(alerta.id)}>
                  <Ionicons name="checkmark-circle-outline" size={32} color={theme.sucesso} />
                </TouchableOpacity>
              )}
              {alerta.lido && (
                <Ionicons name="checkmark-circle" size={32} color={theme.textoSecundario} />
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  content: { padding: theme.espacoGrande, paddingTop: 60 },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto, marginBottom: theme.espacoGrande },
  card: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, marginBottom: theme.espacoMedio,
    flexDirection: 'row', alignItems: 'center', gap: theme.espacoMedio,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardLido: { opacity: 0.5 },
  cardIcone: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardNomeIdoso: { fontSize: theme.fonteMédia, fontWeight: 'bold', color: theme.texto },
  cardDescricao: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginTop: 2 },
  cardHora: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginTop: 4 },
  semDados: { alignItems: 'center', paddingVertical: 60, gap: theme.espacoMedio },
  semDadosTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario, textAlign: 'center' },
});