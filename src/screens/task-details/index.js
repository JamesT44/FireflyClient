import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  PermissionsAndroid,
} from 'react-native';
import {
  Button,
  Caption,
  Card,
  Divider,
  List,
  Text,
  Title,
} from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HTML from 'react-native-render-html';
import table, { IGNORED_TAGS } from '@native-html/table-plugin';
import { WebView } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import DocumentPicker from 'react-native-document-picker';

import {
  CommentDialog,
  ContentContainer,
  CustomAutolink,
  EventItem,
  HeaderButton,
  LoadingOverlay,
} from '_components';
import { useAuthContext } from '_contexts';
import {
  updateLocalTasks,
  getTaskUrl,
  getDescriptionUrl,
  getTaskAttachment,
  getTaskFile,
  getPageUrl,
  setTaskDoneStatusWithCheck,
  addTaskFile,
  addTaskComment,
} from '_api';
import { openCustomTab, momentLongXFormats, isTaskDone } from '_utils';
import { useEffect } from 'react';

const TaskDetailsModal = ({ navigation, route }) => {
  const { colors } = useTheme();
  const highlight = { color: colors.text };

  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(1);
  const webviewRef = useRef();

  const { auth } = useAuthContext();
  const { isLoading, error, data } = useQuery(
    'tasks',
    () => updateLocalTasks(auth),
    {
      refetchInterval: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
      cacheTime: Infinity,
    },
  );

  const taskObject = useMemo(() => data[route.params.id.toString()], [
    data,
    route,
  ]);
  const [taskDone, setTaskDone] = useState(isTaskDone(taskObject));
  useEffect(() => {
    setTaskDone(isTaskDone(taskObject));
  }, [taskObject]);

  const [descriptionShow, setDescriptionShow] = useState(
    taskObject.descriptionDetails &&
      !taskObject.descriptionDetails.isSimpleDescription
      ? 0
      : 1,
  );

  const queryClient = useQueryClient();
  const { mutate: mutateTD } = useMutation(
    () => setTaskDoneStatusWithCheck(auth, taskObject.id, !taskDone),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('tasks');
        setTaskDone(!taskDone);
        const previousTasks = queryClient.getQueryData('tasks');
        queryClient.setQueryData('tasks', (oldData) => {
          let newData = { ...oldData };
          newData[taskObject.id].recipientsResponses[0].responses.push({
            authorName: auth.userData.name,
            releasedTimestamp: moment().toISOString(),
            eventType: taskDone ? 'mark-as-undone' : 'mark-as-done',
          });
          return newData;
        });
        return { previousTasks };
      },
      onError: (err, _, context) => {
        console.warn(err);
        queryClient.setQueryData('tasks', context.previousTasks);
      },
      onSettled: (response) => {
        if (response === 'Task status already set') {
          return updateLocalTasks(auth, [taskObject.id])
            .then(() => queryClient.invalidateQueries('tasks'))
            .catch((err) => console.warn(err));
        } else {
          return queryClient.invalidateQueries('tasks');
        }
      },
    },
  );
  const { mutate: mutateAC } = useMutation(
    (comment) => addTaskComment(auth, taskObject.id, comment),
    {
      onMutate: async (comment) => {
        setCommentVisible(false);
        await queryClient.cancelQueries('tasks');
        const currTimestamp = moment().toISOString();
        const previousTasks = queryClient.getQueryData('tasks');
        queryClient.setQueryData('tasks', (oldData) => {
          let newData = { ...oldData };
          newData[taskObject.id].recipientsResponses[0].responses.push({
            authorName: auth.userData.name,
            message: comment,
            eventType: 'comment',
            releasedTimestamp: currTimestamp,
          });
          return newData;
        });
        return { previousTasks };
      },
      onError: (err, _, context) => {
        console.warn(err);
        queryClient.setQueryData('tasks', context.previousTasks);
      },
      onSettled: () => {
        return queryClient.invalidateQueries('tasks');
      },
    },
  );
  const { mutate: mutateAF } = useMutation(
    (file) => addTaskFile(auth, taskObject.id, file),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('tasks');
        setLoadingVisible(true);
      },
      onError: (err) => {
        console.warn(err);
      },
      onSettled: (response) => {
        queryClient.setQueryData('tasks', (oldData) => {
          let newData = { ...oldData };
          newData[taskObject.id].recipientsResponses[0].responses.push({
            authorName: auth.userData.name,
            file: {
              resourceId: response.description.files[0].id.value,
              fileName: response.description.files[0].title,
            },
            releasedTimestamp: response.state.releasedAt,
            eventType: 'add-file',
            eventGuid: response.description.eventGuid,
          });
          return newData;
        });
        // console.log(JSON.stringify(response, null, 2));
        setLoadingVisible(false);
        return queryClient.invalidateQueries('tasks');
      },
    },
  );

  const addFile = async () => {
    try {
      const file = await DocumentPicker.pick();
      mutateAF(file);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        throw err;
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: taskObject.title,

      headerRight: () => (
        <HeaderButton.Open
          onPress={() => openCustomTab(getTaskUrl(auth, taskObject.id))}
        />
      ),
    });
  }, [navigation, taskObject, auth]);

  const dueDateX = taskObject.dueDate
    ? moment(taskObject.dueDate).calendar(momentLongXFormats)
    : null;
  const setDateX = moment(taskObject.setDate).calendar(momentLongXFormats);
  const descriptionWidth =
    useWindowDimensions().width -
    2 * (styles.card.marginHorizontal + styles.card.paddingHorizontal);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    console.warn(error.message);
    return <LoadingOverlay />;
  }

  const isEmptyNode = (node) =>
    node &&
    (node.name === 'br' ||
      (node.name === 'p' && node.children.every(isEmptyNode)));

  // const alterChildren = (node) => {
  //   const newChildren = [];
  //   let prevEmpty = 0;
  //   for (const child of node.children) {
  //     if (isEmptyNode(child)) {
  //       if (
  //         prevEmpty < 2 &&
  //         newChildren[newChildren.length - 1].type === 'text'
  //       ) {
  //         prevEmpty++;
  //         child.children = [];
  //         child.name = 'br';
  //         child.prev = null;
  //         child.next = null;
  //         if (newChildren.length) {
  //           child.prev = newChildren[newChildren.length - 1];
  //           newChildren[newChildren.length - 1].next = child;
  //         }
  //         newChildren.push(child);
  //       }
  //     } else {
  //       prevEmpty = 0;
  //       child.prev = null;
  //       child.next = null;
  //       if (newChildren.length) {
  //         child.prev = newChildren[newChildren.length - 1];
  //         newChildren[newChildren.length - 1].next = child;
  //       }
  //       newChildren.push(child);
  //     }
  //   }
  //   return newChildren;
  // };

  const ignoreNode = (node) => (!node.prev || !node.next) && isEmptyNode(node);
  const alterNode = (node) => {
    if (isEmptyNode(node)) {
      node.children = [];
      node.name = 'br';
      return node;
    }
  };

  const requestFSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return granted === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openTaskAttachment = async (attachment) => {
    const canDownload = await requestFSPermission();
    if (!canDownload) {
      return;
    }

    setLoadingVisible(true);
    return getTaskAttachment(auth, taskObject.id, attachment)
      .then((res) => {
        setLoadingVisible(false);
        RNFetchBlob.android.actionViewIntent(res.path(), attachment.fileType);
      })
      .catch((err) => {
        setLoadingVisible(false);
        console.warn(err);
      });
  };

  const openTaskFile = async (eventGuid, file) => {
    const canDownload = await requestFSPermission();
    if (!canDownload) {
      return;
    }

    setLoadingVisible(true);
    return getTaskFile(auth, eventGuid, file)
      .then((res) => {
        setLoadingVisible(false);
        RNFetchBlob.android.actionViewIntent(res.path(), file.fileType);
      })
      .catch((err) => {
        setLoadingVisible(false);
        console.warn(err);
      });
  };

  const fileAttachmentComponents = taskObject.fileAttachments
    ? taskObject.fileAttachments.map(
        ({ resourceId, fileName, fileType }, index) => {
          return (
            <View key={resourceId.toString()}>
              {index ? <Divider /> : null}
              <List.Item
                style={styles.attachment}
                titleStyle={styles.attachmentLabel}
                title={fileName}
                onPress={() =>
                  openTaskAttachment({
                    resourceId,
                    fileName,
                    fileType,
                  })
                }
                left={() => (
                  <View style={styles.attachmentIcon}>
                    <MaterialCommunityIcons
                      name="attachment"
                      size={25}
                      color={colors.text}
                    />
                  </View>
                )}
              />
            </View>
          );
        },
      )
    : [];

  const pageAttachmentComponents = taskObject.pageAttachments
    ? taskObject.pageAttachments.map(({ pageId, titleShort }, index) => {
        return (
          <View key={'p' + pageId.toString()}>
            {index > 0 || fileAttachmentComponents.length > 0 ? (
              <Divider />
            ) : null}
            <List.Item
              style={styles.attachment}
              titleStyle={styles.attachmentLabel}
              title={titleShort}
              onPress={() => openCustomTab(getPageUrl(auth, pageId))}
              left={() => (
                <View style={styles.attachmentIcon}>
                  <MaterialCommunityIcons
                    name="link"
                    size={25}
                    color={colors.text}
                  />
                </View>
              )}
            />
          </View>
        );
      })
    : [];

  const attachmentsComponents = [
    ...fileAttachmentComponents,
    ...pageAttachmentComponents,
  ];

  return (
    <>
      <ContentContainer style={styles.container}>
        <Card
          style={[styles.card, styles.titleCard]}
          onPress={() => setCaptionExpanded((curr) => !curr)}>
          <View style={styles.titleSection}>
            <Title style={highlight}>{taskObject.title}</Title>
            <Caption
              style={styles.caption}
              numberOfLines={captionExpanded ? 0 : 1}>
              {dueDateX
                ? dueDateX.endsWith('X')
                  ? 'Due on '
                  : 'Due '
                : 'No due date'}
              {dueDateX && (
                <Caption style={[styles.caption, highlight]}>
                  {dueDateX.endsWith('X') ? dueDateX.slice(0, -1) : dueDateX}
                </Caption>
              )}
            </Caption>
            <Caption
              style={styles.caption}
              numberOfLines={captionExpanded ? 0 : 1}>
              {setDateX.endsWith('X') ? 'Set on ' : 'Set '}
              <Caption style={[styles.caption, highlight]}>
                {setDateX.endsWith('X') ? setDateX.slice(0, -1) : setDateX}
              </Caption>
              {' by '}
              <Caption style={[styles.caption, highlight]}>
                {taskObject.setter.name}
              </Caption>
              {' to '}
              <Caption style={[styles.caption, highlight]}>
                {taskObject.addressees
                  .map((addressee) => addressee.principal.name)
                  .join(', ')}
              </Caption>
            </Caption>
          </View>
          <Divider />
          <View style={styles.actionContainer}>
            <Button
              compact
              uppercase={false}
              labelStyle={styles.actionLabel}
              onPress={addFile}>
              Add a File
            </Button>
            <Button
              compact
              uppercase={false}
              labelStyle={styles.actionLabel}
              onPress={() => setCommentVisible(true)}>
              Add a Comment
            </Button>
            <Button
              mode="contained"
              compact
              icon={taskDone ? 'undo' : 'check-bold'}
              uppercase={false}
              style={styles.containedAction}
              labelStyle={styles.actionLabel}
              onPress={mutateTD}>
              {taskDone ? 'Mark as To Do' : 'Mark as Done'}
            </Button>
          </View>
        </Card>
        {attachmentsComponents.length > 0 && (
          <Card style={styles.attachmentsCard}>
            <List.Section style={styles.attachmentsList}>
              {attachmentsComponents}
            </List.Section>
          </Card>
        )}
        <Card style={styles.card}>
          {taskObject.recipientsResponses[0].responses
            .sort((eventA, eventB) =>
              moment(eventA.releasedTimestamp).isBefore(
                moment(eventB.releasedTimestamp),
              )
                ? 1
                : -1,
            )
            .map((event, index) => (
              <EventItem
                key={uuidv4()}
                divider={index > 0}
                event={event}
                openTaskFile={openTaskFile}
              />
            ))}
        </Card>
        {descriptionShow === 0 && (
          <Card style={styles.card}>
            <Text style={styles.simpleDescription}>Loading description</Text>
          </Card>
        )}
        <Card
          style={[
            taskObject.descriptionDetails &&
            !taskObject.descriptionDetails.isSimpleDescription
              ? styles.webviewCard
              : styles.card,
            { opacity: descriptionShow },
          ]}>
          {taskObject.descriptionDetails &&
          !taskObject.descriptionDetails.isSimpleDescription ? (
            <WebView
              ref={webviewRef}
              style={{ height: descriptionHeight }}
              source={{
                uri: getDescriptionUrl(auth, taskObject.descriptionPageUrl),
              }}
              scalesPageToFit={false}
              scrollEnabled={false}
              injectedJavaScriptBeforeContentLoaded="window.onload = function() {window.ReactNativeWebView.postMessage(document.body.scrollHeight)}; true;"
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={(event) => {
                console.log(event);
                setDescriptionHeight(+event.nativeEvent.data);
                setDescriptionShow(1);
              }}
              onNavigationStateChange={(navState) => {
                if (navState.canGoBack) {
                  webviewRef.current.stopLoading();
                  webviewRef.current.goBack();
                  openCustomTab(navState.url);
                }
              }}
            />
          ) : taskObject.descriptionDetails &&
            taskObject.descriptionDetails.htmlContent ? (
            taskObject.descriptionDetails.htmlContent.includes('</') ? (
              <HTML
                source={{
                  html: `<customwrapper>${taskObject.descriptionDetails.htmlContent
                    .replace(/\s+/g, ' ')
                    .replace(
                      /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]|\((?:[^\s()<>]|(?:\([^\s()<>]+\)))*\))+(?:\((?:[^\s()<>]|(?:\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’])"?(?:<\/a)?)/gi,
                      (match) =>
                        match.endsWith('"') || match.endsWith('</a')
                          ? match
                          : `<a href="${match}">${match}</a>`,
                    )}</customwrapper>`,
                }}
                contentWidth={descriptionWidth}
                // alterChildren={alterChildren}
                alterNode={alterNode}
                ignoreNodesFunction={ignoreNode}
                listsPrefixesRenderers={{
                  ul: () => {
                    return <Text style={{ color: colors.text }}>{'•  '}</Text>;
                  },
                }}
                WebView={WebView}
                ignoredTags={IGNORED_TAGS}
                onLinkPress={(_, href) => openCustomTab(href)}
                renderers={{
                  customwrapper: (_, children) => {
                    return children;
                  },
                  table,
                }}
                tagsStyles={{ customwrapper: { color: colors.text } }}
              />
            ) : (
              <View style={styles.simpleDescription}>
                <CustomAutolink
                  text={taskObject.descriptionDetails.htmlContent}
                />
              </View>
            )
          ) : (
            <Text style={styles.simpleDescription}>No description</Text>
          )}
        </Card>
      </ContentContainer>
      {loadingVisible && <LoadingOverlay />}
      <CommentDialog
        visible={commentVisible}
        onCancel={() => setCommentVisible(false)}
        onSubmit={mutateAC}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 15,
    flexGrow: 1,
  },
  card: {
    marginHorizontal: 12,
    marginTop: 15,
    paddingHorizontal: 10,
  },
  webviewCard: {
    marginHorizontal: 12,
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  attachmentsCard: {
    marginHorizontal: 12,
    marginTop: 15,
  },
  attachmentsList: {
    marginVertical: 0,
  },
  titleSection: {
    paddingBottom: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  actionLabel: {
    fontSize: 13,
  },
  containedAction: {
    marginLeft: 8,
  },
  simpleDescription: {
    marginVertical: 10,
  },
  attachment: {
    paddingHorizontal: 10,
  },
  attachmentLabel: {
    color: '#0e7afe',
  },
  attachmentIcon: {
    justifyContent: 'center',
  },
  caption: {
    fontSize: 14,
  },
});

export default TaskDetailsModal;
