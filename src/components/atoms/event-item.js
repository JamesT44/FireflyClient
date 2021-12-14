import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Caption, Divider, List, Text } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

import { Chip, CustomAutolink } from '_atoms';
import { momentDateTimeFormats } from '_utils';

const EventItem = ({ divider, event, openTaskFile }) => {
  const { colors } = useTheme();

  let messageText;
  let extras = null;
  switch (event.eventType) {
    case 'set-task':
      messageText = 'set this task.';
      break;
    case 'mark-as-done':
      messageText = 'marked this task as done.';
      break;
    case 'mark-as-undone':
      messageText = 'marked this task as to do.';
      break;
    case 'archive-task':
      messageText = 'archived this task.';
      break;
    case 'unarchive-task':
      messageText = 'unarchived this task.';
      break;
    case 'edit-task':
      messageText = 'edited this task.';
      break;
    case 'comment':
      messageText = 'added a comment:';
      extras = <CustomAutolink text={event.message} />;
      break;
    case 'add-file':
      messageText = 'added a file:';
      extras = (
        <List.Item
          style={styles.file}
          titleStyle={styles.fileLabel}
          title={event.file.fileName}
          onPress={() => openTaskFile(event.eventGuid, event.file)}
          left={() => (
            <View style={styles.fileIcon}>
              <MaterialCommunityIcons
                name="attachment"
                size={25}
                color={colors.text}
              />
            </View>
          )}
        />
      );
      break;
    case 'mark-and-grade':
      const maxMark =
        event.taskAssessmentDetails.assessmentMarkMax ?? event.outOf ?? '-';
      if (event.mark !== null) {
        if (event.grade) {
          messageText = 'added a mark and a grade:';
          extras = (
            <>
              <View style={styles.rowContainer}>
                <Chip.Info backgroundColor={colors.primary}>
                  {`${event.mark}/${maxMark}`}
                </Chip.Info>
                <Chip.Info backgroundColor={colors.primary}>
                  {`${event.grade}`}
                </Chip.Info>
              </View>
              {event.message.trim() ? (
                <CustomAutolink text={event.message.trim()} />
              ) : null}
            </>
          );
        } else {
          messageText = 'added a mark:';
          extras = (
            <>
              <View style={styles.rowContainer}>
                <Chip.Info backgroundColor={colors.primary}>
                  {`${event.mark}/${maxMark}`}
                </Chip.Info>
              </View>
              {event.message.trim() ? (
                <CustomAutolink text={event.message.trim()} />
              ) : null}
            </>
          );
        }
      } else {
        if (event.grade) {
          messageText = 'added a grade:';
          extras = (
            <>
              <View style={styles.rowContainer}>
                <Chip.Info backgroundColor={colors.primary}>
                  {`${event.grade}`}
                </Chip.Info>
              </View>
              {event.message.trim() ? (
                <CustomAutolink text={event.message.trim()} />
              ) : null}
            </>
          );
        } else if (event.message.trim()) {
          messageText = 'added feedback:';
          extras = <CustomAutolink text={event.message.trim()} />;
        } else {
          return null;
        }
      }
      break;
    case 'confirm-task-is-complete':
      messageText = 'confirmed this task is complete.';
      break;
    case 'send-reminder':
      messageText = 'sent a reminder.';
      break;
    case 'revert-task-to-to-do':
      messageText = "reverted this task to 'to do'.";
      break;
    case 'request-resubmission':
      messageText = 'requested resubmission.';
      break;
    default:
      console.log(`Unexpected task response event type: ${event.eventType}`);
      messageText = `did event "${event.eventType.replace(/-/g, ' ')}"`;
  }
  // console.log(itemKey);
  return (
    <View>
      {divider && <Divider />}
      <View style={styles.container}>
        <View style={styles.captionContainer}>
          <Caption
            style={
              styles.caption
            }>{`${event.authorName} ${messageText}`}</Caption>
          <Caption style={styles.caption}>{`${moment(
            event.releasedTimestamp,
          ).calendar(momentDateTimeFormats)}`}</Caption>
        </View>
        {extras}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  caption: {
    fontSize: 11,
    lineHeight: 11,
  },
  file: {
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  fileLabel: {
    color: '#0e7afe',
  },
  fileIcon: {
    justifyContent: 'center',
  },
});

export default EventItem;
