import { View, Text } from "react-native";
import React from "react";

const TabIcon = ({ focused, color, size, icon: Icon, label }: any) => {
  if (focused) {
    return (
      <View className="items-center border-t-2 border-blue-500 pt-1">
        <Icon color={color} size={size} />
        <Text className="text-xs font-bold" style={{ color }}>
          {label}
        </Text>
      </View>
    );
  } else {
    return <Icon color={color} size={size - 3} />;
  }
};

export default TabIcon;
