import React from "react";
import {
  MessageCircleMoreIcon,
  BookUserIcon,
  UserRoundIcon,
  NewspaperIcon,
  BellIcon,
} from "lucide-react-native";
import Chat from "./Chat";
import Profile from "./Profile";
import { Tab } from "@/src/types/constant";
import TabIcon from "@/src/components/TabIcon";
import Friends from "./Friends";
import Post from "./Post";
import Notification from "./Notification";

const Home = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: "#ccc",
        },
        tabBarActiveTintColor: "royalblue",
        tabBarInactiveTintColor: "#6c757d",
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              icon={MessageCircleMoreIcon}
              label="Tin nhắn"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              icon={BookUserIcon}
              label="Bạn bè"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={Post}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              icon={NewspaperIcon}
              label="Bài đăng"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              icon={BellIcon}
              label="Thông báo"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              color={color}
              size={size}
              focused={focused}
              icon={UserRoundIcon}
              label="Cá nhân"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Home;
