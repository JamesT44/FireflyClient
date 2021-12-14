import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { HelperText, List, TouchableRipple } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import color from 'color';

import { Chip } from '_atoms';
import { ScrollView } from 'react-native-gesture-handler';

const Underline = ({ focused = false, error = false }) => {
  const { colors } = useTheme();

  let backgroundColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.disabled;

  const underlineStyle = {
    backgroundColor,
    transform: [{ scaleY: focused ? 1 : 0.5 }],
  };

  return <Animated.View style={[styles.underline, underlineStyle]} />;
};

const AutocompleteChipInput = ({
  text,
  handleText,
  suggestions,
  chips,
  handleChips,
  isErrorState,
  placeholder = null,
  getHelperMessage = null,
  style = null,
}) => {
  const { colors, dark, roundness } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setHasErrors(chips.some(isErrorState));
  }, [chips, isErrorState]);

  const handleCloseChip = (thisName) => {
    const newChips = chips.filter((name) => name !== thisName);
    handleChips(newChips);
  };

  const handleBackspace = (e) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (text === '' && chips.length > 0) {
        const newChips = [...chips];
        newChips.pop();
        handleChips(newChips);
      }
    }
  };

  const handleEnter = () => {
    if (suggestions.length > 0) {
      if (!chips.includes(suggestions[0])) {
        const newChips = [...chips, suggestions[0]];
        handleChips(newChips);
      }
    } else {
      if (text.trim() && !chips.includes(text.trim())) {
        const newChips = [...chips, text.trim()];
        handleChips(newChips);
      }
    }
    handleText('');
  };

  const handleSuggestion = (suggestionLabel) => {
    if (!chips.includes(suggestionLabel)) {
      const newChips = [...chips, suggestionLabel];
      handleChips(newChips);
    }
    handleText('');
  };

  const backgroundColor = dark
    ? colors.surface
    : color(colors.onSurface).alpha(0.1).rgb().string();
  const textBoxStyle = {
    borderTopLeftRadius: roundness,
    borderTopRightRadius: roundness,
    backgroundColor,
  };

  const textInputStyle = {
    color: colors.text,
  };

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => inputRef.current.focus()}>
        <View style={style}>
          <View>
            <Underline focused={isFocused} error={hasErrors} />
            <View style={[styles.textBox, textBoxStyle]}>
              {chips.map((thisName) => {
                return (
                  <Chip.Input
                    onClose={() => handleCloseChip(thisName)}
                    key={thisName}
                    error={isErrorState(thisName)}>
                    {thisName}
                  </Chip.Input>
                );
              })}
              <TextInput
                ref={inputRef}
                style={[styles.textInput, textInputStyle]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                blurOnSubmit={false}
                placeholder={placeholder}
                placeholderTextColor={colors.placeholder}
                selectionColor={colors.primary}
                value={text}
                onKeyPress={handleBackspace}
                onChangeText={(newText) => handleText(newText)}
                onSubmitEditing={handleEnter}
              />
            </View>
          </View>
          {isFocused && suggestions.length > 0 && (
            <View
              style={[styles.suggestions, { backgroundColor: colors.surface }]}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {suggestions.map((suggestionLabel) => (
                  <TouchableRipple
                    onPress={() => handleSuggestion(suggestionLabel)}
                    key={suggestionLabel}>
                    <List.Item
                      style={styles.suggestionText}
                      title={suggestionLabel}
                    />
                  </TouchableRipple>
                ))}
              </ScrollView>
            </View>
          )}
          {getHelperMessage &&
            hasErrors &&
            !(isFocused && suggestions.length > 0) && (
              <HelperText type="error">{getHelperMessage(chips)}</HelperText>
            )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    zIndex: 1,
  },
  textBox: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 3,
  },
  textInput: {
    flexGrow: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  suggestions: {
    position: 'relative',
    left: 0,
    right: 0,
    zIndex: 100,
    maxHeight: 198,
    elevation: 5,
  },
});

export default AutocompleteChipInput;
