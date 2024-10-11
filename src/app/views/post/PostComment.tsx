import React, { useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { BottomSheetModal, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Send, Heart, MessageCircle, ImageIcon } from "lucide-react-native";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import EmptyComponent from "@/src/components/empty/EmptyComponent";
import { CommentModel } from "@/src/models/comment/CommentModel";
import { PostModel } from "@/src/models/post/PostModel";
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/src/types/utils';


const PostComment= ({ 
  postItem, 
  onCommentAdded 
}: any) => {
  const { get, post, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(postItem.totalComments);
  const commentSize = 10;

  const fetchComments = useCallback(async (pageNumber: number) => {
    try {
      const res = await get(`/v1/comment/list`, { post: postItem._id, page: pageNumber, size: commentSize, ignoreChildren: 1 });
      const newComments = res.data.content;
      setComments(prev => pageNumber === 0 ? newComments : [...prev, ...newComments]);
      setHasMore(newComments.length === commentSize);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [get, postItem._id]);

  const handleLoadMoreComments = () => {
    if (hasMore && !loading) {
      fetchComments(Math.ceil(comments.length / commentSize));
    }
  };

  const createComment = async () => {
    if (!newComment.trim() && !selectedImage) return;

    setLoadingDialog(true);
    try {
      let params = {
        post: postItem._id,
        content: newComment,
        parent: null,
        imageUrl: ""
      };

      if (selectedImage) {
        params.imageUrl = await uploadImage(selectedImage, post);
      }

      await post(`/v1/comment/create`, params);
      fetchComments(0);
      setNewComment('');
      setSelectedImage(null);
      setTotalComments(totalComments + 1);
      onCommentAdded();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoadingDialog(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const renderComment = ({ item }: { item: CommentModel }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <Text style={styles.authorName}>{item.user.displayName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>

        {item.imageUrl && (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.commentImage} 
              resizeMode="contain"
            />
          </View>
        )}

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
      <View style={styles.postDetailsContainer}>
            <Text style={styles.totalText}>
              {postItem.totalReactions} likes · {totalComments} comments
            </Text>
      </View>
      <BottomSheetFlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={renderComment}
        ListEmptyComponent={<EmptyComponent message="No comments yet" />}
        onEndReached={handleLoadMoreComments}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && hasMore ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : null
        }
      />
      <View style={styles.inputContainer}>
        <Image source={{ uri: postItem.user.ava || undefined }} style={styles.avatar} />
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          multiline
        />
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <ImageIcon size={20} color="#059BF0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={createComment}>
          <Send size={20} color="#059BF0" />
        </TouchableOpacity>
      </View>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: 'center',
  },
  commentList: {
    flexGrow: 1,
  },
  postDetailsContainer: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
  },
  imageWrapper: {
    marginTop: 10,
    alignSelf: 'flex-start',
    width: "100%", // Adjust based on your layout
  },
  commentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default PostComment;