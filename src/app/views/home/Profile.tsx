import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import Intro from "@/src/components/Intro";
import {
  CalendarIcon,
  InfoIcon,
  LogOutIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { remoteUrl } from "@/src/types/constant";
import UserIcon from "@/src/assets/user_icon.png";
import Button from "@/src/components/Button";
import InfoItem from "@/src/components/InfoItem";
import { useLoading } from "../../hooks/useLoading";
import { ConfimationDialog, LoadingDialog } from "@/src/components/Dialog";
import useDialog from "../../hooks/useDialog";

const Profile = ({ navigation }: any) => {
  const { isLoading, showLoading, hideLoading } = useLoading();
  const { isDialogVisible, showDialog, hideDialog } = useDialog();
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    birthDate: "",
    bio: "",
    avatarUrl: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        showLoading();
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
          setProfile(data.data);
        } else {
          console.log(await response.json());
        }
      } catch (error) {
        console.log(error);
      } finally {
        hideLoading();
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    hideDialog();
    AsyncStorage.removeItem("accessToken");
    navigation.navigate("Home");
    navigation.navigate("Login");
  };
  const handleLogoutDialog = () => {
    showDialog();
  };

  return (
    <Intro
      loading={<LoadingDialog isVisible={isLoading} />}
      color="royalblue"
      title="TÀI KHOẢN"
      topComponent={
        <View className="items-center my-5">
          <Image
            source={profile.avatarUrl ? { uri: profile.avatarUrl } : UserIcon}
            className="w-32 h-32 rounded-full"
          />
          <Text className="text-2xl font-bold text-white mt-2">
            {profile.displayName}
          </Text>
          <Text className="text-lg text-gray-200">{profile.email}</Text>
        </View>
      }
    >
      <View className="bg-white rounded-lg shadow-md">
        <InfoItem
          icon={<InfoIcon size={24} color="royalblue" />}
          label="Tiểu Sử"
          value={profile.bio}
        />
        <InfoItem
          icon={<PhoneIcon size={24} color="royalblue" />}
          label="Số Điện Thoại"
          value={profile.phone}
        />
        <InfoItem
          icon={<CalendarIcon size={24} color="royalblue" />}
          label="Ngày Sinh"
          value={profile.birthDate}
        />
      </View>
      <Button
        icon={PencilIcon}
        title="CHỈNH SỬA"
        color="royalblue"
        onPress={() => navigation.navigate("EditProfile")}
      />
      <Button
        icon={LogOutIcon}
        title="ĐĂNG XUẤT"
        color="red"
        onPress={handleLogoutDialog}
      />
      <ConfimationDialog
        isVisible={isDialogVisible}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        onConfirm={handleLogout}
        confirmText="Đăng xuất"
        onCancel={hideDialog}
        color="red"
      />
    </Intro>
  );
};

export default Profile;
