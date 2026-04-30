import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { ChevronLeft, Package, Clock, Truck, CheckCircle, ArrowRight, X, Download, Printer } from 'lucide-react-native';
import { API_BASE } from '../config/api';
import { useUser } from '../context/UserContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function OrderManagementScreen({ navigation }) {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!selectedOrder) return;
    
    setDownloading(true);
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1a1a1a; }
              .label-container { border: 2px dashed #000; padding: 40px; border-radius: 8px; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
              .brand { font-size: 32px; font-weight: 900; letter-spacing: 5px; }
              .section { margin-bottom: 30px; }
              .section-tag { font-size: 10px; color: #999; font-weight: 800; letter-spacing: 2px; margin-bottom: 10px; display: block; }
              .main-text { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .sub-text { font-size: 16px; color: #333; line-height: 1.5; }
              .divider { border-top: 2px solid #000; margin: 30px 0; }
              .meta-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .meta-box { flex: 1; }
              .meta-tag { font-size: 10px; color: #999; font-weight: bold; }
              .meta-value { font-size: 16px; font-weight: bold; }
              .total-highlight { background: #f9f9f9; padding: 15px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
              .total-tag { font-size: 12px; font-weight: 800; letter-spacing: 1px; }
              .total-val { font-size: 24px; font-weight: 900; }
              .item-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f5f5f5; }
              .item-name { font-size: 16px; font-weight: bold; }
              .item-specs { font-size: 12px; color: #666; }
              .item-qty { font-weight: 900; }
              .footer { margin-top: 50px; text-align: center; color: #999; font-style: italic; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="label-container">
              <div class="header">
                <div class="brand">ATELIER</div>
              </div>
              
              <div class="section">
                <span class="section-tag">SHIP TO:</span>
                <div class="main-text">${selectedOrder.user?.name}</div>
                <div class="sub-text">${selectedOrder.shippingAddress?.address}</div>
                <div class="sub-text">${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.country}</div>
              </div>

              <div class="section">
                <span class="section-tag">CONTACT INFO:</span>
                <div class="sub-text">Phone: ${selectedOrder.user?.phone || 'N/A'}</div>
                <div class="sub-text">Email: ${selectedOrder.user?.email || 'N/A'}</div>
              </div>

              <div class="divider"></div>

              <div class="meta-row">
                <div class="meta-box">
                  <span class="meta-tag">ORDER ID</span>
                  <div class="meta-value">#ATL-${selectedOrder._id.slice(-8).toUpperCase()}</div>
                </div>
                <div class="meta-box">
                  <span class="meta-tag">METHOD</span>
                  <div class="meta-value">${selectedOrder.paymentMethod?.toUpperCase()}</div>
                </div>
              </div>

              <div class="total-highlight">
                <span class="total-tag">TOTAL AMOUNT DUE:</span>
                <span class="total-val">Rs. ${selectedOrder.totalPrice.toLocaleString()}</span>
              </div>

              <div class="divider"></div>

              <div class="section">
                <span class="section-tag">CURATED PIECES:</span>
                ${selectedOrder.orderItems.map(item => `
                  <div class="item-row">
                    <div>
                      <div class="item-name">${item.name}</div>
                      <div class="item-specs">${item.color} | ${item.size}</div>
                    </div>
                    <div class="item-qty">QTY: ${item.qty}</div>
                  </div>
                `).join('')}
              </div>

              <div class="footer">Thank you for curating with Atelier.</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not curate PDF document.");
    } finally {
      setDownloading(false);
    }
  };

  const statusOptions = [
    { label: 'Processing', status: 'Processing', step: 'Processing' },
    { label: 'Out for Delivery', status: 'Out for Delivery', step: 'Shipped' },
    { label: 'Delivered', status: 'Delivered', step: 'Delivered' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Could not fetch orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, stepText) => {
    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus, stepText })
      });

      if (response.ok) {
        Alert.alert('Success', 'Order status updated successfully.');
        setStatusModalVisible(false);
        setDetailModalVisible(false);
        fetchOrders();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#999';
      case 'Processing': return '#D4AF37';
      case 'Delivered': return '#4CAF50';
      default: return '#00332B';
    }
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard} 
      onPress={() => {
        setSelectedOrder(item);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>#ATL-{item._id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.customerName}>{item.user?.name || 'Unknown User'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.orderTotal}>Rs. {item.totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.updateBtn}
          onPress={() => {
            setSelectedOrder(item);
            setStatusModalVisible(true);
          }}
        >
          <Text style={styles.updateBtnText}>UPDATE STATUS</Text>
          <ArrowRight size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDER MANAGEMENT</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#00332B" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={48} color="#EEE" />
              <Text style={styles.emptyText}>No active orders found.</Text>
            </View>
          }
        />
      )}

      {/* Order Detail Modal */}
      <Modal visible={detailModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Order Details</Text>
                <Text style={styles.modalSubtitle}>#ATL-{selectedOrder?._id.slice(-8).toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <CheckCircle size={24} color="#00332B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Customer Section */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>CUSTOMER PROFILE</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedOrder?.user?.name || 'Guest User'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedOrder?.user?.email || 'No email provided'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{selectedOrder?.user?.phone || 'No phone provided'}</Text>
                </View>
              </View>

              {/* Delivery Section */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>DELIVERY SANCTUARY</Text>
                <Text style={styles.addressDisplay}>
                  {selectedOrder?.shippingAddress?.address},{"\n"}
                  {selectedOrder?.shippingAddress?.city}, {selectedOrder?.shippingAddress?.country}
                </Text>
              </View>

              {/* Products Section */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>CURATED PIECES</Text>
                {selectedOrder?.orderItems?.map((item, idx) => (
                  <View key={idx} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productSpecs}>Color: {item.color || 'Default'} | Size: {item.size || 'N/A'}</Text>
                    </View>
                    <View style={styles.productMetrics}>
                      <Text style={styles.productQty}>x{item.qty}</Text>
                      <Text style={styles.productPrice}>Rs. {(item.price * item.qty).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Meta Section */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>TRANSACTION LOG</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method:</Text>
                  <Text style={styles.detailValue}>{selectedOrder?.paymentMethod || 'Credit Card'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Placement Date:</Text>
                  <Text style={styles.detailValue}>{new Date(selectedOrder?.createdAt).toLocaleString()}</Text>
                </View>
                <View style={[styles.detailRow, { marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 }]}>
                  <Text style={[styles.detailLabel, { fontSize: 18, color: '#1A1A1A' }]}>Grand Total:</Text>
                  <Text style={[styles.detailValue, { fontSize: 18, color: '#00332B', fontWeight: 'bold' }]}>
                    Rs. {selectedOrder?.totalPrice.toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.modalUpdateBtn}
                onPress={() => setStatusModalVisible(true)}
              >
                <Text style={styles.modalUpdateBtnText}>MANAGE ORDER STATUS</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.printBtn}
                onPress={() => setLabelModalVisible(true)}
              >
                <Text style={styles.printBtnText}>PRINT DELIVERY LABEL</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delivery Label Modal */}
      <Modal visible={labelModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '90%', padding: 0 }]}>
            <View style={styles.labelHeader}>
              <Text style={styles.labelHeaderTitle}>DELIVERY LABEL</Text>
              <TouchableOpacity onPress={() => setLabelModalVisible(false)} style={styles.labelClose}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.labelScroll}>
              <View style={styles.shippingLabelCard}>
                {/* Branding */}
                <View style={styles.labelBranding}>
                  <Text style={styles.brandName}>ATELIER</Text>
                  <View style={styles.barcodePlaceholder} />
                </View>

                {/* Shipping To */}
                <View style={styles.labelSection}>
                  <Text style={styles.labelSectionTag}>SHIP TO:</Text>
                  <Text style={[styles.labelMainText, { fontSize: 20, marginBottom: 5 }]}>{selectedOrder?.user?.name}</Text>
                  <Text style={styles.labelSubText}>{selectedOrder?.shippingAddress?.address}</Text>
                  <Text style={styles.labelSubText}>{selectedOrder?.shippingAddress?.city}, {selectedOrder?.shippingAddress?.country}</Text>
                </View>

                {/* Contact Information */}
                <View style={styles.labelSection}>
                  <Text style={styles.labelSectionTag}>CONTACT INFO:</Text>
                  <View style={styles.labelContactRow}>
                    <Text style={styles.labelContactLabel}>Phone:</Text>
                    <Text style={styles.labelContactValue}>{selectedOrder?.user?.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.labelContactRow}>
                    <Text style={styles.labelContactLabel}>Email:</Text>
                    <Text style={styles.labelContactValue}>{selectedOrder?.user?.email || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.labelDivider} />

                {/* Order Metadata */}
                <View style={styles.labelMetaRow}>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaTag}>ORDER ID</Text>
                    <Text style={styles.metaValue}>#ATL-{selectedOrder?._id.slice(-8).toUpperCase()}</Text>
                  </View>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaTag}>METHOD</Text>
                    <Text style={styles.metaValue}>{selectedOrder?.paymentMethod?.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.labelDivider} />

                {/* Amount Highlight */}
                <View style={styles.amountHighlight}>
                  <Text style={styles.amountTag}>TOTAL AMOUNT TO COLLECT</Text>
                  <Text style={styles.amountVal}>Rs. {selectedOrder?.totalPrice.toLocaleString()}</Text>
                </View>

                {/* Itemized List */}
                <View style={styles.labelSection}>
                  <Text style={styles.labelSectionTag}>CONTENTS / CURATED PIECES:</Text>
                  {selectedOrder?.orderItems?.map((item, idx) => (
                    <View key={idx} style={styles.labelItemRow}>
                      <View style={styles.itemMain}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSpecs}>{item.color} | {item.size}</Text>
                      </View>
                      <Text style={styles.itemQty}>QTY: {item.qty}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.labelFooter}>
                  <Text style={styles.thankYouNote}>Thank you for curating with Atelier.</Text>
                  <View style={styles.stampPlaceholder}>
                    <CheckCircle size={32} color="#00332B" opacity={0.3} />
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.actionPrintBtn} 
                onPress={() => Alert.alert("Print Command Sent", "Delivery label is connecting to air-printer...")}
              >
                <Printer size={18} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.actionPrintBtnText}>CONNECT TO PRINTER</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.downloadActionBtn, downloading && { opacity: 0.7 }]} 
                onPress={handleDownloadPDF}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#00332B" />
                ) : (
                  <>
                    <Download size={18} color="#00332B" style={{ marginRight: 10 }} />
                    <Text style={styles.downloadActionBtnText}>DOWNLOAD AS PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSubtitle}>Order #ATL-{selectedOrder?._id.slice(-8).toUpperCase()}</Text>
            
            <View style={styles.optionsContainer}>
              {statusOptions.map((opt, i) => {
                const isActive = selectedOrder?.status === opt.status;
                return (
                  <TouchableOpacity 
                    key={i}
                    style={[styles.optionRow, isActive && styles.optionRowActive]}
                    onPress={() => !isActive && handleUpdateStatus(selectedOrder._id, opt.status, opt.step)}
                    disabled={updating || isActive}
                  >
                    <View style={[styles.optionIconContainer, isActive && styles.optionIconActive]}>
                      {opt.status === 'Processing' && <Clock size={20} color={isActive ? "#FFF" : "#00332B"} />}
                      {opt.status === 'Out for Delivery' && <Truck size={20} color={isActive ? "#FFF" : "#00332B"} />}
                      {opt.status === 'Delivered' && <CheckCircle size={20} color={isActive ? "#FFF" : "#00332B"} />}
                    </View>
                    <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{opt.label}</Text>
                    {isActive ? (
                      <CheckCircle size={20} color="#00332B" fill="#E8F5E9" />
                    ) : (
                      updating ? <ActivityIndicator size="small" color="#00332B" /> : <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: '180deg' }] }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
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
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderId: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00332B',
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00332B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    color: '#999',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 2,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  addressDisplay: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 24,
    fontWeight: '500',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  productSpecs: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  productMetrics: {
    alignItems: 'flex-end',
  },
  productQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00332B',
  },
  modalUpdateBtn: {
    backgroundColor: '#00332B',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalUpdateBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 12,
  },
  printBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00332B',
  },
  printBtnText: {
    color: '#00332B',
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 12,
  },
  labelHeader: {
    backgroundColor: '#00332B',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  labelHeaderTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  labelScroll: {
    padding: 20,
  },
  shippingLabelCard: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    padding: 24,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  labelBranding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  barcodePlaceholder: {
    width: 80,
    height: 40,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  labelSectionTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  labelSection: {
    marginBottom: 25,
  },
  labelMainText: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  labelSubText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  labelDivider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 15,
  },
  amountHighlight: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  amountTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 5,
  },
  amountVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00332B',
  },
  labelMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaBox: {
    flex: 1,
  },
  metaTag: {
    fontSize: 8,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  labelItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  itemSpecs: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  labelFooter: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  thankYouNote: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#999',
  },
  actionPrintBtn: {
    backgroundColor: '#1A1A1A',
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  actionPrintBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  downloadActionBtn: {
    backgroundColor: '#FFF',
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#00332B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  downloadActionBtnText: {
    color: '#00332B',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  labelContactRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  labelContactLabel: {
    fontSize: 12,
    color: '#999',
    width: 60,
  },
  labelContactValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginBottom: 30,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  optionRowActive: {
    backgroundColor: '#F3F5F4',
    borderBottomColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  optionIconActive: {
    backgroundColor: '#00332B',
  },
  optionLabelActive: {
    color: '#00332B',
    fontWeight: 'bold',
  },
  closeBtn: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 12,
  }
});
