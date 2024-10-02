import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { SettingsIcon } from "lucide-react-native";

const ChatList = ({ navigation }: any) => {
  const chats = [
    {
      id: 1,
      name: "Hữu Tài",
      avatar: require("../../../assets/user_icon.png"),
      lastMessage: "Tớ rảnh nha.",
      date: "13/9",
    },

    {
      id: 2,
      name: "Văn Trung",
      avatar: require("../../../assets/user_icon.png"),
      lastMessage: "Hehe",
      date: "13/9",
    },

    {
      id: 3,
      name: "Trọng",
      avatar: require("../../../assets/user_icon.png"),
      lastMessage: "12345 nha bạn",
      date: "11/9",
    },

    {
      id: 4,
      name: "Lê Trọng Dũng",
      avatar: require("../../../assets/user_icon.png"),
      lastMessage: "Oke nha",
      date: "10/9",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-300">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-200 rounded-full px-4 py-2"
            placeholder="Tìm kiếm tin nhắn"
          />
          <TouchableOpacity className="ml-2">
            <SettingsIcon size={24} />
          </TouchableOpacity>
        </View>

        {/* Tab buttons */}
        <View className="flex-row mt-4">
          <TouchableOpacity className="mr-4">
            <Text className="font-bold">Bạn bè</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Text>Nhóm</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>Khác</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat list */}
      <ScrollView>
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            className="flex-row items-center p-4 border-b border-gray-300"
            onPress={() =>
              navigation.navigate("ChatDetail", { chatId: chat.id })
            }
          >
            <Image source={chat.avatar} className="w-12 h-12 rounded-full" />
            <View className="flex-1 ml-3">
              <Text className="font-bold">{chat.name}</Text>
              <Text className="text-gray-500">{chat.lastMessage}</Text>
            </View>
            <Text className="text-gray-400">{chat.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatList;
