import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Plus } from 'lucide-react-native';
import useFetch from '../../hooks/useFetch';
import { LoadingDialog } from '@/src/components/Dialog';
import { MessageModel } from '@/src/models/chat/MessageModel';
import defaultUserImg from '../../../assets/user_icon.png';
import { ConversationModel } from '@/src/models/chat/ConversationModel';
import { UserModel } from '@/src/models/user/UserModel';
import { encrypt } from '@/src/types/utils';

const ChatDetail = ({ route, navigation }: any) => {
  const item: ConversationModel = route.params?.item;
  const user: UserModel = route.params?.user;
  const { get, post, loading } = useFetch();
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const size = 20;

  useEffect(() => {
    navigation.setOptions({
      title: item.name,
      headerRight: () => item.canAddMember && item.kind == 1 && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddMember', {item})}
          style={styles.headerButton}
        >
          <Plus size={24} color="#059BF0" />
        </TouchableOpacity>
      ),
    });
    fetchMessages(0);
  }, []);

  const fetchMessages = async (pageNumber: number) => {
    try {
      const res = await get(`/v1/message/list/`, {
        page: pageNumber,
        size,
        conversation: item._id,
      });
      console.log('Messages:', res.data.content);
      const newMessages = res.data.content;
      if (pageNumber === 0) {
        setMessages([...newMessages]);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      setHasMore(newMessages.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(0).then(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const messageData = {
      content: inputMessage.trim(),
      conversationId: item._id,
    };

    try {
      setLoadingDialog(true);
      console.log('Encrypting message:', user.secretKey);
      let strDecrypt = encrypt("1231", user.secretKey);
      console.log(strDecrypt)
      // const res = await post('/v1/message/create', messageData);
      // setMessages(prev => [res.data, ...prev]);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoadingDialog(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageModel }) => {
    const isMyMessage = item.isOwner;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Image
            source={item.user.avatarUrl ? { uri: item.user.avatarUrl } : defaultUserImg}
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.user.displayName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {item.createdAt}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        inverted={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && hasMore ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : null
        }
        contentContainerStyle={styles.flatListContent}
      />

      {item.canMessage && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Nhập tin nhắn..."
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send 
              size={24} 
              color={inputMessage.trim() ? "#059BF0" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  headerButton: {
    marginRight: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#059BF0',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'black',
  },
  messageTime: {
    fontSize: 10,
    color: '#rgba(0, 0, 0, 0.5)',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatDetail;