import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);

  function submit() {
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/account/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        });

        const json = await res.json();
        if (!res.ok) {
          Alert.alert('Login failed', json.error || JSON.stringify(json));
          return;
        }

        Alert.alert('Login', json.message || 'Logged in');
        router.push('/');
      } catch (err) {
        Alert.alert('Network error', String(err));
      }
    })();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign in</ThemedText>

      <ThemedText type="subtitle">Email</ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />

      <ThemedText type="subtitle">Password</ThemedText>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholder="••••••••"
      />

      <View style={styles.row}>
        <ThemedText>Staff account</ThemedText>
        <Switch value={isStaff} onValueChange={setIsStaff} />
      </View>

      <Button title="Sign in" onPress={submit} />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
});
