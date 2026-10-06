import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { gerarCodigoVinculo } from '../../api/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VinculoIdosoScreen() {
  const { usuario } = useAuth();
  const [codigo, setCodigo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [expiracao, setExpiracao] = useState(null);
  const insets = useSafeAreaInsets();

  async function handleGerarCodigo() {
    setCarregando(true);
    try {
      const resposta = await gerarCodigoVinculo(usuario.id);
      setCodigo(resposta.data.codigo);
      const exp = new Date(Date.now() + 10 * 60 * 1000);
      setExpiracao(exp);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar o código.');
    } finally {
      setCarregando(false);
    }
  }

  function formatarExpiracao() {
    if (!expiracao) return '';
    return expiracao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.titulo}>Vincular Cuidador</Text>
      <Text style={styles.descricao}>
        Gere um código e passe para o seu cuidador. Ele terá 10 minutos para usar o código e se vincular a você.
      </Text>

      {codigo ? (
        <View style={styles.codigoContainer}>
          <Text style={styles.codigoLabel}>Seu código</Text>
          <Text style={styles.codigo}>{codigo}</Text>
          <View style={styles.expiracaoRow}>
            <Ionicons name="time-outline" size={18} color={theme.textoSecundario} />
            <Text style={styles.expiracao}>Válido até {formatarExpiracao()}</Text>
          </View>
          <TouchableOpacity style={styles.botaoNovo} onPress={handleGerarCodigo}>
            <Text style={styles.botaoNovoTexto}>Gerar novo código</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.botao}
          onPress={handleGerarCodigo}
          disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color={theme.branco} />
            : (
              <>
                <Ionicons name="qr-code-outline" size={28} color={theme.branco} />
                <Text style={styles.botaoTexto}>Gerar Código</Text>
              </>
            )
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.fundo,
    padding: theme.espacoGrande,
    alignItems: 'center',
  },
  titulo: {
    fontSize: theme.fonteTitulo, fontWeight: 'bold',
    color: theme.texto, marginBottom: theme.espacoMedio,
    textAlign: 'center',
  },
  descricao: {
    fontSize: theme.fonteMédia, color: theme.textoSecundario,
    textAlign: 'center', lineHeight: 28,
    marginBottom: theme.espacoGrande * 2,
  },
  codigoContainer: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    padding: theme.espacoGrande * 1.5, alignItems: 'center',
    width: '100%', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  codigoLabel: {
    fontSize: theme.fonteMédia, color: theme.textoSecundario,
    marginBottom: theme.espacoMedio,
  },
  codigo: {
    fontSize: 52, fontWeight: 'bold', color: theme.primaria,
    letterSpacing: 8, marginBottom: theme.espacoMedio,
  },
  expiracaoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: theme.espacoGrande,
  },
  expiracao: {
    fontSize: theme.fontePequena, color: theme.textoSecundario,
  },
  botaoNovo: {
    borderWidth: 1, borderColor: theme.primaria, borderRadius: theme.borderRadius,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  botaoNovoTexto: {
    fontSize: theme.fonteMédia, color: theme.primaria,
  },
  botao: {
    backgroundColor: theme.primaria, borderRadius: theme.borderRadius,
    height: theme.alturaBotao, paddingHorizontal: 32,
    flexDirection: 'row', alignItems: 'center', gap: theme.espacoMedio,
  },
  botaoTexto: {
    color: theme.branco, fontSize: theme.fonteGrande, fontWeight: 'bold',
  },
});