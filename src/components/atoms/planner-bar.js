import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';

const PlannerBar = ({ onPressPrev, onPressNext, title }) => {
  const { colors } = useTheme();

  return (
    <Appbar.Header style={{ backgroundColor: colors.surface }}>
      <Appbar.Content
        title={title}
        titleStyle={[styles.title, { color: colors.primary }]}
      />
      <Appbar.Action icon="chevron-left" onPress={onPressPrev} />
      <Appbar.Action icon="chevron-right" onPress={onPressNext} />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 15 },
});

export default PlannerBar;
