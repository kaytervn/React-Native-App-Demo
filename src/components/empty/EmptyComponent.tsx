import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Box } from 'lucide-react-native';

const EmptyComponent= ({ 
  message = 'Dữ liệu trống', 
  icon: Icon = Box, 
  iconSize = 48, 
  iconColor = '#A0AEC0',
  actionButton = null 
}) => {
  return (
    <View style={styles.container}>
      <Icon size={iconSize} color={iconColor} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {actionButton && (
        <View style={styles.actionButtonContainer}>
          {actionButton}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
  },
  actionButtonContainer: {
    marginTop: 16,
  },
});

export default EmptyComponent;