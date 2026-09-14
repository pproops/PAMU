import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export async function pickTournamentImage(): Promise<{
  uri: string;
  mimeType: string;
} | null> {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.status !== 'granted') {
    throw new Error(
      'Potrebno je dopustiti pristup galeriji kako biste mogli odabrati sliku.'
    );
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const image = result.assets[0];

  return {
    uri: image.uri,
    mimeType: image.mimeType ?? 'image/jpeg',
  };
}

export async function getCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error(
      'Potrebno je dopustiti pristup lokaciji kako bi aplikacija mogla dohvatiti GPS koordinate.'
    );
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
