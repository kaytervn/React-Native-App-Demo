import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const EmailPattern =
  /^(?!.*[.]{2,})[a-zA-Z0-9.%]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Stack = createNativeStackNavigator<{
  Loading: any;
  Login: any;
  Register: any;
  Home: any;
  ForgotPassword: any;
  ResetPassword: any;
}>();

const Tab = createBottomTabNavigator();

export { Tab, Stack, EmailPattern };
