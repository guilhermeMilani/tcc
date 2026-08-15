import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { listarIdososDoCuidador, buscarMedicacoes, cadastrarMedicacao } from '../../api/api';

export default function MedicacoesCuidadorScreen() {
  const { usuario } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);
  const [medicacoes, setMedicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [form, setForm] = useState({ nome: '', dosagem: '', horarios: '' });

  useEffect(() => {
    carregarIdosos();
  }, []);

  useEffect(() => {
    if (idosoSelecionado) carregarMedicacoes();
  }, [idosoSelecionado]);

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

  async function carregarMedicacoes() {
    setCarregando(true);
    try {
      const resposta = await buscarMedicacoes(idosoSelecionado.id);
      setMedicacoes(resposta.data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar as medicações.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCadastrar() {
    if (!form.nome) {
      Alert.alert('Atenção', 'O nome da medicação é obrigatório.');
      return;
    }

    try {
      const horarios = form.horarios
        ? form.horarios.split(',').map(h => h.trim())
        : [];

      await cadastrarMedicacao({
        idosoId: idosoSelecionado.id,
        nome: form.nome,
        dosagem: form.dosagem,
        horarios,
      });

      setModalVisivel(false);
      setForm({ nome: '', dosagem: '', horarios: '' });
      carregarMedicacoes();
      Alert.alert('Sucesso', 'Medicação cadastrada com sucesso.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível cadastrar a medicação.');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Medicações</Text>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => setModalVisivel(true)}
          >
            <Ionicons name="add" size={28} color={theme.branco} />
          </TouchableOpacity>
        </View>

        {idosos.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletor}>
            {idosos.map((idoso) => (
              <TouchableOpacity
                key={idoso.id}
                style={[styles.chip, idosoSelecionado?.id === idoso.id && styles.chipAtivo]}
                onPress={() => setIdosoSelecionado(idoso)}
              >
                <Text style={[styles.chipTexto, idosoSelecionado?.id === idoso.id && styles.chipTextoAtivo]}>
                  {idoso.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {carregando ? (
          <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
        ) : medicacoes.length === 0 ? (
          <View style={styles.semDados}>
            <Ionicons name="medkit-outline" size={48} color={theme.textoSecundario} />
            <Text style={styles.semDadosTexto}>Nenhuma medicação cadastrada.</Text>
          </View>
        ) : (
          medicacoes.map((med) => (
            <View key={med.id} style={styles.card}>
              <Ionicons name="medkit" size={28} color={theme.primaria} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{med.nome}</Text>
                <Text style={styles.cardDosagem}>{med.dosagem}</Text>
                <Text style={styles.cardHorarios}>
                  {med.horarios?.join('  ·  ') || 'Sem horário definido'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Nova Medicação</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome da medicação"
              placeholderTextColor={theme.textoSecundario}
              value={form.nome}
              onChangeText={(v) => setForm(prev => ({ ...prev, nome: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Dosagem (ex: 50mg)"
              placeholderTextColor={theme.textoSecundario}
              value={form.dosagem}
              onChangeText={(v) => setForm(prev => ({ ...prev, dosagem: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Horários separados por vírgula (ex: 08:00, 20:00)"
              placeholderTextColor={theme.textoSecundario}
              value={form.horarios}
              onChangeText={(v) => setForm(prev => ({ ...prev, horarios: v }))}
            />

            <TouchableOpacity style={styles.botaoSalvar} onPress={handleCadastrar}>
              <Text style={styles.botaoSalvarTexto}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  content: { padding: theme.espacoGrande, paddingTop: 60 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.espacoGrande },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto },
  botaoAdicionar: {
    backgroundColor: theme.primaria, width: 48, height: 48,
    borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  seletor: { marginBottom: theme.espacoMedio },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: theme.primaria, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  chipAtivo: { backgroundColor: theme.primaria },
  chipTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  chipTextoAtivo: { color: theme.branco },
  card: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, marginBottom: theme.espacoMedio,
    flexDirection: 'row', alignItems: 'center', gap: theme.espacoMedio,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: theme.fonteMédia, fontWeight: 'bold', color: theme.texto },
  cardDosagem: { fontSize: theme.fontePequena, color: theme.textoSecundario },
  cardHorarios: { fontSize: theme.fontePequena, color: theme.primaria, marginTop: 2 },
  semDados: { alignItems: 'center', paddingVertical: 60, gap: theme.espacoMedio },
  semDadosTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: theme.branco, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: theme.espacoGrande },
  modalTitulo: { fontSize: theme.fonteGrande, fontWeight: 'bold', color: theme.texto, marginBottom: theme.espacoGrande },
  input: {
    backgroundColor: theme.fundo, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, fontSize: theme.fonteMédia,
    color: theme.texto, marginBottom: theme.espacoMedio,
    borderWidth: 1, borderColor: '#DDD', height: theme.alturaBotao,
  },
  botaoSalvar: {
    backgroundColor: theme.primaria, borderRadius: theme.borderRadius,
    height: theme.alturaBotao, justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.espacoMedio,
  },
  botaoSalvarTexto: { color: theme.branco, fontSize: theme.fonteMédia, fontWeight: 'bold' },
  botaoCancelar: { alignItems: 'center', padding: theme.espacoMedio },
  botaoCancelarTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario },
});