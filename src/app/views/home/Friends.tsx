import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFetch from '../../hooks/useFetch';
import userIcon from '../../../assets/user_icon.png';

interface Friend {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

const FriendsList = () => {
  const { get, loading } = useFetch();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const size = 10; // Number of friends to load per page

  const fetchFriends = useCallback(async (pageNumber: number, shouldRefresh: boolean = false) => {
    if (!hasMore && !shouldRefresh) return;

    try {
      const res = await get(`/v1/friendship/list?page=${pageNumber}&size=${size}`);
      const newFriends = res.data.content.map((friendship: any) => ({
        _id: friendship.receiver._id,
        displayName: friendship.receiver.displayName,
        email: friendship.receiver.email,
        avatarUrl: friendship.receiver.avatarUrl,
      }));

      if (shouldRefresh) {
        setFriends(newFriends);
      } else {
        setFriends((prevFriends) => [...prevFriends, ...newFriends]);
      }

      setHasMore(newFriends.length === size);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, [get, hasMore, size]);

  useEffect(() => {
    fetchFriends(0, true);
  }, [fetchFriends]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFriends(0, true).then(() => setRefreshing(false));
  }, [fetchFriends]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchFriends(page + 1);
    }
  };

  const filteredFriends = useMemo(() => {
    return friends.filter(friend =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const renderFriendItem = ({ item }: { item: Friend }) => {
    return (
      <View className="flex-row items-center mb-4">
        <Image
          source={item.avatarUrl ? { uri: item.avatarUrl } : userIcon}
          className="w-12 h-12 rounded-full mr-3"
          defaultSource={userIcon}
          onError={(e) => console.log('Error loading avatar:', e.nativeEvent.error)}
        />
        <View className="flex-1">
          <Text className="text-base font-medium">{item.displayName}</Text>
          <Text className="text-sm text-gray-500">{item.email}</Text>
        </View>
      </View>
    );
  };

  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.displayName[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {} as Record<string, Friend[]>);

  const sortedGroups = Object.entries(groupedFriends).sort(([a], [b]) => a.localeCompare(b));

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row items-center bg-gray-100 rounded-full px-3 mb-3">
        <Ionicons name="search" size={20} color="#999" className="mr-2" />
        <TextInput
          className="flex-1 h-10 text-base"
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity className="p-2 ml-1" onPress={() => console.log('Add friend')}>
          <Ionicons name="person-add-outline" size={24} color="#0084ff" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-1" onPress={() => console.log('Scan QR')}>
          <Ionicons name="qr-code-outline" size={24} color="#0084ff" />
        </TouchableOpacity>
      </View>
      <View className="flex-row mb-4 border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === 'friends' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('friends')}
        >
          <Text className={`text-base ${activeTab === 'friends' ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === 'groups' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setActiveTab('groups')}
        >
          <Text className={`text-base ${activeTab === 'groups' ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>Nhóm</Text>
        </TouchableOpacity>
      </View>
      <View className="mb-4">
        <TouchableOpacity className="flex-row items-center mb-3 bg-gray-100 p-3 rounded-lg">
          <Ionicons name="people-outline" size={24} color="#0084ff" />
          <Text className="ml-3 text-base text-gray-900">Danh sách chặn</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mb-3 bg-gray-100 p-3 rounded-lg">
          <Ionicons name="person-add-outline" size={24} color="#0084ff" />
          <Text className="ml-3 text-base text-gray-900">Lời mời kết bạn (20)</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold">Yêu thích</Text>
        <TouchableOpacity className="bg-gray-100 px-3 py-2 rounded-full">
          <Text className="text-blue-500">+ Thêm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedGroups}
        keyExtractor={(item) => item[0]}
        renderItem={({ item: [letter, groupFriends] }) => (
          <View>
            <Text className="text-lg font-bold mt-4 mb-2">{letter}</Text>
            {groupFriends.map((friend) => (
              <React.Fragment key={friend._id}>
                {renderFriendItem({ item: friend })}
              </React.Fragment>
            ))}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && hasMore ? <ActivityIndicator size="large" color="#0084ff" /> : null
        }
      />
    </View>
  );
};

export default FriendsList;