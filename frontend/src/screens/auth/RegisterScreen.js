import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus memiliki 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Coba gunakan email lain.');
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
          <Text style={styles.brandName}>wearlyourfit</Text>
          <Text style={styles.tagline}>Mulai rapikan lemari pakaian impianmu</Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Buat Akun Baru</Text>
          <Text style={styles.formSubtitle}>Daftar untuk mulai mengombinasikan outfit</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Nama Lengkap"
            placeholder="Contoh: Clara Oswald"
            value={name}
            onChangeText={(text) => { setName(text); setError(''); }}
            icon={<Ionicons name="person-outline" size={18} color={COLORS.textLight} />}
          />

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
            placeholder="Minimal 6 karakter"
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry={!showPassword}
            icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />}
          />

          <CustomInput
            label="Konfirmasi Password"
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
            secureTextEntry={!showPassword}
            icon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textLight} />}
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
            title="Daftar Sekarang"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>Sudah memiliki akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchAuthLink}>Masuk</Text>
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
    marginBottom: SPACING.lg,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMedium,
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
