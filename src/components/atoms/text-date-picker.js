import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import color from 'color';

import { momentFormats } from '_utils';

const TextDatePicker = ({
  date,
  onChange,
  label = null,
  placeholder = null,
  error = false,
  clearable = true,
}) => {
  const [show, setShow] = useState(false);
  const { colors, dark } = useTheme();

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate ? selectedDate : date;
    setShow(Platform.OS === 'ios');
    onChange(currentDate);
  };

  const textLabel = date
    ? moment(date).startOf('day').calendar(momentFormats)
    : '';

  const backgroundColor = dark
    ? colors.surface
    : color(colors.onSurface).alpha(0.1).rgb().string();

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setShow(true)}>
        <View style={styles.container}>
          <TextInput
            dense={true}
            editable={false}
            label={label}
            placeholder={placeholder}
            error={error}
            value={textLabel}
            style={[{ backgroundColor }, styles.textInput]}
            right={
              textLabel && clearable ? (
                <TextInput.Icon
                  name="close"
                  onPress={() => onChange('')}
                  size={24}
                />
              ) : null
            }
          />
        </View>
      </TouchableWithoutFeedback>
      {show && (
        <DateTimePicker
          value={() => date || new Date()}
          onChange={handleChange}
          display="default"
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInput: {
    fontSize: 15,
  },
});

export default TextDatePicker;
