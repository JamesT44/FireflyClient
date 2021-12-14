import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Portal } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';

const LoadingOverlay = () => {
  const { colors, dark } = useTheme();

  return (
    <Portal>
      <View style={[styles.container]}>
        <ActivityIndicator
          color={dark ? colors.text : colors.primary}
          size={90}
        />
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

export default LoadingOverlay;
