import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { listarIdososDoCuidador, buscarHistoricoSinaisVitais } from '../../api/api';

const RANGES = [
  { label: '1 hora', value: '1h' },
  { label: '24 horas', value: '24h' },
  { label: '7 dias', value: '7d' },
];

export default function SinaisVitaisScreen() {
  const { usuario } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);
  const [sinais, setSinais] = useState([]);
  const [range, setRange] = useState('1h');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarIdosos();
  }, []);

  useEffect(() => {
    if (idosoSelecionado) carregarSinais();
  }, [idosoSelecionado, range]);

  async function carregarIdosos() {
    try {
      const resposta = await listarIdososDoCuidador(usuario.id);
      setIdosos(resposta.data);
      if (resposta.data.length > 0) setIdosoSelecionado(resposta.data[0]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os idosos.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarSinais() {
    setCarregando(true);
    try {
      const resposta = await buscarHistoricoSinaisVitais(idosoSelecionado.id, range);
      setSinais(resposta.data.slice(-20).reverse()); // últimos 20 registros
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os sinais vitais.');
    } finally {
      setCarregando(false);
    }
  }

  function corFreq(valor) {
    if (!idosoSelecionado) return theme.texto;
    if (valor > idosoSelecionado.limiteFreqMax) return theme.perigo;
    if (valor < idosoSelecionado.limiteFreqMin) return theme.alerta;
    return theme.sucesso;
  }

  function corSpO2(valor) {
    if (!idosoSelecionado) return theme.texto;
    return valor < idosoSelecionado.limiteSpO2Min ? theme.perigo : theme.sucesso;
  }

  function corTemp(valor) {
    if (!idosoSelecionado) return theme.texto;
    return valor > idosoSelecionado.limiteTempMax ? theme.perigo : theme.sucesso;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Sinais Vitais</Text>

      {idosos.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorIdoso}>
          {idosos.map((idoso) => (
            <TouchableOpacity
              key={idoso.id}
              style={[styles.chipIdoso, idosoSelecionado?.id === idoso.id && styles.chipAtivo]}
              onPress={() => setIdosoSelecionado(idoso)}
            >
              <Text style={[styles.chipTexto, idosoSelecionado?.id === idoso.id && styles.chipTextoAtivo]}>
                {idoso.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.seletorRange}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[styles.botaoRange, range === r.value && styles.botaoRangeAtivo]}
            onPress={() => setRange(r.value)}
          >
            <Text style={[styles.botaoRangeTexto, range === r.value && styles.botaoRangeTextoAtivo]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
      ) : sinais.length === 0 ? (
        <View style={styles.semDados}>
          <Ionicons name="heart-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Nenhum dado no período selecionado.</Text>
        </View>
      ) : (
        sinais.map((sinal, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardHora}>
              {new Date(sinal.dataHora).toLocaleString('pt-BR')}
            </Text>
            <View style={styles.cardValores}>
              <ValorSinal icone="heart" cor={corFreq(sinal.frequenciaCardiaca)}
                valor={`${sinal.frequenciaCardiaca} bpm`} />
              <ValorSinal icone="water" cor={corSpO2(sinal.spO2)}
                valor={`${sinal.spO2}%`} />
              <ValorSinal icone="thermometer" cor={corTemp(sinal.temperatura)}
                valor={`${sinal.temperatura}°C`} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function ValorSinal({ icone, cor, valor }) {
  return (
    <View style={styles.valorSinal}>
      <Ionicons name={icone} size={20} color={cor} />
      <Text style={[styles.valorTexto, { color: cor }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  content: { padding: theme.espacoGrande, paddingTop: 60 },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto, marginBottom: theme.espacoGrande },
  seletorIdoso: { marginBottom: theme.espacoMedio },
  chipIdoso: {
    borderRadius: 20, borderWidth: 1, borderColor: theme.primaria,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
  },
  chipAtivo: { backgroundColor: theme.primaria },
  chipTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  chipTextoAtivo: { color: theme.branco },
  seletorRange: { flexDirection: 'row', gap: theme.espacoPequeno, marginBottom: theme.espacoGrande },
  botaoRange: {
    flex: 1, borderRadius: theme.borderRadius, borderWidth: 1,
    borderColor: theme.primaria, paddingVertical: 10, alignItems: 'center',
  },
  botaoRangeAtivo: { backgroundColor: theme.primaria },
  botaoRangeTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  botaoRangeTextoAtivo: { color: theme.branco },
  card: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, marginBottom: theme.espacoMedio,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardHora: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginBottom: 8 },
  cardValores: { flexDirection: 'row', justifyContent: 'space-between' },
  valorSinal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  valorTexto: { fontSize: theme.fonteMédia, fontWeight: 'bold' },
  semDados: { alignItems: 'center', paddingVertical: 60, gap: theme.espacoMedio },
  semDadosTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario, textAlign: 'center' },
});