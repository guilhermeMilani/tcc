import React, { useState, useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  listarIdososDoCuidador, buscarMedicacoesHojeIdoso,
  cadastrarMedicacao, deletarMedicacao, atualizarMedicacao
} from '../../api/api';

export default function MedicacoesCuidadorScreen() {
  const { usuario } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);
  const [medicacoes, setMedicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [medicacaoEditando, setMedicacaoEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [dosagemValor, setDosagemValor] = useState('');
  const [dosagemUnidade, setDosagemUnidade] = useState('mg');
  const [horarios, setHorarios] = useState([]);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [horarioTemp, setHorarioTemp] = useState(new Date());

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

  function abrirModalCadastro() {
    limparForm();
    setModoEdicao(false);
    setMedicacaoEditando(null);
    setModalVisivel(true);
  }

  function abrirModalEdicao(med) {
    setModoEdicao(true);
    setMedicacaoEditando(med);
    setNome(med.nome || '');

    // Separa valor e unidade da dosagem
    const match = med.dosagem?.match(/^(\d+(?:\.\d+)?)(mg|g)$/);
    if (match) {
      setDosagemValor(match[1]);
      setDosagemUnidade(match[2]);
    } else {
      setDosagemValor(med.dosagem || '');
      setDosagemUnidade('mg');
    }

    // Pega todos os horários da medicação
    const horariosUnicos = [...new Set(
      medicacoes
        .filter(m => m.id === med.id)
        .map(m => m.horario?.substring(0, 5))
        .filter(Boolean)
    )];
    setHorarios(horariosUnicos);
    setModalVisivel(true);
  }

  function onChangeTimePicker(event, selectedDate) {
    setMostrarTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHorarioTemp(selectedDate);
      if (Platform.OS === 'android') {
        adicionarHorario(selectedDate);
      }
    }
  }

  function adicionarHorario(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const horario = `${h}:${m}`;
    if (!horarios.includes(horario)) {
      setHorarios(prev => [...prev, horario].sort());
    }
    setMostrarTimePicker(false);
  }

  function removerHorario(h) {
    setHorarios(prev => prev.filter(x => x !== h));
  }

  function limparForm() {
    setNome('');
    setDosagemValor('');
    setDosagemUnidade('mg');
    setHorarios([]);
  }

  async function handleSalvar() {
    if (!nome) {
      Alert.alert('Atenção', 'O nome da medicação é obrigatório.');
      return;
    }
    try {
      const dosagem = dosagemValor ? `${dosagemValor}${dosagemUnidade}` : '';
      const dados = {
        idosoId: idosoSelecionado.id,
        nome,
        dosagem,
        horarios,
      };

      if (modoEdicao && medicacaoEditando) {
        await atualizarMedicacao(medicacaoEditando.id, dados);
        Alert.alert('Sucesso', 'Medicação atualizada com sucesso.');
      } else {
        await cadastrarMedicacao(dados);
        Alert.alert('Sucesso', 'Medicação cadastrada com sucesso.');
      }

      setModalVisivel(false);
      limparForm();
      carregarMedicacoes();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a medicação.');
    }
  }

  async function handleDeletar(medicacaoId, nome) {
    Alert.alert(
      'Excluir Medicação',
      `Deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarMedicacao(medicacaoId);
              carregarMedicacoes();
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir a medicação.');
            }
          }
        }
      ]
    );
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
          <View style={styles.cardAcoes}>
            <View style={styles.horarioBadge}>
              <Ionicons name="time-outline" size={14} color={theme.textoSecundario} />
              <Text style={styles.horarioTexto}>{formatarHorario(med.horario)}</Text>
            </View>
            <TouchableOpacity onPress={() => abrirModalEdicao(med)} style={styles.botaoIcone}>
              <Ionicons name="pencil-outline" size={18} color={theme.primaria} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletar(med.id, med.nome)} style={styles.botaoIcone}>
              <Ionicons name="trash-outline" size={18} color={theme.perigo} />
            </TouchableOpacity>
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
          <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirModalCadastro}>
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitulo}>
                {modoEdicao ? 'Editar Medicação' : 'Nova Medicação'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nome da medicação"
                placeholderTextColor={theme.textoSecundario}
                value={nome}
                onChangeText={setNome}
              />

              <View style={styles.dosagemContainer}>
                <TextInput
                  style={[styles.input, styles.dosagemInput]}
                  placeholder="Dosagem"
                  placeholderTextColor={theme.textoSecundario}
                  keyboardType="numeric"
                  value={dosagemValor}
                  onChangeText={setDosagemValor}
                />
                <View style={styles.unidadeContainer}>
                  {['mg', 'g'].map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unidadeBotao, dosagemUnidade === u && styles.unidadeBotaoAtivo]}
                      onPress={() => setDosagemUnidade(u)}
                    >
                      <Text style={[styles.unidadeTexto, dosagemUnidade === u && styles.unidadeTextoAtivo]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.labelHorarios}>Horários</Text>
              <View style={styles.horariosLista}>
                {horarios.map(h => (
                  <View key={h} style={styles.horarioChip}>
                    <Text style={styles.horarioChipTexto}>{h}</Text>
                    <TouchableOpacity onPress={() => removerHorario(h)}>
                      <Ionicons name="close" size={14} color={theme.branco} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.botaoAdicionarHorario}
                  onPress={() => setMostrarTimePicker(true)}
                >
                  <Ionicons name="add" size={20} color={theme.primaria} />
                  <Text style={styles.botaoAdicionarHorarioTexto}>Adicionar horário</Text>
                </TouchableOpacity>
              </View>

              {mostrarTimePicker && (
                <DateTimePicker
                  value={horarioTemp}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeTimePicker}
                />
              )}

              {Platform.OS === 'ios' && mostrarTimePicker && (
                <TouchableOpacity
                  style={styles.botaoConfirmarHorario}
                  onPress={() => adicionarHorario(horarioTemp)}
                >
                  <Text style={styles.botaoSalvarTexto}>Confirmar horário</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
                <Text style={styles.botaoSalvarTexto}>
                  {modoEdicao ? 'Atualizar' : 'Salvar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => { setModalVisivel(false); limparForm(); }}
              >
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  cardAcoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nomeMed: { fontSize: theme.fonteMédia, fontWeight: 'bold', color: theme.texto },
  dosagem: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginTop: 2 },
  horarioBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.fundo, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  horarioTexto: { fontSize: theme.fontePequena, color: theme.textoSecundario, fontWeight: 'bold' },
  botaoIcone: { padding: 4 },
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
  dosagemContainer: { flexDirection: 'row', gap: theme.espacoMedio, marginBottom: theme.espacoMedio },
  dosagemInput: { flex: 1, marginBottom: 0 },
  unidadeContainer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  unidadeBotao: {
    borderWidth: 1, borderColor: theme.primaria, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  unidadeBotaoAtivo: { backgroundColor: theme.primaria },
  unidadeTexto: { fontSize: theme.fonteMédia, color: theme.primaria },
  unidadeTextoAtivo: { color: theme.branco },
  labelHorarios: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginBottom: 8 },
  horariosLista: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.espacoMedio },
  horarioChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.primaria, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  horarioChipTexto: { color: theme.branco, fontSize: theme.fontePequena },
  botaoAdicionarHorario: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: theme.primaria, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6, borderStyle: 'dashed',
  },
  botaoAdicionarHorarioTexto: { color: theme.primaria, fontSize: theme.fontePequena },
  botaoConfirmarHorario: {
    backgroundColor: theme.primaria, borderRadius: theme.borderRadius,
    height: 44, justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.espacoMedio,
  },
  botaoSalvar: {
    backgroundColor: theme.primaria, borderRadius: theme.borderRadius,
    height: theme.alturaBotao, justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.espacoMedio, marginTop: theme.espacoMedio,
  },
  botaoSalvarTexto: { color: theme.branco, fontSize: theme.fonteMédia, fontWeight: 'bold' },
  botaoCancelar: { alignItems: 'center', padding: theme.espacoMedio },
  botaoCancelarTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario },
});