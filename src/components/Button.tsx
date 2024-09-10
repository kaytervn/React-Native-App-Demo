import { Text, TouchableOpacity } from "react-native";
import React from "react";

const Button = ({ onPress, title, color }: any) => {
  return (
    <TouchableOpacity
      className="py-3 rounded-lg my-4"
      style={{ backgroundColor: color }}
      onPress={onPress}
    >
      <Text className="text-center text-white font-semibold text-lg">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
