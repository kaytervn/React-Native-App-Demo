import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import Intro from "@/src/components/Intro";
import { PencilIcon } from "lucide-react-native";

const Profile = () => {
  return (
    <Intro
      color="royalblue"
      title="TÀI KHOẢN"
      topComponent={
        <View className="flex-row items-center my-5 space-x-3">
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=11" }}
            className="w-20 h-20 rounded-full"
          />
          <View>
            <Text className="text-xl font-bold text-white">Sample Name</Text>
            <Text className="text-md text-gray-300">
              kienductrong@gmail.com
            </Text>
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
