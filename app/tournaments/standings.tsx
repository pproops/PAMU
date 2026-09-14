import { Ionicons } from '@expo/vector-icons';
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '@/lib/errors';
import { listMatches } from '@/lib/matches';
import { readParam } from '@/lib/params';
import { calculateStandings, formatGoalDifference } from '@/lib/standings';
import { listTeams } from '@/lib/teams';
import type { Standing } from '@/types/models';

export default function StandingsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = readParam(params.id);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStandings = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [teams, matches] = await Promise.all([
        listTeams(id),
        listMatches(id),
      ]);
      setStandings(calculateStandings(teams, matches));
    } catch (error) {
      Alert.alert(
        'Greška',
        getErrorMessage(error, 'Nije moguće učitati tablicu.')
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadStandings();
    }, [loadStandings])
  );


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#0bdc73"
        />

        <Text style={styles.loadingText}>
          Izračun tablice...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tablica',
          headerStyle: {
            backgroundColor: '#07151d',
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Tablica poretka
            </Text>

            <Text style={styles.subtitle}>
              Automatski poredak prema rezultatima
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="stats-chart"
              size={22}
              color="#0bdc73"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#55c8ff"
            />
          </View>

          <Text style={styles.infoText}>
            Tablica se automatski izračunava iz završenih utakmica.
          </Text>
        </View>

        {standings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="podium-outline"
                size={36}
                color="#0bdc73"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Nema ekipa
            </Text>

            <Text style={styles.emptyText}>
              Dodajte ekipe u turnir kako bi se prikazala tablica.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.tableCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
              >
                <View>
                  <View style={styles.tableHeader}>
                    <Text
                      style={
                        styles.positionHeader
                      }
                    >
                      #
                    </Text>

                    <Text
                      style={
                        styles.teamHeader
                      }
                    >
                      Ekipa
                    </Text>

                    <Text
                      style={
                        styles.statHeader
                      }
                    >
                      O
                    </Text>

                    <Text
                      style={
                        styles.statHeader
                      }
                    >
                      P
                    </Text>

                    <Text
                      style={
                        styles.statHeader
                      }
                    >
                      N
                    </Text>

                    <Text
                      style={
                        styles.statHeader
                      }
                    >
                      I
                    </Text>

                    <Text
                      style={
                        styles.goalsHeader
                      }
                    >
                      Gol
                    </Text>

                    <Text
                      style={
                        styles.statHeader
                      }
                    >
                      GR
                    </Text>

                    <Text
                      style={
                        styles.pointsHeader
                      }
                    >
                      B
                    </Text>
                  </View>

                  {standings.map(
                    (team, index) => {
                      const first =
                        index === 0;

                      return (
                        <View
                          key={
                            team.teamId
                          }
                          style={[
                            styles.tableRow,
                            index ===
                              standings.length -
                                1 &&
                              styles.lastTableRow,
                          ]}
                        >
                          <View
                            style={
                              styles.positionCell
                            }
                          >
                            <View
                              style={[
                                styles.positionBadge,
                                first &&
                                  styles.firstPositionBadge,
                              ]}
                            >
                              {first ? (
                                <Ionicons
                                  name="trophy"
                                  size={13}
                                  color="#07151d"
                                />
                              ) : (
                                <Text
                                  style={
                                    styles.positionText
                                  }
                                >
                                  {index + 1}
                                </Text>
                              )}
                            </View>
                          </View>

                          <View
                            style={
                              styles.teamCell
                            }
                          >
                            <View
                              style={
                                styles.teamAvatar
                              }
                            >
                              <Text
                                style={
                                  styles.teamAvatarText
                                }
                              >
                                {team.shortName
                                  ?.slice(
                                    0,
                                    3
                                  )
                                  .toUpperCase()}
                              </Text>
                            </View>

                            <View
                              style={
                                styles.teamText
                              }
                            >
                              <Text
                                style={
                                  styles.teamName
                                }
                                numberOfLines={
                                  1
                                }
                              >
                                {team.name}
                              </Text>

                              <Text
                                style={
                                  styles.teamDetails
                                }
                              >
                                {
                                  team.shortName
                                }
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={
                              styles.statCell
                            }
                          >
                            {team.played}
                          </Text>

                          <Text
                            style={[
                              styles.statCell,
                              styles.winsCell,
                            ]}
                          >
                            {team.wins}
                          </Text>

                          <Text
                            style={
                              styles.statCell
                            }
                          >
                            {team.draws}
                          </Text>

                          <Text
                            style={[
                              styles.statCell,
                              styles.lossesCell,
                            ]}
                          >
                            {team.losses}
                          </Text>

                          <Text
                            style={
                              styles.goalsCell
                            }
                          >
                            {
                              team.goalsFor
                            }
                            :
                            {
                              team.goalsAgainst
                            }
                          </Text>

                          <Text
                            style={[
                              styles.statCell,
                              team.goalDifference >
                                0 &&
                                styles.positiveGoalDifference,
                            ]}
                          >
                            {formatGoalDifference(
                              team.goalDifference
                            )}
                          </Text>

                          <View
                            style={
                              styles.pointsCell
                            }
                          >
                            <View
                              style={
                                styles.pointsBadge
                              }
                            >
                              <Text
                                style={
                                  styles.pointsText
                                }
                              >
                                {
                                  team.points
                                }
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    }
                  )}
                </View>
              </ScrollView>
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>
                  O
                </Text>

                <Text style={styles.legendText}>
                  Odigrano
                </Text>
              </View>

              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>
                  P
                </Text>

                <Text style={styles.legendText}>
                  Pobjede
                </Text>
              </View>

              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>
                  N
                </Text>

                <Text style={styles.legendText}>
                  Neriješeno
                </Text>
              </View>

              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>
                  I
                </Text>

                <Text style={styles.legendText}>
                  Izgubljeno
                </Text>
              </View>

              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>
                  GR
                </Text>

                <Text style={styles.legendText}>
                  Gol-razlika
                </Text>
              </View>

              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>
                  B
                </Text>

                <Text style={styles.legendText}>
                  Bodovi
                </Text>
              </View>
            </View>

            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                Detaljna statistika
              </Text>

              <Text style={styles.detailsSubtitle}>
                Pregled svake ekipe
              </Text>
            </View>

            {standings.map(
              (team, index) => (
                <View
                  key={`details-${team.teamId}`}
                  style={styles.detailsCard}
                >
                  <View style={styles.detailsTop}>
                    <View style={styles.detailsTeam}>
                      <View
                        style={[
                          styles.detailsPosition,
                          index === 0 &&
                            styles.detailsPositionFirst,
                        ]}
                      >
                        {index === 0 ? (
                          <Ionicons
                            name="trophy"
                            size={18}
                            color="#07151d"
                          />
                        ) : (
                          <Text
                            style={
                              styles.detailsPositionText
                            }
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>

                      <View style={styles.detailsAvatar}>
                        <Text style={styles.detailsAvatarText}>
                          {team.shortName
                            ?.slice(0, 3)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.detailsTeamText}>
                        <Text
                          style={styles.detailsTeamName}
                          numberOfLines={1}
                        >
                          {team.name}
                        </Text>

                        <Text
                          style={styles.detailsShortName}
                        >
                          {team.shortName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.bigPoints}>
                      <Text style={styles.bigPointsValue}>
                        {team.points}
                      </Text>

                      <Text style={styles.bigPointsLabel}>
                        BOD
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statisticsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {team.played}
                      </Text>

                      <Text style={styles.statLabel}>
                        Odigrano
                      </Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statBox}>
                      <Text
                        style={[
                          styles.statValue,
                          styles.greenValue,
                        ]}
                      >
                        {team.wins}
                      </Text>

                      <Text style={styles.statLabel}>
                        Pobjede
                      </Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {team.draws}
                      </Text>

                      <Text style={styles.statLabel}>
                        Neriješeno
                      </Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statBox}>
                      <Text
                        style={[
                          styles.statValue,
                          styles.redValue,
                        ]}
                      >
                        {team.losses}
                      </Text>

                      <Text style={styles.statLabel}>
                        Porazi
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalsSection}>
                    <View style={styles.goalStat}>
                      <View style={styles.goalStatIcon}>
                        <Ionicons
                          name="football-outline"
                          size={17}
                          color="#0bdc73"
                        />
                      </View>

                      <View>
                        <Text style={styles.goalStatLabel}>
                          Golovi
                        </Text>

                        <Text style={styles.goalStatValue}>
                          {team.goalsFor} :{' '}
                          {team.goalsAgainst}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.goalStat}>
                      <View style={styles.goalStatIcon}>
                        <Ionicons
                          name="trending-up-outline"
                          size={17}
                          color="#55c8ff"
                        />
                      </View>

                      <View>
                        <Text style={styles.goalStatLabel}>
                          Gol-razlika
                        </Text>

                        <Text style={styles.goalStatValue}>
                          {formatGoalDifference(
                            team.goalDifference
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
            )}
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07151d',
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 50,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07151d',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8fa0aa',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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

  infoCard: {
    backgroundColor: '#12303c',
    borderWidth: 1,
    borderColor: '#1c4352',
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#153a49',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    color: '#9fc6d7',
    fontSize: 12,
    lineHeight: 18,
  },

  emptyCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color: '#71808a',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  tableCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 18,
    overflow: 'hidden',
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b1b24',
    minHeight: 46,
    paddingHorizontal: 8,
  },

  positionHeader: {
    width: 42,
    color: '#71808a',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  teamHeader: {
    width: 155,
    color: '#71808a',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statHeader: {
    width: 42,
    color: '#71808a',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  goalsHeader: {
    width: 58,
    color: '#71808a',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  pointsHeader: {
    width: 48,
    color: '#0bdc73',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 67,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#19333f',
  },

  lastTableRow: {
    borderBottomWidth: 0,
  },

  positionCell: {
    width: 42,
    alignItems: 'center',
  },

  positionBadge: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#0b1b24',
    alignItems: 'center',
    justifyContent: 'center',
  },

  firstPositionBadge: {
    backgroundColor: '#0bdc73',
  },

  positionText: {
    color: '#9aa9b2',
    fontSize: 12,
    fontWeight: '800',
  },

  teamCell: {
    width: 155,
    flexDirection: 'row',
    alignItems: 'center',
  },

  teamAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  teamAvatarText: {
    color: '#0bdc73',
    fontSize: 10,
    fontWeight: '900',
  },

  teamText: {
    flex: 1,
  },

  teamName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  teamDetails: {
    color: '#71808a',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },

  statCell: {
    width: 42,
    color: '#c1ccd2',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  winsCell: {
    color: '#0bdc73',
  },

  lossesCell: {
    color: '#ff6577',
  },

  goalsCell: {
    width: 58,
    color: '#c1ccd2',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  positiveGoalDifference: {
    color: '#0bdc73',
  },

  pointsCell: {
    width: 48,
    alignItems: 'center',
  },

  pointsBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pointsText: {
    color: '#0bdc73',
    fontSize: 14,
    fontWeight: '900',
  },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 11,
    marginBottom: 27,
    gap: 10,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendKey: {
    color: '#d2dce1',
    fontSize: 9,
    fontWeight: '900',
    marginRight: 4,
  },

  legendText: {
    color: '#657985',
    fontSize: 9,
  },

  detailsHeader: {
    marginBottom: 13,
  },

  detailsTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 3,
  },

  detailsSubtitle: {
    color: '#71808a',
    fontSize: 12,
  },

  detailsCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  detailsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  detailsTeam: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  detailsPosition: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#0b1b24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  detailsPositionFirst: {
    backgroundColor: '#0bdc73',
  },

  detailsPositionText: {
    color: '#9aa9b2',
    fontSize: 13,
    fontWeight: '900',
  },

  detailsAvatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  detailsAvatarText: {
    color: '#0bdc73',
    fontSize: 11,
    fontWeight: '900',
  },

  detailsTeamText: {
    flex: 1,
  },

  detailsTeamName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  detailsShortName: {
    color: '#71808a',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },

  bigPoints: {
    minWidth: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bigPointsValue: {
    color: '#0bdc73',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },

  bigPointsLabel: {
    color: '#5c8d78',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  statisticsRow: {
    flexDirection: 'row',
    backgroundColor: '#0b1b24',
    borderRadius: 13,
    paddingVertical: 12,
    marginBottom: 13,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: '#1c3542',
  },

  statValue: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },

  greenValue: {
    color: '#0bdc73',
  },

  redValue: {
    color: '#ff6577',
  },

  statLabel: {
    color: '#657985',
    fontSize: 8,
    marginTop: 3,
  },

  goalsSection: {
    flexDirection: 'row',
    gap: 9,
  },

  goalStat: {
    flex: 1,
    minHeight: 58,
    backgroundColor: '#0d202a',
    borderRadius: 13,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  goalStatLabel: {
    color: '#657985',
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 2,
  },

  goalStatValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 30,
  },
});