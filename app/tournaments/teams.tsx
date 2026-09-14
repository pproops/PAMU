import { Ionicons } from '@expo/vector-icons';
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import AppModal from '@/components/AppModal';
import { useAppModal } from '@/hooks/use-app-modal';
import { getErrorMessage } from '@/lib/errors';
import { readParam } from '@/lib/params';
import { addTeam, deleteTeam, listTeams } from '@/lib/teams';
import type { Team } from '@/types/models';

export default function TeamsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = readParam(params.id);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showModal, modalProps } = useAppModal();

  const scrollTo = (y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, 250);
  };

  const loadTeams = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setTeams(await listTeams(id));
    } catch (error) {
      showModal(
        'error',
        'Greška',
        getErrorMessage(error, 'Nije moguće učitati ekipe.')
      );
    } finally {
      setLoading(false);
    }
  }, [id, showModal]);

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [loadTeams])
  );

  const handleAddTeam = async () => {
    Keyboard.dismiss();

    if (!name.trim() || !shortName.trim()) {
      showModal(
        'error',
        'Nedostaju podaci',
        'Unesite naziv i skraćeni naziv ekipe.'
      );
      return;
    }

    if (!id) {
      showModal('error', 'Greška', 'ID turnira nije pronađen.');
      return;
    }

    try {
      setSaving(true);
      const addedTeamName = name.trim();
      await addTeam(id, name, shortName);
      setName('');
      setShortName('');
      await loadTeams();
      showModal(
        'success',
        'Ekipa je dodana!',
        `${addedTeamName} je uspješno dodana na turnir.`
      );
    } catch (error) {
      showModal(
        'error',
        'Dodavanje nije uspjelo',
        getErrorMessage(error, 'Nije moguće dodati ekipu.')
      );
    } finally {
      setSaving(false);
    }
  };

  const removeTeam = async (teamId: string, teamName: string) => {
    try {
      setDeleting(true);
      await deleteTeam(id, teamId);
      await loadTeams();
      showModal(
        'success',
        'Ekipa je obrisana!',
        `${teamName} je uspješno uklonjena s turnira.`
      );
    } catch (error) {
      showModal(
        'error',
        'Brisanje nije uspjelo',
        getErrorMessage(error, 'Nije moguće obrisati ekipu.')
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    showModal(
      'delete',
      'Obrisati ekipu?',
      `Jeste li sigurni da želite obrisati ekipu "${teamName}"? Obrisat će se i njezine utakmice.`,
      () => removeTeam(teamId, teamName),
      {
        confirmText: 'Obriši',
        cancelText: 'Odustani',
        showCancel: true,
      }
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ekipe',

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

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        <TouchableWithoutFeedback
          onPress={
            Keyboard.dismiss
          }
        >
          <ScrollView
            ref={
              scrollViewRef
            }
            style={
              styles.screen
            }
            contentContainerStyle={
              styles.scrollContainer
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
                  name="people-outline"
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
                  Ekipe
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Dodajte i upravljajte ekipama turnira.
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
                  styles.formTitleRow
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
                  Dodaj novu ekipu
                </Text>
              </View>

              <Text
                style={
                  styles.label
                }
              >
                Naziv ekipe
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="shield-outline"
                  size={19}
                  color="#71808a"
                />

                <TextInput
                  value={name}
                  onChangeText={
                    setName
                  }
                  style={
                    styles.input
                  }
                  placeholder="npr. HNK Posušje"
                  placeholderTextColor="#647680"
                  onFocus={() =>
                    scrollTo(
                      80
                    )
                  }
                />
              </View>

              <Text
                style={
                  styles.label
                }
              >
                Skraćeni naziv
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="text-outline"
                  size={19}
                  color="#71808a"
                />

                <TextInput
                  value={
                    shortName
                  }
                  onChangeText={
                    setShortName
                  }
                  style={
                    styles.input
                  }
                  placeholder="npr. POS"
                  placeholderTextColor="#647680"
                  autoCapitalize="characters"
                  maxLength={5}
                  onFocus={() =>
                    scrollTo(
                      160
                    )
                  }
                />
              </View>

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
                  handleAddTeam
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
                    : 'Dodaj ekipu'}
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
                Dodane ekipe
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
                  {teams.length}
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
                  Učitavanje ekipa...
                </Text>
              </View>
            ) : teams.length ===
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
                    name="people-outline"
                    size={30}
                    color="#0bdc73"
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  Još nema ekipa
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Dodajte prvu ekipu pomoću obrasca iznad.
                </Text>
              </View>
            ) : (
              teams.map(
                (
                  team,
                  index
                ) => (
                  <View
                    key={
                      team.id
                    }
                    style={
                      styles.teamCard
                    }
                  >
                    <View
                      style={
                        styles.teamNumber
                      }
                    >
                      <Text
                        style={
                          styles.teamNumberText
                        }
                      >
                        {index +
                          1}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.teamLogo
                      }
                    >
                      <Text
                        style={
                          styles.teamLogoText
                        }
                      >
                        {team.shortName
                          .slice(
                            0,
                            3
                          )
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.teamInfo
                      }
                    >
                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.teamName
                        }
                      >
                        {
                          team.name
                        }
                      </Text>

                      <View
                        style={
                          styles.shortNameRow
                        }
                      >
                        <Text
                          style={
                            styles.shortNameLabel
                          }
                        >
                          Oznaka
                        </Text>

                        <View
                          style={
                            styles.shortNameBadge
                          }
                        >
                          <Text
                            style={
                              styles.shortNameText
                            }
                          >
                            {
                              team.shortName
                            }
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={
                        styles.actions
                      }
                    >
                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        style={
                          styles.editButton
                        }
                        onPress={() =>
                          router.push(
                            {
                              pathname:
                                '/tournaments/edit-team',

                              params:
                                {
                                  teamId:
                                    team.id,

                                  tournamentId:
                                    id,
                                },
                            }
                          )
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={
                            19
                          }
                          color="#55c8ff"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        style={
                          styles.deleteButton
                        }
                        onPress={() =>
                          handleDeleteTeam(
                            team.id,
                            team.name
                          )
                        }
                        disabled={
                          deleting
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={
                            19
                          }
                          color="#ff6b6b"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              )
            )}

            <View
              style={
                styles.bottomSpace
              }
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <AppModal {...modalProps} />
    </>
  );
}

const styles =
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      backgroundColor:
        '#07151d',
    },

    screen: {
      flex: 1,
      backgroundColor:
        '#07151d',
    },

    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 450,
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
      alignItems: 'center',
      justifyContent:
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

    formTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 17,
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

    inputContainer: {
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
      marginBottom: 16,
      gap: 9,
    },

    input: {
      flex: 1,
      color: '#ffffff',
      fontSize: 14,
      paddingVertical: 12,
    },

    addButton: {
      minHeight: 52,
      backgroundColor:
        '#0bdc73',
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
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
      paddingHorizontal: 9,
      borderRadius: 14,
      backgroundColor:
        '#14342d',
      alignItems: 'center',
      justifyContent:
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
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        '#1c3542',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
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
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
    },

    emptyIcon: {
      width: 57,
      height: 57,
      borderRadius: 18,
      backgroundColor:
        '#14342d',
      alignItems: 'center',
      justifyContent:
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

    teamCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 17,
      padding: 13,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },

    teamNumber: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor:
        '#0d202a',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 9,
    },

    teamNumberText: {
      color: '#71808a',
      fontSize: 10,
      fontWeight: '800',
    },

    teamLogo: {
      width: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor:
        '#14342d',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 11,
    },

    teamLogoText: {
      color: '#0bdc73',
      fontSize: 11,
      fontWeight: '900',
    },

    teamInfo: {
      flex: 1,
    },

    teamName: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 6,
    },

    shortNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    shortNameLabel: {
      color: '#71808a',
      fontSize: 9,
    },

    shortNameBadge: {
      backgroundColor:
        '#0d202a',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },

    shortNameText: {
      color: '#8fa0aa',
      fontSize: 9,
      fontWeight: '800',
    },

    actions: {
      flexDirection: 'row',
      gap: 7,
      marginLeft: 8,
    },

    editButton: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        '#102b39',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        '#26181d',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    bottomSpace: {
      height: 20,
    },
  });