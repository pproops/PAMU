import { Ionicons } from '@expo/vector-icons';
import {
  router,
  Stack,
  useLocalSearchParams,
} from 'expo-router';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
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

import { getErrorMessage } from '@/lib/errors';
import { getOwnedMatch, saveMatchResult } from '@/lib/matches';
import { readParam } from '@/lib/params';
import { getOwnedTeam } from '@/lib/teams';
import type { Match, Team } from '@/types/models';

export default function EditMatchScreen() {
  const params = useLocalSearchParams<{ matchId: string }>();
  const matchId = readParam(params.matchId);

  const scrollViewRef =
    useRef<ScrollView | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [match, setMatch] =
    useState<Match | null>(null);

  const [homeTeam, setHomeTeam] =
    useState<Team | null>(null);

  const [awayTeam, setAwayTeam] =
    useState<Team | null>(null);

  const [homeScore, setHomeScore] =
    useState('');

  const [awayScore, setAwayScore] =
    useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMatch = async () => {
      if (!matchId) {
        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const matchData = await getOwnedMatch(matchId);

        if (!isMounted) {
          return;
        }

        setMatch(matchData);

        if (
          matchData.homeScore !== null &&
          matchData.homeScore !== undefined
        ) {
          setHomeScore(matchData.homeScore.toString());
        }

        if (
          matchData.awayScore !== null &&
          matchData.awayScore !== undefined
        ) {
          setAwayScore(matchData.awayScore.toString());
        }

        const [home, away] = await Promise.all([
          getOwnedTeam(matchData.homeTeamId),
          getOwnedTeam(matchData.awayTeamId),
        ]);

        if (!isMounted) {
          return;
        }

        setHomeTeam(home);
        setAwayTeam(away);
        setLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoading(false);

        Alert.alert(
          'Greška',
          getErrorMessage(error, 'Utakmica nije pronađena.'),
          [
            {
              text: 'U redu',
              onPress: () => router.back(),
            },
          ]
        );
      }
    };

    loadMatch();

    return () => {
      isMounted = false;
    };
  }, [matchId]);

  const scrollTo = (y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 250);
  };

  const handleSaveResult = async () => {
    if (!matchId || !match) {
      Alert.alert(
        'Greška',
        'Utakmica nije pronađena.'
      );

      return;
    }

    if (
      homeScore.trim() === '' ||
      awayScore.trim() === ''
    ) {
      Alert.alert(
        'Greška',
        'Unesite rezultat za obje ekipe.'
      );

      return;
    }

    const parsedHomeScore =
      Number(homeScore);

    const parsedAwayScore =
      Number(awayScore);

    if (
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore)
    ) {
      Alert.alert(
        'Greška',
        'Rezultat mora biti broj.'
      );

      return;
    }

    if (
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      Alert.alert(
        'Greška',
        'Rezultat ne može biti negativan.'
      );

      return;
    }

    if (
      !Number.isInteger(parsedHomeScore) ||
      !Number.isInteger(parsedAwayScore)
    ) {
      Alert.alert(
        'Greška',
        'Rezultat mora biti cijeli broj.'
      );

      return;
    }

    try {
      setSaving(true);

      await saveMatchResult(
        matchId,
        parsedHomeScore,
        parsedAwayScore
      );

      setSaving(false);

      Alert.alert(
        'Uspjeh',
        'Rezultat je uspješno spremljen.',
        [
          {
            text: 'U redu',
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error) {
      setSaving(false);

      Alert.alert(
        'Greška',
        getErrorMessage(error, 'Nije moguće spremiti rezultat.')
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#0bdc73"
        />

        <Text style={styles.loadingText}>
          Učitavanje utakmice...
        </Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color="#ff6577"
          />
        </View>

        <Text style={styles.errorText}>
          Utakmica nije pronađena.
        </Text>
      </View>
    );
  }

  const isCompleted =
    match.status === 'completed';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Rezultat utakmice',
          headerStyle: {
            backgroundColor: '#07151d',
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
        }}
      />

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
            contentContainerStyle={
              styles.scrollContainer
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={
              false
            }
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>
                    {isCompleted
                      ? 'Uredi rezultat'
                      : 'Unos rezultata'}
                  </Text>

                  <Text style={styles.subtitle}>
                    {isCompleted
                      ? 'Promijenite rezultat utakmice'
                      : 'Unesite konačni rezultat utakmice'}
                  </Text>
                </View>

                <View style={styles.headerIcon}>
                  <Ionicons
                    name="football-outline"
                    size={23}
                    color="#0bdc73"
                  />
                </View>
              </View>

              <View style={styles.matchCard}>
                <View style={styles.matchCardTop}>
                  <View
                    style={[
                      styles.statusBadge,
                      isCompleted
                        ? styles.completedBadge
                        : styles.scheduledBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isCompleted
                          ? styles.completedDot
                          : styles.scheduledDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        isCompleted
                          ? styles.completedText
                          : styles.scheduledText,
                      ]}
                    >
                      {isCompleted
                        ? 'ZAVRŠENA'
                        : 'ZAKAZANA'}
                    </Text>
                  </View>

                  <View style={styles.dateContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#71808a"
                    />

                    <Text style={styles.dateText}>
                      {match.scheduledAt}
                    </Text>
                  </View>
                </View>

                <View style={styles.teamsRow}>
                  <View style={styles.teamColumn}>
                    <View style={styles.teamAvatar}>
                      <Text style={styles.teamAvatarText}>
                        {homeTeam?.shortName
                          ?.slice(0, 3)
                          .toUpperCase() ||
                          'DOM'}
                      </Text>
                    </View>

                    <Text
                      style={styles.teamName}
                      numberOfLines={2}
                    >
                      {homeTeam?.name ??
                        'Domaća ekipa'}
                    </Text>

                    <Text style={styles.teamType}>
                      DOMAĆIN
                    </Text>
                  </View>

                  <View style={styles.vsArea}>
                    <View style={styles.vsCircle}>
                      <Text style={styles.vsText}>
                        VS
                      </Text>
                    </View>
                  </View>

                  <View style={styles.teamColumn}>
                    <View style={styles.teamAvatar}>
                      <Text style={styles.teamAvatarText}>
                        {awayTeam?.shortName
                          ?.slice(0, 3)
                          .toUpperCase() ||
                          'GOS'}
                      </Text>
                    </View>

                    <Text
                      style={styles.teamName}
                      numberOfLines={2}
                    >
                      {awayTeam?.name ??
                        'Gostujuća ekipa'}
                    </Text>

                    <Text style={styles.teamType}>
                      GOST
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultIcon}>
                    <Ionicons
                      name="stats-chart-outline"
                      size={21}
                      color="#0bdc73"
                    />
                  </View>

                  <View>
                    <Text style={styles.resultTitle}>
                      Rezultat
                    </Text>

                    <Text style={styles.resultSubtitle}>
                      Unesite broj golova
                    </Text>
                  </View>
                </View>

                <View style={styles.scoreRow}>
                  <View style={styles.scoreColumn}>
                    <Text style={styles.scoreLabel}>
                      {homeTeam?.shortName ??
                        'DOM'}
                    </Text>

                    <TextInput
                      style={styles.scoreInput}
                      value={homeScore}
                      onChangeText={setHomeScore}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#536771"
                      onFocus={() =>
                        scrollTo(150)
                      }
                      maxLength={3}
                      selectTextOnFocus
                    />

                    <Text style={styles.scoreTeamType}>
                      Domaćin
                    </Text>
                  </View>

                  <View style={styles.separatorArea}>
                    <Text style={styles.scoreSeparator}>
                      :
                    </Text>
                  </View>

                  <View style={styles.scoreColumn}>
                    <Text style={styles.scoreLabel}>
                      {awayTeam?.shortName ??
                        'GOS'}
                    </Text>

                    <TextInput
                      style={styles.scoreInput}
                      value={awayScore}
                      onChangeText={setAwayScore}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#536771"
                      onFocus={() =>
                        scrollTo(150)
                      }
                      maxLength={3}
                      selectTextOnFocus
                    />

                    <Text style={styles.scoreTeamType}>
                      Gost
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <Ionicons
                    name="information-circle-outline"
                    size={19}
                    color="#55c8ff"
                  />

                  <Text style={styles.infoText}>
                    Spremanjem rezultata utakmica će biti označena kao završena i tablica će se automatski ažurirati.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleSaveResult}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#07151d"
                    />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color="#07151d"
                    />
                  )}

                  <Text style={styles.saveButtonText}>
                    {saving
                      ? 'Spremanje...'
                      : isCompleted
                        ? 'Spremi novi rezultat'
                        : 'Spremi rezultat'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpace} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#07151d',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 300,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#07151d',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07151d',
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8fa0aa',
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#251821',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },

  subtitle: {
    color: '#8fa0aa',
    fontSize: 13,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  matchCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 19,
    padding: 16,
    marginBottom: 16,
  },

  matchCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  scheduledBadge: {
    backgroundColor: '#12303c',
  },

  completedBadge: {
    backgroundColor: '#14342d',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  scheduledDot: {
    backgroundColor: '#55c8ff',
  },

  completedDot: {
    backgroundColor: '#0bdc73',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  scheduledText: {
    color: '#55c8ff',
  },

  completedText: {
    color: '#0bdc73',
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
    marginLeft: 10,
  },

  dateText: {
    color: '#71808a',
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },

  teamsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },

  teamAvatar: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: '#14342d',
    borderWidth: 1,
    borderColor: '#1c493c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  teamAvatarText: {
    color: '#0bdc73',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  teamName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    minHeight: 38,
    lineHeight: 18,
  },

  teamType: {
    color: '#657985',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 4,
  },

  vsArea: {
    width: 75,
    alignItems: 'center',
    paddingTop: 7,
  },

  vsCircle: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: '#0b1b24',
    borderWidth: 1,
    borderColor: '#28414d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vsText: {
    color: '#8fa0aa',
    fontSize: 14,
    fontWeight: '900',
  },

  resultCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 19,
    padding: 17,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  resultIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  resultTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 3,
  },

  resultSubtitle: {
    color: '#71808a',
    fontSize: 12,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  scoreColumn: {
    alignItems: 'center',
  },

  scoreLabel: {
    color: '#9aa9b2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  scoreInput: {
    width: 90,
    height: 76,
    borderWidth: 1,
    borderColor: '#28414d',
    borderRadius: 16,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#0b1b24',
  },

  scoreTeamType: {
    color: '#657985',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 7,
  },

  separatorArea: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },

  scoreSeparator: {
    color: '#71808a',
    fontSize: 31,
    fontWeight: '900',
  },

  infoCard: {
    backgroundColor: '#12303c',
    borderWidth: 1,
    borderColor: '#1c4352',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  infoText: {
    flex: 1,
    color: '#9fc6d7',
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },

  saveButton: {
    minHeight: 53,
    backgroundColor: '#0bdc73',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#07151d',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 60,
  },
});