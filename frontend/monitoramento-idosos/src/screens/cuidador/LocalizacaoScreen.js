import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, ScrollView
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { listarIdososDoCuidador, buscarUltimaLocalizacao } from '../../api/api';

export default function LocalizacaoScreen() {
  const { usuario } = useAuth();
  const [idosos, setIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);
  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarIdosos();
  }, []);

  useEffect(() => {
    if (idosoSelecionado) carregarLocalizacao();
    const intervalo = setInterval(() => {
      if (idosoSelecionado) carregarLocalizacao();
    }, 15000);
    return () => clearInterval(intervalo);
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

  async function carregarLocalizacao() {
    try {
      const resposta = await buscarUltimaLocalizacao(idosoSelecionado.id);
      setLocalizacao(resposta.data);
    } catch (e) {
      // silencioso
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Localização</Text>

        {idosos.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={theme.primaria} style={{ marginTop: 40 }} />
      ) : !localizacao ? (
        <View style={styles.semDados}>
          <Ionicons name="location-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Nenhuma localização disponível.</Text>
        </View>
      ) : (
        <>
          <MapView
            style={styles.mapa}
            region={{
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{ latitude: localizacao.latitude, longitude: localizacao.longitude }}
              title={idosoSelecionado?.nome}
              description="Última localização conhecida"
            />
          </MapView>

          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={20} color={theme.primaria} />
            <Text style={styles.infoTexto}>
              Atualizado em: {new Date(localizacao.dataHora).toLocaleString('pt-BR')}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fundo },
  cabecalho: { padding: theme.espacoGrande, paddingTop: 60 },
  titulo: { fontSize: theme.fonteTitulo, fontWeight: 'bold', color: theme.texto, marginBottom: theme.espacoMedio },
  chip: {
    borderRadius: 20, borderWidth: 1, borderColor: theme.primaria,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
  },
  chipAtivo: { backgroundColor: theme.primaria },
  chipTexto: { fontSize: theme.fontePequena, color: theme.primaria },
  chipTextoAtivo: { color: theme.branco },
  mapa: { flex: 1 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: theme.espacoMedio, backgroundColor: theme.branco,
  },
  infoTexto: { fontSize: theme.fontePequena, color: theme.textoSecundario },
  semDados: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.espacoMedio },
  semDadosTexto: { fontSize: theme.fonteMédia, color: theme.textoSecundario, textAlign: 'center' },
});