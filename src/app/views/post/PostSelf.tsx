import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import useFetch from '../../hooks/useFetch';
import PostItem from '@/src/components/post/PostItem';
import { PostModel } from '@/src/models/post/PostModel';

const PostSelf = ({ navigation, searchQuery }: any) => {
  const { get, loading } = useFetch();
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const size = 4;

  const fetchData = useCallback(async (pageNumber: number) => {
    try {
      const res = await get(`/v1/post/list`, { 
        page: pageNumber, 
        size, 
        content: searchQuery ? searchQuery : undefined  // include search query in API call
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
      console.error('Error fetching posts:', error);
    }
  }, [get, searchQuery]);

  useEffect(() => {
    fetchData(0);
  }, [searchQuery]); 

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchData(page + 1);
    }
  };

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={(item, index) => `${item._id} - ${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item._id })}>
            <PostItem post={item} />
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (loading ? <ActivityIndicator /> : null)}
      />
    </View>
  );
};

export default PostSelf;
