import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const scrollViewRef = useRef<ScrollView | null>(null);

  const scrollTo = (y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 250);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Greška', 'Unesite e-mail i lozinku.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Greška', getErrorMessage(error, 'Prijava nije uspjela.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.logoSection}>
              <View style={styles.logoIcon}>
                <Ionicons
                  name="trophy"
                  size={34}
                  color="#07151d"
                />
              </View>

              <Text style={styles.appName}>
                Tournament Manager
              </Text>

              <Text style={styles.appSubtitle}>
                Upravljajte svojim turnirima
                jednostavno i brzo.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.title}>
                Prijava
              </Text>

              <Text style={styles.subtitle}>
                Prijavite se u svoj račun i nastavite
                upravljati turnirima.
              </Text>

              <Text style={styles.label}>
                E-mail
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#7f929d"
                />

                <TextInput
                  style={styles.input}
                  placeholder="unesite e-mail"
                  placeholderTextColor="#667985"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => scrollTo(250)}
                />
              </View>

              <Text style={styles.label}>
                Lozinka
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#7f929d"
                />

                <TextInput
                  style={styles.input}
                  placeholder="unesite lozinku"
                  placeholderTextColor="#667985"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => scrollTo(340)}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color="#7f929d"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.button,
                  submitting && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? 'Prijava...' : 'Prijavi se'}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#07151d"
                />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />

                <Text style={styles.dividerText}>
                  NEMAŠ RAČUN?
                </Text>

                <View style={styles.divider} />
              </View>

              <Link
                href="/auth/register"
                asChild
              >
                <TouchableOpacity
                  style={styles.registerButton}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#0bdc73"
                  />

                  <Text style={styles.registerButtonText}>
                    Registriraj se
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#07151d',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 320,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: 35,
    backgroundColor: '#07151d',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#0bdc73',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  appName: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },

  appSubtitle: {
    color: '#8fa0aa',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
  },

  formCard: {
    backgroundColor: '#10232e',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1c3542',
  },

  title: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '800',
    marginBottom: 6,
  },

  subtitle: {
    color: '#8fa0aa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },

  label: {
    color: '#d8e0e5',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f3946',
    backgroundColor: '#0b1b24',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 17,
    minHeight: 56,
  },

  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 14,
  },

  button: {
    marginTop: 6,
    backgroundColor: '#0bdc73',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  buttonText: {
    color: '#07151d',
    fontSize: 16,
    fontWeight: '800',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1d3642',
  },

  dividerText: {
    color: '#657985',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginHorizontal: 10,
  },

  registerButton: {
    borderWidth: 1,
    borderColor: '#0bdc73',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  registerButtonText: {
    color: '#0bdc73',
    fontSize: 15,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },
});