import React, { useState, useEffect, useMemo,useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import useFetch from "../../hooks/useFetch";
import userIcon from "../../../assets/user_icon.png";
import { MessageCircleIcon, UserPlusIcon } from "lucide-react-native";


interface Friend {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

const FriendsList = () => {
  const { get, loading } = useFetch();
  const [friends, setFriends] = useState<Friend[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("friends");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);


  const size = 10; // Number of friends to load per page

  const fetchFriends = useCallback(async (pageNumber: number, shouldRefresh: boolean = false) => {
    if (!hasMore && !shouldRefresh) return;

    try {

      const res = await get(`/v1/friendship/friends?page=${pageNumber}&size=${size}`);
      const newFriends = res.data.map((friendship: any) => ({

        _id: friendship.receiver._id,
        displayName: friendship.receiver.displayName,
        email: friendship.receiver.email,
        avatarUrl: friendship.receiver.avatarUrl,
      }));

      if (shouldRefresh) {
        setFriends(newFriends);
      } else {
        setFriends((prevFriends) => [...prevFriends, ...newFriends]);
      }

      setHasMore(newFriends.length === size);
      setPage(pageNumber);

    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [get, hasMore, size]);

  useEffect(() => {
    fetchFriends(0, true);
  }, [fetchFriends]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFriends(0, true).then(() => setRefreshing(false));
  }, [fetchFriends]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchFriends(page + 1);
    }
  };

  const filteredFriends = useMemo(() => {
    return friends.filter((friend) =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const openFriendModal = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedFriend(null);
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        onPress={() => openFriendModal(item)}
        className="flex-row items-center mb-4"
      >
        <Image
          source={item.avatarUrl ? { uri: item.avatarUrl } : userIcon}
          className="w-12 h-12 rounded-full mr-3"
          defaultSource={userIcon}
        />
        <View className="flex-1">
          <Text className="text-lg font-bold">{item.displayName}</Text>
          <Text className="text-gray-500">{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.displayName[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {} as Record<string, Friend[]>);

  const sortedGroups = Object.entries(groupedFriends).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 mb-3">
        <Ionicons name="search" size={20} color="#999" className="mr-2" />
        <TextInput
          className="flex-1 h-10 text-base"
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity className="p-2">
          <Ionicons name="qr-code-outline" size={24} color="#0084ff" />
        </TouchableOpacity>
      </View>

      <View className="flex-row border-b border-gray-200 mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "friends" ? "border-b-2 border-blue-500" : ""
          }`}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            className={`text-center text-base ${
              activeTab === "friends"
                ? "text-blue-500 font-bold"
                : "text-gray-500"
            }`}
          >
            Bạn bè
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "groups" ? "border-b-2 border-blue-500" : ""
          }`}
          onPress={() => setActiveTab("groups")}
        >
          <Text
            className={`text-center text-base ${
              activeTab === "groups"
                ? "text-blue-500 font-bold"
                : "text-gray-500"
            }`}
          >
            Nhóm
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <TouchableOpacity className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3">
          <Ionicons name="people-outline" size={24} color="#0084ff" />
          <Text className="ml-3 text-base">Danh sách chặn</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-gray-100 p-3 rounded-lg">
          <Ionicons name="person-add-outline" size={24} color="#0084ff" />
          <Text className="ml-3 text-base">Lời mời kết bạn (20)</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedGroups}
        keyExtractor={(item) => item[0]}
        renderItem={({ item: [letter, groupFriends] }) => (
          <View>

            <Text className="text-xl font-bold mt-4 mb-2">{letter}</Text>
            {groupFriends.map((friend) => renderFriendItem({ item: friend }))}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && hasMore ? <ActivityIndicator size="large" color="#0084ff" /> : null
        }
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-full bg-white p-6 rounded-lg items-center">
            {selectedFriend && (
              <>
                <Image
                  source={
                    selectedFriend.avatarUrl
                      ? { uri: selectedFriend.avatarUrl }
                      : userIcon
                  }
                  className="w-20 h-20 rounded-full mb-4"
                />
                <Text className="text-lg font-bold mb-2">
                  {selectedFriend.displayName}
                </Text>
                <Text className="text-gray-500 mb-4">
                  {selectedFriend.email}
                </Text>
                <View className="flex flex-row justify-between">
                  <View className="w-1/2 pr-2">
                    <Button
                      className="w-full"
                      icon={MessageCircleIcon}
                      title="NHẮN TIN"
                      color="royalblue"
                    />
                  </View>
                  <View className="w-1/2  pl-2">
                    <Button
                      className="w-full"
                      icon={UserPlusIcon}
                      title="THÊM BẠN BÈ"
                      color="green"
                    />
                  </View>
                </View>
                <TouchableOpacity
                  className="py-3 mt-5 rounded-lg w-1/4 justify-center items-center"
                  onPress={closeModal}
                >
                  <Text className="text-red-600 text-center">ĐÓNG</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FriendsList;
