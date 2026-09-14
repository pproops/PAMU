import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppModal from '@/components/AppModal';
import { useAppModal } from '@/hooks/use-app-modal';
import { formatDate, formatScheduledAt, formatTime } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import { addMatch, deleteMatch, listMatches } from '@/lib/matches';
import { readParam } from '@/lib/params';
import { listTeams } from '@/lib/teams';
import type { Match, Team } from '@/types/models';

export default function MatchesScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = readParam(params.id);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [matches, setMatches] =
    useState<Match[]>([]);

  const [
    homeTeamId,
    setHomeTeamId,
  ] = useState('');

  const [
    awayTeamId,
    setAwayTeamId,
  ] = useState('');

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date>(
    new Date()
  );

  const [
    selectedTime,
    setSelectedTime,
  ] = useState<Date>(
    new Date()
  );

  const [
    dateSelected,
    setDateSelected,
  ] = useState(false);

  const [
    timeSelected,
    setTimeSelected,
  ] = useState(false);

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const { showModal, modalProps } = useAppModal();

  const buildScheduledAt = () => {
    if (!dateSelected || !timeSelected) {
      return '';
    }

    return formatScheduledAt(selectedDate, selectedTime);
  };

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [teamList, matchList] = await Promise.all([
        listTeams(id),
        listMatches(id),
      ]);
      setTeams(teamList);
      setMatches(matchList);
    } catch (error) {
      showModal(
        'error',
        'Greška',
        getErrorMessage(error, 'Nije moguće učitati utakmice.')
      );
    } finally {
      setLoading(false);
    }
  }, [id, showModal]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  const handleDateValueChange = (_event: unknown, date: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    setSelectedDate(date);
    setDateSelected(true);
  };

  const handleTimeValueChange = (_event: unknown, time: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    setSelectedTime(time);
    setTimeSelected(true);
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  const handleTimeDismiss = () => {
    setShowTimePicker(false);
  };

  const handleAddMatch =
    async () => {
      Keyboard.dismiss();

      if (!id) {
        showModal(
          'error',
          'Greška',
          'ID turnira nije pronađen.'
        );

        return;
      }

      if (
        !homeTeamId ||
        !awayTeamId
      ) {
        showModal(
          'error',
          'Odaberite ekipe',
          'Potrebno je odabrati domaću i gostujuću ekipu.'
        );

        return;
      }

      if (
        homeTeamId ===
        awayTeamId
      ) {
        showModal(
          'error',
          'Neispravan odabir',
          'Domaća i gostujuća ekipa ne mogu biti iste.'
        );

        return;
      }

      if (
        !dateSelected ||
        !timeSelected
      ) {
        showModal(
          'error',
          'Nedostaje termin',
          'Odaberite datum i vrijeme utakmice.'
        );

        return;
      }

      const scheduledAt =
        buildScheduledAt();

      try {
        setSaving(true);
        await addMatch(id, homeTeamId, awayTeamId, scheduledAt);
        setHomeTeamId('');
        setAwayTeamId('');
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setDateSelected(false);
        setTimeSelected(false);
        setShowDatePicker(false);
        setShowTimePicker(false);
        await loadData();
        showModal(
          'success',
          'Utakmica je dodana!',
          'Nova utakmica je uspješno dodana u raspored.'
        );
      } catch (error) {
        showModal(
          'error',
          'Dodavanje nije uspjelo',
          getErrorMessage(error, 'Nije moguće dodati utakmicu.')
        );
      } finally {
        setSaving(false);
      }
    };

  const removeMatch = async (matchId: string) => {
    try {
      setDeleting(true);
      await deleteMatch(id, matchId);
      await loadData();
      showModal(
        'success',
        'Utakmica je obrisana!',
        'Utakmica je uspješno uklonjena iz rasporeda.'
      );
    } catch (error) {
      showModal(
        'error',
        'Brisanje nije uspjelo',
        getErrorMessage(error, 'Nije moguće obrisati utakmicu.')
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMatch = (
    matchId: string
  ) => {
    showModal(
      'delete',
      'Obrisati utakmicu?',
      'Jeste li sigurni da želite obrisati ovu utakmicu? Ova radnja se ne može poništiti.',
      () => removeMatch(matchId),
      {
        confirmText:
          'Obriši',

        cancelText:
          'Odustani',

        showCancel:
          true,
      }
    );
  };

  const getTeam = (
    teamId: string
  ) => {
    return teams.find(
      team =>
        team.id ===
        teamId
    );
  };

  const getTeamName = (
    teamId: string
  ) => {
    return (
      getTeam(teamId)
        ?.name ??
      'Nepoznata ekipa'
    );
  };

  const getShortName = (
    teamId: string
  ) => {
    return (
      getTeam(teamId)
        ?.shortName ??
      '---'
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title:
            'Utakmice',

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="football-outline"
              size={27}
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
                styles.title
              }
            >
              Utakmice
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Dodajte raspored i pratite rezultate utakmica.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.formCard
          }
        >
          <View
            style={
              styles.formHeading
            }
          >
            <View
              style={
                styles.smallIcon
              }
            >
              <Ionicons
                name="add-outline"
                size={20}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.formTitle
              }
            >
              Nova utakmica
            </Text>
          </View>

          <Text
            style={
              styles.label
            }
          >
            Domaća ekipa
          </Text>

          <View
            style={
              styles.teamSelection
            }
          >
            {teams
              .filter(team => team.id !== awayTeamId)
              .map(team => {
                const selected =
                  homeTeamId ===
                  team.id;

                return (
                  <TouchableOpacity
                    key={
                      team.id
                    }
                    activeOpacity={
                      0.85
                    }
                    style={[
                      styles.teamOption,

                      selected &&
                        styles.teamOptionSelected,
                    ]}
                    onPress={() => {
                      setHomeTeamId(team.id);

                      if (awayTeamId === team.id) {
                        setAwayTeamId('');
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.teamBadge,

                        selected &&
                          styles.teamBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.teamBadgeText,

                          selected &&
                            styles.teamBadgeTextSelected,
                        ]}
                      >
                        {team.shortName}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={
                        1
                      }
                      style={[
                        styles.teamOptionText,

                        selected &&
                          styles.teamOptionTextSelected,
                      ]}
                    >
                      {team.name}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color="#07151d"
                      />
                    )}
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <Text
            style={[
              styles.label,
              {
                marginTop:
                  15,
              },
            ]}
          >
            Gostujuća ekipa
          </Text>

          <View
            style={
              styles.teamSelection
            }
          >
            {teams
              .filter(team => team.id !== homeTeamId)
              .map(team => {
                const selected =
                  awayTeamId ===
                  team.id;

                return (
                  <TouchableOpacity
                    key={
                      team.id
                    }
                    activeOpacity={
                      0.85
                    }
                    style={[
                      styles.teamOption,

                      selected &&
                        styles.teamOptionSelected,
                    ]}
                    onPress={() => {
                      setAwayTeamId(team.id);

                      if (homeTeamId === team.id) {
                        setHomeTeamId('');
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.teamBadge,

                        selected &&
                          styles.teamBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.teamBadgeText,

                          selected &&
                            styles.teamBadgeTextSelected,
                        ]}
                      >
                        {team.shortName}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={
                        1
                      }
                      style={[
                        styles.teamOptionText,

                        selected &&
                          styles.teamOptionTextSelected,
                      ]}
                    >
                      {team.name}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color="#07151d"
                      />
                    )}
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {teams.length ===
            0 && (
            <View
              style={
                styles.noTeamsBox
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#55c8ff"
              />

              <Text
                style={
                  styles.noTeamsText
                }
              >
                Prvo dodajte ekipe kako biste mogli kreirati utakmicu.
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.label,
              styles.dateLabel,
            ]}
          >
            Datum utakmice
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.pickerButton
            }
            onPress={() => {
              Keyboard.dismiss();

              setShowDatePicker(
                true
              );
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#0bdc73"
            />

            <Text
              style={[
                styles.pickerText,

                !dateSelected &&
                  styles.pickerPlaceholder,
              ]}
            >
              {dateSelected
                ? formatDate(
                    selectedDate
                  )
                : 'Odaberite datum'}
            </Text>

            <Ionicons
              name="chevron-down-outline"
              size={18}
              color="#71808a"
            />
          </TouchableOpacity>

          {showDatePicker && (
            <View
              style={
                styles.pickerContainer
              }
            >
              <DateTimePicker
                value={
                  selectedDate
                }
                mode="date"
                display={
                  Platform.OS ===
                  'ios'
                    ? 'spinner'
                    : 'default'
                }
                minimumDate={
                  new Date()
                }
                onValueChange={handleDateValueChange}
                onDismiss={handleDateDismiss}
              />

              {Platform.OS ===
                'ios' && (
                <TouchableOpacity
                  style={
                    styles.iosConfirm
                  }
                  onPress={() => {
                    setDateSelected(
                      true
                    );

                    setShowDatePicker(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.iosConfirmText
                    }
                  >
                    Potvrdi datum
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text
            style={[
              styles.label,
              {
                marginTop:
                  15,
              },
            ]}
          >
            Vrijeme utakmice
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.pickerButton
            }
            onPress={() => {
              Keyboard.dismiss();

              setShowTimePicker(
                true
              );
            }}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color="#0bdc73"
            />

            <Text
              style={[
                styles.pickerText,

                !timeSelected &&
                  styles.pickerPlaceholder,
              ]}
            >
              {timeSelected
                ? formatTime(
                    selectedTime
                  )
                : 'Odaberite vrijeme'}
            </Text>

            <Ionicons
              name="chevron-down-outline"
              size={18}
              color="#71808a"
            />
          </TouchableOpacity>

          {showTimePicker && (
            <View
              style={
                styles.pickerContainer
              }
            >
              <DateTimePicker
                value={
                  selectedTime
                }
                mode="time"
                is24Hour
                display={
                  Platform.OS ===
                  'ios'
                    ? 'spinner'
                    : 'default'
                }
                onValueChange={handleTimeValueChange}
                onDismiss={handleTimeDismiss}
              />

              {Platform.OS ===
                'ios' && (
                <TouchableOpacity
                  style={
                    styles.iosConfirm
                  }
                  onPress={() => {
                    setTimeSelected(
                      true
                    );

                    setShowTimePicker(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.iosConfirmText
                    }
                  >
                    Potvrdi vrijeme
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            activeOpacity={
              0.88
            }
            style={[
              styles.addButton,

              saving &&
                styles.disabledButton,
            ]}
            onPress={
              handleAddMatch
            }
            disabled={
              saving
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={21}
              color="#07151d"
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              {saving
                ? 'Dodavanje...'
                : 'Dodaj utakmicu'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Raspored utakmica
          </Text>

          <View
            style={
              styles.countBadge
            }
          >
            <Text
              style={
                styles.countText
              }
            >
              {matches.length}
            </Text>
          </View>
        </View>

        {loading ? (
          <View
            style={
              styles.loadingCard
            }
          >
            <ActivityIndicator
              size="small"
              color="#0bdc73"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Učitavanje utakmica...
            </Text>
          </View>
        ) : matches.length ===
          0 ? (
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
                name="football-outline"
                size={30}
                color="#0bdc73"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Još nema utakmica
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Dodajte prvu utakmicu i definirajte datum i vrijeme odigravanja.
            </Text>
          </View>
        ) : (
          matches.map(
            match => {
              const completed =
                match.status ===
                'completed';

              return (
                <View
                  key={
                    match.id
                  }
                  style={
                    styles.matchCard
                  }
                >
                  <View
                    style={
                      styles.matchTop
                    }
                  >
                    <View
                      style={
                        styles.dateRow
                      }
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#8fa0aa"
                      />

                      <Text
                        style={
                          styles.matchDate
                        }
                      >
                        {
                          match.scheduledAt
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,

                        completed
                          ? styles.completedBadge
                          : styles.scheduledBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,

                          completed
                            ? styles.completedText
                            : styles.scheduledText,
                        ]}
                      >
                        {completed
                          ? 'Završena'
                          : 'Zakazana'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.teamsRow
                    }
                  >
                    <View
                      style={
                        styles.teamColumn
                      }
                    >
                      <View
                        style={
                          styles.matchTeamLogo
                        }
                      >
                        <Text
                          style={
                            styles.matchTeamLogoText
                          }
                        >
                          {getShortName(
                            match.homeTeamId
                          )}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={
                          2
                        }
                        style={
                          styles.matchTeamName
                        }
                      >
                        {getTeamName(
                          match.homeTeamId
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.scoreColumn
                      }
                    >
                      {completed &&
                      match.homeScore !==
                        null &&
                      match.awayScore !==
                        null ? (
                        <Text
                          style={
                            styles.score
                          }
                        >
                          {
                            match.homeScore
                          }
                          {' : '}
                          {
                            match.awayScore
                          }
                        </Text>
                      ) : (
                        <View
                          style={
                            styles.vsCircle
                          }
                        >
                          <Text
                            style={
                              styles.vsText
                            }
                          >
                            VS
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={
                        styles.teamColumn
                      }
                    >
                      <View
                        style={
                          styles.matchTeamLogo
                        }
                      >
                        <Text
                          style={
                            styles.matchTeamLogoText
                          }
                        >
                          {getShortName(
                            match.awayTeamId
                          )}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={
                          2
                        }
                        style={
                          styles.matchTeamName
                        }
                      >
                        {getTeamName(
                          match.awayTeamId
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.matchDivider
                    }
                  />

                  <View
                    style={
                      styles.actionsRow
                    }
                  >
                    <TouchableOpacity
                      activeOpacity={
                        0.85
                      }
                      style={
                        styles.resultButton
                      }
                      onPress={() =>
                        router.push(
                          {
                            pathname:
                              '/tournaments/edit-match',

                            params:
                              {
                                matchId:
                                  match.id,
                              },
                          }
                        )
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={17}
                        color="#55c8ff"
                      />

                      <Text
                        style={
                          styles.resultButtonText
                        }
                      >
                        {completed
                          ? 'Uredi rezultat'
                          : 'Unesi rezultat'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={
                        0.85
                      }
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        handleDeleteMatch(
                          match.id
                        )
                      }
                      disabled={
                        deleting
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ff6b6b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
          )
        )}

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
      paddingTop: 22,
      paddingBottom: 60,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      marginBottom: 22,
    },

    headerIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    title: {
      color: '#ffffff',
      fontSize: 25,
      fontWeight: '900',
      marginBottom: 3,
    },

    subtitle: {
      color: '#8fa0aa',
      fontSize: 12,
      lineHeight: 18,
    },

    formCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 19,
      padding: 16,
      marginBottom: 25,
    },

    formHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 18,
    },

    smallIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      backgroundColor:
        '#14342d',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    formTitle: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '900',
    },

    label: {
      color: '#c4ced4',
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 8,
    },

    teamSelection: {
      gap: 8,
    },

    teamOption: {
      minHeight: 51,
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 11,
      gap: 9,
    },

    teamOptionSelected: {
      backgroundColor:
        '#0bdc73',
      borderColor:
        '#0bdc73',
    },

    teamBadge: {
      minWidth: 42,
      height: 32,
      borderRadius: 9,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
      paddingHorizontal: 6,
    },

    teamBadgeSelected: {
      backgroundColor:
        '#12342d',
    },

    teamBadgeText: {
      color: '#0bdc73',
      fontSize: 10,
      fontWeight: '900',
    },

    teamBadgeTextSelected: {
      color: '#0bdc73',
    },

    teamOptionText: {
      flex: 1,
      color: '#c4ced4',
      fontSize: 12,
      fontWeight: '700',
    },

    teamOptionTextSelected: {
      color: '#07151d',
      fontWeight: '900',
    },

    noTeamsBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor:
        '#102b39',
      padding: 11,
      borderRadius: 11,
      marginTop: 11,
    },

    noTeamsText: {
      flex: 1,
      color: '#8fa0aa',
      fontSize: 10,
      lineHeight: 15,
    },

    dateLabel: {
      marginTop: 18,
    },

    pickerButton: {
      minHeight: 52,
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 13,
      backgroundColor:
        '#0d202a',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
      gap: 10,
    },

    pickerText: {
      flex: 1,
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '700',
    },

    pickerPlaceholder: {
      color: '#647680',
      fontWeight: '400',
    },

    pickerContainer: {
      marginTop: 9,
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 13,
      padding: 8,
      overflow: 'hidden',
    },

    iosConfirm: {
      minHeight: 43,
      backgroundColor:
        '#0bdc73',
      borderRadius: 10,
      justifyContent:
        'center',
      alignItems:
        'center',
      margin: 8,
    },

    iosConfirmText: {
      color: '#07151d',
      fontWeight: '900',
    },

    addButton: {
      minHeight: 53,
      backgroundColor:
        '#0bdc73',
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems:
        'center',
      gap: 8,
      marginTop: 20,
    },

    addButtonText: {
      color: '#07151d',
      fontSize: 14,
      fontWeight: '900',
    },

    disabledButton: {
      opacity: 0.55,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    sectionTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '900',
    },

    countBadge: {
      minWidth: 32,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        '#14342d',
      paddingHorizontal: 9,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    countText: {
      color: '#0bdc73',
      fontSize: 12,
      fontWeight: '900',
    },

    loadingCard: {
      minHeight: 110,
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 17,
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems:
        'center',
      gap: 10,
    },

    loadingText: {
      color: '#8fa0aa',
      fontSize: 12,
    },

    emptyCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 18,
      paddingVertical: 30,
      paddingHorizontal: 20,
      alignItems: 'center',
    },

    emptyIcon: {
      width: 57,
      height: 57,
      borderRadius: 18,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
      marginBottom: 11,
    },

    emptyTitle: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '900',
      marginBottom: 5,
    },

    emptyText: {
      color: '#71808a',
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
    },

    matchCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 18,
      padding: 14,
      marginBottom: 11,
    },

    matchTop: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },

    matchDate: {
      color: '#8fa0aa',
      fontSize: 10,
      fontWeight: '700',
    },

    statusBadge: {
      borderRadius: 15,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    completedBadge: {
      backgroundColor:
        '#14342d',
    },

    scheduledBadge: {
      backgroundColor:
        '#102b39',
    },

    statusText: {
      fontSize: 9,
      fontWeight: '900',
    },

    completedText: {
      color: '#0bdc73',
    },

    scheduledText: {
      color: '#55c8ff',
    },

    teamsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    teamColumn: {
      flex: 1,
      alignItems: 'center',
    },

    matchTeamLogo: {
      minWidth: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor:
        '#14342d',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 6,
      marginBottom: 7,
    },

    matchTeamLogoText: {
      color: '#0bdc73',
      fontSize: 10,
      fontWeight: '900',
    },

    matchTeamName: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 15,
    },

    scoreColumn: {
      width: 75,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    score: {
      color: '#ffffff',
      fontSize: 22,
      fontWeight: '900',
    },

    vsCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    vsText: {
      color: '#71808a',
      fontSize: 10,
      fontWeight: '900',
    },

    matchDivider: {
      height: 1,
      backgroundColor:
        '#19333f',
      marginVertical: 14,
    },

    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },

    resultButton: {
      flex: 1,
      minHeight: 40,
      backgroundColor:
        '#102b39',
      borderRadius: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 6,
    },

    resultButtonText: {
      color: '#55c8ff',
      fontSize: 10,
      fontWeight: '800',
    },

    deleteButton: {
      width: 42,
      height: 40,
      borderRadius: 11,
      backgroundColor:
        '#26181d',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    bottomSpace: {
      height: 30,
    },
  });