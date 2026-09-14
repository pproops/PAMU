import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  router,
  Stack,
  useLocalSearchParams,
} from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
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
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAppModal } from '@/hooks/use-app-modal';
import { formatDate, parseDate } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import { getCurrentCoordinates, pickTournamentImage } from '@/lib/media';
import { readParam } from '@/lib/params';
import { deleteTournamentImage, uploadTournamentImage } from '@/lib/storage';
import { getOwnedTournament, updateTournament } from '@/lib/tournaments';
import type { SportType, TournamentStatus } from '@/types/models';

export default function EditTournamentScreen() {
  const params = useLocalSearchParams();
  const id = readParam(params.id);

  const scrollViewRef =
    useRef<ScrollView | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    gettingLocation,
    setGettingLocation,
  ] = useState(false);

  const [name, setName] =
    useState('');

  const [
    organizerName,
    setOrganizerName,
  ] = useState('');

  const [sportType, setSportType] =
    useState<SportType>('football');

  const [city, setCity] =
    useState('');

  const [venue, setVenue] =
    useState('');

  const [
    startDate,
    setStartDate,
  ] = useState('');

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date>(
    new Date()
  );

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  const [status, setStatus] =
    useState<TournamentStatus>('active');

  const [
    imageUrl,
    setImageUrl,
  ] = useState('');

  const [
    imagePath,
    setImagePath,
  ] = useState('');

  const [
    newImageUri,
    setNewImageUri,
  ] = useState<
    string | null
  >(null);

  const [
    newImageMimeType,
    setNewImageMimeType,
  ] = useState<string>(
    'image/jpeg'
  );

  const [
    latitude,
    setLatitude,
  ] = useState<
    number | null
  >(null);

  const [
    longitude,
    setLongitude,
  ] = useState<
    number | null
  >(null);

  const { showModal, modalProps } = useAppModal();

  const scrollTo = (
    y: number
  ) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo(
        {
          y,
          animated: true,
        }
      );
    }, 250);
  };

  useEffect(() => {
    let isMounted = true;

    const loadTournament = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          showModal(
            'error',
            'Greška',
            'ID turnira nije pronađen.',
            () => router.back()
          );
        }
        return;
      }

      try {
        const data = await getOwnedTournament(id);

        if (!isMounted) {
          return;
        }

        setName(data.name ?? '');
        setOrganizerName(data.organizerName ?? '');
        setSportType(data.sportType ?? 'football');
        setCity(data.city ?? '');
        setVenue(data.venue ?? '');
        setStartDate(data.startDate ?? '');

        if (data.startDate) {
          setSelectedDate(parseDate(data.startDate));
        }

        setStatus(data.status ?? 'active');
        setImageUrl(data.imageUrl ?? '');
        setImagePath(data.imagePath ?? '');
        setLatitude(data.latitude ?? null);
        setLongitude(data.longitude ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        showModal(
          'error',
          'Greška',
          getErrorMessage(error, 'Nije moguće učitati turnir.'),
          () => router.back()
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTournament();

    return () => {
      isMounted = false;
    };
  }, [id, showModal]);

  const openDatePicker =
    () => {
      Keyboard.dismiss();

      setShowDatePicker(
        true
      );
    };

  const handleDateValueChange = (_event: unknown, date: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    setSelectedDate(date);
    setStartDate(formatDate(date));
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  const pickImage = async () => {
    try {
      const image = await pickTournamentImage();

      if (image) {
        setNewImageUri(image.uri);
        setNewImageMimeType(image.mimeType);
      }
    } catch (error) {
      showModal(
        'error',
        'Greška',
        getErrorMessage(error, 'Nije moguće odabrati sliku.')
      );
    }
  };

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const coordinates = await getCurrentCoordinates();
      setLatitude(coordinates.latitude);
      setLongitude(coordinates.longitude);
      showModal(
        'success',
        'Lokacija ažurirana',
        'Nova GPS lokacija turnira je uspješno dohvaćena.'
      );
    } catch (error) {
      showModal(
        'error',
        'Greška',
        getErrorMessage(error, 'Nije moguće dohvatiti lokaciju.')
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!id) {
      showModal('error', 'Greška', 'ID turnira nije pronađen.');
      return;
    }

    if (!name.trim()) {
      showModal('error', 'Nedostaje naziv', 'Unesite naziv turnira.');
      return;
    }

    if (!organizerName.trim()) {
      showModal(
        'error',
        'Nedostaje organizator',
        'Unesite organizatora turnira.'
      );
      return;
    }

    if (!city.trim()) {
      showModal('error', 'Nedostaje grad', 'Unesite grad.');
      return;
    }

    if (!venue.trim()) {
      showModal('error', 'Nedostaje teren', 'Unesite mjesto ili teren.');
      return;
    }

    if (!startDate.trim()) {
      showModal(
        'error',
        'Nedostaje datum',
        'Odaberite datum početka turnira.'
      );
      return;
    }

    try {
      setSaving(true);

      let finalImageUrl = imageUrl;
      let finalImagePath = imagePath;

      if (newImageUri) {
        const uploadedImage = await uploadTournamentImage(
          newImageUri,
          newImageMimeType
        );
        finalImageUrl = uploadedImage.imageUrl;
        finalImagePath = uploadedImage.imagePath;

        if (imagePath && imagePath !== finalImagePath) {
          await deleteTournamentImage(imagePath);
        }
      }

      await updateTournament(id, {
        name,
        organizerName,
        sportType,
        city,
        venue,
        startDate,
        status,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
        latitude,
        longitude,
      });

      setImageUrl(finalImageUrl);
      setImagePath(finalImagePath);
      setNewImageUri(null);

      showModal(
        'success',
        'Promjene spremljene!',
        'Podaci o turniru su uspješno ažurirani.',
        () => router.back()
      );
    } catch (error) {
      showModal(
        'error',
        'Spremanje nije uspjelo',
        getErrorMessage(error, 'Nije moguće spremiti turnir.')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Uredi turnir',
            headerStyle: { backgroundColor: '#07151d' },
            headerTintColor: '#ffffff',
            headerShadowVisible: false,
          }}
        />
        <LoadingScreen message="Učitavanje turnira..." />
        <AppModal {...modalProps} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title:
            'Uredi turnir',

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
                styles.container
              }
            >
              <View
                style={
                  styles.headingRow
                }
              >
                <View
                  style={
                    styles.headingIcon
                  }
                >
                  <Ionicons
                    name="create-outline"
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
                    Uredi turnir
                  </Text>

                  <Text
                    style={
                      styles.subtitle
                    }
                  >
                    Promijenite podatke o turniru.
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.formCard
                }
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  Naziv turnira
                </Text>

                <View
                  style={
                    styles.inputContainer
                  }
                >
                  <Ionicons
                    name="trophy-outline"
                    size={19}
                    color="#71808a"
                  />

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      name
                    }
                    onChangeText={
                      setName
                    }
                    placeholder="Naziv turnira"
                    placeholderTextColor="#647680"
                    onFocus={() =>
                      scrollTo(
                        0
                      )
                    }
                  />
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Organizator turnira
                </Text>

                <View
                  style={
                    styles.inputContainer
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={19}
                    color="#71808a"
                  />

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      organizerName
                    }
                    onChangeText={
                      setOrganizerName
                    }
                    placeholder="npr. HNK Posušje"
                    placeholderTextColor="#647680"
                    onFocus={() =>
                      scrollTo(
                        100
                      )
                    }
                  />
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Sport
                </Text>

                <View
                  style={
                    styles.sportButtons
                  }
                >
                  <TouchableOpacity
                    activeOpacity={
                      0.85
                    }
                    style={[
                      styles.sportButton,

                      sportType ===
                        'football' &&
                        styles.sportButtonActive,
                    ]}
                    onPress={() =>
                      setSportType(
                        'football'
                      )
                    }
                  >
                    <Ionicons
                      name="football-outline"
                      size={20}
                      color={
                        sportType ===
                        'football'
                          ? '#07151d'
                          : '#8fa0aa'
                      }
                    />

                    <Text
                      style={[
                        styles.sportButtonText,

                        sportType ===
                          'football' &&
                          styles.sportButtonTextActive,
                      ]}
                    >
                      Nogomet
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={
                      0.85
                    }
                    style={[
                      styles.sportButton,

                      sportType ===
                        'futsal' &&
                        styles.sportButtonActive,
                    ]}
                    onPress={() =>
                      setSportType(
                        'futsal'
                      )
                    }
                  >
                    <Ionicons
                      name="football-outline"
                      size={20}
                      color={
                        sportType ===
                        'futsal'
                          ? '#07151d'
                          : '#8fa0aa'
                      }
                    />

                    <Text
                      style={[
                        styles.sportButtonText,

                        sportType ===
                          'futsal' &&
                          styles.sportButtonTextActive,
                      ]}
                    >
                      Futsal
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Status
                </Text>

                <View
                  style={
                    styles.sportButtons
                  }
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.sportButton,
                      status === 'active' &&
                        styles.sportButtonActive,
                    ]}
                    onPress={() => setStatus('active')}
                  >
                    <Text
                      style={[
                        styles.sportButtonText,
                        status === 'active' &&
                          styles.sportButtonTextActive,
                      ]}
                    >
                      Aktivan
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.sportButton,
                      status === 'completed' &&
                        styles.sportButtonActive,
                    ]}
                    onPress={() => setStatus('completed')}
                  >
                    <Text
                      style={[
                        styles.sportButtonText,
                        status === 'completed' &&
                          styles.sportButtonTextActive,
                      ]}
                    >
                      Završen
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Grad
                </Text>

                <View
                  style={
                    styles.inputContainer
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={19}
                    color="#71808a"
                  />

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      city
                    }
                    onChangeText={
                      setCity
                    }
                    placeholder="Grad"
                    placeholderTextColor="#647680"
                    onFocus={() =>
                      scrollTo(
                        260
                      )
                    }
                  />
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Mjesto / teren
                </Text>

                <View
                  style={
                    styles.inputContainer
                  }
                >
                  <Ionicons
                    name="football-outline"
                    size={19}
                    color="#71808a"
                  />

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      venue
                    }
                    onChangeText={
                      setVenue
                    }
                    placeholder="Mjesto ili teren"
                    placeholderTextColor="#647680"
                    onFocus={() =>
                      scrollTo(
                        380
                      )
                    }
                  />
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Datum početka
                </Text>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.dateButton
                  }
                  onPress={
                    openDatePicker
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#0bdc73"
                  />

                  <Text
                    style={
                      styles.dateText
                    }
                  >
                    {startDate ||
                      'Odaberite datum'}
                  </Text>

                  <Ionicons
                    name="chevron-down-outline"
                    size={19}
                    color="#71808a"
                  />
                </TouchableOpacity>

                {showDatePicker && (
                  <View
                    style={
                      styles.datePickerContainer
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
                      onValueChange={handleDateValueChange}
                      onDismiss={handleDateDismiss}
                    />

                    {Platform.OS ===
                      'ios' && (
                      <TouchableOpacity
                        style={
                          styles.iosDateConfirmButton
                        }
                        onPress={() =>
                          setShowDatePicker(
                            false
                          )
                        }
                      >
                        <Text
                          style={
                            styles.iosDateConfirmText
                          }
                        >
                          Potvrdi datum
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                GPS lokacija
              </Text>

              <View
                style={
                  styles.sectionCard
                }
              >
                <View
                  style={
                    styles.sectionHeader
                  }
                >
                  <View
                    style={
                      styles.sectionIcon
                    }
                  >
                    <Ionicons
                      name="location-outline"
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
                        styles.sectionCardTitle
                      }
                    >
                      Lokacija turnira
                    </Text>

                    <Text
                      style={
                        styles.sectionDescription
                      }
                    >
                      Po potrebi ažurirajte GPS koordinate turnira.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.locationButton
                  }
                  onPress={
                    getCurrentLocation
                  }
                  disabled={
                    gettingLocation
                  }
                >
                  <Ionicons
                    name="navigate-outline"
                    size={19}
                    color="#0bdc73"
                  />

                  <Text
                    style={
                      styles.locationButtonText
                    }
                  >
                    {gettingLocation
                      ? 'Dohvaćanje lokacije...'
                      : latitude !==
                            null &&
                          longitude !==
                            null
                        ? 'Promijeni GPS lokaciju'
                        : 'Dohvati GPS lokaciju'}
                  </Text>
                </TouchableOpacity>

                {latitude !==
                  null &&
                longitude !==
                  null ? (
                  <View
                    style={
                      styles.locationBox
                    }
                  >
                    <View
                      style={
                        styles.locationSuccessRow
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#0bdc73"
                      />

                      <Text
                        style={
                          styles.locationSuccess
                        }
                      >
                        Lokacija spremljena
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.coordinateText
                      }
                    >
                      Latitude:{' '}
                      {latitude.toFixed(
                        6
                      )}
                    </Text>

                    <Text
                      style={
                        styles.coordinateText
                      }
                    >
                      Longitude:{' '}
                      {longitude.toFixed(
                        6
                      )}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={
                      styles.noLocationText
                    }
                  >
                    Lokacija nije spremljena.
                  </Text>
                )}
              </View>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Slika turnira
              </Text>

              <View
                style={
                  styles.sectionCard
                }
              >
                {newImageUri ? (
                  <Image
                    source={{
                      uri:
                        newImageUri,
                    }}
                    style={
                      styles.previewImage
                    }
                    resizeMode="cover"
                  />
                ) : imageUrl ? (
                  <Image
                    source={{
                      uri:
                        imageUrl,
                    }}
                    style={
                      styles.previewImage
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
                        styles.imagePlaceholderIcon
                      }
                    >
                      <Ionicons
                        name="images-outline"
                        size={31}
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
                      Dodajte naslovnu sliku turnira.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.imageButton
                  }
                  onPress={
                    pickImage
                  }
                >
                  <Ionicons
                    name="images-outline"
                    size={19}
                    color="#ffffff"
                  />

                  <Text
                    style={
                      styles.imageButtonText
                    }
                  >
                    {imageUrl ||
                    newImageUri
                      ? 'Promijeni sliku'
                      : 'Odaberi sliku'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={
                  0.88
                }
                style={[
                  styles.saveButton,

                  saving &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleSave
                }
                disabled={
                  saving
                }
              >
                <Ionicons
                  name="save-outline"
                  size={21}
                  color="#07151d"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {saving
                    ? 'Spremanje...'
                    : 'Spremi promjene'}
                </Text>
              </TouchableOpacity>

              <View
                style={
                  styles.bottomSpace
                }
              />
            </View>
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

    centerContainer: {
      flex: 1,
      backgroundColor:
        '#07151d',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 13,
    },

    loadingText: {
      color: '#8fa0aa',
      fontSize: 13,
    },

    scrollContainer: {
      flexGrow: 1,
    },

    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 22,
      backgroundColor:
        '#07151d',
    },

    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      marginBottom: 22,
    },

    headingIcon: {
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
      marginBottom: 24,
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
      marginBottom: 17,
      gap: 9,
    },

    input: {
      flex: 1,
      color: '#ffffff',
      fontSize: 14,
      paddingVertical: 12,
    },

    sportButtons: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
    },

    sportButton: {
      flex: 1,
      minHeight: 49,
      borderWidth: 1,
      borderColor:
        '#1c3542',
      backgroundColor:
        '#0d202a',
      borderRadius: 13,
      flexDirection: 'row',
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 7,
    },

    sportButtonActive: {
      backgroundColor:
        '#0bdc73',
      borderColor:
        '#0bdc73',
    },

    sportButtonText: {
      color: '#8fa0aa',
      fontWeight: '800',
      fontSize: 13,
    },

    sportButtonTextActive: {
      color: '#07151d',
    },

    dateButton: {
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

    dateText: {
      flex: 1,
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },

    datePickerContainer: {
      marginTop: 10,
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 13,
      overflow: 'hidden',
      padding: 8,
    },

    iosDateConfirmButton: {
      minHeight: 43,
      backgroundColor:
        '#0bdc73',
      borderRadius: 10,
      alignItems:
        'center',
      justifyContent:
        'center',
      margin: 8,
    },

    iosDateConfirmText: {
      color: '#07151d',
      fontWeight: '900',
    },

    sectionTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 11,
    },

    sectionCard: {
      backgroundColor:
        '#10232e',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 18,
      padding: 15,
      marginBottom: 24,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      marginBottom: 15,
    },

    sectionIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    sectionCardTitle: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 2,
    },

    sectionDescription: {
      color: '#71808a',
      fontSize: 11,
      lineHeight: 16,
    },

    locationButton: {
      minHeight: 49,
      borderWidth: 1,
      borderColor:
        '#245044',
      borderRadius: 13,
      backgroundColor:
        '#12342d',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      marginBottom: 12,
    },

    locationButtonText: {
      color: '#0bdc73',
      fontSize: 13,
      fontWeight: '800',
    },

    locationBox: {
      backgroundColor:
        '#0d202a',
      borderRadius: 12,
      padding: 12,
    },

    locationSuccessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 7,
    },

    locationSuccess: {
      color: '#0bdc73',
      fontSize: 12,
      fontWeight: '800',
    },

    coordinateText: {
      color: '#8fa0aa',
      fontSize: 11,
      marginTop: 2,
    },

    noLocationText: {
      color: '#71808a',
      fontSize: 12,
      textAlign: 'center',
      paddingVertical: 4,
    },

    previewImage: {
      width: '100%',
      height: 190,
      borderRadius: 14,
      marginBottom: 13,
      backgroundColor:
        '#0d202a',
    },

    imagePlaceholder: {
      width: '100%',
      height: 165,
      borderRadius: 14,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      marginBottom: 13,
    },

    imagePlaceholderIcon: {
      width: 56,
      height: 56,
      borderRadius: 17,
      backgroundColor:
        '#14342d',
      justifyContent:
        'center',
      alignItems: 'center',
      marginBottom: 9,
    },

    imagePlaceholderTitle: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 4,
    },

    imagePlaceholderText: {
      color: '#71808a',
      fontSize: 11,
    },

    imageButton: {
      minHeight: 49,
      backgroundColor:
        '#0d202a',
      borderWidth: 1,
      borderColor:
        '#1c3542',
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    imageButtonText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '800',
    },

    saveButton: {
      minHeight: 55,
      backgroundColor:
        '#0bdc73',
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
    },

    saveButtonText: {
      color: '#07151d',
      fontSize: 15,
      fontWeight: '900',
    },

    disabledButton: {
      opacity: 0.6,
    },

    bottomSpace: {
      height: 450,
    },
  });