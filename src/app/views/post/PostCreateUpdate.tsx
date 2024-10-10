import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useFetch from '../../hooks/useFetch';
import { uploadImage } from '@/src/types/utils';
import { LoadingDialog } from '@/src/components/Dialog';
import Toast from 'react-native-toast-message';
import { errorToast } from "@/src/types/toast";

const PostCreateUpdate = ({ navigation, route }: any) => {
  const { get, post, put, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    if (route.params) {
      const { post_id } = route.params;
      if (post_id) {
        setIsUpdating(true);
        setPostId(post_id);
        fetchPostDetails(post_id);
      }
    }
  }, [route.params]);

  const fetchPostDetails = async (id: string) => {
    setLoadingDialog(true);
    try {
      const response = await get(`/v1/post/get/${id}`);
      if (response.result) {
        const postData = response.data;
        setContent(postData.content);
        setImages(postData.imageUrls || []);
        setStatus(postData.kind);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      errorToast("Failed to fetch post details");
    }
    setLoadingDialog(false);
  };

  // Function to pick image from library
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoadingDialog(true);
    let postBody: { id: any, content: string; imageUrls: string[], kind: number } = {
      id: postId || null,
      content: content,
      imageUrls: [],
      kind: status
    };

    if (content.trim() === "" || content.trim().length <= 0) {
      setLoadingDialog(false);
      ToastAndroid.show("Nội dung không được để trống", ToastAndroid.SHORT);
      return;
    }

    if (images.length > 0) {
      for (const image of images) {
        if (!image.startsWith('http')) {  // Only upload new images
          const uploadResult = await uploadImage(image, post);
          postBody.imageUrls.push(uploadResult);
        } else {
          postBody.imageUrls.push(image);  // Keep existing image URLs
        }
      }
    }

    try {
      let res;
      if (isUpdating) {
        res = await put(`/v1/post/update/`, postBody);
      } else {
        res = await post("/v1/post/create", postBody);
      }
      
      if (res.result) {
        ToastAndroid.show(isUpdating ? "Post updated successfully" : "Post created successfully", ToastAndroid.SHORT);
        navigation.navigate({
          name: 'Post', 
          params: { updatedPost: res.data },
          merge: true,
        });
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      errorToast(isUpdating ? "Failed to update post" : "Failed to create post");
    }
    setLoadingDialog(false);
  };

  const renderStatusButton = (value: number, label: string) => (
    <TouchableOpacity
      style={[styles.statusButton, status === value && styles.selectedStatusButton]}
      onPress={() => setStatus(value)}
    >
      <Text style={[styles.statusButtonText, status === value && styles.selectedStatusButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isUpdating ? "Cập nhật bài đăng" : "Tạo bài đăng"}</Text>
        <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
          <Text style={styles.postButtonText}>{isUpdating ? "Cập nhật" : "Đăng"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Content input */}
        <View style={styles.statusContainer}>
          {renderStatusButton(1, "Công khai")}
          {renderStatusButton(2, "Bạn bè")}
          {renderStatusButton(3, "Chỉ mình tôi")}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChangeText={setContent}
          multiline
        />

        {/* Display selected images */}
        <ScrollView horizontal
        contentContainerStyle={{ paddingRight: 15 }}
        style={styles.imageScrollView}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Button to add an image */}
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#059BF0" />
          <Text style={styles.addImageText}>Thêm ảnh</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#059BF0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  imageScrollView: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  addImageText: {
    marginLeft: 10,
    color: '#059BF0',
    fontSize: 16,
  },

  //status
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#059BF0',
  },
  selectedStatusButton: {
    backgroundColor: '#059BF0',
  },
  statusButtonText: {
    color: '#059BF0',
  },
  selectedStatusButtonText: {
    color: '#fff',
  },
  
});

export default PostCreateUpdate;