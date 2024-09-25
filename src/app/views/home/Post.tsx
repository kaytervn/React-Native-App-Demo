import { View, Text, FlatList, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import useDialog from "../../hooks/useDialog";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import { PostModel } from "@/src/models/post/PostModel";
import PostItem from "@/src/components/post/PostItem";

const Post = () => {

  const { isDialogVisible, showDialog, hideDialog } = useDialog();
  const { get, loading } = useFetch();

  const [posts, setPosts] = useState<PostModel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const res = await get(`/v1/post/list?content=${searchQuery}`);
      setPosts(res.data.content);
    } else {
      fetchData(); // Reset to default list if search is empty
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchData(); // Reset the post list when clearing the search
  };


  const fetchData = async () => {
    const res = await get("/v1/post/list");
    setPosts(res.data.content);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    
    <View className="flex-1 p-4">
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
