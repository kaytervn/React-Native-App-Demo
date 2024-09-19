import React, { useEffect, useState } from "react";
import Login from "./views/Login";
import Loading from "./views/Loading";
import Register from "./views/Register";
import Home from "./views/home/Home";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import { remoteUrl, Stack } from "../types/constant";
import Verify from "./views/Verify";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditProfile from "./views/home/EditProfile";

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
    <Stack.Screen name="EditProfile" component={EditProfile} />
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
