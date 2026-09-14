import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { getErrorMessage } from '@/lib/errors';
import { getSportName, getStatusLabel } from '@/lib/labels';
import { listOwnedTournaments } from '@/lib/tournaments';
import type { Tournament } from '@/types/models';

export default function TournamentsScreen() {
  const [tournaments, setTournaments] =
    useState<Tournament[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setTournaments(await listOwnedTournaments());
    } catch (error) {
      Alert.alert(
        'Greška',
        getErrorMessage(error, 'Nije moguće učitati turnire.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTournaments();
    }, [loadTournaments])
  );

  const openTournament = (id: string) => {
    router.push({
      pathname: '/tournaments/details',
      params: { id },
    });
  };

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Moji turniri
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Pregledajte i upravljajte svojim turnirima.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.addButton
            }
            onPress={() =>
              router.push('/tournaments/create')
            }
          >
            <Ionicons
              name="add"
              size={25}
              color="#07151d"
            />
          </TouchableOpacity>
        </View>

        {/* BROJ TURNIRA */}
        {!loading && (
          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={
                styles.summaryIcon
              }
            >
              <Ionicons
                name="trophy-outline"
                size={24}
                color="#0bdc73"
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Ukupno turnira
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {
                  tournaments.length
                }
              </Text>
            </View>

            <View
              style={
                styles.activeBadge
              }
            >
              <View
                style={
                  styles.activeDot
                }
              />

              <Text
                style={
                  styles.activeText
                }
              >
                Vaši turniri
              </Text>
            </View>
          </View>
        )}

        {/* LOADING */}
        {loading ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color="#0bdc73"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Učitavanje turnira...
            </Text>
          </View>
        ) : tournaments.length ===
          0 ? (
          /* EMPTY */
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="trophy-outline"
                size={38}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Još nemate turnira
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Kreirajte prvi turnir i počnite dodavati ekipe, utakmice i rezultate.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.emptyButton
              }
              onPress={() =>
                router.push('/tournaments/create')
              }
            >
              <Ionicons
                name="add-circle-outline"
                size={21}
                color="#07151d"
              />

              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Kreiraj turnir
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Vaši turniri
            </Text>

            {tournaments.map(
              (
                tournament
              ) => (
                <TouchableOpacity
                  key={
                    tournament.id
                  }
                  activeOpacity={
                    0.88
                  }
                  style={
                    styles.tournamentCard
                  }
                  onPress={() =>
                    openTournament(
                      tournament.id
                    )
                  }
                >
                  {/* IMAGE */}
                  <View
                    style={
                      styles.imageContainer
                    }
                  >
                    {tournament.imageUrl ? (
                      <Image
                        source={{
                          uri:
                            tournament.imageUrl,
                        }}
                        style={
                          styles.image
                        }
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={
                          styles.imagePlaceholder
                        }
                      >
                        <View
                          style={
                            styles.placeholderIcon
                          }
                        >
                          <Ionicons
                            name="trophy-outline"
                            size={34}
                            color="#0bdc73"
                          />
                        </View>

                        <Text
                          style={
                            styles.placeholderText
                          }
                        >
                          Nema slike
                        </Text>
                      </View>
                    )}

                    {/* STATUS */}
                    <View
                      style={
                        styles.statusBadge
                      }
                    >
                      <View
                        style={
                          styles.statusDot
                        }
                      />

                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {getStatusLabel(
                          tournament.status
                        )}
                      </Text>
                    </View>

                    {/* SPORT */}
                    <View
                      style={
                        styles.sportBadge
                      }
                    >
                      <Ionicons
                        name="football-outline"
                        size={14}
                        color="#55c8ff"
                      />

                      <Text
                        style={
                          styles.sportText
                        }
                      >
                        {getSportName(
                          tournament.sportType
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* CONTENT */}
                  <View
                    style={
                      styles.cardContent
                    }
                  >
                    <View
                      style={
                        styles.cardTitleRow
                      }
                    >
                      <Text
                        numberOfLines={
                          2
                        }
                        style={
                          styles.tournamentName
                        }
                      >
                        {
                          tournament.name
                        }
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={21}
                        color="#71808a"
                      />
                    </View>

                    {/* ORGANIZATOR */}
                    <View
                      style={
                        styles.organizerRow
                      }
                    >
                      <View
                        style={
                          styles.organizerIcon
                        }
                      >
                        <Ionicons
                          name="people-outline"
                          size={17}
                          color="#0bdc73"
                        />
                      </View>

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={
                            styles.organizerLabel
                          }
                        >
                          Organizator
                        </Text>

                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.organizerValue
                          }
                        >
                          {tournament.organizerName?.trim()
                            ? tournament.organizerName
                            : 'Organizator nije naveden'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.divider
                      }
                    />

                    {/* INFO */}
                    <View
                      style={
                        styles.infoGrid
                      }
                    >
                      <View
                        style={
                          styles.infoItem
                        }
                      >
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color="#0bdc73"
                        />

                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Grad
                          </Text>

                          <Text
                            numberOfLines={
                              1
                            }
                            style={
                              styles.infoValue
                            }
                          >
                            {
                              tournament.city
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.infoItem
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#0bdc73"
                        />

                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Datum
                          </Text>

                          <Text
                            numberOfLines={
                              1
                            }
                            style={
                              styles.infoValue
                            }
                          >
                            {
                              tournament.startDate
                            }
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* TEREN */}
                    <View
                      style={
                        styles.venueRow
                      }
                    >
                      <View
                        style={
                          styles.venueIcon
                        }
                      >
                        <Ionicons
                          name="football-outline"
                          size={18}
                          color="#0bdc73"
                        />
                      </View>

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={
                            styles.infoLabel
                          }
                        >
                          Teren
                        </Text>

                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.infoValue
                          }
                        >
                          {
                            tournament.venue
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            )}
          </>
        )}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        '#07151d',
    },

    container: {
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 40,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 22,
    },

    headerTextContainer: {
      flex: 1,
      marginRight: 14,
    },

    title: {
      color: '#ffffff',
      fontSize: 29,
      fontWeight: '900',
      marginBottom: 5,
    },

    subtitle: {
      color: '#8fa0aa',
      fontSize: 13,
      lineHeight: 19,
    },

    addButton: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        '#0bdc73',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    summaryCard: {
      minHeight: 79,
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 17,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 27,
    },

    summaryIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        '#15342f',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 12,
    },

    summaryLabel: {
      color: '#71808a',
      fontSize: 11,
      marginBottom: 2,
    },

    summaryValue: {
      color: '#ffffff',
      fontSize: 21,
      fontWeight: '900',
    },

    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor:
        '#12342d',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
    },

    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        '#0bdc73',
    },

    activeText: {
      color: '#0bdc73',
      fontSize: 10,
      fontWeight: '800',
    },

    sectionTitle: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 14,
    },

    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 70,
    },

    loadingText: {
      color: '#8fa0aa',
      marginTop: 12,
      fontSize: 14,
    },

    emptyCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 19,
      paddingVertical: 34,
      paddingHorizontal: 22,
      alignItems: 'center',
    },

    emptyIcon: {
      width: 69,
      height: 69,
      borderRadius: 21,
      backgroundColor:
        '#15342f',
      alignItems: 'center',
      justifyContent:
        'center',
      marginBottom: 14,
    },

    emptyTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 7,
    },

    emptyText: {
      color: '#8fa0aa',
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      maxWidth: 290,
      marginBottom: 20,
    },

    emptyButton: {
      minHeight: 50,
      paddingHorizontal: 20,
      borderRadius: 13,
      backgroundColor:
        '#0bdc73',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    emptyButtonText: {
      color: '#07151d',
      fontWeight: '800',
      fontSize: 14,
    },

    tournamentCard: {
      backgroundColor:
        '#10232e',
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        '#1c3542',
      overflow: 'hidden',
      marginBottom: 17,
    },

    imageContainer: {
      position: 'relative',
      height: 180,
      backgroundColor:
        '#0b1c25',
    },

    image: {
      width: '100%',
      height: '100%',
    },

    imagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#0b1c25',
    },

    placeholderIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#15342f',
      marginBottom: 8,
    },

    placeholderText: {
      color: '#71808a',
      fontSize: 12,
      fontWeight: '600',
    },

    statusBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor:
        'rgba(7, 21, 29, 0.92)',
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        '#0bdc73',
    },

    statusText: {
      color: '#0bdc73',
      fontSize: 10,
      fontWeight: '800',
    },

    sportBadge: {
      position: 'absolute',
      left: 12,
      bottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor:
        'rgba(7, 21, 29, 0.92)',
    },

    sportText: {
      color: '#55c8ff',
      fontSize: 10,
      fontWeight: '800',
    },

    cardContent: {
      padding: 16,
    },

    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 10,
      marginBottom: 14,
    },

    tournamentName: {
      flex: 1,
      color: '#ffffff',
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 25,
    },

    organizerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#0d202a',
      borderRadius: 13,
      padding: 11,
      marginBottom: 14,
    },

    organizerIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        '#15342f',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    organizerLabel: {
      color: '#71808a',
      fontSize: 10,
      marginBottom: 2,
    },

    organizerValue: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '700',
    },

    divider: {
      height: 1,
      backgroundColor:
        '#1c3542',
      marginBottom: 14,
    },

    infoGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },

    infoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    infoLabel: {
      color: '#71808a',
      fontSize: 10,
      marginBottom: 2,
    },

    infoValue: {
      color: '#c4ced4',
      fontSize: 12,
      fontWeight: '700',
    },

    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#0d202a',
      borderRadius: 12,
      padding: 10,
    },

    venueIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        '#15342f',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 9,
    },

    bottomSpace: {
      height: 40,
    },
  });