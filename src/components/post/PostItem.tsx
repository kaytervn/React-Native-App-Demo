import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { PostModel } from '@/src/models/post/PostModel';
import { Ionicons } from '@expo/vector-icons';
import useFetch from '@/src/app/hooks/useFetch';

const PostItem = ({ postItem, onPostUpdate }: { postItem: PostModel, onPostUpdate: (post: PostModel) => void }) => {
  const { post, del, loading } = useFetch();
  const liked = postItem.isReacted == 1;
  const likeCount = postItem.totalReactions;

  const handleLike = async () => {
    let updatedPost = { ...postItem };
    if (liked) {
      const reactResponse = await del(`/v1/post-reaction/delete/${postItem._id}`);
      if (reactResponse.result) {
        updatedPost.isReacted = 0;
        updatedPost.totalReactions =  likeCount - 1;
      }
    } else {
      const reactResponse = await post("/v1/post-reaction/create", { post: postItem._id });
      if (reactResponse.result) {
          updatedPost.isReacted = 1;
          updatedPost.totalReactions = likeCount + 1;
      }
    }
    onPostUpdate(updatedPost); 
  };

  const renderStatusIcon = () => {
    if (postItem.kind === 1) {
      return <Ionicons name="earth" size={14} color="#7f8c8d" />;
    } else if (postItem.kind === 2) {
      return <Ionicons name="people" size={14} color="#7f8c8d" />;
    } else {
      return <Ionicons name="lock-closed" size={14} color="#7f8c8d" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image
          source={{ uri: postItem.user.avatarUrl || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.nameTimeContainer}>
          <Text style={styles.userName}>{postItem.user.displayName}</Text>
          <View style={styles.statusTimeContainer}>
            {renderStatusIcon()}
            <Text style={styles.timeAgo}>{postItem.createdAt}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.content}>{postItem.content}</Text>

      {postItem.imageUrls.length > 0 && (
        <Image source={{ uri: postItem.imageUrls[0] }} style={styles.postImage} />
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {likeCount} Lượt thích • {postItem.totalComments} Bình luận
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#e74c3c' : '#7f8c8d'}
          />
          <Text style={[styles.actionText, liked ? styles.likedText : null]}>Thích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#7f8c8d" />
          <Text style={styles.actionText}>Bình luận</Text>
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
    marginBottom: 5,
    
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
  statusTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    color: '#7f8c8d',
    fontSize: 12,
    marginLeft: 5,
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
});

export default PostItem