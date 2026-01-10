import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { stockApi } from '../services/stockApi';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    if (!username.trim()) {
      setUsernameError('Username or email is required');
      isValid = false;
    } else {
      setUsernameError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if it's the admin user
      if (username === 'demo@gmail.com' && password === '123456') {
        Alert.alert('Login Successful', 'Welcome, Admin!');
        // Navigate to admin dashboard
        router.push('/admin-dashboard');
      } else {
        // Check if it's a valid user
        const users = await stockApi.getAllUsers();
        const user = users.find(u => u.email === username);
        
        if (user && user.status !== 'blocked') {
          Alert.alert('Login Successful', 'Welcome!');
          // Navigate to user dashboard
          router.push('/(tabs)');
        } else if (user && user.status === 'blocked') {
          Alert.alert('Login Failed', 'Your account has been blocked by the administrator.');
        } else {
          Alert.alert('Login Failed', 'Invalid email or password. Only registered users can access this application.');
        }
      }
    } catch (error) {
      Alert.alert('Login Error', 'An error occurred during login. Please try again.');
    }
    setIsLoading(false);
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedView style={styles.contentContainer}>
            {/* Logo/Title Section */}
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>Login</ThemedText>
              <ThemedText style={styles.subtitle}>Sign in to your account</ThemedText>
            </ThemedView>

            {/* Login Form */}
            <ThemedView style={styles.formContainer}>
              {/* Username Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                        borderColor: usernameError ? '#FF6B6B' : (isDark ? Colors.dark.text : Colors.light.text),
                        color: isDark ? Colors.dark.text : Colors.light.text,
                      }
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={isDark ? Colors.dark.icon : Colors.light.icon}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (usernameError) setUsernameError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  {usernameError ? (
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" style={styles.errorIcon} />
                  ) : null}
                </View>
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                        borderColor: passwordError ? '#FF6B6B' : (isDark ? Colors.dark.text : Colors.light.text),
                        color: isDark ? Colors.dark.text : Colors.light.text,
                      }
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? Colors.dark.icon : Colors.light.icon}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={isDark ? Colors.dark.icon : Colors.light.icon} 
                    />
                  </TouchableOpacity>
                  {passwordError ? (
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" style={styles.errorIcon} />
                  ) : null}
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  { 
                    backgroundColor: isLoading 
                      ? (isDark ? Colors.dark.tint : Colors.light.tint) 
                      : (isDark ? Colors.dark.tint : Colors.light.tint)
                  }
                ]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <ThemedText style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </ThemedText>
              </TouchableOpacity>

              {/* Navigation to Register */}
              <View style={styles.navigationContainer}>
                <ThemedText style={styles.navigationText}>Don't have an account? </ThemedText>
                <Link href="/register" asChild>
                  <TouchableOpacity>
                    <ThemedText style={styles.navigationLink}>Sign Up</ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
            </ThemedView>

            {/* Admin Info */}
            <View style={styles.adminInfoContainer}>
              <ThemedText style={styles.adminInfoText}>Admin credentials:</ThemedText>
              <ThemedText style={styles.adminInfoText}>Email: demo@gmail.com</ThemedText>
              <ThemedText style={styles.adminInfoText}>Password: 123456</ThemedText>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  formContainer: {
    width: '100%',
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorIcon: {
    position: 'absolute',
    right: 16,
    top: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 4,
    marginTop: 4,
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  navigationText: {
    fontSize: 16,
  },
  navigationLink: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  adminInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  adminInfoText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
});