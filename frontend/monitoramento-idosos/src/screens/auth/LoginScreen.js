import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/api';

export default function LoginScreen({ navigation }) {
  const { salvarLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await login(email, senha);
      await salvarLogin(resposta.data.token);
    } catch (e) {
      Alert.alert('Erro', 'E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Bem-vindo</Text>
      <Text style={styles.subtitulo}>Faça login para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={theme.textoSecundario}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={theme.textoSecundario}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando
          ? <ActivityIndicator color={theme.branco} />
          : <Text style={styles.botaoTexto}>Entrar</Text>
        }
      </TouchableOpacity>

      <View style={styles.cadastroContainer}>
        <Text style={styles.cadastroTexto}>Não tem conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CadastroIdoso')}>
          <Text style={styles.cadastroLink}>Sou idoso</Text>
        </TouchableOpacity>
        <Text style={styles.cadastroTexto}> · </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CadastroCuidador')}>
          <Text style={styles.cadastroLink}>Sou cuidador</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.fundo,
    justifyContent: 'center',
    paddingHorizontal: theme.espacoGrande,
  },
  titulo: {
    fontSize: theme.fonteTitulo,
    fontWeight: 'bold',
    color: theme.primaria,
    textAlign: 'center',
    marginBottom: theme.espacoPequeno,
  },
  subtitulo: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
    textAlign: 'center',
    marginBottom: theme.espacoGrande * 2,
  },
  input: {
    backgroundColor: theme.branco,
    borderRadius: theme.borderRadius,
    padding: theme.espacoMedio,
    fontSize: theme.fonteMédia,
    color: theme.texto,
    marginBottom: theme.espacoMedio,
    borderWidth: 1,
    borderColor: '#DDD',
    height: theme.alturaBotao,
  },
  botao: {
    backgroundColor: theme.primaria,
    borderRadius: theme.borderRadius,
    height: theme.alturaBotao,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.espacoMedio,
  },
  botaoTexto: {
    color: theme.branco,
    fontSize: theme.fonteGrande,
    fontWeight: 'bold',
  },
  cadastroContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.espacoGrande,
    flexWrap: 'wrap',
  },
  cadastroTexto: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
  },
  cadastroLink: {
    fontSize: theme.fonteMédia,
    color: theme.primaria,
    fontWeight: 'bold',
  },
});