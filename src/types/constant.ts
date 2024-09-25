import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const EmailPattern =
  /^(?!.*[.]{2,})[a-zA-Z0-9.%]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PhonePattern = /^0[35789][0-9]{8}$/;

const remoteUrl = "https://realtime-chat-app-api-tbaf.onrender.com";

const Stack = createNativeStackNavigator<{
  Loading: any;
  Login: any;
  Register: any;
  Home: any;
  ForgotPassword: any;
  ResetPassword: any;
  Verify: any;
  Profile: any;
  EditProfile: any;
}>();

const Tab = createBottomTabNavigator();

export { Tab, Stack, EmailPattern, PhonePattern, remoteUrl };