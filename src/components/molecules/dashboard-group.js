import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, List } from 'react-native-paper';

const DashboardGroup = ({ items, title, renderer }) => {
  return items.length ? (
    <Card style={styles.card}>
      <List.Accordion title={title}>{items.map(renderer)}</List.Accordion>
    </Card>
  ) : null;
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
  },
});

export default DashboardGroup;
