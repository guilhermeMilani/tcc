import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { buscarMedicacoesHoje, registrarAdesao } from '../../api/api';

export default function MedicacoesIdosoScreen() {
  const { usuario } = useAuth();
  const [medicacoes, setMedicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarMedicacoes();
    }, [])
  );

  async function carregarMedicacoes() {
    setCarregando(true);
    try {
      const resposta = await buscarMedicacoesHoje(usuario.id);
      setMedicacoes(resposta.data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar as medicações.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleAdesao(medicacaoId, tomou) {
    try {
      await registrarAdesao(medicacaoId, tomou);
      await carregarMedicacoes();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível registrar.');
    }
  }

  const agora = medicacoes.filter(m => m.status === 'AGORA');
  const proximas = medicacoes.filter(m => m.status === 'PROXIMA');
  const anteriores = medicacoes.filter(m => m.status === 'ANTERIOR');

  function formatarHorario(horario) {
    return horario?.substring(0, 5);
  }

  function CardMedicacao({ med, ativa }) {
    const jaTomou = med.tomou === true;
    const naoTomou = med.tomou === false;
    const semRegistro = med.tomou === null;

    return (
      <View style={[styles.card, !ativa && styles.cardInativo]}>
        <View style={styles.cardTopo}>
          <View style={styles.cardInfo}>
            <Text style={[styles.nomeMed, !ativa && styles.textoInativo]}>{med.nome}</Text>
            <Text style={[styles.dosagem, !ativa && styles.textoInativo]}>{med.dosagem}</Text>
          </View>
          <View style={styles.horarioBadge}>
            <Ionicons name="time-outline" size={14} color={ativa ? theme.primaria : theme.textoSecundario} />
            <Text style={[styles.horarioTexto, !ativa && styles.textoInativo]}>
              {formatarHorario(med.horario)}
            </Text>
          </View>
        </View>

        {jaTomou && (
          <View style={[styles.statusBadge, { backgroundColor: theme.sucesso + '20' }]}>
            <Ionicons name="checkmark-circle" size={18} color={theme.sucesso} />
            <Text style={[styles.statusTexto, { color: theme.sucesso }]}>Medicação tomada</Text>
          </View>
        )}

        {naoTomou && med.status === 'ANTERIOR' && (
          <View style={[styles.statusBadge, { backgroundColor: theme.perigo + '20' }]}>
            <Ionicons name="close-circle" size={18} color={theme.perigo} />
            <Text style={[styles.statusTexto, { color: theme.perigo }]}>Não tomada</Text>
          </View>
        )}

        {ativa && semRegistro && (
          <View style={styles.botoesAdesao}>
            <TouchableOpacity
              style={[styles.botaoAdesao, { backgroundColor: theme.sucesso }]}
              onPress={() => handleAdesao(med.id, true)}
            >
              <Ionicons name="checkmark" size={24} color={theme.branco} />
              <Text style={styles.botaoAdesaoTexto}>Tomei</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoAdesao, { backgroundColor: theme.perigo }]}
              onPress={() => handleAdesao(med.id, false)}
            >
              <Ionicons name="close" size={24} color={theme.branco} />
              <Text style={styles.botaoAdesaoTexto}>Não tomei</Text>
            </TouchableOpacity>
          </View>
        )}

        {med.status === 'PROXIMA' && (
          <View style={[styles.statusBadge, { backgroundColor: theme.primaria + '15' }]}>
            <Ionicons name="time-outline" size={18} color={theme.primaria} />
            <Text style={[styles.statusTexto, { color: theme.primaria }]}>
              Próximo horário: {formatarHorario(med.horario)}
            </Text>
          </View>
        )}
      </View>
    );
  }

  function Secao({ titulo, icone, cor, medicacoes, ativa }) {
    if (medicacoes.length === 0) return null;
    return (
      <View style={styles.secao}>
        <View style={styles.secaoTitulo}>
          <Ionicons name={icone} size={18} color={cor} />
          <Text style={[styles.secaoTexto, { color: cor }]}>{titulo}</Text>
        </View>
        {medicacoes.map((med, i) => (
          <CardMedicacao key={`${med.id}-${med.horario}-${i}`} med={med} ativa={ativa} />
        ))}
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color={theme.primaria} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Minhas Medicações</Text>
      <Text style={styles.subtitulo}>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {medicacoes.length === 0 ? (
        <View style={styles.semDados}>
          <Ionicons name="medkit-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Nenhuma medicação cadastrada.</Text>
        </View>
      ) : (
        <>
          <Secao
            titulo="Agora"
            icone="alert-circle"
            cor={theme.alerta}
            medicacoes={agora}
            ativa={true}
          />
          <Secao
            titulo="Próximas"
            icone="time"
            cor={theme.primaria}
            medicacoes={proximas}
            ativa={false}
          />
          <Secao
            titulo="Anteriores"
            icone="checkmark-done"
            cor={theme.textoSecundario}
            medicacoes={anteriores}
            ativa={false}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  content: { padding: theme.espacoGrande, paddingTop: 60 },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto, marginBottom: 4 },
  subtitulo: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginBottom: theme.espacoGrande, textTransform: 'capitalize' },
  secao: { marginBottom: theme.espacoGrande },
  secaoTitulo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.espacoMedio },
  secaoTexto: { fontSize: theme.fonteMédia, fontWeight: 'bold' },
  card: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, marginBottom: theme.espacoMedio,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardInativo: { opacity: 0.7 },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardInfo: { flex: 1 },
  nomeMed: { fontSize: theme.fonteMédia, fontWeight: 'bold', color: theme.texto },
  dosagem: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginTop: 2 },
  textoInativo: { color: theme.textoSecundario },
  horarioBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.fundo, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  horarioTexto: { fontSize: theme.fontePequena, color: theme.primaria, fontWeight: 'bold' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    marginTop: 4,
  },
  statusTexto: { fontSize: theme.fontePequena, fontWeight: '500' },
  botoesAdesao: { flexDirection: 'row', gap: theme.espacoMedio, marginTop: 8 },
  botaoAdesao: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, gap: 6,
  },
  botaoAdesaoTexto: { color: theme.branco, fontSize: theme.fonteMédia, fontWeight: 'bold' },
  semDados: { alignItems: 'center', paddingVertical: 60, gap: theme.espacoMedio },
  semDadosTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario, textAlign: 'center' },
});