import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    (async () => {
      try {
        setIsLoading(true);
        if (!email || !password) {
          Alert.alert('Validation', 'Email and password are required');
          return;
        }
        await register(email, password, email, isStaff);
        Alert.alert('Registered', 'Account created successfully');
        router.push('/');
      } catch (err) {
        Alert.alert('Register failed', String(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Register</ThemedText>

      <ThemedText type="subtitle">Name</ThemedText>
      <TextInput 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
        placeholder="Full name"
        editable={!isLoading}
      />

      <ThemedText type="subtitle">Email</ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
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

      <View style={styles.row}>
        <ThemedText>Staff account</ThemedText>
        <Switch value={isStaff} onValueChange={setIsStaff} />
      </View>

      <Button 
        title={isLoading ? 'Creating account...' : 'Create account'} 
        onPress={submit}
        disabled={isLoading}
      />
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
