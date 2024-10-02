import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "@/src/components/Dialog";
import { NotificationModel } from "@/src/models/notification/NotificationModel";
import NotificationItem from "@/src/components/notification/NotificationItem";

const Notification = ({ navigation }: any) => {
  const { get, loading } = useFetch();
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const size = 10;

  const fetchNotifications = useCallback(
    async (pageNumber: number) => {
      if (!hasMore) return;
      try {
        const params = {
          page: pageNumber,
          size,
          getMyNotifications: 1
        };
        console.log("Notification params:", params);
        
        const res = await get(`/v1/notification/list`, params);
        console.log("Notification response:", res.data.content);
        
        const newNotifications = res.data.content;
        if (pageNumber === 0) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prevNotifications) => [...prevNotifications, ...newNotifications]);
        }
        setHasMore(newNotifications.length === size);
        setPage(pageNumber);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoadingDialog(false);
      }
    },
    [get, hasMore, size]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    fetchNotifications(page).then(() => setRefreshing(false));
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchNotifications(0);
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No notifications</Text>
    </View>
  );

  const renderItem = ({ item }: { item: NotificationModel }) => (
    <View style={{marginVertical: 0}}>
      <NotificationItem item={item} />
    </View>
  );

  return (
    <View className="flex-1">
    {loadingDialog && <LoadingDialog isVisible={loadingDialog} />}
    <FlatList
      data={notifications}
      keyExtractor={(item, index) => `${item._id}-${index}`}
      style={styles.listContainer}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={() => 
        loading && hasMore ? <ActivityIndicator size="large" color="#007AFF" /> : null
      }
 
      />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notificationItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal:15,
    
    flexDirection: "row",
    alignItems: "center",
  },
  unreadItem: {
    backgroundColor: "#e6f3ff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
});

export default Notification;
