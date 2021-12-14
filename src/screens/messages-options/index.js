import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { Title, Divider } from 'react-native-paper';
import { ScrollIntoView } from 'react-native-scroll-into-view';
import Fuse from 'fuse.js';
import { useQuery } from 'react-query';

import {
  AutocompleteChipInput,
  ChipGroup,
  ConfirmFAB,
  ContentContainer,
  PresetDaterangePicker,
  ChipContainer,
  HeaderButton,
} from '_components';
import {
  useAuthContext,
  useMessagesOptionsContext,
  MESSAGE_SORT_OPTIONS,
  MESSAGE_STATUS_OPTIONS,
  INITIAL_MESSAGES_OPTIONS,
} from '_contexts';
import { getMessages } from '_api';
import { useMemo } from 'react';
import { copyDate, presetDateranges } from '_utils';

const MessagesOptionsModal = ({ navigation }) => {
  const { auth } = useAuthContext();
  const { isLoading, error, data } = useQuery(
    'messages',
    () => getMessages(auth),
    { refetchInterval: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );

  let choices = [];
  if (!isLoading && !error) {
    choices = Array.from(
      new Set(data.map((message) => message.from.name)).values(),
    );
  }

  const scrollIntoViewRef = useRef(null);
  const { messagesOptions, setMessagesOptions } = useMessagesOptionsContext();

  const [currMessagesOptions, setCurrMessagesOptions] = useState({
    sort: messagesOptions.sort,
    status: messagesOptions.status,
    sentBy: messagesOptions.sentBy.slice(),
    after: copyDate(messagesOptions.after),
    before: copyDate(messagesOptions.before),
  });

  const [sentByText, setSetByText] = useState('');
  const fuse = useMemo(
    () => new Fuse(choices, { ignoreLocation: true, ignoreFieldNorm: true }),
    [choices],
  );

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const scrollToSentBy = () => {
    scrollIntoViewRef.current.scrollIntoView({ align: 'top' });
  };
  useLayoutEffect(() => {
    Keyboard.addListener('keyboardDidShow', scrollToSentBy);
    return () => Keyboard.removeListener('keyboardDidShow', scrollToSentBy);
  });

  const handleSort = (label) => {
    setCurrMessagesOptions((prevMessagesOptions) => ({
      ...prevMessagesOptions,
      sort: label,
    }));
    dismissKeyboard();
  };
  const handleStatus = (label) => {
    setCurrMessagesOptions((prevMessagesOptions) => {
      if (prevMessagesOptions.status.includes(label)) {
        return {
          ...prevMessagesOptions,
          status: prevMessagesOptions.status.filter((val) => val !== label),
        };
      } else {
        return {
          ...prevMessagesOptions,
          status: [...prevMessagesOptions.status, label],
        };
      }
    });
    dismissKeyboard();
  };
  const handleSentBy = (newSentBy) => {
    setCurrMessagesOptions((prevMessagesOptions) => ({
      ...prevMessagesOptions,
      sentBy: newSentBy,
    }));
  };
  const handleAfter = (date) => {
    setCurrMessagesOptions((prevMessagesOptions) => ({
      ...prevMessagesOptions,
      after: date,
    }));
    dismissKeyboard();
  };
  const handleBefore = (date) => {
    setCurrMessagesOptions((prevMessagesOptions) => ({
      ...prevMessagesOptions,
      before: date,
    }));
    dismissKeyboard();
  };

  const confirmChanges = () => {
    setMessagesOptions(currMessagesOptions);
    navigation.navigate('Messages');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton.Discard
          onPress={() => {
            navigation.navigate('Messages');
          }}
        />
      ),
      headerRight: () => (
        <HeaderButton.Reset
          onPress={() => {
            setCurrMessagesOptions({ ...INITIAL_MESSAGES_OPTIONS });
          }}
        />
      ),
    });
  }, [navigation, setMessagesOptions]);

  return (
    <>
      <ContentContainer>
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Sort By</Title>
          <ChipContainer style={styles.chipContainer}>
            <ChipGroup.SelectSingle
              selected={currMessagesOptions.sort}
              onChange={handleSort}
              labels={Object.values(MESSAGE_SORT_OPTIONS)}
              checkmark={false}
            />
          </ChipContainer>
        </View>
        <Divider />
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Message Status</Title>
          <ChipContainer style={styles.chipContainer}>
            <ChipGroup.SelectMultiple
              selected={currMessagesOptions.status}
              onChange={handleStatus}
              labels={Object.values(MESSAGE_STATUS_OPTIONS)}
            />
          </ChipContainer>
        </View>
        <Divider />
        <ScrollIntoView
          enabled={true}
          ref={scrollIntoViewRef}
          style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Sent By</Title>
          <AutocompleteChipInput
            text={sentByText}
            handleText={setSetByText}
            suggestions={
              sentByText
                ? fuse.search(sentByText).map((suggestion) => suggestion.item)
                : []
            }
            chips={currMessagesOptions.sentBy}
            handleChips={handleSentBy}
            isErrorState={useCallback(
              (name) => choices.length && !choices.includes(name),
              [choices],
            )}
            placeholder="Enter a name"
            getHelperMessage={(chips) =>
              `"${chips.find(
                (name) => !choices.includes(name),
              )}" is not a recognised name`
            }
            style={styles.chipInput}
          />
        </ScrollIntoView>
        <Divider />
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Date Sent</Title>
          <PresetDaterangePicker
            fromDate={currMessagesOptions.after}
            setFromDate={handleAfter}
            toDate={currMessagesOptions.before}
            setToDate={handleBefore}
            presets={presetDateranges}
            onPress={dismissKeyboard}
          />
        </View>
        <Divider />
        <ConfirmFAB.BottomPadding />
      </ContentContainer>
      <ConfirmFAB label="Show messages" onPress={confirmChanges} />
    </>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 15,
  },
  sectionTitle: {
    paddingLeft: 10,
  },
  chipContainer: {
    paddingHorizontal: 12,
  },
  chipInput: {
    paddingHorizontal: 12,
    paddingTop: 5,
  },
});

export default MessagesOptionsModal;
