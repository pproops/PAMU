import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';

export default function ProfileScreen() {
  const { user, signOutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      Alert.alert(
        'Greška',
        getErrorMessage(error, 'Nije se moguće odjaviti.')
      );
    }
  };

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            TOURNAMENT MANAGER
          </Text>

          <Text style={styles.title}>
            Profil
          </Text>

          <Text style={styles.subtitle}>
            Pregled korisničkog računa i postavki prijave.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={38}
              color="#07151d"
            />
          </View>

          <Text style={styles.profileTitle}>
            Prijavljeni korisnik
          </Text>

          <Text
            style={styles.email}
            numberOfLines={1}
          >
            {user?.email ?? 'Nema dostupnog e-maila'}
          </Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              Aktivna sesija
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Račun
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#0bdc73"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                E-mail adresa
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={1}
              >
                {user?.email ?? '-'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#0bdc73"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Status računa
              </Text>

              <Text style={styles.infoValue}>
                Prijavljen
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#0bdc73"
            />
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              Tournament Manager
            </Text>

            <Text style={styles.noteText}>
              Vaš račun povezan je s turnirima koje kreirate i
              kojima upravljate u aplikaciji.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#ffffff"
          />

          <Text style={styles.logoutButtonText}>
            Odjavi se
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07151d',
  },

  container: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    color: '#0bdc73',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },

  subtitle: {
    color: '#8fa0aa',
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 320,
  },

  profileCard: {
    backgroundColor: '#10232e',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1c3542',
    padding: 22,
    alignItems: 'center',
    marginBottom: 26,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#0bdc73',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  profileTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },

  email: {
    color: '#9eacb5',
    fontSize: 15,
    maxWidth: '90%',
    marginBottom: 14,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12342d',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0bdc73',
    marginRight: 7,
  },

  statusText: {
    color: '#0bdc73',
    fontSize: 12,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: '#10232e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1c3542',
    padding: 17,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: '#7f929d',
    fontSize: 12,
    marginBottom: 3,
  },

  infoValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#1d3642',
    marginVertical: 16,
  },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d202a',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#19333f',
    padding: 16,
    marginBottom: 24,
  },

  noteIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  noteText: {
    color: '#8fa0aa',
    fontSize: 13,
    lineHeight: 19,
  },

  logoutButton: {
    backgroundColor: '#b00020',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 35,
  },
});