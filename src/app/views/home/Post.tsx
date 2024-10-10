import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import { PostModel } from "@/src/models/post/PostModel";
import PostItem from "@/src/components/post/PostItem";
import SearchBar from "@/src/components/search/SearchBar";
import { ChevronsLeftRightIcon, Send } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmptyComponent from "@/src/components/empty/EmptyComponent";
import { useFocusEffect } from "expo-router";

const Post = ({ navigation, route }: any) => {
  const { get, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const isInitialMount = useRef(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const size = 4;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await get("/v1/user/profile");
        console.log(res);
        setUserAvatar(res.data.avatarUrl);
        // setUserName(profile.data.displayName);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
    fetchData(0);
  }, []);

  const tabs = [
    { title: "Cộng đồng", getListKind: 1 },
    { title: "Bạn bè", getListKind: 2 },
    { title: "Tôi", getListKind: 3 },
  ];

  const handleSearch = async () => {
    setLoadingDialog(true);
    try {
      const res = await get(`/v1/post/list`, {
        content: searchQuery.trim(),
        page: 0,
        size,
        getListKind: tabs[activeTab].getListKind,
      });
      setPosts(res.data.content);
      setHasMore(true);
      setPage(0);
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setLoadingDialog(false);
    }
  };

  const clearSearch = () => {
    setLoadingDialog(true);
    setSearchQuery("");
    setPage(0);
    fetchData(0);
  };

  const fetchData = useCallback(
    async (pageNumber: number) => {
      if (!hasMore && pageNumber !== 0) return;
      try {
        const res = await get(`/v1/post/list`, {
          page: pageNumber,
          size,
          getListKind: tabs[activeTab].getListKind,
        });
        const newPosts = res.data.content;
        if (pageNumber === 0) {
          setPosts(newPosts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }
        setHasMore(newPosts.length === size);
        setPage(pageNumber);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoadingDialog(false);
      }
    },
    [get, hasMore, size, activeTab]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setPage(0);
    fetchData(0).then(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchData(page + 1);
    }
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setPage(0);
    setSearchQuery("");
    setHasMore(true);
    setPosts([]);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      fetchData(0);
    }
  }, [activeTab]);

  const handlePostDelete = (deletedPostId: string) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== deletedPostId)
    );
  };

  const handlePostUpdate = (updatedPost: PostModel) => {
    setPosts((prevPosts) => {
      console.log("call back update");
      const index = prevPosts.findIndex((post) => post._id === updatedPost._id);
      if (index !== -1) {
        const newPosts = [...prevPosts];
        newPosts[index] = updatedPost;
        return newPosts;
      }

      return prevPosts;
    });
  };

  const renderItem = ({ item }: { item: PostModel }) => (
    <View>
      <PostItem
        postItem={item}
        onPostUpdate={handlePostUpdate}
        onPostDelete={handlePostDelete}
        navigation={navigation}
      />
    </View>
  );

  const renderHeader = () => (
    <TouchableOpacity
      style={styles.inputCreatePost}
      onPress={() => navigation.navigate("PostCreateUpdate")}
      onLongPress={() => {}}
    >
      <Image source={{ uri: userAvatar || undefined }} style={styles.avatar} />
      <Text style={styles.inputPlaceholder}>Bạn đang nghĩ gì?</Text>
      <View style={styles.sendButton}>
        <Send size={20} color="#059BF0" />
      </View>
    </TouchableOpacity>
  );

  //from update post
  useFocusEffect(
    useCallback(() => {
      if (route.params?.updatedPost) {
        const updatedPost = route.params.updatedPost;
        setPosts((currentPosts) => {
          const index = currentPosts.findIndex(
            (post) => post._id === updatedPost._id
          );
          if (index !== -1) {
            // Update existing post
            const newPosts = [...currentPosts];
            newPosts[index] = updatedPost;
            return newPosts;
          } else {
            // Add new post to the beginning of the list
            return [updatedPost, ...currentPosts];
          }
        });
        // Clear the params after handling
        navigation.setParams({ updatedPost: undefined });
      }
    }, [navigation, route.params?.updatedPost])
  );

  return (
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        onSearch={handleSearch}
        placeholder="Tìm kiếm bài đăng..."
        handleClear={clearSearch}
      />

      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => handleTabChange(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => `${item._id} - ${index}`}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={EmptyComponent}
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
  //search
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    marginHorizontal: 10,
    marginTop: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(237, 247, 255, 0.15)",
    borderRadius: 25,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
    color: "#fff",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#fff",
    tintColor: "#fff",
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: "#059BF0",
    borderRadius: 25,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  //emptyList
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
  //Tab
  tabContainer: {
    flexDirection: "row",
    marginBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#059BF0",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
  },
  activeTabText: {
    color: "#059BF0",
    fontWeight: "bold",
  },
  //Search
  inputCreatePost: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 15,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "#888",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  sendButton: {
    padding: 5,
  },
});

export default Post;
