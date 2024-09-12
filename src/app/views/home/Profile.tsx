import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Intro from "@/src/components/Intro";
import { PencilIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { remoteUrl } from "@/src/types/constant";
import UserIcon from "@/src/assets/user_icon.png";
const Profile = () => {
  const [profile, setProfile] = useState({
    name: null,
    email: null,
    avatarUrl: null,
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const response = await fetch(`${remoteUrl}/v1/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.data.displayName,
            email: data.data.email,
            avatarUrl: data.data.avatarUrl || UserIcon,
          });
        } else {
          console.log(response.json());
        }
      } catch (error) {
        console.log(error);
      } finally {
      }
    };
    fetchProfile();
  }, []);

  return (
    <Intro
      color="royalblue"
      title="TÀI KHOẢN"
      topComponent={
        <View className="flex-row items-center my-5 space-x-3">
          <Image
            source={profile?.avatarUrl ? { uri: profile.avatarUrl } : UserIcon}
            className="w-20 h-20 rounded-full"
          />
          <View>
            <Text className="text-xl font-bold text-white">{profile.name}</Text>
            <Text className="text-md text-gray-300">{profile.email}</Text>
          </View>
          <TouchableOpacity>
            <PencilIcon size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      }
    ></Intro>
  );
};

export default Profile;
