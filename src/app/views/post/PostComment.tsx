import React, { useCallback, useEffect, useRef, useState } from 'react';
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


const PostComment = ({postItem}: {postItem: PostModel}) => {
  const { get, post, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const size = 10;

  useEffect(() => {
    fetchUserData();
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

  const fetchComments = useCallback(async (pageNumber: number) => {
    if (!hasMore && pageNumber !== 0) return;
    await getComments(pageNumber);
  }, [get, hasMore]);

  async function getComments(pageNumber: number) {
    try {
      const res = await get(`/v1/comment/list`, { post: postItem._id, ignoreChildren: 1 });
      const newComments = res.data.content;
      
      setComments((prevComments) => {
        // Create a Set of existing comment IDs
        const existingIds = new Set(prevComments.map(comment => comment._id));
        // Filter out any new comments that already exist
        const uniqueNewComments = newComments.filter((comment: { _id: string; }) => !existingIds.has(comment._id));
        // If it's the first page, return only new comments, otherwise append to existing
        return pageNumber === 0 ? uniqueNewComments : [...prevComments, ...uniqueNewComments];
      });

      setHasMore(newComments.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingDialog(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);

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
        const res = await post(`/v1/post/${postItem._id}/comment`, { content: newComment.trim() });
        setComments((prevComments) => [res.data, ...prevComments]);
        setNewComment('');
        if (postItem) {
          postItem.totalComments += 1;
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
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}

      <FlatList
        data={comments}
        keyExtractor={(item, index) => `${item._id} - ${index}`}
        renderItem={renderComment}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <View style={styles.postDetailsContainer}>
            <Text style={styles.totalText}>
              {postItem?.totalReactions} likes · {postItem?.totalComments} comments
            </Text>
          </View>
        )}
        ListEmptyComponent={<EmptyComponent message="Chưa có bình luận nào" />}
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
        <TouchableOpacity style={styles.sendButton} onPress={handlePostComment}>
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