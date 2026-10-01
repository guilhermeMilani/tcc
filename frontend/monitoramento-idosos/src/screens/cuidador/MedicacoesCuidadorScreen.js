import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  listarIdososDoCuidador, buscarMedicacoesHojeIdoso, cadastrarMedicacao
} from '../../api/api';

export default function MedicacoesCuidadorScreen() {
  const { usuario } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);
  const [medicacoes, setMedicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [form, setForm] = useState({ nome: '', dosagem: '', horarios: '' });

  useFocusEffect(
    useCallback(() => {
      carregarIdosos();
    }, [])
  );

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
    const resposta = await buscarMedicacoesHojeIdoso(idosoSelecionado.id);
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

  function formatarHorario(horario) {
    return horario?.substring(0, 5);
  }

  const tomadas = medicacoes.filter(m => m.tomou === true);
  const naoTomadas = medicacoes.filter(m => m.tomou === false || (m.tomou === null && m.status === 'ANTERIOR'));
  const pendentes = medicacoes.filter(m => m.tomou === null && m.status !== 'ANTERIOR');

  function CardMedicacao({ med }) {
    const icone = med.tomou === true ? 'checkmark-circle' : med.tomou === false ? 'close-circle' : 'time-outline';
    const cor = med.tomou === true ? theme.sucesso : med.tomou === false ? theme.perigo : theme.primaria;
    const statusTexto = med.tomou === true ? 'Tomada' : med.tomou === false ? 'Não tomada' : med.status === 'AGORA' ? 'Pendente agora' : med.status === 'PROXIMA' ? 'Próxima' : 'Sem registro';

    return (
      <View style={styles.card}>
        <View style={styles.cardTopo}>
          <View style={styles.cardInfo}>
            <Text style={styles.nomeMed}>{med.nome}</Text>
            <Text style={styles.dosagem}>{med.dosagem}</Text>
          </View>
          <View style={styles.horarioBadge}>
            <Ionicons name="time-outline" size={14} color={theme.textoSecundario} />
            <Text style={styles.horarioTexto}>{formatarHorario(med.horario)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cor + '20' }]}>
          <Ionicons name={icone} size={16} color={cor} />
          <Text style={[styles.statusTexto, { color: cor }]}>{statusTexto}</Text>
        </View>
      </View>
    );
  }

  function Secao({ titulo, icone, cor, medicacoes }) {
    if (medicacoes.length === 0) return null;
    return (
      <View style={styles.secao}>
        <View style={styles.secaoTitulo}>
          <Ionicons name={icone} size={18} color={cor} />
          <Text style={[styles.secaoTexto, { color: cor }]}>{titulo} ({medicacoes.length})</Text>
        </View>
        {medicacoes.map((med, i) => (
          <CardMedicacao key={`${med.id}-${med.horario}-${i}`} med={med} />
        ))}
      </View>
    );
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

        <Text style={styles.subtitulo}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

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
          <>
            <Secao titulo="Tomadas" icone="checkmark-circle" cor={theme.sucesso} medicacoes={tomadas} />
            <Secao titulo="Não tomadas" icone="close-circle" cor={theme.perigo} medicacoes={naoTomadas} />
            <Secao titulo="Pendentes" icone="time" cor={theme.primaria} medicacoes={pendentes} />
          </>
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
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto },
  subtitulo: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginBottom: theme.espacoGrande, textTransform: 'capitalize' },
  botaoAdicionar: {
    backgroundColor: theme.primaria, width: 48, height: 48,
    borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  seletor: { marginBottom: theme.espacoMedio },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: theme.primaria, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  chipAtivo: { backgroundColor: theme.primaria },
  chipTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  chipTextoAtivo: { color: theme.branco },
  secao: { marginBottom: theme.espacoGrande },
  secaoTitulo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.espacoMedio },
  secaoTexto: { fontSize: theme.fonteMédia, fontWeight: 'bold' },
  card: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, marginBottom: theme.espacoMedio,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardInfo: { flex: 1 },
  nomeMed: { fontSize: theme.fonteMédia, fontWeight: 'bold', color: theme.texto },
  dosagem: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginTop: 2 },
  horarioBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.fundo, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  horarioTexto: { fontSize: theme.fontePequena, color: theme.textoSecundario, fontWeight: 'bold' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  statusTexto: { fontSize: theme.fontePequena, fontWeight: '500' },
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