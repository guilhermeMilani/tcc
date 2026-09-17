import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  VictoryChart, VictoryLine, VictoryAxis,
  VictoryVoronoiContainer, VictoryScatter
} from 'victory-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { listarIdososDoCuidador, buscarHistoricoSinaisVitais } from '../../api/api';

const RANGES = [
  { label: '1h', value: '1h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
];

const larguraTela = Dimensions.get('window').width - 32;

function formatarEixoX(timestamp, range) {
  const d = new Date(timestamp);
  if (range === '1h' || range === '24h') {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

function formatarTooltip(timestamp) {
  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}



function GraficoSinal({ dados, cor, titulo, icone, unidade, range }) {
  const [tooltipInfo, setTooltipInfo] = useState(null);

  if (!dados || dados.length === 0) return null;

  const maxPontos = range === '1h' ? 20 : range === '24h' ? 30 : 40;
  const dadosFiltrados = dados.length > maxPontos
    ? dados.filter((_, i) => i % Math.ceil(dados.length / maxPontos) === 0)
    : dados;

  const larguraGrafico = Math.max(larguraTela, dadosFiltrados.length * 30);

  const labels = dadosFiltrados.map((d, i) => {
    const total = dadosFiltrados.length;
    const mostrar = [0, Math.floor(total / 4), Math.floor(total / 2), Math.floor(3 * total / 4), total - 1];
    return mostrar.includes(i) ? formatarEixoX(d.x, range) : '';
  });

  return (
    <View style={styles.cardGrafico}>
      <View style={styles.graficoTituloRow}>
        <Ionicons name={icone} size={20} color={cor} />
        <Text style={styles.graficoTitulo}>{titulo}</Text>
        {tooltipInfo && (
          <View style={[styles.tooltipFixo, { borderColor: cor }]}>
            <Text style={[styles.tooltipValor, { color: cor }]}>{tooltipInfo.valor}{unidade}</Text>
            <Text style={styles.tooltipHora}>{tooltipInfo.hora}</Text>
          </View>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!tooltipInfo}
      >
        <VictoryChart
          width={larguraGrafico}
          height={200}
          padding={{ top: 20, bottom: 40, left: 55, right: 25 }}
          style={{ background: { fill: 'transparent' } }}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              onActivated={(points) => {
                if (points && points.length > 0 && points[0].y != null) {
                  setTooltipInfo({
                    valor: points[0].y,
                    hora: formatarTooltip(points[0].x)
                  });
                }
              }}
              onDeactivated={() => setTooltipInfo(null)}
            />
          }
        >
          <VictoryAxis
            tickValues={dadosFiltrados.map(d => d.x)}
            tickFormat={(t) => labels[dadosFiltrados.findIndex(d => d.x === t)] || ''}
            style={{
              axis: { stroke: '#DDD' },
              tickLabels: { fontSize: 9, fill: theme.textoSecundario, angle: -20 },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#DDD' },
              tickLabels: { fontSize: 9, fill: theme.textoSecundario },
              grid: { stroke: '#F0F0F0', strokeDasharray: '4' },
            }}
          />
          <VictoryLine
            data={dadosFiltrados}
            style={{ data: { stroke: cor, strokeWidth: 2 } }}
            interpolation="monotoneX"
          />
          <VictoryScatter
            data={dadosFiltrados}
            size={3}
            style={{ data: { fill: cor } }}
          />
        </VictoryChart>
      </ScrollView>
    </View>
  );
}

export default function SinaisVitaisScreen() {
  const { usuario } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);
  const [sinais, setSinais] = useState([]);
  const [range, setRange] = useState('1h');
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarIdosos();
    }, [])
  );

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
      setSinais(resposta.data.reverse());
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os sinais vitais.');
    } finally {
      setCarregando(false);
    }
  }

  function corFreq(valor) {
    if (!idosoSelecionado || valor == null) return theme.texto;
    if (valor > idosoSelecionado.limiteFreqMax) return theme.perigo;
    if (valor < idosoSelecionado.limiteFreqMin) return theme.alerta;
    return theme.sucesso;
  }

  function corSpO2(valor) {
    if (!idosoSelecionado || valor == null) return theme.texto;
    return valor < idosoSelecionado.limiteSpO2Min ? theme.perigo : theme.sucesso;
  }

  function corTemp(valor) {
    if (!idosoSelecionado || valor == null) return theme.texto;
    return valor > idosoSelecionado.limiteTempMax ? theme.perigo : theme.sucesso;
  }

const ultimo = sinais.length > 0
  ? sinais.reduce((a, b) => new Date(a.dataHora) > new Date(b.dataHora) ? a : b)
  : null;

  const freqData = sinais
    .filter(s => s.frequenciaCardiaca != null)
    .map(s => ({ x: new Date(s.dataHora).getTime(), y: s.frequenciaCardiaca }));

  const spo2Data = sinais
    .filter(s => s.spO2 != null)
    .map(s => ({ x: new Date(s.dataHora).getTime(), y: s.spO2 }));

  const tempData = sinais
    .filter(s => s.temperatura != null)
    .map(s => ({ x: new Date(s.dataHora).getTime(), y: s.temperatura }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Sinais Vitais</Text>

      {idosos.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorIdoso}>
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorRange}>
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
      </ScrollView>

      {carregando ? (
        <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
      ) : sinais.length === 0 ? (
        <View style={styles.semDados}>
          <Ionicons name="heart-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Nenhum dado no período selecionado.</Text>
        </View>
      ) : (
        <>
          {ultimo && (
            <View style={styles.cardUltimo}>
              <Text style={styles.cardUltimoTitulo}>Último registro</Text>
              <Text style={styles.cardUltimoHora}>
                {new Date(ultimo.dataHora).toLocaleString('pt-BR')}
              </Text>
              <View style={styles.cardUltimoValores}>
                <View style={styles.valorItem}>
                  <Ionicons name="heart" size={22} color={corFreq(ultimo.frequenciaCardiaca)} />
                  <Text style={[styles.valorTexto, { color: corFreq(ultimo.frequenciaCardiaca) }]}>
                    {ultimo.frequenciaCardiaca} bpm
                  </Text>
                </View>
                <View style={styles.valorItem}>
                  <Ionicons name="water" size={22} color={corSpO2(ultimo.spO2)} />
                  <Text style={[styles.valorTexto, { color: corSpO2(ultimo.spO2) }]}>
                    {ultimo.spO2?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.valorItem}>
                  <Ionicons name="thermometer" size={22} color={corTemp(ultimo.temperatura)} />
                  <Text style={[styles.valorTexto, { color: corTemp(ultimo.temperatura) }]}>
                    {ultimo.temperatura?.toFixed(1)}°C
                  </Text>
                </View>
              </View>
            </View>
          )}

          <GraficoSinal
            dados={freqData}
            cor={theme.perigo}
            titulo="Frequência Cardíaca (bpm)"
            icone="heart"
            unidade=" bpm"
            range={range}
          />
          <GraficoSinal
            dados={spo2Data}
            cor="#1565C0"
            titulo="SpO2 (%)"
            icone="water"
            unidade="%"
            range={range}
          />
          <GraficoSinal
            dados={tempData}
            cor={theme.alerta}
            titulo="Temperatura (°C)"
            icone="thermometer"
            unidade="°C"
            range={range}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  content: { padding: theme.espacoGrande, paddingTop: 60 },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto, marginBottom: theme.espacoGrande },
  seletorIdoso: { marginBottom: theme.espacoMedio },
  chip: {
    borderRadius: 20, borderWidth: 1, borderColor: theme.primaria,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
  },
  chipAtivo: { backgroundColor: theme.primaria },
  chipTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  chipTextoAtivo: { color: theme.branco },
  seletorRange: { marginBottom: theme.espacoGrande },
  botaoRange: {
    borderRadius: theme.borderRadius, borderWidth: 1,
    borderColor: theme.primaria, paddingVertical: 8,
    paddingHorizontal: 16, marginRight: 8, alignItems: 'center',
  },
  botaoRangeAtivo: { backgroundColor: theme.primaria },
  botaoRangeTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  botaoRangeTextoAtivo: { color: theme.branco },
  cardUltimo: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoGrande, marginBottom: theme.espacoMedio,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardUltimoTitulo: { fontSize: theme.fonteMédia, fontWeight: 'bold', color: theme.texto },
  cardUltimoHora: { fontSize: theme.fontePequena, color: theme.textoSecundario, marginBottom: theme.espacoMedio },
  cardUltimoValores: { flexDirection: 'row', justifyContent: 'space-between' },
  valorItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  valorTexto: { fontSize: theme.fonteMédia, fontWeight: 'bold' },
  cardGrafico: {
    backgroundColor: theme.branco,
    borderRadius: theme.borderRadius,
    paddingTop: theme.espacoMedio,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginBottom: theme.espacoMedio,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  graficoTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: theme.espacoMedio,
  },
  graficoTitulo: { fontSize: theme.fontePequena, fontWeight: 'bold', color: theme.texto },
  tooltipFixo: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1A1A1A',
  },
  tooltipValor: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltipHora: {
    fontSize: 10,
    color: '#AAA',
  },
  semDados: { alignItems: 'center', paddingVertical: 60, gap: theme.espacoMedio },
  semDadosTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario, textAlign: 'center' },
});