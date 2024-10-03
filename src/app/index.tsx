import React, { useEffect, useState } from "react";
import Login from "./views/Login";
import Loading from "./views/Loading";
import Register from "./views/Register";
import Home from "./views/home/Home";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import { remoteUrl, Stack, StackScreenNames } from "../types/constant";
import Verify from "./views/Verify";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditProfle from "./views/home/EditProfile";
import Profile from "./views/home/Profile";
import ChangePassword from "./views/home/ChangePassword";
import PostDetail from "./views/post/PostDetail";
import Post from "./views/home/Post";
import PostCreateUpdate from "./views/post/PostCreateUpdate";
import ChatList from "./views/chat/ChatList";
import ChatDetail from "./views/chat/ChatDetail";

const AppNavigator = ({ isAuthenticated }: any) => (
  <Stack.Navigator
    initialRouteName={isAuthenticated ? "Home" : "Login"}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    <Stack.Screen name="ResetPassword" component={ResetPassword} />
    <Stack.Screen name="Verify" component={Verify} />
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="EditProfile" component={EditProfle} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="ChangePassword" component={ChangePassword} />
    <Stack.Screen name="Post" component={Post} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="PostCreateUpdate" component={PostCreateUpdate}/>
    <Stack.Screen name="ChatList" component={ChatList} />
    <Stack.Screen name="ChatDetail" component={ChatDetail} />
  </Stack.Navigator>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const response = await fetch(`${remoteUrl}/v1/user/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: token,
          }),
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.removeItem("accessToken");
          setIsAuthenticated(false);
        }
      } catch (error) {
        await AsyncStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  return (
    <>
      {isLoading ? (
        <Stack.Navigator
          initialRouteName="Loading"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Loading" component={Loading} />
        </Stack.Navigator>
      ) : (
        <AppNavigator isAuthenticated={isAuthenticated} />
      )}
    </>
  );
};

export default App;
