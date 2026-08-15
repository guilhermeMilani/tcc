import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { theme } from '../../constants/theme';
import { cadastrarCuidador } from '../../api/api';

export default function CadastroCuidadorScreen({ navigation }) {
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', telefone: '', relacaoComIdoso: ''
  });
  const [carregando, setCarregando] = useState(false);

  function atualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  async function handleCadastro() {
    if (!form.nome || !form.email || !form.senha) {
      Alert.alert('Atenção', 'Nome, e-mail e senha são obrigatórios.');
      return;
    }

    setCarregando(true);
    try {
      await cadastrarCuidador(form);
      Alert.alert('Sucesso', 'Cadastro realizado! Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro. Verifique os dados.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastro</Text>
      <Text style={styles.subtitulo}>Crie sua conta de cuidador</Text>

      {[
        { campo: 'nome', placeholder: 'Nome completo' },
        { campo: 'email', placeholder: 'E-mail', keyboard: 'email-address' },
        { campo: 'senha', placeholder: 'Senha', seguro: true },
        { campo: 'telefone', placeholder: 'Telefone (opcional)', keyboard: 'phone-pad' },
        { campo: 'relacaoComIdoso', placeholder: 'Relação com o idoso (ex: filho, enfermeiro)' },
      ].map(({ campo, placeholder, keyboard, seguro }) => (
        <TextInput
          key={campo}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.textoSecundario}
          keyboardType={keyboard || 'default'}
          autoCapitalize={campo === 'email' ? 'none' : 'sentences'}
          secureTextEntry={!!seguro}
          value={form[campo]}
          onChangeText={(v) => atualizar(campo, v)}
        />
      ))}

      <TouchableOpacity
        style={styles.botao}
        onPress={handleCadastro}
        disabled={carregando}
      >
        {carregando
          ? <ActivityIndicator color={theme.branco} />
          : <Text style={styles.botaoTexto}>Cadastrar</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.voltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.voltarTexto}>Voltar para o login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.fundo,
    paddingHorizontal: theme.espacoGrande,
    paddingTop: 60,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: theme.fonteTitulo,
    fontWeight: 'bold',
    color: theme.primaria,
    marginBottom: theme.espacoPequeno,
  },
  subtitulo: {
    fontSize: theme.fonteMédia,
    color: theme.textoSecundario,
    marginBottom: theme.espacoGrande,
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
  voltar: {
    marginTop: theme.espacoGrande,
    alignItems: 'center',
  },
  voltarTexto: {
    fontSize: theme.fonteMédia,
    color: theme.primaria,
  },
});