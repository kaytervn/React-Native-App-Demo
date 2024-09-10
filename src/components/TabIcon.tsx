import { View, Text } from "react-native";
import React from "react";

const TabIcon = ({ focused, color, size, icon: Icon, label }: any) => {
  if (focused) {
    return (
      <View className="items-center border-t-2 border-blue-500 pt-1">
        <View style={{ position: "relative", width: size, height: size }}>
          <Icon
            fill={color}
            color={color}
            size={size}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          />
          <Icon
            color={"#000"}
            size={size}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
          />
        </View>
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
