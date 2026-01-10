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

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
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
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create user through API
      await stockApi.createUser({
        email: email,
        name: name,
        password: password,
        status: 'active',
      });
      
      Alert.alert('Registration Successful', `Welcome, ${name}! Your account has been created. You can now log in.`);
      // Navigate to login screen
      router.push('/login');
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        Alert.alert('Registration Error', 'A user with this email already exists. Please use a different email.');
      } else {
        Alert.alert('Registration Error', 'An error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
            {/* Header Section */}
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
            </ThemedView>

            {/* Registration Form */}
            <ThemedView style={styles.formContainer}>
              {/* Name Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                        borderColor: nameError ? '#FF6B6B' : (isDark ? Colors.dark.text : Colors.light.text),
                        color: isDark ? Colors.dark.text : Colors.light.text,
                      }
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor={isDark ? Colors.dark.icon : Colors.light.icon}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) setNameError('');
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {nameError ? (
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" style={styles.errorIcon} />
                  ) : null}
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email Address</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                        borderColor: emailError ? '#FF6B6B' : (isDark ? Colors.dark.text : Colors.light.text),
                        color: isDark ? Colors.dark.text : Colors.light.text,
                      }
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={isDark ? Colors.dark.icon : Colors.light.icon}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  {emailError ? (
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" style={styles.errorIcon} />
                  ) : null}
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
                    placeholder="Create a password"
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

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                        borderColor: confirmPasswordError ? '#FF6B6B' : (isDark ? Colors.dark.text : Colors.light.text),
                        color: isDark ? Colors.dark.text : Colors.light.text,
                      }
                    ]}
                    placeholder="Confirm your password"
                    placeholderTextColor={isDark ? Colors.dark.icon : Colors.light.icon}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={isDark ? Colors.dark.icon : Colors.light.icon} 
                    />
                  </TouchableOpacity>
                  {confirmPasswordError ? (
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" style={styles.errorIcon} />
                  ) : null}
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                style={[
                  styles.registerButton,
                  { 
                    backgroundColor: isLoading 
                      ? (isDark ? Colors.dark.tint : Colors.light.tint) 
                      : (isDark ? Colors.dark.tint : Colors.light.tint)
                  }
                ]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                <ThemedText style={styles.registerButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </ThemedText>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <ThemedText style={styles.loginLink}>Sign In</ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
              
              {/* Note that only admin can access */}
              <View style={styles.adminNoteContainer}>
                <ThemedText style={styles.adminNoteText}>Note: Only admin can access this application</ThemedText>
                <ThemedText style={styles.adminNoteText}>Admin credentials: demo@gmail.com / 123456</ThemedText>
              </View>
            </ThemedView>
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
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  adminNoteContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  adminNoteText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
});