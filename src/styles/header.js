import { useTheme } from '@react-navigation/native';

const useHeaderStyle = () => {
  const { colors, dark } = useTheme();

  return {
    headerStyle: {
      backgroundColor: dark ? colors.border : colors.primary,
    },
    headerTintColor: 'white',
  };
};

export default useHeaderStyle;
