import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Text, Divider } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import color from 'color';
import moment from 'moment';
import Autolink from 'react-native-autolink';

import { Chip } from '_atoms';
import { openCustomTab, momentLongFormats } from '_utils';

const ItemContainer = ({
  swipeText = null,
  swipeColour = null,
  onSwipe = null,
  style = null,
  children,
  divider,
}) => {
  const swipeableRef = useRef(null);

  return (
    <View style={style}>
      {divider && <Divider />}
      {swipeText ? (
        <Swipeable
          ref={swipeableRef}
          leftThreshold={100}
          rightThreshold={100}
          renderLeftActions={() => (
            <View style={[styles.swipeLeft, { backgroundColor: swipeColour }]}>
              <Text style={styles.swipeText}>{swipeText}</Text>
            </View>
          )}
          renderRightActions={() => (
            <View style={[styles.swipeRight, { backgroundColor: swipeColour }]}>
              <Text style={styles.swipeText}>{swipeText}</Text>
            </View>
          )}
          onSwipeableOpen={() => {
            // swipeableRef.current.close();
            const { dragX, rowTranslation } = swipeableRef.current.state;
            dragX.setValue(0);
            rowTranslation.setValue(0);
            swipeableRef.current.setState({ rowState: 0 });
            onSwipe();
          }}>
          {children}
        </Swipeable>
      ) : (
        children
      )}
    </View>
  );
};

const Task = React.memo(
  ({
    title,
    addressees,
    setter,
    due,
    done,
    numAttachments,
    grades,
    onPress,
    onSwipe,
    backgroundColor = null,
    divider = true,
  }) => {
    const { colors } = useTheme();
    const itemStyle = { backgroundColor: backgroundColor ?? colors.background };
    const descriptionColor = color(colors.text).alpha(0.54).rgb().string();
    const descriptionStyle = { color: descriptionColor, fontSize: 14 };

    const swipeText = done ? 'Mark as\nto do' : 'Mark as\ndone';
    const swipeColour = done ? 'red' : 'green';
    const overdue =
      !done && moment(due).startOf('day').isBefore(moment().startOf('day'));

    return (
      <ItemContainer
        swipeText={swipeText}
        swipeColour={swipeColour}
        onSwipe={onSwipe}
        style={styles.container}
        divider={divider}>
        <List.Item
          title={title}
          titleStyle={{ color: colors.text }}
          style={itemStyle}
          onPress={onPress}
          description={() => {
            return (
              <View>
                <Text
                  selectable={false}
                  numberOfLines={1}
                  style={descriptionStyle}>
                  {`Set by ${setter}`}
                </Text>
                <Text
                  selectable={false}
                  numberOfLines={1}
                  style={descriptionStyle}>
                  {addressees.length
                    ? `To ${addressees.join(', ')}`
                    : 'Recipients hidden'}
                </Text>
                <View style={styles.rowContainer}>
                  {[
                    numAttachments ? (
                      <Chip.Info
                        key="attachments"
                        backgroundColor={colors.primary}
                        icon="attachment">
                        {numAttachments}
                      </Chip.Info>
                    ) : null,
                    ...grades.map((grade, i) => (
                      <Chip.Info
                        key={`grade${i}`}
                        backgroundColor={colors.primary}>
                        {grade}
                      </Chip.Info>
                    )),
                    done ? (
                      <Chip.Info
                        key="doneStatus"
                        backgroundColor="green"
                        icon="check">
                        DONE
                      </Chip.Info>
                    ) : overdue ? (
                      <Chip.Info key="doneStatus" backgroundColor="red">
                        OVERDUE
                      </Chip.Info>
                    ) : (
                      <Chip.Info
                        key="doneStatus"
                        backgroundColor={colors.primary}>
                        TO DO
                      </Chip.Info>
                    ),
                  ]}
                  <Text
                    selectable={false}
                    numberOfLines={1}
                    style={[descriptionStyle, { color: colors.text }]}>
                    {due
                      ? `Due ${moment(due).calendar(momentLongFormats)}`
                      : 'No due date'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </ItemContainer>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.addressees.join(', ') === nextProps.addressees.join(', ') &&
      prevProps.setter === nextProps.setter &&
      prevProps.due === nextProps.due &&
      prevProps.done === nextProps.done &&
      prevProps.numAttachments === nextProps.numAttachments &&
      prevProps.grades.length === nextProps.grades.length && //Lazy comparison
      prevProps.backgroundColor === nextProps.backgroundColor &&
      prevProps.divider === nextProps.divider
    );
  },
);

const Message = React.memo(
  ({
    archived,
    description,
    recipients,
    setter,
    sent,
    onSwipe,
    backgroundColor,
    divider = true,
  }) => {
    const { colors } = useTheme();
    const itemStyle = { backgroundColor: backgroundColor ?? colors.background };
    const descriptionColor = color(colors.text).alpha(0.54).rgb().string();
    const descriptionStyle = { color: descriptionColor, fontSize: 14 };

    const swipeText = archived ? 'Move\nto inbox' : 'Archive';
    const swipeColour = archived ? colors.primary : 'green';

    return (
      <ItemContainer
        swipeText={swipeText}
        swipeColour={swipeColour}
        onSwipe={onSwipe}
        divider={divider}>
        <List.Item
          title={<Autolink text={description} onPress={openCustomTab} />}
          titleStyle={[styles.messageTitle, { color: colors.text }]}
          titleNumberOfLines={0}
          style={itemStyle}
          description={() => {
            return (
              <View>
                <Text selectable={false} style={descriptionStyle}>
                  {`Sent by ${setter} ${
                    recipients.length ? `to ${recipients}` : ''
                  } on ${moment(sent).calendar(momentLongFormats)}`}
                </Text>
              </View>
            );
          }}
        />
      </ItemContainer>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.archived === nextProps.archived &&
      prevProps.description === nextProps.description &&
      prevProps.recipients === nextProps.recipients &&
      prevProps.setter === nextProps.setter &&
      prevProps.sent === nextProps.sent &&
      prevProps.backgroundColor === nextProps.backgroundColor &&
      prevProps.divider === nextProps.divider
    );
  },
);

const Bookmark = React.memo(
  ({ title, breadcrumb, creator, created, url, divider = true }) => {
    const { colors } = useTheme();
    const descriptionColor = color(colors.text).alpha(0.54).rgb().string();
    const descriptionStyle = { color: descriptionColor, fontSize: 14 };
    return (
      <ItemContainer style={styles.container} divider={divider}>
        <List.Item
          title={title}
          titleStyle={{ color: colors.text }}
          onPress={() => openCustomTab(url)}
          description={() => {
            return (
              <View>
                <Text
                  selectable={false}
                  numberOfLines={1}
                  style={descriptionStyle}>
                  {breadcrumb}
                </Text>
                <Text
                  selectable={false}
                  numberOfLines={1}
                  style={descriptionStyle}>
                  {`Created by ${creator}`}
                </Text>
                <Text
                  selectable={false}
                  numberOfLines={1}
                  style={descriptionStyle}>
                  {`On ${moment(created).calendar(momentLongFormats)}`}
                </Text>
              </View>
            );
          }}
        />
      </ItemContainer>
    );
  },
);

const ITEM_HEIGHT = 111;

const Item = { Task, Message, Bookmark, ITEM_HEIGHT };

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
  },
  rowContainer: {
    paddingTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeLeft: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  swipeRight: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  swipeText: {
    color: 'white',
    fontSize: 15,
    padding: 20,
    textAlign: 'center',
  },
  messageTitle: {
    fontSize: 15,
  },
});

export default Item;
