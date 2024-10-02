import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationModel } from '@/src/models/notification/NotificationModel';

const NotificationItem = ({ item }: { item: NotificationModel }) => {
  return (
    <TouchableOpacity style={[styles.container, item.status ? null : styles.unreadItem]}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={24} color="#007AFF" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{item.createdAt}</Text>
      </View>
      {!item.status && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadItem: {
    backgroundColor: '#e6f3ff',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    alignSelf: 'center',
    marginLeft: 8,
  },
});

export default NotificationItem;