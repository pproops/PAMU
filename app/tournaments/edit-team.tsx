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
import { readParam } from '@/lib/params';
import { getOwnedTeam, updateTeam } from '@/lib/teams';

export default function EditTeamScreen() {
  const params = useLocalSearchParams<{ teamId: string }>();
  const teamId = readParam(params.teamId);

  const scrollViewRef =
    useRef<ScrollView | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState('');

  const [shortName, setShortName] =
    useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTeam = async () => {
      if (!teamId) {
        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const data = await getOwnedTeam(teamId);

        if (!isMounted) {
          return;
        }

        setName(data.name);
        setShortName(data.shortName);
        setLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoading(false);

        Alert.alert(
          'Greška',
          getErrorMessage(error, 'Ekipa nije pronađena.'),
          [
            {
              text: 'U redu',
              onPress: () => router.back(),
            },
          ]
        );
      }
    };

    loadTeam();

    return () => {
      isMounted = false;
    };
  }, [teamId]);

  const scrollTo = (y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 250);
  };

  const handleUpdateTeam = async () => {
    if (!name.trim() || !shortName.trim()) {
      Alert.alert(
        'Greška',
        'Unesite naziv i skraćeni naziv ekipe.'
      );

      return;
    }

    if (!teamId) {
      Alert.alert(
        'Greška',
        'ID ekipe nije pronađen.'
      );

      return;
    }

    try {
      setSaving(true);
      await updateTeam(teamId, name, shortName);
      setSaving(false);

      Alert.alert(
        'Uspjeh',
        'Ekipa je uspješno uređena.',
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
        getErrorMessage(error, 'Nije moguće spremiti ekipu.')
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
          Učitavanje ekipe...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Uredi ekipu',
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
                    Uredi ekipu
                  </Text>

                  <Text style={styles.subtitle}>
                    Promijenite podatke ekipe
                  </Text>
                </View>

                <View style={styles.headerIcon}>
                  <Ionicons
                    name="create-outline"
                    size={22}
                    color="#0bdc73"
                  />
                </View>
              </View>

              <View style={styles.previewCard}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>
                    {shortName
                      .trim()
                      .slice(0, 3)
                      .toUpperCase() ||
                      name
                        .trim()
                        .slice(0, 2)
                        .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.previewText}>
                  <Text
                    style={styles.previewName}
                    numberOfLines={1}
                  >
                    {name || 'Naziv ekipe'}
                  </Text>

                  <View style={styles.shortBadge}>
                    <Text style={styles.shortBadgeText}>
                      {shortName
                        .trim()
                        .toUpperCase() ||
                        'KRATICA'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <View style={styles.formIcon}>
                    <Ionicons
                      name="people-outline"
                      size={21}
                      color="#0bdc73"
                    />
                  </View>

                  <View>
                    <Text style={styles.formTitle}>
                      Podaci ekipe
                    </Text>

                    <Text style={styles.formSubtitle}>
                      Uredite naziv i kraticu
                    </Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>
                  Naziv ekipe
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="people-outline"
                    size={19}
                    color="#71808a"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Naziv ekipe"
                    placeholderTextColor="#5f737f"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => scrollTo(0)}
                    returnKeyType="next"
                  />
                </View>

                <Text style={styles.inputLabel}>
                  Skraćeni naziv
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="text-outline"
                    size={19}
                    color="#71808a"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="npr. POS"
                    placeholderTextColor="#5f737f"
                    value={shortName}
                    onChangeText={setShortName}
                    autoCapitalize="characters"
                    maxLength={5}
                    onFocus={() =>
                      scrollTo(100)
                    }
                    returnKeyType="done"
                    onSubmitEditing={
                      handleUpdateTeam
                    }
                  />
                </View>

                <View style={styles.tipCard}>
                  <Ionicons
                    name="information-circle-outline"
                    size={19}
                    color="#55c8ff"
                  />

                  <Text style={styles.tipText}>
                    Skraćeni naziv može imati najviše 5 znakova.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleUpdateTeam}
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
                      size={21}
                      color="#07151d"
                    />
                  )}

                  <Text style={styles.saveButtonText}>
                    {saving
                      ? 'Spremanje...'
                      : 'Spremi promjene'}
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

  previewCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  teamAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#14342d',
    borderWidth: 1,
    borderColor: '#1c493c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  teamAvatarText: {
    color: '#0bdc73',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  previewText: {
    flex: 1,
    alignItems: 'flex-start',
  },

  previewName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },

  shortBadge: {
    backgroundColor: '#0b1b24',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  shortBadgeText: {
    color: '#9aa9b2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  formCard: {
    backgroundColor: '#10232e',
    borderWidth: 1,
    borderColor: '#1c3542',
    borderRadius: 19,
    padding: 17,
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 21,
  },

  formIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#14342d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  formTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },

  formSubtitle: {
    color: '#71808a',
    fontSize: 12,
  },

  inputLabel: {
    color: '#c9d3d9',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 53,
    borderWidth: 1,
    borderColor: '#1f3946',
    backgroundColor: '#0b1b24',
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    marginLeft: 9,
    paddingVertical: 13,
  },

  tipCard: {
    backgroundColor: '#12303c',
    borderWidth: 1,
    borderColor: '#1c4352',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  tipText: {
    flex: 1,
    color: '#9fc6d7',
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 8,
  },

  saveButton: {
    minHeight: 52,
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