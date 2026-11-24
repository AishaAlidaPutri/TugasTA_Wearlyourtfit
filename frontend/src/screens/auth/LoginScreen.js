import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>wearlyourfit</Text>
          <Text style={styles.tagline}>Your wardrobe, planned beautifully.</Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Masuk ke Akun</Text>
          <Text style={styles.formSubtitle}>Kelola koleksi pakaian dan rencanakan outfit harianmu</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
            keyboardType="email-address"
            icon={<Ionicons name="mail-outline" size={18} color={COLORS.textLight} />}
          />

          <CustomInput
            label="Password"
            placeholder="Masukkan kata sandi"
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry={!showPassword}
            icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            }
          />

          <CustomButton
            title="Masuk"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>Belum memiliki akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchAuthLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  formSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: 10,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorBoxText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 8,
    flex: 1,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  switchAuthText: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  switchAuthLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
