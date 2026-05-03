import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  Dimensions,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { ChevronLeft, Search, CreditCard, Calendar, Package, XCircle, RotateCcw, ChevronRight, Filter } from 'lucide-react-native';
import { useAdmin } from '../context/AdminContext';

const { width } = Dimensions.get('window');

export default function PaymentManagementScreen({ navigation }) {
  const { payments, setPayments } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const handleRefund = (paymentId) => {
    Alert.alert(
      'Process Refund',
      'Are you sure you want to refund this payment? The amount will be credited back to the original method.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Refund', 
          onPress: () => {
            setPayments(prev => prev.map(p => 
              p.id === paymentId ? { ...p, status: 'Refunded' } : p
            ));
            setIsDetailVisible(false);
            Alert.alert('Refund Processed', 'Transaction entry updated.');
          }
        }
      ]
    );
  };

  const handleCancel = (paymentId) => {
    Alert.alert(
      'Cancel Payment',
      'This will void the transaction if not yet processed.',
      [
        { text: 'Back', style: 'cancel' },
        { 
          text: 'Confirm Cancellation', 
          style: 'destructive',
          onPress: () => {
            setPayments(prev => prev.map(p => 
              p.id === paymentId ? { ...p, status: 'Canceled' } : p
            ));
            setIsDetailVisible(false);
            Alert.alert('Canceled', 'The payment record has been voided.');
          }
        }
      ]
    );
  };

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.date.includes(searchQuery) ||
    p.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#00332B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PAYMENT CLEARING</Text>
        <TouchableOpacity>
          <Filter size={20} color="#00332B" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#999" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by ID, Date (YYYY-MM-DD)..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Transaction Logs</Text>
          <Text style={styles.summarySubtitle}>Audit and manage customer settlements.</Text>
        </View>

        {filteredPayments.map(payment => (
          <TouchableOpacity 
            key={payment.id} 
            style={styles.paymentCard}
            onPress={() => { setSelectedPayment(payment); setIsDetailVisible(true); }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.idGroup}>
                <CreditCard size={14} color="#999" />
                <Text style={styles.paymentId}>{payment.id}</Text>
              </View>
              <View style={[styles.statusBadge, 
                payment.status === 'Paid' ? styles.paidBadge : 
                payment.status === 'Refunded' ? styles.refundedBadge : styles.canceledBadge]}>
                <Text style={[styles.statusText, 
                  payment.status === 'Paid' ? styles.paidText : 
                  payment.status === 'Refunded' ? styles.refundedText : styles.canceledText]}>
                  {payment.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View>
                <Text style={styles.customerName}>{payment.customer}</Text>
                <Text style={styles.paymentDate}>{payment.date}</Text>
              </View>
              <Text style={styles.amountText}>Rs. {payment.amount.toFixed(2)}</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.itemCount}>{payment.items.length} {payment.items.length === 1 ? 'item' : 'items'} purchased</Text>
                <ChevronRight size={16} color="#BBB" />
            </View>
          </TouchableOpacity>
        ))}

        {filteredPayments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found for this query.</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={isDetailVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Transaction Detail</Text>
                    <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                        <Text style={styles.closeBtn}>CLOSE</Text>
                    </TouchableOpacity>
                </View>

                {selectedPayment && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>PAYMENT ID</Text>
                            <Text style={styles.detailVal}>{selectedPayment.id}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailLabel}>DATE</Text>
                                <Text style={styles.detailVal}>{selectedPayment.date}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailLabel}>METHOD</Text>
                                <Text style={styles.detailVal}>{selectedPayment.method}</Text>
                            </View>
                        </View>

                        <View style={styles.itemSection}>
                            <Text style={styles.detailLabel}>PURCHASED ITEMS</Text>
                            {selectedPayment.items.map((item, idx) => (
                                <View key={idx} style={styles.purchasedItem}>
                                    <View style={styles.itemIcon}><Package size={16} color="#00332B" /></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemSub}>Rs. {item.price} x {item.qty}</Text>
                                    </View>
                                    <Text style={styles.itemTotal}>Rs. {(item.price * item.qty).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>TOTAL SETTLEMENT</Text>
                            <Text style={styles.totalVal}>Rs. {selectedPayment.amount.toFixed(2)}</Text>
                        </View>

                        {selectedPayment.status === 'Paid' && (
                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={[styles.modalActionBtn, styles.refundBtn]}
                                    onPress={() => handleRefund(selectedPayment.id)}
                                >
                                    <RotateCcw size={18} color="#FFF" />
                                    <Text style={styles.actionBtnTextWhite}>PROCESS REFUND</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.modalActionBtn, styles.cancelBtn]}
                                    onPress={() => handleCancel(selectedPayment.id)}
                                >
                                    <XCircle size={18} color="#E53935" />
                                    <Text style={styles.actionBtnTextRed}>CANCEL TRANSACTION</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ height: 20 }} />
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
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F4',
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  content: {
    paddingHorizontal: 24,
  },
  summaryBox: {
    marginBottom: 25,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1A1A1A',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentId: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadge: { backgroundColor: '#E8F5E9' },
  refundedBadge: { backgroundColor: '#FFF3E0' },
  canceledBadge: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 8, fontWeight: 'bold' },
  paidText: { color: '#2E7D32' },
  refundedText: { color: '#EF6C00' },
  canceledText: { color: '#C62828' },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00332B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  itemCount: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
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
    height: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#00332B',
  },
  closeBtn: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8D6E63',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemSection: {
    marginVertical: 10,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  purchasedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F5F4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemSub: {
    fontSize: 12,
    color: '#999',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
  },
  totalVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00332B',
  },
  modalActions: {
    marginTop: 20,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 12,
  },
  refundBtn: {
    backgroundColor: '#00332B',
  },
  cancelBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E53935',
  },
  actionBtnTextWhite: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 13,
  },
  actionBtnTextRed: {
    color: '#E53935',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#BBB',
    fontStyle: 'italic',
  },
});
