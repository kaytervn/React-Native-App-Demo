import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ModalDelete = ({ isVisible, title, onClose, onConfirm } : any) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{title}</Text>
          <View style={styles.separator} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.verticalSeparator} />
            <TouchableOpacity style={styles.button} onPress={onConfirm}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: width * 0.75,
    backgroundColor: 'white',
    borderRadius: 14,
    overflow: 'hidden'
  },
  modalText: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500'
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5'
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 50
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  verticalSeparator: {
    width: 1,
    backgroundColor: '#E5E5E5'
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '400'
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '600'
  }
});

export default ModalDelete;