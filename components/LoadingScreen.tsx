import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';

export function LoadingScreen({ message = 'Učitavanje...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={AppColors.accent} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  text: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginTop: 13,
  },
});
