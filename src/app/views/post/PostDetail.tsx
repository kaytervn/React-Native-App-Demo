import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useFetch from '../../hooks/useFetch';
import { PostModel } from '@/src/models/post/PostModel';


const PostDetail = ({ navigation, route }: any) => {
  const { get, loading } = useFetch();
  const [post, setPost] = useState<PostModel | null>(null);
  console.log(route.params)
  // const postId = route.params.postId;

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const res = await get(`/v1/post/${postId}`);
        setPost(res.data);
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId, get]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>
      {/* Add more details as needed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default PostDetail;