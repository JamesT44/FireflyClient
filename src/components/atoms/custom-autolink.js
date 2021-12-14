import React from 'react';
import { Text } from 'react-native-paper';
import Autolink from 'react-native-autolink';

import { openCustomTab } from '_utils';

const CustomAutolink = ({ text }) => {
  return (
    <Autolink
      text={text}
      onPress={openCustomTab}
      renderText={(content) => <Text>{content}</Text>}
    />
  );
};

export default CustomAutolink;
