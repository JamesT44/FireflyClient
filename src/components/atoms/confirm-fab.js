import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import color from 'color';

const ConfirmFAB = ({ label, onPress, loading = false, disabled = false }) => {
  const { colors } = useTheme();
  const labelColor = disabled
    ? color(colors.onBackground).alpha(0.32).rgb().string()
    : colors.background;
  const backgroundColor = disabled
    ? color(colors.onBackground)
        .mix(color(colors.background), 0.88)
        .rgb()
        .string()
    : color(colors.text).mix(color(colors.background), 0.1).rgb().string();

  return (
    <FAB
      color={labelColor}
      style={[styles.fab, { backgroundColor }]}
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  );
};

const FABBottomPadding = () => <View style={styles.padding} />;
ConfirmFAB.BottomPadding = FABBottomPadding;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    marginVertical: 16,
    marginHorizontal: 12,
    left: 0,
    right: 0,
    bottom: 0,
  },
  padding: { height: 80 },
});

export default ConfirmFAB;
