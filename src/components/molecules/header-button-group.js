import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQueryClient } from 'react-query';

import { HeaderButton } from '_atoms';
import { usePreferencesContext } from '_contexts';

const ButtonGroupContainer = ({ children }) => (
  <View style={styles.container}>{children}</View>
);

const RefreshAvatar = ({ avatarOnPress }) => {
  const { preferences } = usePreferencesContext();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries('tasks'),
      queryClient.refetchQueries('messages'),
      queryClient.refetchQueries('bookmarks'),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ButtonGroupContainer>
      <HeaderButton.Refresh onPress={onRefresh} refreshing={refreshing} />
      <HeaderButton.Avatar
        onPress={avatarOnPress}
        source={{ uri: preferences.profilePic }}
      />
    </ButtonGroupContainer>
  );
};

const OptionsAvatar = ({ optionsOnPress, avatarOnPress }) => {
  const { preferences } = usePreferencesContext();
  return (
    <ButtonGroupContainer>
      <HeaderButton.Options onPress={optionsOnPress} />
      <HeaderButton.Avatar
        onPress={avatarOnPress}
        source={{ uri: preferences.profilePic }}
      />
    </ButtonGroupContainer>
  );
};

const DateAvatar = ({ dateOnPress, avatarOnPress }) => {
  const { preferences } = usePreferencesContext();
  return (
    <ButtonGroupContainer>
      <HeaderButton.Date onPress={dateOnPress} />
      <HeaderButton.Avatar
        onPress={avatarOnPress}
        source={{ uri: preferences.profilePic }}
      />
    </ButtonGroupContainer>
  );
};

const HeaderButtonGroup = { RefreshAvatar, DateAvatar, OptionsAvatar };

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
});

export default HeaderButtonGroup;
