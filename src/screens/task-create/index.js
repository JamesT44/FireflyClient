import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Divider,
  HelperText,
  IconButton,
  List,
  TextInput,
  Title,
} from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useMutation, useQueryClient } from 'react-query';
import color from 'color';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import {
  ConfirmFAB,
  ContentContainer,
  ErrorDialog,
  HeaderButton,
  LoadingOverlay,
  TextDatePicker,
} from '_components';
import { useAuthContext } from '_contexts';
import { setPersonalTask, getTaskUrl } from '_api';

const TaskCreateModal = ({ navigation }) => {
  const { colors, dark, roundness } = useTheme();
  const { auth } = useAuthContext();

  const [titleText, setTitleText] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueDateError, setDueDateError] = useState(false);
  const [setDate, setSetDate] = useState(moment().startOf('day').toDate());
  const [attachments, setAttachments] = useState([]);
  const [errorVisible, setErrorVisible] = useState(false);

  const backgroundColor = dark
    ? colors.surface
    : color(colors.onSurface).alpha(0.1).rgb().string();

  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    ({ title, description, due, set, attachmentList }) =>
      setPersonalTask(
        auth,
        title,
        description,
        moment(due),
        moment(set),
        attachmentList,
      ),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('tasks');
      },
      onError: (err) => {
        console.warn(err);
      },
      onSuccess: (taskId, { title, description, due, set, attachmentList }) => {
        if (moment().startOf('day').add(1, 'day').isAfter(set)) {
          queryClient.setQueryData('tasks', (oldData) => {
            let newData = { ...oldData };
            newData[taskId.toString()] = {
              descriptionDetails: {
                htmlContent: description,
                isSimpleDescription: true,
              },
              title: title,
              setDate: moment(set).toISOString(),
              dueDate: moment(due).toISOString(),
              setter: {
                guid: auth.userData.guid,
                name: auth.userData.name,
              },
              archived: false,
              taskType: 'PersonalTask',
              totalMarkOutOf: null,
              fileAttachments: attachmentList.map(([fileName]) => ({
                fileName,
              })),
              pageAttachments: [],
              addressees: [
                {
                  principal: {
                    guid: auth.userData.guid,
                    name: auth.userData.name,
                  },
                },
              ],
              recipientsResponses: [
                {
                  responses: [
                    {
                      authorName: auth.userData.name,
                      releasedTimestamp: moment().toISOString(),
                      eventType: 'set-task',
                    },
                  ],
                },
              ],
              deleted: false,
              id: taskId,
            };
            return newData;
          });
        }
        navigation.navigate('Tasks', { newTaskUrl: getTaskUrl(auth, taskId) });
      },
      onSettled: () => {
        return queryClient.invalidateQueries('tasks');
      },
    },
  );

  const createTask = () => {
    setTitleError(false);
    setDueDateError(false);

    let isError = false;
    if (titleText.trim() === '') {
      isError = true;
      setTitleError(true);
    }
    if (!dueDate) {
      isError = true;
      setDueDateError(true);
    }
    if (isError) {
      return;
    }

    mutate({
      title: titleText,
      description: descriptionText,
      due: dueDate,
      set: setDate,
      attachmentList: attachments,
    });
  };

  const addAttachment = async () => {
    try {
      const res = await DocumentPicker.pick();
      if (res.size > 5000000) {
        setErrorVisible(true);
        return;
      }
      const base64Data = await RNFS.readFile(res.uri, 'base64');
      setAttachments((oldAttachments) => [
        ...oldAttachments,
        [res.name, base64Data, uuidv4()],
      ]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        throw err;
      }
    }
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
    });
  }, [navigation]);

  return (
    <>
      <ContentContainer style={styles.container}>
        <TextInput
          label="Title"
          dense
          style={[{ backgroundColor }, styles.textInput]}
          value={titleText}
          onChangeText={(text) => {
            setTitleText(text);
            setTitleError(false);
          }}
          onBlur={() => {
            if (titleText.trim() === '') {
              setTitleError(true);
            }
          }}
          error={titleError}
        />
        <View style={styles.spacer}>
          <HelperText type="error" visible={titleError}>
            Please add a title
          </HelperText>
        </View>
        <TextInput
          label="Description (optional)"
          dense
          style={[{ backgroundColor }, styles.textInput]}
          value={descriptionText}
          multiline
          onChangeText={(text) => setDescriptionText(text)}
        />
        <View style={styles.spacer} />
        <TextDatePicker
          label="Date Due"
          date={dueDate}
          onChange={(newDate) => {
            setDueDate(newDate);
            if (newDate) {
              setDueDateError(false);
            }
          }}
          error={dueDateError}
          display="default"
          clearable={false}
        />
        <View style={styles.spacer}>
          <HelperText type="error" visible={dueDateError}>
            Please add a date due
          </HelperText>
        </View>
        <TextDatePicker
          label="Date Set"
          date={setDate}
          onChange={(newDate) => {
            setSetDate(newDate);
          }}
          display="default"
          clearable={false}
        />
        <View style={styles.spacer} />
        <List.Section
          style={{
            backgroundColor,
            borderTopLeftRadius: roundness,
            borderTopRightRadius: roundness,
          }}>
          <List.Item
            title={<Title>Attachments</Title>}
            right={() => <IconButton icon="plus" onPress={addAttachment} />}
          />
          {attachments.map(([filename, _, uuid]) => (
            <View key={uuid}>
              <Divider />
              <List.Item
                title={filename}
                left={() => <List.Icon icon="attachment" />}
                right={() => (
                  <IconButton
                    icon="close"
                    onPress={() =>
                      setAttachments((oldAttachments) =>
                        oldAttachments.filter(
                          ([_1, _2, uuid2]) => uuid2 !== uuid,
                        ),
                      )
                    }
                  />
                )}
              />
            </View>
          ))}
        </List.Section>
        <ConfirmFAB.BottomPadding />
      </ContentContainer>
      <ConfirmFAB label="Create Personal Task" onPress={createTask} />
      <ErrorDialog
        message={
          'Maximum file size of 5MB exceeded. Use web interface to upload larger files.'
        }
        visible={errorVisible}
        onDismiss={() => setErrorVisible(false)}
      />
      {isLoading && <LoadingOverlay />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 15,
  },
  spacer: {
    height: 35,
  },
});

export default TaskCreateModal;
