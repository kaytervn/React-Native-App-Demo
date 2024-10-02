import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import { PostModel } from "@/src/models/post/PostModel";
import PostItem from "@/src/components/post/PostItem";

const PostAll = ({ navigation, searchQuery }: any) => {
  const { get, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const size = 4;

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setPage(0)
      setHasMore(true)
      fetchData(0);
    }
    else {
      setLoadingDialog(true)
      const res = await get(`/v1/post/list`, {content:searchQuery, page:0, size});
      setPosts(res.data.content);
      setHasMore(true)
      setPage(0)
      setLoadingDialog(false)
    }
  };

  const clearSearch = () => {
    setLoadingDialog(true)
    setPage(0)
    fetchData(0); 
  };

  const fetchData = useCallback(async (pageNumber: number) => {
    if (!hasMore) return;
    try {
      const res = await get(`/v1/post/list`, {page:pageNumber, size});
      console.log('PostAll response:', res.data.content);
      const newPosts = res.data.content;
      if (pageNumber === 0) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }

      setHasMore(newPosts.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingDialog(false);
    }
  }, [get, hasMore, size]);

  const handleRefresh = () =>{
    setRefreshing(true);
    setPage(0);
    fetchData(0).then(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchData(page + 1);
    }
  };

  useEffect(() => {
    fetchData(0);
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
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}
  
      <FlatList
        data={posts}
        keyExtractor={(item, index) => `${item._id} - ${index}`}
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

export default PostAll;