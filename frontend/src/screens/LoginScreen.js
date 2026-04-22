import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Mail, Lock, Chrome, Apple } from 'lucide-react-native';
import { API_BASE } from '../config/api';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading]   = React.useState(false);
  const { login } = useUser();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }


    // ── Real API login ────────────────────────────────────────────────────
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      login(data);                          // ← save user globally
      if (data.isAdmin) {
        navigation.navigate('AdminDashboard');
      } else {
        navigation.navigate('HomeMain');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground 
        source={require('../assets/login-bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>ATELIER</Text>
                <View style={styles.sloganContainer}>
                  <View style={styles.verticalLine} />
                  <Text style={styles.slogan}>Curated luxury for the modern silhouette.</Text>
                </View>
              </View>

              {/* Welcome Section */}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Welcome back</Text>
                <Text style={styles.welcomeSubtitle}>Please enter your details to continue.</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS / USERNAME</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput 
                      style={styles.input}
                      placeholder="hello@atelier.com"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TouchableOpacity>
                      <Text style={styles.forgotText}>FORGOT?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput 
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#999"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.loginButton, loading && { opacity: 0.6 }]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={styles.loginButtonText}>LOGIN</Text>
                  }
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR CONNECT WITH</Text>
                <View style={styles.line} />
              </View>

              {/* Social Login Section */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButtonWhite}>
                  <Chrome size={20} color="#000" />
                  <Text style={styles.socialButtonTextBlack}>GOOGLE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButtonGreen}>
                  <Apple size={20} color="#FFF" />
                  <Text style={styles.socialButtonTextWhite}>APPLE</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>New to Atelier? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Subtle white overlay
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#00332B',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
  },
  sloganContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  verticalLine: {
    width: 2,
    height: 35,
    backgroundColor: '#8D6E63',
    marginRight: 10,
    opacity: 0.5,
  },
  slogan: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 20,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1.5,
  },
  forgotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8D6E63',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: '#F3F5F4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#00332B',
    height: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 35,
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
  },
  socialButtonWhite: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  socialButtonGreen: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00332B',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  socialButtonTextBlack: {
    color: '#000',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 11,
    letterSpacing: 1,
  },
  socialButtonTextWhite: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 11,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    paddingBottom: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    fontWeight: 'bold',
    color: '#8D6E63',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
