import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import useFetch from '../../hooks/useFetch';
import { PostModel } from '@/src/models/post/PostModel';
import { Ionicons } from '@expo/vector-icons';


const PostDetail = ({ navigation, route }: any) => {
  const { get, loading } = useFetch();
  const [post, setPost] = useState<PostModel | null>(null);
  const postId = route.params.postId
  console.log(route.params.postId)
  // const postId = route.params.postId;

  const fetchPostDetail = useCallback(async() => {
    try {
      const res = await get(`/v1/post/get/${postId}`);
      console.log(res.data)
      setPost(res.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  }, [get]);

  useEffect(() => {
    fetchPostDetail();
  },[]);

  // const handleLike = () => {
  //   if (liked) {
  //     ;
  //   } else {
  //     setLikeCount(likeCount + 1);
  //   }
  //   setLiked(!liked);
  // };

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
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: post.user.avatarUrl || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.nameTimeContainer}>
          <Text style={styles.userName}>{post.user.displayName}</Text>
          <Text style={styles.timeAgo}>2 hours ago</Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Post Image (if available) */}
      {post.imageUrl && (
        <Image
         source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}

      {/* Like and Comment Count */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{post.likes} Likes • {post.comments || 0} Comments</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} >
        <Ionicons
            name={'heart'}
            size={24}
            color={'#e74c3c'}
          />
          {/* <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#e74c3c' : '#7f8c8d'}
          /> */}
          <Text style={[styles.actionText]}>Like</Text>
          {/* <Text style={[styles.actionText, liked && styles.likedText]}>Like</Text> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#7f8c8d" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameTimeContainer: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeAgo: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsText: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#7f8c8d',
    fontSize: 14,
  },
  likedText: {
    color: '#e74c3c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostDetail;