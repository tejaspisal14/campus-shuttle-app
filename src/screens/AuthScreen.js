import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signUpStudent, signUpDriver, signIn, supabase } from '../services/supabase';
import { COLORS, SPACING, FONT_SIZES } from '../utils/constants';

// College email validation - must end with .edu
const COLLEGE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.edu$/i;

export default function AuthScreen({ navigation, onGuestLogin }) {
  const [mode, setMode] = useState('student'); // 'student' | 'driver'
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateCollegeEmail = (emailStr) => {
    return COLLEGE_EMAIL_REGEX.test(emailStr);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await signIn(email, password);
        let userType = data?.user?.user_metadata?.user_type;
        if (!userType) {
          try {
            const profile = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', data.user.id)
              .single();
            userType = profile?.data?.user_type;
          } catch (e) {
            // fallback to student
          }
        }
        // Auth state listener will navigate to MainTabs with userType
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        if (!phone.trim()) {
          throw new Error('Please enter your phone number');
        }
        if (!email.trim()) {
          throw new Error('Please enter your email');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        if (mode === 'student') {
          if (!validateCollegeEmail(email)) {
            throw new Error('Students must use a college email (e.g. name@college.edu)');
          }
          await signUpStudent(email, password, name.trim(), phone.trim());
        } else {
          if (!licenseNumber.trim()) {
            throw new Error('Please enter your license number');
          }
          await signUpDriver(email, password, name.trim(), phone.trim(), licenseNumber.trim());
        }
        // Auth state listener will navigate to MainTabs
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Navigation after auth is handled by AppNavigator's auth state listener

  const switchToLogin = () => {
    setIsLogin(true);
    setError('');
  };

  const switchToSignUp = () => {
    setIsLogin(false);
    setError('');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.logo}>🚌</Text>
              <Text style={styles.title}>Campus Shuttle</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Welcome back' : 'Create your account'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'student' && styles.modeBtnActive]}
                  onPress={() => { setMode('student'); setError(''); }}
                >
                  <Text style={[styles.modeText, mode === 'student' && styles.modeTextActive]}>
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'driver' && styles.modeBtnActive]}
                  onPress={() => { setMode('driver'); setError(''); }}
                >
                  <Text style={[styles.modeText, mode === 'driver' && styles.modeTextActive]}>
                    Driver
                  </Text>
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={COLORS.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    placeholderTextColor={COLORS.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                  {mode === 'driver' && (
                    <TextInput
                      style={styles.input}
                      placeholder="License Number"
                      placeholderTextColor={COLORS.textSecondary}
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                    />
                  )}
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder={mode === 'student' && !isLogin ? "Email (e.g. you@college.edu)" : "Email"}
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitText}>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchBtn}
                onPress={isLogin ? switchToSignUp : switchToLogin}
              >
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => onGuestLogin?.() || navigation.navigate('MainTabs', { userType: 'student' })}
            >
              <Text style={styles.demoText}>Continue as Guest</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  logo: {
    fontSize: 56,
    marginBottom: SPACING.md,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBox: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitBtnDisabled: {
    opacity: 0.8,
  },
  submitText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  switchBtn: {
    alignItems: 'center',
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  demoBtn: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  demoText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
  },
});
