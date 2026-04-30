import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { ChevronLeft, MapPin, Plus, CheckCircle2, Edit3, ArrowRight } from 'lucide-react-native';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

export default function CheckoutOverviewScreen({ route, navigation }) {
  const { total, selectedItems } = route.params;
  const { user } = useUser();
  
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [selectedId, setSelectedId] = useState(defaultAddr?._id);

  // Billing (Same as in your screenshot)
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = subtotal * 0.10; 
  const finalTotal = subtotal - discountAmount;

  const handleContinue = () => {
    if (!selectedId) {
      Alert.alert('Address Required', 'Please select a delivery address.');
      return;
    }
    const selectedAddress = user.addresses.find(a => a._id === selectedId);
    navigation.navigate('Payment', { 
      amount: finalTotal, 
      selectedItems,
      address: selectedAddress
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>REVIEW & ADDRESS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Billing Summary Card (Matching user screenshot) */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>CHOSEN ITEM SUMMARY ({selectedItems.length})</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Selection Subtotal</Text>
            <Text style={styles.rowValue}>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>Collection Discount (10%)</Text>
              <Text style={[styles.rowValue, { color: '#E53935' }]}>- Rs. {discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Address Selection Section */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
          
          {user?.addresses?.length > 0 ? (
            user.addresses.map((addr) => (
              <TouchableOpacity 
                key={addr._id} 
                style={[styles.addressItem, selectedId === addr._id && styles.activeAddress]}
                onPress={() => setSelectedId(addr._id)}
              >
                <View style={styles.addressInner}>
                  <View style={[styles.radio, selectedId === addr._id && styles.radioActive]}>
                    {selectedId === addr._id && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressType}>{(addr.label || 'Other').toUpperCase()}</Text>
                    <Text style={styles.recipientName}>{addr.recipient}</Text>
                    <Text style={styles.addressText}>{addr.street}, {addr.city}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('DeliveryAddresses', { editId: addr._id })}
                    style={styles.editBtn}
                  >
                    <Edit3 size={18} color="#00332B" opacity={0.6} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity 
              style={styles.addPlaceholder}
              onPress={() => navigation.navigate('DeliveryAddresses')}
            >
              <Plus size={20} color="#999" />
              <Text style={styles.addText}>ADD DELIVERY ADDRESS</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.addNewLine}
            onPress={() => navigation.navigate('DeliveryAddresses')}
          >
            <Plus size={16} color="#00332B" />
            <Text style={styles.addNewLineText}>ADD ANOTHER ADDRESS</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleContinue}>
          <Text style={styles.checkoutBtnText}>CONTINUE TO PAYMENT</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  content: { padding: 24 },
  
  // Summary Card Style (from user's image)
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rowLabel: { fontSize: 14, color: '#666' },
  rowValue: { fontSize: 14, color: '#1A1A1A', fontWeight: 'bold' },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  totalLabel: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  totalValue: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  // Address Section
  addressSection: { marginTop: 10 },
  sectionTitle: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  addressItem: {
    backgroundColor: '#FAFAF8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  activeAddress: {
    borderColor: '#00332B',
    backgroundColor: '#FFF',
    borderWidth: 2,
  },
  addressInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  radioActive: { borderColor: '#00332B' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00332B' },
  addressInfo: { flex: 1 },
  addressType: { fontSize: 9, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 5 },
  recipientName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  addressText: { fontSize: 13, color: '#666' },
  editBtn: { padding: 10 },
  
  addPlaceholder: {
    height: 100,
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  addText: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 10, letterSpacing: 1 },
  addNewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addNewLineText: { fontSize: 11, fontWeight: 'bold', color: '#00332B', marginLeft: 10, letterSpacing: 1 },

  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  checkoutBtn: {
    backgroundColor: '#00332B',
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginRight: 12,
  },
});
