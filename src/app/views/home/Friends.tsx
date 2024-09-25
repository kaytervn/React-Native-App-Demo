import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  const { get } = useFetch();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await get('/v1/friendship/friends');
      const friendList = res.data.map((friendship: any) => ({
        _id: friendship.receiver._id,
        displayName: friendship.receiver.displayName,
        email: friendship.receiver.email,
        avatarUrl: friendship.receiver.avatarUrl,
      }));
      console.log('Fetched friends:', friendList);  // Log fetched data
      setFriends(friendList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const filteredFriends = useMemo(() => {
    return friends.filter(friend =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const renderFriendItem = ({ item }: { item: Friend }) => {
    console.log('Rendering friend:', item.displayName, 'Avatar URL:', item.avatarUrl);
    return (
      <View style={styles.friendItem}>
        <Image
          source={item.avatarUrl ? { uri: item.avatarUrl } : userIcon}
          style={styles.avatar}
          defaultSource={userIcon}
          onError={(e) => console.log('Error loading avatar:', e.nativeEvent.error)}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendEmail}>{item.email}</Text>
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.qrButton}>
          <Ionicons name="qr-code-outline" size={24} color="#0084ff" />
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Nhóm</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Ionicons name="people-outline" size={24} color="#0084ff" />
          <Text style={styles.optionText}>Danh sách chặn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Ionicons name="person-add-outline" size={24} color="#0084ff" />
          <Text style={styles.optionText}>Lời mời kết bạn (20)</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.favoritesContainer}>
        <Text style={styles.sectionTitle}>Yêu thích</Text>
        <TouchableOpacity style={styles.addFavorite}>
          <Text style={styles.addFavoriteText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedGroups}
        keyExtractor={(item) => item[0]}
        renderItem={({ item: [letter, groupFriends] }) => (
          <View>
            <Text style={styles.letterHeader}>{letter}</Text>
            {groupFriends.map((friend) => renderFriendItem({ item: friend }))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  qrButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0084ff',
  },
  tabText: {
    fontSize: 16,
    color: '#65676b',
  },
  activeTabText: {
    color: '#0084ff',
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 8,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#050505',
  },
  favoritesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFavorite: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addFavoriteText: {
    color: '#0084ff',
  },
  letterHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendEmail: {
    fontSize: 14,
    color: '#65676b',
  },
});

export default FriendsList;