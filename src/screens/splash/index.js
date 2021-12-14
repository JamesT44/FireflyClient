import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { LoadingOverlay } from '_components';

const SplashScreen = () => {
  const { colors } = useTheme();
  const backgroundColor = colors.primary;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LoadingOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default SplashScreen;
