import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  useTasksOptionsContext,
  TASK_SORT_OPTIONS,
  TASK_PROGRESS_OPTIONS,
  INITIAL_TASKS_OPTIONS,
} from '_contexts';
import { updateLocalTasks } from '_api';
import { copyDate, presetDateranges } from '_utils';

const TasksOptionsModal = ({ navigation }) => {
  const { auth } = useAuthContext();
  const { isLoading, error, data } = useQuery(
    'tasks',
    () => updateLocalTasks(auth),
    { refetchInterval: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 },
  );

  let choices = [];
  if (!isLoading && !error) {
    choices = Array.from(
      new Set(
        Object.values(data)
          .filter((task) => !task.deleted)
          .map((task) => task.setter.name),
      ).values(),
    );
  }

  const scrollIntoViewRef = useRef(null);
  const { tasksOptions, setTasksOptions } = useTasksOptionsContext();

  const [currTasksOptions, setCurrTasksOptions] = useState({
    sort: tasksOptions.sort,
    setBy: tasksOptions.setBy.slice(),
    progress: tasksOptions.progress.slice(),
    dueAfter: copyDate(tasksOptions.dueAfter),
    dueBefore: copyDate(tasksOptions.dueBefore),
    setAfter: copyDate(tasksOptions.setAfter),
    setBefore: copyDate(tasksOptions.setBefore),
  });

  const [setByText, setSetByText] = useState('');
  const fuse = useMemo(
    () => new Fuse(choices, { ignoreLocation: true, ignoreFieldNorm: true }),
    [choices],
  );

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const scrollToSetBy = () => {
    scrollIntoViewRef.current.scrollIntoView({ align: 'top' });
  };
  useLayoutEffect(() => {
    Keyboard.addListener('keyboardDidShow', scrollToSetBy);
    return () => Keyboard.removeListener('keyboardDidShow', scrollToSetBy);
  });

  const handleSort = (label) => {
    setCurrTasksOptions((prevTasksOptions) => ({
      ...prevTasksOptions,
      sort: label,
    }));
    dismissKeyboard();
  };
  const handleSetBy = (newSetBy) => {
    setCurrTasksOptions((prevTasksOptions) => ({
      ...prevTasksOptions,
      setBy: newSetBy,
    }));
  };
  const handleProgress = (label) => {
    setCurrTasksOptions((prevTasksOptions) => {
      if (prevTasksOptions.progress.includes(label)) {
        return {
          ...prevTasksOptions,
          progress: prevTasksOptions.progress.filter((val) => val !== label),
        };
      } else {
        return {
          ...prevTasksOptions,
          progress: [...prevTasksOptions.progress, label],
        };
      }
    });
    dismissKeyboard();
  };
  const handleDueAfter = (date) => {
    setCurrTasksOptions((prevTasksOptions) => ({
      ...prevTasksOptions,
      dueAfter: date,
    }));
    dismissKeyboard();
  };
  const handleDueBefore = (date) => {
    setCurrTasksOptions((prevTasksOptions) => ({
      ...prevTasksOptions,
      dueBefore: date,
    }));
    dismissKeyboard();
  };
  const handleSetAfter = (date) => {
    setCurrTasksOptions((prevTasksOptions) => ({
      ...prevTasksOptions,
      setAfter: date,
    }));
    dismissKeyboard();
  };
  const handleSetBefore = (date) => {
    setCurrTasksOptions((prevTasksOptions) => ({
      ...prevTasksOptions,
      setBefore: date,
    }));
    dismissKeyboard();
  };

  const confirmChanges = () => {
    setTasksOptions(currTasksOptions);
    navigation.navigate('Tasks');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton.Discard
          onPress={() => {
            navigation.navigate('Tasks');
          }}
        />
      ),
      headerRight: () => (
        <HeaderButton.Reset
          onPress={() => {
            setCurrTasksOptions({ ...INITIAL_TASKS_OPTIONS });
          }}
        />
      ),
    });
  }, [navigation, setTasksOptions]);

  return (
    <>
      <ContentContainer>
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Sort By</Title>
          <ChipContainer style={styles.chipContainer}>
            <ChipGroup.SelectSingle
              selected={currTasksOptions.sort}
              onChange={handleSort}
              labels={Object.values(TASK_SORT_OPTIONS)}
              checkmark={false}
            />
          </ChipContainer>
        </View>
        <Divider />
        <ScrollIntoView
          enabled={true}
          ref={scrollIntoViewRef}
          style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Set By</Title>
          <AutocompleteChipInput
            text={setByText}
            handleText={setSetByText}
            suggestions={
              setByText
                ? fuse.search(setByText).map((suggestion) => suggestion.item)
                : []
            }
            chips={currTasksOptions.setBy}
            handleChips={handleSetBy}
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
          <Title style={styles.sectionTitle}>Task Progress</Title>
          <ChipContainer style={styles.chipContainer}>
            <ChipGroup.SelectMultiple
              selected={currTasksOptions.progress}
              onChange={handleProgress}
              labels={Object.values(TASK_PROGRESS_OPTIONS)}
            />
          </ChipContainer>
        </View>
        <Divider />
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Date Due</Title>
          <PresetDaterangePicker
            fromDate={currTasksOptions.dueAfter}
            setFromDate={handleDueAfter}
            toDate={currTasksOptions.dueBefore}
            setToDate={handleDueBefore}
            presets={presetDateranges}
            onPress={dismissKeyboard}
          />
        </View>
        <Divider />
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Date Set</Title>
          <PresetDaterangePicker
            fromDate={currTasksOptions.setAfter}
            setFromDate={handleSetAfter}
            toDate={currTasksOptions.setBefore}
            setToDate={handleSetBefore}
            presets={presetDateranges}
            onPress={dismissKeyboard}
          />
        </View>
        <Divider />
        <ConfirmFAB.BottomPadding />
      </ContentContainer>
      <ConfirmFAB label="Show tasks" onPress={confirmChanges} />
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

export default TasksOptionsModal;
