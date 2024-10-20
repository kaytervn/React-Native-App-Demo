import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import SearchBar from "@/src/components/search/SearchBar";
import EmptyComponent from "@/src/components/empty/EmptyComponent";
import defaultUserImg from "../../../assets/user_icon.png";

interface Friend {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

const Friends = ({ navigation }: any) => {
  const { get, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(0);

  const size = 10;

  useEffect(() => {
    fetchData(0);
  }, []);

  const handleSearch = async () => {
    setLoadingDialog(true);
    Keyboard.dismiss();
    await getFriends(0, searchQuery);
    setLoadingDialog(false);
  };

  const clearSearch = async () => {
    setLoadingDialog(true);
    Keyboard.dismiss();
    setSearchQuery("");
    await getFriends(0, "");
  };

  async function getFriends(pageNumber: number, content: string) {
    try {
      const res = await get(`/v1/friendship/list`, {
        page: pageNumber,
        size,
        content: content
      });
      const newFriends = res.data.content.map((friendship: any) => ({
        _id: friendship.receiver._id,
        displayName: friendship.receiver.displayName,
        email: friendship.receiver.email,
        avatarUrl: friendship.receiver.avatarUrl,
      }));
      if (pageNumber === 0) {
        setFriends(newFriends);
      } else {
        setFriends((prevFriends) => [...prevFriends, ...newFriends]);
      }
      setHasMore(newFriends.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoadingDialog(false);
    }
  }

  

  const fetchData = useCallback(
    async (pageNumber: number) => {
      if (!hasMore && pageNumber !== 0) return;
      getFriends(pageNumber, searchQuery);
    },
    [get, size]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setPage(0);
    getFriends(0, "").then(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchData(page + 1);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image
        source={item.avatarUrl ? { uri: item.avatarUrl } : defaultUserImg}
        style={styles.avatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.displayName}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={() => navigation.navigate("FriendRequests")}
      >
        <Ionicons name="person-add-outline" size={24} color="#0084ff" />
        <Text style={styles.headerButtonText}>Lời mời kết bạn</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={() => navigation.navigate("SendFriendRequests")}
      >
        <Ionicons name="people-outline" size={24} color="#0084ff" />
        <Text style={styles.headerButtonText}>Yêu cầu kết bạn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        onSearch={handleSearch}
        placeholder="Tìm kiếm bạn bè..."
        handleClear={clearSearch}
      />

      <FlatList
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={renderFriendItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyComponent message="Không tìm thấy bạn bè" />}
        ListFooterComponent={() =>
          loading && hasMore ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  headerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1c1e21",
  },
});

export default Friends;