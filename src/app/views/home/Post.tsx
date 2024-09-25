import { View, Text, FlatList, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import useDialog from "../../hooks/useDialog";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import { PostModel } from "@/src/models/post/PostModel";
import PostItem from "@/src/components/post/PostItem";

const Post = () => {

  const { isDialogVisible, showDialog, hideDialog } = useDialog();
  const { get, loading } = useFetch();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const size = 10;

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const res = await get(`/v1/post/list?content=${searchQuery}`);
      setPosts(res.data.content);
    } else {
      fetchData(1, true); // Reset to default list if search is empty
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchData(1, true); // Reset the post list when clearing the search
  };

  const fetchData = useCallback(async (pageNumber: number, shouldRefresh: boolean = false) => {
    if (!hasMore && !shouldRefresh) return;

    try {
      const res = await get(`/v1/post/list?page=${pageNumber}&size=${size}`);
      const newPosts = res.data.content;

      if (shouldRefresh) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }

      setHasMore(newPosts.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [get, hasMore, size]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(1, true).then(() => setRefreshing(false));
  }, [fetchData]);
  useEffect(() => {
    fetchData(page, true);
  }, []);

  return (
    
    <View className="flex-1">
    {loading && <LoadingDialog isVisible={loading} />}
  
    <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search posts..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      style={styles.listContainer}
      renderItem={({ item }) => <PostItem post={item} />}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal:10,
    marginTop:15
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



export default Post;
