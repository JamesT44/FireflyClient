import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

const NewTaskFAB = ({ onPress, marginBottom = 0 }) => (
  <FAB
    style={[styles.fab, { marginBottom: marginBottom + 16 }]}
    icon="plus"
    onPress={onPress}
  />
);

const FABBottomPadding = () => <View style={styles.padding} />;
NewTaskFAB.BottomPadding = FABBottomPadding;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    marginRight: 16,
    right: 0,
    bottom: 0,
  },
  padding: {
    height: 88,
  },
});

export default NewTaskFAB;
