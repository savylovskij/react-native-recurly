import { Text, View } from 'react-native';
import { Link } from 'expo-router';

const SignUp = () => {
  return (
    <View>
      <Text>Sign Up</Text>

      <Link href="/(auth)/sign-in">Sign In</Link>
    </View>
  );
};

export default SignUp;
