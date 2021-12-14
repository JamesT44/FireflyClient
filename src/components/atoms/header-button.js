import React, { Children } from 'react';
import { StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar as AvatarIcon,
  Button,
} from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ButtonContainer = ({
  onPress,
  children,
  rippleRadius = 22,
  aspectRatio = 1,
}) => {
  const { dark } = useTheme();
  const rippleColor = dark ? 'rgba(255, 255, 255, .32)' : 'rgba(0, 0, 0, .32)';

  return onPress ? (
    <TouchableNativeFeedback
      useForeground={TouchableNativeFeedback.canUseNativeForeground()}
      background={TouchableNativeFeedback.Ripple(
        rippleColor,
        false,
        rippleRadius,
      )}
      onPress={onPress}>
      <View style={[styles.buttonContainer, { aspectRatio }]}>
        {Children.only(children)}
      </View>
    </TouchableNativeFeedback>
  ) : (
    <View style={[styles.buttonContainer, { aspectRatio }]}>
      {Children.only(children)}
    </View>
  );
};

const Avatar = ({ onPress, source }) => (
  <ButtonContainer onPress={onPress}>
    <AvatarIcon.Image size={25} source={source} />
  </ButtonContainer>
);

const Refresh = ({ onPress, refreshing }) => (
  <ButtonContainer onPress={refreshing ? null : onPress}>
    {refreshing ? (
      <ActivityIndicator animating={true} size={25} color="white" />
    ) : (
      <MaterialCommunityIcons name="refresh" size={25} color="white" />
    )}
  </ButtonContainer>
);

const Options = ({ onPress }) => (
  <ButtonContainer onPress={onPress}>
    <Ionicons name="md-options" size={25} color="white" />
  </ButtonContainer>
);

const Date = ({ onPress }) => (
  <ButtonContainer onPress={onPress}>
    <MaterialCommunityIcons name="calendar" size={25} color="white" />
  </ButtonContainer>
);

const Discard = ({ onPress }) => {
  const { colors } = useTheme();
  return (
    <Button
      onPress={onPress}
      uppercase={false}
      labelStyle={styles.label}
      color={colors.text}
      compact>
      Discard
    </Button>
  );
};

const Reset = ({ onPress }) => {
  const { colors } = useTheme();
  return (
    <Button
      onPress={onPress}
      uppercase={false}
      labelStyle={styles.label}
      color={colors.text}
      compact>
      Reset
    </Button>
  );
};

const Open = ({ onPress }) => (
  <ButtonContainer onPress={onPress}>
    <MaterialCommunityIcons name="open-in-app" size={25} color="white" />
  </ButtonContainer>
);
const HeaderButton = { Avatar, Refresh, Options, Date, Discard, Reset, Open };

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 15,
    letterSpacing: 0,
  },
});

export default HeaderButton;
