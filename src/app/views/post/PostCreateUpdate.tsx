import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useFetch from '../../hooks/useFetch';
import { uploadImage } from '@/src/types/utils';
import { LoadingDialog } from '@/src/components/Dialog';
import Toast from 'react-native-toast-message';
import { errorToast } from "@/src/types/toast";
const PostCreateUpdate = ({ navigation }: any) => {
  const { post, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Function to pick image from library
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async() => {
    // await post('/v1/post/create', )
    setLoadingDialog(true)
    let postBody = {
      content: content,
      imageUrl: null
    }
    if (content == null || content.trim().length <= 0){
      Toast.show(errorToast("Nội dung bị trống!"));
    }
    if (image) {
      postBody.imageUrl = await uploadImage(image, post);
    }
    
    const res = await post("/v1/post/create", postBody)
    if (res.result){
      navigation.goBack();
    }
    setLoadingDialog(false)
  };

  return (
    <View style={styles.container}>
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo bài đăng</Text>
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Đăng</Text>
        </TouchableOpacity>
      </View>

      {/* Content input */}
      <TextInput
        style={styles.input}
        placeholder="Bạn đang nghĩ gì?"
        value={content}
        onChangeText={setContent}
        multiline
      />

      {/* Display selected image */}
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      {/* Button to add an image */}
      <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
        <Ionicons name="image-outline" size={24} color="#059BF0" />
        <Text style={styles.addImageText}>Thêm ảnh</Text>
      </TouchableOpacity>
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
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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
});

export default PostCreateUpdate;