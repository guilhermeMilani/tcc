import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { buscarMedicacoes, registrarAdesao } from '../../api/api';

export default function MedicacoesIdosoScreen() {
  const { usuario } = useAuth();
  const [medicacoes, setMedicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarMedicacoes();
  }, []);

  async function carregarMedicacoes() {
    try {
      const resposta = await buscarMedicacoes(usuario.id);
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
      Alert.alert(
        tomou ? '✅ Registrado' : '❌ Registrado',
        tomou ? 'Medicação marcada como tomada.' : 'Medicação marcada como não tomada.'
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível registrar.');
    }
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

      {medicacoes.length === 0 ? (
        <View style={styles.semDados}>
          <Ionicons name="medkit-outline" size={48} color={theme.textoSecundario} />
          <Text style={styles.semDadosTexto}>Nenhuma medicação cadastrada.</Text>
        </View>
      ) : (
        medicacoes.map((med) => (
          <View key={med.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.nomeMed}>{med.nome}</Text>
              <Text style={styles.dosagem}>{med.dosagem}</Text>
              <View style={styles.horariosContainer}>
                <Ionicons name="time-outline" size={18} color={theme.textoSecundario} />
                <Text style={styles.horarios}>
                  {med.horarios?.join('  ·  ') || 'Sem horário definido'}
                </Text>
              </View>
            </View>

            <View style={styles.botoesAdesao}>
              <TouchableOpacity
                style={[styles.botaoAdesao, { backgroundColor: theme.sucesso }]}
                onPress={() => handleAdesao(med.id, true)}
              >
                <Ionicons name="checkmark" size={28} color={theme.branco} />
                <Text style={styles.botaoAdesaoTexto}>Tomei</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoAdesao, { backgroundColor: theme.perigo }]}
                onPress={() => handleAdesao(med.id, false)}
              >
                <Ionicons name="close" size={28} color={theme.branco} />
                <Text style={styles.botaoAdesaoTexto}>Não tomei</Text>
              </TouchableOpacity>
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
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: theme.fonteTitulo,
    fontWeight: 'bold',
    color: theme.texto,
    marginBottom: theme.espacoGrande,
  },
  card: {
    backgroundColor: theme.branco,
    borderRadius: theme.borderRadius,
    padding: theme.espacoGrande,
    marginBottom: theme.espacoMedio,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardInfo: {
    marginBottom: theme.espacoMedio,
  },
  nomeMed: {
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
    color: theme.texto,
    marginBottom: 4,
  },
  dosagem: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
    marginBottom: 8,
  },
  horariosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horarios: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
  },
  botoesAdesao: {
    flexDirection: 'row',
    gap: theme.espacoMedio,
  },
  botaoAdesao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
    padding: theme.espacoMedio,
    gap: 6,
  },
  botaoAdesaoTexto: {
    color: theme.branco,
    fontSize: theme.fonteMédia,
    fontWeight: 'bold',
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