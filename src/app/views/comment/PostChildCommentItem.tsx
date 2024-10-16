import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommentModel } from "@/src/models/comment/CommentModel";
import useFetch from "../../hooks/useFetch";

const ChildCommentItem = (
  {item, onItemUpdate }:any 
) => {
  const { post, del, loading } = useFetch();

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

  return (
    <View style={styles.childCommentItem}>
      <Image
        source={{ uri: item.user.avatarUrl }}
        style={styles.childAvatar}
      />
      <View style={styles.childCommentContent}>
        <Text style={styles.authorName}>{item.user.displayName}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.childCommentImage}
            resizeMode="contain"
          />
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikeComment(item, true)}
        >
          <Ionicons
            name={item.isReacted ? "heart" : "heart-outline"}
            size={24}
            color={item.isReacted ? "#e74c3c" : "#7f8c8d"}
          />
          <Text style={styles.actionText}>{item.totalReactions}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  childCommentItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  childAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  childCommentContent: {
  
  },
  authorName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 5,
  },
  childCommentImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#888",
  },
});

export default ChildCommentItem;
