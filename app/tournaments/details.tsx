import { Ionicons } from '@expo/vector-icons';
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppModal from '@/components/AppModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAppModal } from '@/hooks/use-app-modal';
import { getErrorMessage } from '@/lib/errors';
import { getSportName, getStatusLabel } from '@/lib/labels';
import { readParam } from '@/lib/params';
import { deleteTournament, getOwnedTournament } from '@/lib/tournaments';
import type { Tournament } from '@/types/models';

export default function TournamentDetailsScreen() {
  const params = useLocalSearchParams();
  const id = readParam(params.id);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { showModal, modalProps } = useAppModal();

  const loadTournament = useCallback(async () => {
    if (!id) {
      setLoading(false);
      showModal('error', 'Greška', 'ID turnira nije pronađen.');
      return;
    }

    try {
      setLoading(true);
      setTournament(await getOwnedTournament(id));
    } catch (error) {
      setTournament(null);
      showModal(
        'error',
        'Greška',
        getErrorMessage(error, 'Nije moguće učitati turnir.')
      );
    } finally {
      setLoading(false);
    }
  }, [id, showModal]);

  useFocusEffect(
    useCallback(() => {
      loadTournament();
    }, [loadTournament])
  );

  const openMap =
    async () => {
      if (
        tournament?.latitude ==
          null ||
        tournament?.longitude ==
          null
      ) {
        showModal(
          'info',
          'Lokacija nije dostupna',
          'Za ovaj turnir nije spremljena GPS lokacija.'
        );

        return;
      }

      try {
        const latitude =
          tournament.latitude;

        const longitude =
          tournament.longitude;

        const url =
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        const canOpen =
          await Linking.canOpenURL(
            url
          );

        if (canOpen) {
          await Linking.openURL(
            url
          );
        } else {
          showModal(
            'error',
            'Greška',
            'Nije moguće otvoriti kartu.'
          );
        }
      } catch (error) {
        showModal(
          'error',
          'Greška',
          getErrorMessage(error, 'Nije moguće otvoriti Google Maps.')
        );
      }
    };

  const removeTournament = async () => {
    if (!id) {
      return;
    }

    try {
      setDeleting(true);
      await deleteTournament(id);
      showModal(
        'success',
        'Turnir je obrisan!',
        'Turnir je uspješno uklonjen zajedno s ekipama i utakmicama.',
        () => router.replace('/(tabs)/tournaments')
      );
    } catch (error) {
      showModal(
        'error',
        'Brisanje nije uspjelo',
        getErrorMessage(error, 'Nije moguće obrisati turnir.')
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    if (!id) {
      return;
    }

    showModal(
      'delete',
      'Obrisati turnir?',
      'Jeste li sigurni da želite obrisati ovaj turnir? Ova radnja se ne može poništiti. Obrisat će se i ekipe i utakmice.',
      removeTournament,
      {
        confirmText: 'Obriši',
        cancelText: 'Odustani',
        showCancel: true,
      }
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title:
              'Detalji turnira',

            headerStyle: {
              backgroundColor:
                '#07151d',
            },

            headerTintColor:
              '#ffffff',

            headerShadowVisible:
              false,
          }}
        />

        <LoadingScreen message="Učitavanje turnira..." />

        <AppModal {...modalProps} />
      </>
    );
  }

  if (!tournament) {
    return (
      <>
        <Stack.Screen
          options={{
            title:
              'Detalji turnira',

            headerStyle: {
              backgroundColor:
                '#07151d',
            },

            headerTintColor:
              '#ffffff',

            headerShadowVisible:
              false,
          }}
        />

        <View
          style={
            styles.centerContainer
          }
        >
          <View
            style={
              styles.notFoundIcon
            }
          >
            <Ionicons
              name="trophy-outline"
              size={34}
              color="#71808a"
            />
          </View>

          <Text
            style={
              styles.notFoundTitle
            }
          >
            Turnir nije pronađen
          </Text>

          <Text
            style={
              styles.notFoundText
            }
          >
            Podaci o turniru nisu dostupni.
          </Text>
        </View>

        <AppModal {...modalProps} />
      </>
    );
  }

  const hasLocation =
    tournament.latitude !=
      null &&
    tournament.longitude !=
      null;

  const sportName = getSportName(tournament.sportType);

  return (
    <>
      <Stack.Screen
        options={{
          title:
            tournament.name,

          headerStyle: {
            backgroundColor:
              '#07151d',
          },

          headerTintColor:
            '#ffffff',

          headerShadowVisible:
            false,
        }}
      />

      <ScrollView
        style={
          styles.screen
        }
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {tournament.imageUrl ? (
          <Image
            source={{
              uri:
                tournament.imageUrl,
            }}
            style={
              styles.tournamentImage
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
                styles.imagePlaceholderTitle
              }
            >
              Nema slike
            </Text>

            <Text
              style={
                styles.imagePlaceholderText
              }
            >
              Za ovaj turnir nije dodana naslovna slika.
            </Text>
          </View>
        )}

        <View
          style={
            styles.titleRow
          }
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.title
              }
            >
              {tournament.name}
            </Text>

            <View
              style={
                styles.badgesRow
              }
            >
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
                  {getStatusLabel(tournament.status)}
                </Text>
              </View>

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
                    styles.sportBadgeText
                  }
                >
                  {sportName}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={
            styles.organizerCard
          }
        >
          <View
            style={
              styles.organizerIcon
            }
          >
            <Ionicons
              name="people-outline"
              size={23}
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
              Organizator turnira
            </Text>

            <Text
              style={
                styles.organizerValue
              }
            >
              {tournament.organizerName?.trim()
                ? tournament.organizerName
                : 'Nije navedeno'}
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Informacije
        </Text>

        <View
          style={
            styles.infoCard
          }
        >
          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="location-outline"
                size={19}
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
                Grad
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {tournament.city}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="football-outline"
                size={19}
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
                style={
                  styles.infoValue
                }
              >
                {tournament.venue}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="calendar-outline"
                size={19}
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
                Datum početka
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {tournament.startDate}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Lokacija
        </Text>

        <View
          style={
            styles.locationCard
          }
        >
          <View
            style={
              styles.locationTop
            }
          >
            <View
              style={
                styles.locationIcon
              }
            >
              <Ionicons
                name="navigate-outline"
                size={23}
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
                  styles.locationTitle
                }
              >
                GPS lokacija turnira
              </Text>

              <Text
                style={
                  styles.locationDescription
                }
              >
                {hasLocation
                  ? 'Lokacija je spremljena i dostupna na karti.'
                  : 'Za ovaj turnir još nije spremljena GPS lokacija.'}
              </Text>
            </View>
          </View>

          {hasLocation && (
            <View
              style={
                styles.coordinatesBox
              }
            >
              <Text
                style={
                  styles.coordinateText
                }
              >
                Latitude:{' '}
                {tournament.latitude?.toFixed(
                  6
                )}
              </Text>

              <Text
                style={
                  styles.coordinateText
                }
              >
                Longitude:{' '}
                {tournament.longitude?.toFixed(
                  6
                )}
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={[
              styles.mapButton,

              !hasLocation &&
                styles.mapButtonDisabled,
            ]}
            onPress={
              openMap
            }
          >
            <Ionicons
              name="map-outline"
              size={19}
              color={
                hasLocation
                  ? '#07151d'
                  : '#71808a'
              }
            />

            <Text
              style={[
                styles.mapButtonText,

                !hasLocation &&
                  styles.mapButtonTextDisabled,
              ]}
            >
              Otvori na karti
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Upravljanje turnirom
        </Text>

        <View
          style={
            styles.managementGrid
          }
        >
          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.managementCard
            }
            onPress={() =>
              router.push({
                pathname:
                  '/tournaments/teams',

                params: {
                  id,
                },
              })
            }
          >
            <View
              style={
                styles.managementIcon
              }
            >
              <Ionicons
                name="people-outline"
                size={25}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.managementTitle
              }
            >
              Ekipe
            </Text>

            <Text
              style={
                styles.managementText
              }
            >
              Dodavanje i uređivanje ekipa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.managementCard
            }
            onPress={() =>
              router.push({
                pathname:
                  '/tournaments/matches',

                params: {
                  id,
                },
              })
            }
          >
            <View
              style={
                styles.managementIcon
              }
            >
              <Ionicons
                name="football-outline"
                size={25}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.managementTitle
              }
            >
              Utakmice
            </Text>

            <Text
              style={
                styles.managementText
              }
            >
              Raspored i rezultati
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.managementCard
            }
            onPress={() =>
              router.push({
                pathname:
                  '/tournaments/standings',

                params: {
                  id,
                },
              })
            }
          >
            <View
              style={
                styles.managementIcon
              }
            >
              <Ionicons
                name="stats-chart-outline"
                size={25}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.managementTitle
              }
            >
              Tablica
            </Text>

            <Text
              style={
                styles.managementText
              }
            >
              Poredak i bodovi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.managementCard
            }
            onPress={() =>
              router.push({
                pathname:
                  '/tournaments/edit',

                params: {
                  id,
                },
              })
            }
          >
            <View
              style={
                styles.managementIcon
              }
            >
              <Ionicons
                name="create-outline"
                size={25}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.managementTitle
              }
            >
              Uredi
            </Text>

            <Text
              style={
                styles.managementText
              }
            >
              Promijenite podatke turnira
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={
            0.85
          }
          style={[
            styles.deleteButton,

            deleting &&
              styles.deleteButtonDisabled,
          ]}
          onPress={
            handleDelete
          }
          disabled={
            deleting
          }
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#ff6b6b"
          />

          <Text
            style={
              styles.deleteButtonText
            }
          >
            {deleting
              ? 'Brisanje...'
              : 'Obriši turnir'}
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      <AppModal {...modalProps} />
    </>
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
      paddingTop: 18,
    },

    centerContainer: {
      flex: 1,
      backgroundColor:
        '#07151d',
      justifyContent:
        'center',
      alignItems:
        'center',
      paddingHorizontal: 30,
    },

    loadingText: {
      color: '#8fa0aa',
      fontSize: 13,
      marginTop: 13,
    },

    notFoundIcon: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor:
        '#10232e',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 16,
    },

    notFoundTitle: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 6,
    },

    notFoundText: {
      color: '#71808a',
      fontSize: 13,
      textAlign: 'center',
    },

    tournamentImage: {
      width: '100%',
      height: 210,
      borderRadius: 20,
      backgroundColor:
        '#10232e',
      marginBottom: 20,
    },

    imagePlaceholder: {
      width: '100%',
      height: 210,
      borderRadius: 20,
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      justifyContent:
        'center',
      alignItems:
        'center',
      marginBottom: 20,
      paddingHorizontal: 25,
    },

    placeholderIcon: {
      width: 62,
      height: 62,
      borderRadius: 19,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
      marginBottom: 11,
    },

    imagePlaceholderTitle: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 4,
    },

    imagePlaceholderText: {
      color: '#71808a',
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 17,
    },

    titleRow: {
      marginBottom: 18,
    },

    title: {
      color: '#ffffff',
      fontSize: 27,
      fontWeight: '900',
      marginBottom: 10,
    },

    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#14342d',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 6,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        '#0bdc73',
    },

    statusText: {
      color: '#0bdc73',
      fontSize: 11,
      fontWeight: '800',
    },

    sportBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#102b39',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 5,
    },

    sportBadgeText: {
      color: '#55c8ff',
      fontSize: 11,
      fontWeight: '800',
    },

    organizerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 17,
      padding: 15,
      marginBottom: 25,
    },

    organizerIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    organizerLabel: {
      color: '#71808a',
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 3,
    },

    organizerValue: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
    },

    sectionTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '900',
      marginBottom: 11,
    },

    infoCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 18,
      paddingHorizontal: 15,
      marginBottom: 25,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 11,
    },

    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    infoLabel: {
      color: '#71808a',
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 2,
    },

    infoValue: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '700',
    },

    divider: {
      height: 1,
      backgroundColor:
        '#19333f',
    },

    locationCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 18,
      padding: 15,
      marginBottom: 25,
    },

    locationTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      marginBottom: 13,
    },

    locationIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    locationTitle: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 3,
    },

    locationDescription: {
      color: '#71808a',
      fontSize: 11,
      lineHeight: 16,
    },

    coordinatesBox: {
      backgroundColor:
        '#0d202a',
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },

    coordinateText: {
      color: '#8fa0aa',
      fontSize: 11,
      marginVertical: 2,
    },

    mapButton: {
      minHeight: 49,
      backgroundColor:
        '#0bdc73',
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    mapButtonDisabled: {
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
    },

    mapButtonText: {
      color: '#07151d',
      fontSize: 13,
      fontWeight: '900',
    },

    mapButtonTextDisabled: {
      color: '#71808a',
    },

    managementGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
      rowGap: 11,
      marginBottom: 24,
    },

    managementCard: {
      width: '48.5%',
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 17,
      padding: 14,
      minHeight: 138,
    },

    managementIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        '#14342d',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 11,
    },

    managementTitle: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '900',
      marginBottom: 4,
    },

    managementText: {
      color: '#71808a',
      fontSize: 10,
      lineHeight: 15,
    },

    deleteButton: {
      minHeight: 53,
      backgroundColor:
        '#26181d',
      borderWidth: 1,
      borderColor:
        '#5a2830',
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    deleteButtonDisabled: {
      opacity: 0.55,
    },

    deleteButtonText: {
      color: '#ff6b6b',
      fontSize: 14,
      fontWeight: '900',
    },

    bottomSpace: {
      height: 50,
    },
  });