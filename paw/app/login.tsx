import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme].tint;

  async function submit() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    try {
      setIsLoading(true);
      await login(username, password);
    } catch (err) {
      Alert.alert('Login failed', String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#151718' : '#fff' }]}>  
      <View style={styles.inner}>
        <Text style={[styles.emoji]}>🐱</Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Lucky Cat</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#666' }]}>Sign in to mark attendance</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          style={[styles.input, {
            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#444' : '#ddd',
          }]}
          autoCapitalize="none"
          placeholder="Username or Student ID"
          placeholderTextColor={isDark ? '#777' : '#999'}
          editable={!isLoading}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          style={[styles.input, {
            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#444' : '#ddd',
          }]}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={isDark ? '#777' : '#999'}
          editable={!isLoading}
          onSubmitEditing={submit}
        />

        <Pressable
          onPress={submit}
          disabled={isLoading}
          style={[styles.button, { backgroundColor: tintColor, opacity: isLoading ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  inner: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
