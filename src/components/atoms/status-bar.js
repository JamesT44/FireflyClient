import React from 'react';
import { StatusBar as StatusBarNative } from 'react-native';
import { useTheme } from '@react-navigation/native';

const StatusBar = () => {
  const { colors } = useTheme();

  return (
    <StatusBarNative barStyle="light-content" backgroundColor={colors.darker} />
  );
};

export default StatusBar;
