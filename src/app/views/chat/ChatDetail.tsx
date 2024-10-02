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
import { ArrowLeft, Search, Menu } from "lucide-react-native";

const ChatDetail = ({ navigation, route }: any) => {
  const { chatId } = route.params;
  const messages = [
    {
      id: 1,
      sender: "Hữu Tài",
      message: "Hello bạn!!!",
      time: "12:00",
      isMe: false,
    },
    {
      id: 2,
      message: "Hello bạn!!!",
      time: "12:00",
      isMe: true,
    },
    {
      id: 3,
      sender: "Hữu Tài",
      message: "Chiều nay rảnh khum?",
      time: "12:00",
      isMe: false,
    },
    {
      id: 4,
      message:
        "Tớ rảnh nha. Bạn muốn đi đâu? Chúng mình đi thư viện học bài nhé!",
      time: "12:00",
      isMe: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-blue-300 bg-sky-500">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Image
            source={require("../../../assets/user_icon.png")}
            className="w-10 h-10 rounded-full ml-3"
          />
          <Text className="ml-3 font-bold text-lg text-white">Hữu Tài</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4">
            <Search size={24} className="text-white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Menu size={24} className="text-white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView className="flex-1 px-4 py-4">
        {messages.map((message) => (
          <View
            key={message.id}
            className={`flex-row ${
              message.isMe ? "flex-row-reverse" : ""
            } mb-4`}
          >
            {!message.isMe && (
              <Image
                source={require("../../../assets/user_icon.png")}
                className="w-8 h-8 rounded-full mr-2 mt-1"
              />
            )}
            <View
              className={`rounded-2xl p-3 max-w-[70%] ${
                message.isMe ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text className={`${message.isMe ? "text-white" : "text-black"}`}>
                {message.message}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View className="flex-row items-center p-4 border-t border-gray-300">
        <TextInput
          className="flex-1 bg-gray-200 rounded-full px-4 py-2"
          placeholder="Nhập tin nhắn"
        />
        <TouchableOpacity className="ml-2">
          <Text className="text-blue-500 font-bold">Gửi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChatDetail;
