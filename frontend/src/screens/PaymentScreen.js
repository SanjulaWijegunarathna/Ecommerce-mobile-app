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
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, CreditCard, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react-native';
import { API_BASE } from '../config/api';
import { useShop } from '../context/ShopContext';
import { useUser } from '../context/UserContext';

export default function PaymentScreen({ route, navigation }) {
  const { amount, selectedItems, address: selectedAddress } = route.params || { amount: 0, selectedItems: [], address: null };
  const [method, setMethod] = useState('card'); // 'card', 'cod'
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { clearCart, removeFromCart } = useShop();
  const { user, updateUser } = useUser();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Billing Calculations
  const subtotal = amount;
  const tax = subtotal * 0.05; 
  const shipping = amount > 5000 ? 0 : 250; 
  const totalAmount = subtotal + tax + shipping;

  React.useEffect(() => {
    if (user?.paymentMethods) {
      const defaultMethod = user.paymentMethods.find(m => m.isDefault);
      if (defaultMethod) {
        setCardName(defaultMethod.cardholderName || '');
        setCardNumber(defaultMethod.cardNumber || '');
        setExpiry(defaultMethod.expiry || '');
      }
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (method === 'card' && (!cardName || !cardNumber || !expiry || !cvv)) {
      Alert.alert('Payment Missing', 'Please complete card details or choose COD.');
      return;
    }
    // Logic remains same...

    setLoading(true);
    try {
      const orderData = {
        orderItems: selectedItems.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id,
          size: item.selectedSize,
          color: item.selectedColor
        })),
        shippingAddress: {
          address: `${selectedAddress.street}, ${selectedAddress.city}`,
          city: selectedAddress.city,
          postalCode: '00100', // Mock
          country: selectedAddress.country
        },
        paymentMethod: method === 'card' ? 'Credit Card' : 'Cash on Delivery',
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: totalAmount,
        isPaid: false, // Default
      };

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Remove only selected items from cart
        for (const item of selectedItems) {
          removeFromCart(item._id, item.selectedSize);
        }
        setSuccess(true);
      } else {
        const err = await response.json();
        Alert.alert('Order Failed', err.message || 'An error occurred');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <CheckCircle size={80} color="#00332B" />
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successSubtitle}>
          Your Atelier curated pieces are being prepared for delivery. Expect an update shortly.
        </Text>
        <TouchableOpacity 
          style={styles.homeBtn}
          onPress={() => navigation.navigate('HomeMain')}
        >
          <Text style={styles.homeBtnText}>BACK TO SHOPPING</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CHECKOUT</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.editLink}>CHANGE</Text>
              </TouchableOpacity>
            </View>

            
            {selectedAddress ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressLabel}>{(selectedAddress.label || 'Other').toUpperCase()}</Text>
                <Text style={styles.addressName}>{selectedAddress.recipient}</Text>
                <Text style={styles.addressText}>{selectedAddress.street}</Text>
                <Text style={styles.addressText}>{selectedAddress.city}, {selectedAddress.country}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addAddressPlaceholder}
                onPress={() => navigation.navigate('DeliveryAddresses')}
              >
                <Text style={styles.addAddressText}>+ ADD DELIVERY ADDRESS</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bill Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BILLING SUMMARY</Text>
            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Subtotal</Text>
                <Text style={styles.billValue}>Rs. {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Administrative Tax (5%)</Text>
                <Text style={styles.billValue}>Rs. {tax.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Editorial Shipping</Text>
                <Text style={styles.billValue}>{shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`}</Text>
              </View>
              <View style={[styles.billRow, styles.totalBillRow]}>
                <Text style={styles.totalBillLabel}>Grand Total</Text>
                <Text style={styles.totalBillValue}>Rs. {totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTLEMENT METHOD</Text>
            <View style={styles.methodContainer}>
              <TouchableOpacity 
                style={[styles.methodCard, method === 'card' && styles.activeMethod]}
                onPress={() => setMethod('card')}
              >
                <CreditCard size={20} color={method === 'card' ? '#00332B' : '#999'} />
                <Text style={[styles.methodText, method === 'card' && styles.activeMethodText]}>CARD</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.methodCard, method === 'cod' && styles.activeMethod]}
                onPress={() => setMethod('cod')}
              >
                <Smartphone size={20} color={method === 'cod' ? '#00332B' : '#999'} />
                <Text style={[styles.methodText, method === 'cod' && styles.activeMethodText]}>CASH ON DELIVERY</Text>
              </TouchableOpacity>
            </View>

            {method === 'card' && (
              <View style={styles.cardForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.smallLabel}>CARDHOLDER NAME</Text>
                  <TextInput style={styles.input} value={cardName} onChangeText={setCardName} placeholder="Julianne Moore" placeholderTextColor="#BBB" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.smallLabel}>CARD NUMBER</Text>
                  <TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} placeholder="**** **** **** 4242" placeholderTextColor="#BBB" keyboardType="numeric" />
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                    <Text style={styles.smallLabel}>EXPIRY</Text>
                    <TextInput style={styles.input} value={expiry} onChangeText={setExpiry} placeholder="MM/YY" placeholderTextColor="#BBB" />
                  </View>
                  <View style={[styles.inputGroup, { flex: 0.6 }]}>
                    <Text style={styles.smallLabel}>CVV</Text>
                    <TextInput style={styles.input} value={cvv} onChangeText={setCvv} placeholder="***" placeholderTextColor="#BBB" keyboardType="numeric" maxLength={4} />
                  </View>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.payBtn, loading && { opacity: 0.7 }]} 
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.payBtnText}>
                {method === 'card' ? 'AUTHORIZE PAYMENT' : 'CONFIRM ORDER'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.secureBadge}>
            <ShieldCheck size={14} color="#999" />
            <Text style={styles.secureText}>SECURE ATELIER ENCRYPTION</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  editLink: {
    fontSize: 10,
    color: '#00332B',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  addressCard: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  addressLabel: {
    fontSize: 8,
    color: '#00332B',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  addAddressPlaceholder: {
    height: 80,
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAddressText: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  billBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  totalBillRow: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalBillLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalBillValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00332B',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  methodCard: {
    flex: 1,
    height: 70,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  activeMethod: {
    borderColor: '#00332B',
    backgroundColor: '#F3F5F4',
  },
  methodText: {
    fontSize: 9,
    marginTop: 6,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeMethodText: {
    color: '#00332B',
  },
  cardForm: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 15,
  },
  smallLabel: {
    fontSize: 8,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1A1A1A',
  },
  payBtn: {
    backgroundColor: '#00332B',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  secureBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    opacity: 0.5,
  },
  secureText: {
    fontSize: 8,
    color: '#666',
    marginLeft: 8,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00332B',
    marginTop: 30,
    marginBottom: 15,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  homeBtn: {
    backgroundColor: '#00332B',
    paddingHorizontal: 30,
    paddingVertical: 18,
  },
  homeBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
