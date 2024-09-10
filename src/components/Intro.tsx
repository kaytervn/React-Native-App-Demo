import {
  View,
  Text,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import Toast from "react-native-toast-message";

const Intro = ({
  color,
  header,
  subHeader,
  children,
  loading,
  dialog,
  topComponent,
  title,
}: any) => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      {title && (
        <Text
          className="text-white text-start text-2xl font-bold px-3 pt-3"
          style={{ backgroundColor: color }}
        >
          {title}
        </Text>
      )}
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: color }}
      >
        <StatusBar barStyle="light-content" backgroundColor="black" />
        {topComponent}
        <View
          className={`bg-white rounded-t-3xl p-6 flex-1 w-full ${
            topComponent ? "" : "mt-20"
          }`}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-3xl font-bold" style={{ color }}>
              {header}
            </Text>
            <Text className="text-base mb-8 text-gray-600">{subHeader}</Text>
            {children}
          </ScrollView>
        </View>
        <Toast />
        {loading}
        {dialog}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Intro;
