import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Send, Heart, MessageCircle } from 'lucide-react-native';
import useFetch from '../../hooks/useFetch';
import { LoadingDialog } from '@/src/components/Dialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmptyComponent from '@/src/components/empty/EmptyComponent';
import { CommentModel } from '@/src/models/comment/CommentModel';
import { PostModel } from '@/src/models/post/PostModel';


const PostComment = ({ route }: any) => {
  const { get, post, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [postDetails, setPostDetails] = useState<PostModel | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const postId = route.params?.postId;
  const size = 10;

  useEffect(() => {
    fetchUserData();
    fetchPostDetails();
    fetchComments(0);
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await get('/v1/user/profile');
      setUserAvatar(res.data.avatarUrl);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPostDetails = async () => {
    try {
      const res = await get(`/v1/post/${postId}`);
      setPostDetails(res.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const fetchComments = useCallback(async (pageNumber: number) => {
    if (!hasMore && pageNumber !== 0) return;
    try {
      const res = await get(`/v1/comment/list`, {post: postId, ignoreChildren: 1});
      const newComments = res.data.content;
      if (pageNumber === 0) {
        setComments(newComments);
      } else {
        setComments((prevComments) => [...prevComments, ...newComments]);
      }
      setHasMore(newComments.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingDialog(false);
    }
  }, [get, hasMore, size, postId]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchPostDetails();
    fetchComments(0).then(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1);
    }
  };

  const handlePostComment = async () => {
    if (newComment.trim()) {
      setLoadingDialog(true);
      try {
        const res = await post(`/v1/post/${postId}/comment`, { content: newComment.trim() });
        setComments((prevComments) => [res.data, ...prevComments]);
        setNewComment('');
        // Update total comments count
        if (postDetails) {
          setPostDetails({
            ...postDetails,
            totalComments: postDetails.totalComments + 1,
          });
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      } finally {
        setLoadingDialog(false);
      }
    }
  };

  const renderComment = ({ item }: { item: CommentModel }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <Text style={styles.authorName}>{item.user.displayName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={16} color="#888" />
            <Text style={styles.actionText}>{item.totalReactions}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={16} color="#888" />
            <Text style={styles.actionText}>{item.totalChildren}</Text>
          </TouchableOpacity>
        </View>
        {/* {item.totalChildren > 0 && (
          <View style={styles.repliesContainer}>
            {item.totalChildren.slice(0, 2).map((reply) => (
              <View key={reply._id} style={styles.replyContainer}>
                <Image source={{ uri: reply.author.avatarUrl }} style={styles.replyAvatar} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyAuthorName}>{reply.author.displayName}</Text>
                  <Text style={styles.replyText}>{reply.content}</Text>
                </View>
              </View>
            ))}
          </View>
        )} */}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.postDetailsContainer}>
      <Text style={styles.totalText}>
        {postDetails?.totalReactions} likes · {postDetails?.totalComments} comments
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}

      <FlatList
        data={comments}
        keyExtractor={(item, index) => `thumbnail-${index}`}
        renderItem={renderComment}
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

      <View style={styles.inputContainer}>
        <Image source={{ uri: userAvatar || undefined }} style={styles.avatar} />
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          multiline
        />
        
        {/* Add new Comment */}
        <TouchableOpacity style={styles.sendButton}>
          <Send size={20} color="#059BF0" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  postDetailsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 14,
    color: '#666',
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 5,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#888',
  },
  repliesContainer: {
    marginTop: 10,
    paddingLeft: 20,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthorName: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
  },
  sendButton: {
    padding: 5,
  },
});

export default PostComment;