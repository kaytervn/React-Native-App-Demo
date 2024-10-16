import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import { CommentModel } from "@/src/models/comment/CommentModel";
import { ActivityIndicator } from 'react-native';
import ChildCommentItem from './PostChildCommentItem';
import MenuClick from '@/src/components/post/MenuClick';
import useFetch from '../../hooks/useFetch';
import { successToast } from '@/src/types/toast';
import Toast from 'react-native-toast-message';

const PostCommentItem = ({
  item,
  toggleChildComments,
  handleReply,
  expandedComments,
  loadingChildren,
  navigation,
  onItemUpdate
} : any ) => {
  const { post, del, loading } = useFetch();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);
  

  const handleLikeComment = async (comment: CommentModel) => {
    let updatedComment = { ...comment };
    try {
      if (comment.isReacted) {
        updatedComment.isReacted = 0;
        updatedComment.totalReactions = comment.totalReactions - 1;
        onItemUpdate(updatedComment);
        const reactResponse = await del(`/v1/comment-reaction/delete/${comment._id}`);
        if (!reactResponse.result) {
          throw new Error("Failed to unlike comment");
        }
      } else {
        updatedComment.isReacted = 1;
        updatedComment.totalReactions = comment.totalReactions + 1;
        onItemUpdate(updatedComment);
        const reactResponse = await post("/v1/comment-reaction/create", {
          comment: comment._id,
        });
        if (!reactResponse.result) {
          throw new Error("Failed to like comment");
        }
      }
    } catch (error) {
      onItemUpdate(item); 
      console.error("Error updating like status:", error);
    }
  
  };

  const handleUpdate = () => {
    setShowMenu(false);
    navigation.navigate("PostCommentUpdate", 
    { 
      comment_id: item._id , 
      onPostUpdate: (updatedItem: CommentModel | null) => {
        if (updatedItem) {
          handlePostUpdate(updatedItem);
        }
      },
  }, );
  };

  const handlePostUpdate = (updatedItem: CommentModel) => {
    onItemUpdate(updatedItem);
  };

  const handleDeletePress = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    setLoadingDialog(true)
    try {
      const response = await del(`/v1/comment/delete/${postItem._id}`);
      if (response.result) {
        onPostDelete(postItem._id);
        Toast.show(successToast("Xóa bài đăng thành công!"))
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Failed to delete the post. Please try again.");
    } finally {
      setLoadingDialog(false)
    }
  };

  const renderChildComments = (parentId: string) => {
    const children = expandedComments[parentId];
    if (!children) return null;
    return (
      <View style={styles.childCommentsContainer}>
        {children.map((child: { _id: any; }) => (
          <ChildCommentItem 
            key={child._id} 
            item={child} 
            onItemUpdate={onItemUpdate}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <Text style={styles.authorName}>{item.user.displayName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        {item.imageUrl && (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.imageUrl }} style={styles.commentImage} resizeMode="contain" />
          </View>
        )}
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleLikeComment(item)}
          >
            <Ionicons
              name={item.isReacted ? "heart" : "heart-outline"}
              size={22}
              color={item.isReacted ? "#e74c3c" : "#7f8c8d"}
            />
            <Text style={styles.actionText}>{item.totalReactions}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleChildComments(item._id)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="#7f8c8d"
            />
            <Text style={styles.actionText}>{item.totalChildren}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleReply(item)}>
            <Text style={styles.replyButtonText}>Phản hồi</Text>
          </TouchableOpacity>
        </View>

        {item.totalChildren > 0 && (
          <TouchableOpacity onPress={() => toggleChildComments(item._id)} style={styles.viewRepliesButton}>
            {loadingChildren[item._id] ? (
              <ActivityIndicator size="small" color="#059BF0" />
            ) : (
              <>
                <Text style={styles.viewRepliesText}>
                  {expandedComments[item._id] ? "Ẩn phản hồi" : `Xem ${item.totalChildren} phản hồi`}
                </Text>
                {expandedComments[item._id] ? <ChevronUp size={16} color="#059BF0" /> : <ChevronDown size={16} color="#059BF0" />}
              </>
            )}
          </TouchableOpacity>
        )}

        {renderChildComments(item._id)}

        <MenuClick
          titleUpdate={"Chỉnh sửa bình luận"}
          titleDelete={"Xóa bình luận"} 
          isVisible={showMenu}
          onClose={() => setShowMenu(false)}
          onUpdate={handleUpdate}
          onDelete={handleDeletePress}      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    padding: 15,
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
    
  },
  authorName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 5,
  },
  imageWrapper: {
    marginTop: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  commentImage: {
    width: '100%',
    height: 200,
    alignSelf: 'flex-start',
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
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
  replyButtonText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: 'semibold',
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  viewRepliesText: {
    color: '#059BF0',
    marginRight: 5,
  },
  childCommentsContainer: {
    marginLeft: 20,
    marginTop: 10,
  },
});

export default PostCommentItem;