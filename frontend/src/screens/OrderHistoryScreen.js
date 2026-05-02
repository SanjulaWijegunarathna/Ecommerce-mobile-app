import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { API_BASE } from '../config/api';
import { useFocusEffect } from '@react-navigation/native';

export default function OrderHistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { user } = useUser();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/orders/myorders`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch your orders.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const filteredOrders = orders.filter(o => 
    activeTab === 'ALL' ? true : o.status.toUpperCase() === activeTab
  );

  const handleCancelOrder = async (orderId, paymentMethod) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            setCanceling(true);
            try {
              const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${user.token}`
                }
              });

              if (response.ok) {
                if (paymentMethod && paymentMethod !== 'Cash on Delivery') {
                  Alert.alert('Refund Initiated', 'Since the payment was done, the amount will be refunded back to your account within 2-3 business working days.');
                } else {
                  Alert.alert('Order Cancelled', 'Your order has been successfully cancelled.');
                }
                setModalVisible(false);
                fetchOrders();
              } else {
                throw new Error("Failed to cancel");
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Could not cancel the order at this time.');
            } finally {
              setCanceling(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard} 
      onPress={() => {
        setSelectedOrder(item);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>ORDER #{item._id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'Delivered' ? styles.statusDelivered : styles.statusProcessing]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.itemImagesRow}>
        {item.orderItems.slice(0, 3).map((prod, index) => (
          <Image 
            key={index} 
            source={{ uri: prod.image?.startsWith('http') ? prod.image : `${API_BASE}${prod.image}` }} 
            style={styles.productImageThumb} 
          />
        ))}
        <View style={styles.orderDetailsSection}>
          <Text style={styles.itemCountText}>{item.orderItems.length} ITEM{item.orderItems.length > 1 ? 'S' : ''}</Text>
          <Text style={styles.orderTotal}>Rs. {item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Invoice', { order: item })}
        >
          <Text style={styles.secondaryBtnText}>VIEW INVOICE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Tracking', { order: item })}
        >
          <Text style={styles.primaryBtnText}>
            {item.status === 'Delivered' ? 'REVIEW ORDER' : 'TRACK ORDER'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Search size={20} color="#00332B" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionSubtitle}>PERSONAL ARCHIVE</Text>
          <Text style={styles.title}>Your Purchases</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterBar}>
          {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.filterTab, activeTab === tab && styles.activeFilterTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.filterTabText, activeTab === tab && styles.activeFilterTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00332B" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 100 }}>
                <Text style={{ color: '#999', fontSize: 16 }}>No orders found.</Text>
              </View>
            )}
          />
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#00332B" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>ORDER ID</Text>
                  <Text style={styles.detailValue}>#{selectedOrder._id.slice(-8).toUpperCase()}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>SHIPPING TO</Text>
                  <Text style={styles.detailValue}>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>PAYMENT METHOD</Text>
                  <Text style={styles.detailValue}>{selectedOrder.paymentMethod || 'Credit Card'}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>ITEMS</Text>
                  {selectedOrder.orderItems.map((item, idx) => (
                    <View key={idx} style={styles.modalItemRow}>
                      <Text style={styles.modalItemName}>{item.qty}x {item.name}</Text>
                      <Text style={styles.modalItemPrice}>Rs. {item.price * item.qty}</Text>
                    </View>
                  ))}
                  <View style={styles.modalTotalRow}>
                    <Text style={styles.modalTotalLabel}>Total</Text>
                    <Text style={styles.modalTotalValue}>Rs. {selectedOrder.totalPrice.toLocaleString()}</Text>
                  </View>
                </View>

                {selectedOrder.status === 'Pending' && (
                  <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => handleCancelOrder(selectedOrder._id, selectedOrder.paymentMethod)}
                    disabled={canceling}
                  >
                    {canceling ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.cancelBtnText}>CANCEL ORDER</Text>
                    )}
                  </TouchableOpacity>
                )}
                
                {selectedOrder.status !== 'Pending' && (
                  <View style={styles.processedBadge}>
                    <Text style={styles.processedText}>This order is already {selectedOrder.status.toLowerCase()} and cannot be cancelled.</Text>
                  </View>
                )}
                
                <View style={{height: 40}} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 70,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE9',
  },
  headerTitle: {
    fontSize: 16,
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  headerSection: {
    marginBottom: 25,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  filterTab: {
    marginRight: 20,
    paddingBottom: 8,
  },
  activeFilterTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00332B',
  },
  filterTabText: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  activeFilterTabText: {
    color: '#00332B',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE9',
    paddingBottom: 15,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statusDelivered: {
    backgroundColor: '#E8F5E9',
  },
  statusProcessing: {
    backgroundColor: '#FFF8E1',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#1A1A1A',
  },
  itemImagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  productImageThumb: {
    width: 60,
    height: 80,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#F3F5F4',
    resizeMode: 'cover',
  },
  orderDetailsSection: {
    justifyContent: 'center',
  },
  itemCountText: {
    fontSize: 9,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    flex: 0.48,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
  },
  primaryBtn: {
    flex: 0.48,
    paddingVertical: 14,
    backgroundColor: '#00332B',
    borderRadius: 4,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalScroll: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    lineHeight: 20,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalItemName: {
    fontSize: 14,
    color: '#333',
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00332B',
  },
  cancelBtn: {
    backgroundColor: '#D9534F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  processedBadge: {
    backgroundColor: '#F0EBE9',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  processedText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
