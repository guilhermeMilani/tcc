import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { vincularPorCodigo } from '../../api/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VinculoCuidadorScreen() {
  const { usuario } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const insets = useSafeAreaInsets();

  async function handleVincular() {
    if (codigo.length !== 6) {
      Alert.alert('Atenção', 'Digite o código de 6 dígitos.');
      return;
    }

    setCarregando(true);
    try {
      await vincularPorCodigo(usuario.id, codigo);
      setCodigo('');
      Alert.alert('✅ Sucesso', 'Vínculo criado com sucesso! O idoso agora aparece na sua lista.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Código inválido ou expirado.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Vincular Idoso</Text>
      <Text style={styles.descricao}>
        Peça ao idoso para gerar um código no aplicativo dele e digite abaixo para se vincular.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor={theme.textoSecundario}
          keyboardType="number-pad"
          maxLength={6}
          value={codigo}
          onChangeText={setCodigo}
          textAlign="center"
        />
      </View>

      <TouchableOpacity
        style={[styles.botao, codigo.length !== 6 && styles.botaoDesabilitado]}
        onPress={handleVincular}
        disabled={carregando || codigo.length !== 6}
      >
        {carregando
          ? <ActivityIndicator color={theme.branco} />
          : (
            <>
              <Ionicons name="link-outline" size={24} color={theme.branco} />
              <Text style={styles.botaoTexto}>Vincular</Text>
            </>
          )
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: theme.fundo,
    padding: theme.espacoGrande,
    alignItems: 'center', justifyContent: 'center',
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
  inputContainer: {
    width: '100%', marginBottom: theme.espacoGrande,
  },
  input: {
    backgroundColor: theme.branco, borderRadius: theme.borderRadius,
    borderWidth: 2, borderColor: theme.primaria,
    fontSize: 40, fontWeight: 'bold', color: theme.primaria,
    height: 90, letterSpacing: 12,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: theme.primaria, borderRadius: theme.borderRadius,
    height: theme.alturaBotao, paddingHorizontal: 32,
    flexDirection: 'row', alignItems: 'center', gap: theme.espacoMedio,
    width: '100%', justifyContent: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoTexto: {
    color: theme.branco, fontSize: theme.fonteGrande, fontWeight: 'bold',
  },
});