import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  buscarAlertasCuidador, marcarAlertaComoLido, marcarTodosAlertasComoLidos
} from '../../api/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAMANHO_PAGINA = 15;

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
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [temMais, setTemMais] = useState(true);
  const paginaRef = useRef(0);
  const ocupadoRef = useRef(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      carregarPagina(0);
      // atualiza só a primeira página, e apenas se o usuário não rolou além dela
      const intervalo = setInterval(() => {
        if (paginaRef.current === 0) carregarPagina(0, true);
      }, 30000);
      return () => clearInterval(intervalo);
    }, [])
  );

  async function carregarPagina(pagina, silencioso = false) {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    if (pagina > 0) setCarregandoMais(true);
    try {
      const { data } = await buscarAlertasCuidador(usuario.id, pagina, TAMANHO_PAGINA);
      setAlertas(prev => {
        if (pagina === 0) return data.content;
        const ids = new Set(prev.map(a => a.id));
        return [...prev, ...data.content.filter(a => !ids.has(a.id))];
      });
      setTemMais(!data.last);
      paginaRef.current = pagina;
    } catch (e) {
      if (!silencioso) Alert.alert('Erro', 'Não foi possível carregar os alertas.');
    } finally {
      ocupadoRef.current = false;
      setCarregando(false);
      setCarregandoMais(false);
      setAtualizando(false);
    }
  }

  function carregarMais() {
    if (temMais && !ocupadoRef.current) carregarPagina(paginaRef.current + 1);
  }

  function atualizar() {
    setAtualizando(true);
    carregarPagina(0);
  }

  async function handleMarcarLido(alertaId) {
    try {
      await marcarAlertaComoLido(alertaId);
      setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, lido: true } : a));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível marcar como lido.');
    }
  }

  async function handleMarcarTodos() {
    try {
      await marcarTodosAlertasComoLidos(usuario.id);
      setAlertas(prev => prev.map(a => ({ ...a, lido: true })));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível marcar todos como lidos.');
    }
  }

  const temNaoLido = alertas.some(a => !a.lido);

  function renderItem({ item: alerta }) {
    const config = ICONES[alerta.tipo] || { icone: 'alert', cor: theme.alerta };
    return (
      <View style={[styles.card, alerta.lido && styles.cardLido]}>
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
        {!alerta.lido ? (
          <TouchableOpacity onPress={() => handleMarcarLido(alerta.id)}>
            <Ionicons name="checkmark-circle-outline" size={32} color={theme.sucesso} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="checkmark-circle" size={32} color={theme.textoSecundario} />
        )}
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      data={alertas}
      keyExtractor={a => String(a.id)}
      renderItem={renderItem}
      onEndReached={carregarMais}
      onEndReachedThreshold={0.4}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.titulo}>Alertas</Text>
          {temNaoLido && (
            <TouchableOpacity style={styles.botaoTodos} onPress={handleMarcarTodos}>
              <Ionicons name="checkmark-done" size={20} color={theme.branco} />
              <Text style={styles.botaoTodosTexto}>Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      ListEmptyComponent={
        carregando ? (
          <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.semDados}>
            <Ionicons name="notifications-outline" size={48} color={theme.textoSecundario} />
            <Text style={styles.semDadosTexto}>Nenhum alerta registrado.</Text>
          </View>
        )
      }
      ListFooterComponent={
        carregandoMais ? <ActivityIndicator color={theme.primaria} style={{ marginVertical: 16 }} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  content: { padding: theme.espacoGrande },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto, marginBottom: theme.espacoGrande },
  botaoTodos: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: theme.primaria, borderRadius: theme.borderRadius,
    padding: theme.espacoMedio, marginBottom: theme.espacoGrande,
  },
  botaoTodosTexto: { color: theme.branco, fontSize: theme.fontePequena, fontWeight: 'bold' },
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