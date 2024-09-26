import { View, Text, FlatList, TextInput, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import useDialog from "../../hooks/useDialog";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import { PostModel } from "@/src/models/post/PostModel";
import PostItem from "@/src/components/post/PostItem";

const Post = ({ navigation }: any) => {
  const { isDialogVisible, showDialog, hideDialog } = useDialog();
  const { get, loading } = useFetch();
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(0);

  const size = 4;

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setInitialLoading(true)
      const res = await get(`/v1/post/list`, {content:searchQuery});
      setPosts(res.data.content);
      setHasMore(false)
      setPage(0)
      setInitialLoading(false)
    } else {
      fetchData(0, true); // Reset to default list if search is empty
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchData(0, true); // Reset the post list when clearing the search
  };

  const fetchData = useCallback(async (pageNumber: number, shouldRefresh: boolean = false) => {
    if (!hasMore && !shouldRefresh) return;

    try {
      const res = await get(`/v1/post/list`, {page:pageNumber, size});
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
    } finally {
      setInitialLoading(false);
    }
  }, [get, hasMore, size]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery("");
    fetchData(0, true).then(() => setRefreshing(false));
  }, [fetchData]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchData(page + 1);
    }
  };

  useEffect(() => {
    fetchData(0, true);
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts found</Text>
    </View>
  );

  const renderItem = ({ item }: { item: PostModel }) => (
    <TouchableOpacity
      onPress={() => 
        navigation.navigate("PostDetail", {postId:item._id})
      } 
    >
      <PostItem post={item} />
    </TouchableOpacity>
  );

  return (

    <View className="flex-1">
    {initialLoading && <LoadingDialog isVisible={initialLoading} />}
  
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
      keyExtractor={(item, index) => `${item._id}-${index}`}
      style={styles.listContainer}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={() => 
        loading && hasMore ? <ActivityIndicator size="large" color="#007AFF" /> : null
      }
    
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
});



export default Post;
