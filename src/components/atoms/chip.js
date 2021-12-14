import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip as PaperChip } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import color from 'color';

const Choice = ({ children, selected, checkmark = true, onPress }) => {
  const { colors, dark } = useTheme();

  const [textColor, setTextColor] = useState(colors.text);
  const [chipStyle, setChipStyle] = useState(null);

  useEffect(() => {
    if (selected) {
      setTextColor(dark ? colors.background : colors.surface);
      setChipStyle({
        backgroundColor: colors.primary,
      });
    } else {
      setTextColor(color(colors.text).darken(0.2).rgb().string());
      setChipStyle({
        backgroundColor: color(colors.onSurface).alpha(0.1).rgb().string(),
      });
    }
  }, [selected, colors, dark]);

  return (
    <PaperChip
      icon={checkmark ? null : () => null}
      style={[styles.chip, chipStyle]}
      selected={selected}
      selectedColor={textColor}
      onPress={onPress}>
      {children}
    </PaperChip>
  );
};

const Input = ({ children, onClose, error = false }) => {
  const { colors, dark } = useTheme();

  const textColor = dark ? colors.background : colors.surface;
  const chipStyle = {
    backgroundColor: error ? colors.error : colors.primary,
  };

  return (
    <View>
      <PaperChip
        icon={() => null}
        style={[styles.chip, chipStyle]}
        selected={true}
        selectedColor={textColor}
        onClose={onClose}
        onPress={() => null}>
        {children}
      </PaperChip>
    </View>
  );
};

const Info = ({ children, icon = null, backgroundColor }) => {
  return (
    <View style={styles.infoChipContainer}>
      <PaperChip
        icon={() =>
          icon ? <Icon name={icon} style={styles.infoChipIcon} /> : null
        }
        style={[styles.infoChip, { backgroundColor }]}
        textStyle={styles.infoChipText}>
        {children}
      </PaperChip>
    </View>
  );
};

const Chip = { Choice: Choice, Input, Info };

const styles = StyleSheet.create({
  chip: {
    marginVertical: 5,
    marginHorizontal: 3,
  },
  infoChipContainer: {
    paddingRight: 5,
  },
  infoChip: {
    height: 20,
  },
  infoChipIcon: {
    color: 'white',
    fontSize: 18,
    marginTop: -4,
    marginBottom: -2,
    marginLeft: -2,
    marginRight: 4,
  },
  infoChipText: {
    color: 'white',
    fontSize: 12,
    marginTop: -3,
    marginBottom: 0,
    marginLeft: -4,
    marginRight: 4,
  },
});

export default Chip;
