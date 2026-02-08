import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    (async () => {
      try {
        setIsLoading(true);
        await login(username, password);
        Alert.alert('Login', 'Logged in successfully');
        router.push('/');
      } catch (err) {
        Alert.alert('Login failed', String(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign in</ThemedText>

      <ThemedText type="subtitle">Username or Email</ThemedText>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        placeholder="username@example.com"
        editable={!isLoading}
      />

      <ThemedText type="subtitle">Password</ThemedText>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholder="••••••••"
        editable={!isLoading}
      />

      <Button title={isLoading ? 'Signing in...' : 'Sign in'} onPress={submit} disabled={isLoading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
});
