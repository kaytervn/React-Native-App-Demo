import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions, Modal } from 'react-native'
import React, { useRef, useState } from 'react'
import { PostModel } from '@/src/models/post/PostModel';
import { Ionicons } from '@expo/vector-icons';
import useFetch from '@/src/app/hooks/useFetch';
const { width, height  } = Dimensions.get('window');
const imageWidth = width - 20;

const PostItem = ({ postItem, onPostUpdate }: { postItem: PostModel, onPostUpdate: (post: PostModel) => void }) => {
  const { post, del, loading } = useFetch();
  const liked = postItem.isReacted == 1;
  const likeCount = postItem.totalReactions;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fullScreenFlatListRef = useRef(null);

  const handleLike = async () => {
    let updatedPost = { ...postItem };
    try {
      if (liked) {
        updatedPost.isReacted = 0;
        updatedPost.totalReactions = likeCount - 1;
        onPostUpdate(updatedPost);
        const reactResponse = await del(`/v1/post-reaction/delete/${postItem._id}`);
        console.log("unlike")
        if (!reactResponse.result) {
          throw new Error("Failed to unlike");
        }
      } else {
        updatedPost.isReacted = 1;
        updatedPost.totalReactions = likeCount + 1;
        onPostUpdate(updatedPost);
        const reactResponse = await post("/v1/post-reaction/create", { post: postItem._id });
        console.log("like")
        if (!reactResponse.result) {
          throw new Error("Failed to like");
        }
      }
    } catch (error) {
      // Revert UI if something goes wrong
      onPostUpdate(postItem);  // Revert to the original state
      console.error("Error updating like status:", error);
    }
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

  const handleImagePress = (index: any) => {
    console.log('Image pressed:', index); // Debugging log
    setSelectedImageIndex(index);
    setIsModalVisible(true);
  };


  const renderImageItem = ({ item, index }: any) => (
    <TouchableOpacity 
      style={styles.imageContainer} 
      onPress={() => handleImagePress(index)}
    >
      <Image source={{ uri: item }} style={styles.postImage} />
      {postItem.imageUrls.length > 1 && (
        <Text style={styles.imageCounter}>{`${index + 1}/${postItem.imageUrls.length}`}</Text>
      )}
    </TouchableOpacity>
  );

  const renderFullScreenImageItem = ({ item, index }: any) => (
    <View style={styles.fullScreenImageContainer}>
      <Image 
        source={{ uri: item }} 
        style={styles.fullScreenImage} 
        resizeMode="contain"
      />
      {postItem.imageUrls.length > 1 && (
        <Text style={styles.fullScreenCounter}>
          {`${index + 1}/${postItem.imageUrls.length}`}
        </Text>
      )}
    </View>
  );

  const renderFullScreenGallery  = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setIsModalVisible(false)}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <FlatList
          ref={fullScreenFlatListRef}
          data={postItem.imageUrls}
          renderItem={renderFullScreenImageItem}
          keyExtractor={(item, index) => `fullscreen-${index}`}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={selectedImageIndex}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(newIndex);
          }}
        />
      </View>
    </Modal>
  );
  const handleMenuPress = () => {
    console.log('Menu icon pressed');
    // Handle menu actions here, e.g., edit, delete post
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
        <FlatList
          data={postItem.imageUrls}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `thumbnail-${index}`}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          snapToInterval={imageWidth}
          decelerationRate="fast"
          style={styles.imageList}
        />
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

      {postItem.isOwner == 1 && (
        <TouchableOpacity style={styles.menuIcon} onPress={handleMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      )}

    {renderFullScreenGallery()}
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
  menuIcon: {
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 1,
    paddingHorizontal:20,
    paddingBottom:10
  },

  //List Image
  imageList: {
    marginVertical: 10,
  },
  imageContainer: {
    width: imageWidth,
    height: 200,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  imageCounter: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 5,
    borderRadius: 10,
    fontSize: 12,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullScreenCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 10,
    borderRadius: 20,
    fontSize: 16,
  },
});

export default PostItem