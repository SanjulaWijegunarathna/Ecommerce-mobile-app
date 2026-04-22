import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  StatusBar,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Chrome, Facebook, Eye, EyeOff } from 'lucide-react-native';
import { API_BASE } from '../config/api';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleRegister = async () => {
    // ── Basic validation ──────────────────────────────────────────────────
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    // ── API call ──────────────────────────────────────────────────────────
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // ── Success → go to Login ─────────────────────────────────────────
      Alert.alert(
        'Account Created! 🎉',
        'Your account has been created successfully. Please log in.',
        [{ text: 'Log In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ATELIER</Text>
            <Text style={styles.slogan}>Join the world of refined aesthetics</Text>
          </View>

          {/* Title Section */}
          <Text style={styles.title}>Create your account</Text>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Julianne Moore"
                  placeholderTextColor="#BBB"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="j.moore@atelier.com"
                  placeholderTextColor="#BBB"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#BBB"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(v => !v)}>
                  {showPassword
                    ? <EyeOff size={20} color="#BBB" />
                    : <Eye    size={20} color="#BBB" />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#BBB"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.createButtonText}>Create Account</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR REGISTER WITH</Text>
            <View style={styles.line} />
          </View>

          {/* Social Register Section */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Chrome size={20} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Facebook size={20} color="#1877F2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F8',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
  },
  slogan: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 35,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  inputWrapper: {
    backgroundColor: '#F1F3F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  createButton: {
    backgroundColor: '#00332B',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialButton: {
    flex: 0.48,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  socialButtonText: {
    color: '#333',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
    paddingBottom: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    fontWeight: 'bold',
    color: '#8B4513',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
