import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import moment from 'moment';

import { ChipContainer, TextDatePicker } from '_atoms';
import { ChipGroup } from '_molecules';

const PresetDaterangePicker = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  presets,
  onPress = null,
  defaultLabel = 'Custom',
}) => {
  const [isCustom, setIsCustom] = useState(false);

  const isEqual = (date1, date2) => {
    if (date1 === date2) {
      return true;
    }
    return moment(date1).isSame(date2);
  };

  const currentPreset = isCustom
    ? defaultLabel
    : Object.keys(presets).find(
        (preset) =>
          isEqual(fromDate, presets[preset][0]) &&
          isEqual(toDate, presets[preset][1]),
      ) || defaultLabel;

  return (
    <View>
      <ChipContainer style={styles.chipContainer}>
        <ChipGroup.SelectSingle
          selected={currentPreset}
          onChange={(label) => {
            if (label === defaultLabel) {
              setFromDate('');
              setToDate('');
              setIsCustom(true);
            } else {
              setFromDate(presets[label][0]);
              setToDate(presets[label][1]);
              setIsCustom(false);
            }
            onPress();
          }}
          labels={[...Object.keys(presets), defaultLabel]}
        />
      </ChipContainer>

      <View style={styles.datePickerContainer}>
        <TextDatePicker
          date={fromDate}
          onChange={(newDate) => {
            setFromDate(newDate);
            if (newDate && toDate && moment(newDate).isAfter(toDate)) {
              setToDate(newDate);
            }
            setIsCustom(false);
            onPress();
          }}
          placeholder={isCustom ? 'Choose start date' : 'Start of time'}
        />
        <Text style={styles.toLabel}>to</Text>
        <TextDatePicker
          date={toDate}
          onChange={(newDate) => {
            setToDate(newDate);
            if (newDate && fromDate && moment(newDate).isBefore(fromDate)) {
              setFromDate(newDate);
            }
            setIsCustom(false);
            onPress();
          }}
          placeholder={isCustom ? 'Choose end date' : 'End of time'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  toLabel: {
    paddingHorizontal: 10,
  },
});

export default PresetDaterangePicker;
