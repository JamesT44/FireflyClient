import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Title, Divider } from 'react-native-paper';

import {
  ChipGroup,
  ConfirmFAB,
  ContentContainer,
  ChipContainer,
  HeaderButton,
} from '_components';
import {
  useBookmarksOptionsContext,
  BOOKMARK_SORT_OPTIONS,
  BOOKMARK_TYPE_OPTIONS,
  INITIAL_BOOKMARKS_OPTIONS,
} from '_contexts';

const BookmarksOptionsModal = ({ navigation }) => {
  const {
    bookmarksOptions,
    setBookmarksOptions,
  } = useBookmarksOptionsContext();

  const [currBookmarksOptions, setCurrBookmarksOptions] = useState({
    sort: bookmarksOptions.sort,
    type: bookmarksOptions.type,
  });

  const handleSort = (label) => {
    setCurrBookmarksOptions((prevBookmarksOptions) => ({
      ...prevBookmarksOptions,
      sort: label,
    }));
  };
  const handleType = (label) => {
    setCurrBookmarksOptions((prevBookmarksOptions) => {
      if (prevBookmarksOptions.type.includes(label)) {
        return {
          ...prevBookmarksOptions,
          type: prevBookmarksOptions.type.filter((val) => val !== label),
        };
      } else {
        return {
          ...prevBookmarksOptions,
          type: [...prevBookmarksOptions.type, label],
        };
      }
    });
  };

  const confirmChanges = () => {
    setBookmarksOptions(currBookmarksOptions);
    navigation.navigate('Bookmarks');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton.Discard
          onPress={() => {
            navigation.navigate('Bookmarks');
          }}
        />
      ),
      headerRight: () => (
        <HeaderButton.Reset
          onPress={() => {
            setCurrBookmarksOptions({ ...INITIAL_BOOKMARKS_OPTIONS });
          }}
        />
      ),
    });
  }, [navigation, setBookmarksOptions]);

  return (
    <>
      <ContentContainer>
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Sort By</Title>
          <ChipContainer style={styles.chipContainer}>
            <ChipGroup.SelectSingle
              selected={currBookmarksOptions.sort}
              onChange={handleSort}
              labels={Object.values(BOOKMARK_SORT_OPTIONS)}
              checkmark={false}
            />
          </ChipContainer>
        </View>
        <Divider />
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Bookmark Type</Title>
          <ChipContainer style={styles.chipContainer}>
            <ChipGroup.SelectMultiple
              selected={currBookmarksOptions.type}
              onChange={handleType}
              labels={Object.values(BOOKMARK_TYPE_OPTIONS)}
            />
          </ChipContainer>
        </View>
        <Divider />
        <ConfirmFAB.BottomPadding />
      </ContentContainer>
      <ConfirmFAB label="Show bookmarks" onPress={confirmChanges} />
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

export default BookmarksOptionsModal;
