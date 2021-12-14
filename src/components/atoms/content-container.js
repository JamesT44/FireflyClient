import React from 'react';
import { FlatList, ScrollView, StyleSheet } from 'react-native';
import { wrapScrollView } from 'react-native-scroll-into-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const ScrollIntoViewScrollView = wrapScrollView(ScrollView);

export const ContentContainer = ({ children, style }) => (
  <SafeAreaView style={styles.container}>
    <ScrollIntoViewScrollView
      contentContainerStyle={style}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      fadingEdgeLength={50}>
      {children}
    </ScrollIntoViewScrollView>
  </SafeAreaView>
);

export const FlatListContainer = (props) => (
  <SafeAreaView style={styles.container}>
    <FlatList
      {...props}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      fadingEdgeLength={50}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
