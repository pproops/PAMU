import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { listOwnedTournaments } from '@/lib/tournaments';

export default function HomeScreen() {
  const [tournamentCount, setTournamentCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      listOwnedTournaments()
        .then((tournaments) => {
          if (!cancelled) {
            setTournamentCount(tournaments.length);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setTournamentCount(0);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoIcon}>
              <Ionicons
                name="trophy"
                size={23}
                color="#08131c"
              />
            </View>

            <Text style={styles.appName}>
              Tournament Manager
            </Text>
          </View>
        </View>

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Dobrodošli
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Organizirajte i pratite svoje turnire
            na jednom mjestu.
          </Text>
        </View>

        {/* MAIN ACTIONS */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.createCard}
            onPress={() =>
              router.push('/tournaments/create')
            }
          >
            <View style={styles.createIcon}>
              <Ionicons
                name="add"
                size={27}
                color="#0bdc73"
              />
            </View>

            <Text style={styles.createTitle}>
              Kreiraj turnir
            </Text>

            <Text style={styles.createSubtitle}>
              Pokreni novi turnir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.tournamentsCard}
            onPress={() =>
              router.push('/(tabs)/tournaments')
            }
          >
            <View style={styles.darkIcon}>
              <Ionicons
                name="trophy-outline"
                size={27}
                color="#ffffff"
              />
            </View>

            <Text style={styles.cardTitle}>
              Moji turniri
            </Text>

            <Text style={styles.cardSubtitle}>
              Pregledaj i upravljaj
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Upravljanje turnirima
          </Text>

          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />

            <Text style={styles.activeText}>
              {tournamentCount} turnira
            </Text>
          </View>
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.infoTop}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="football-outline"
                size={29}
                color="#0bdc73"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                Sve za vaš turnir
              </Text>

              <Text style={styles.infoDescription}>
                Upravljajte ekipama, utakmicama,
                rezultatima i tablicom na jednom mjestu.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresRow}>
            <View style={styles.feature}>
              <Ionicons
                name="people-outline"
                size={22}
                color="#0bdc73"
              />

              <Text style={styles.featureText}>
                Ekipe
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons
                name="football-outline"
                size={22}
                color="#0bdc73"
              />

              <Text style={styles.featureText}>
                Utakmice
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons
                name="stats-chart-outline"
                size={22}
                color="#0bdc73"
              />

              <Text style={styles.featureText}>
                Tablica
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons
                name="location-outline"
                size={22}
                color="#0bdc73"
              />

              <Text style={styles.featureText}>
                Lokacija
              </Text>
            </View>
          </View>
        </View>

        {/* SECOND INFO CARD */}
        <View style={styles.smallCard}>
          <View style={styles.smallIcon}>
            <Ionicons
              name="images-outline"
              size={24}
              color="#0bdc73"
            />
          </View>

          <View style={styles.smallCardContent}>
            <Text style={styles.smallCardTitle}>
              Vaši turniri, vaše slike
            </Text>

            <Text style={styles.smallCardText}>
              Dodajte vlastite fotografije turnira
              i uredite sve podatke kada želite.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.allTournamentsButton}
          onPress={() =>
            router.push('/(tabs)/tournaments')
          }
        >
          <Text style={styles.allTournamentsText}>
            Pogledaj moje turnire
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#07151d"
          />
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
    paddingTop: 22,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#0bdc73',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  appName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },

  welcomeSection: {
    marginBottom: 27,
  },

  welcomeTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },

  welcomeSubtitle: {
    color: '#9eacb5',
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 34,
  },

  createCard: {
    flex: 1,
    minHeight: 155,
    backgroundColor: '#0bdc73',
    borderRadius: 18,
    padding: 17,
    justifyContent: 'flex-end',
  },

  tournamentsCard: {
    flex: 1,
    minHeight: 155,
    backgroundColor: '#122632',
    borderRadius: 18,
    padding: 17,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#1d3542',
  },

  createIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  darkIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#203845',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  createTitle: {
    color: '#07151d',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },

  createSubtitle: {
    color: '#075a36',
    fontSize: 13,
  },

  cardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },

  cardSubtitle: {
    color: '#91a2ad',
    fontSize: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102a25',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0bdc73',
    marginRight: 6,
  },

  activeText: {
    color: '#0bdc73',
    fontSize: 12,
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: '#10232e',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1c3542',
    marginBottom: 13,
  },

  infoTop: {
    flexDirection: 'row',
  },

  infoIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#15342f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },

  infoDescription: {
    color: '#9eacb5',
    fontSize: 14,
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#203844',
    marginVertical: 18,
  },

  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  feature: {
    alignItems: 'center',
    flex: 1,
  },

  featureText: {
    color: '#b5c0c7',
    fontSize: 11,
    marginTop: 7,
  },

  smallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d202a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#19333f',
    marginBottom: 14,
  },

  smallIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#15342f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  smallCardContent: {
    flex: 1,
  },

  smallCardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  smallCardText: {
    color: '#8fa0aa',
    fontSize: 13,
    lineHeight: 18,
  },

  allTournamentsButton: {
    backgroundColor: '#0bdc73',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  allTournamentsText: {
    color: '#07151d',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 35,
  },
});