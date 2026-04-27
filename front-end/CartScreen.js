import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  StatusBar,
  Switch,
  Platform
} from 'react-native';
import { ChevronLeft, Gift, Heart, Trash2, ArrowRight, Lock, MessageSquare } from 'lucide-react-native';
import { API_BASE } from '../config/api';
import { useShop } from '../context/ShopContext';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, addToCart, clearCart, addToWishlist, updateQuantity } = useShop();
  
  // Track selected IDs for checkout
  const [selectedItems, setSelectedItems] = useState(cart.map(item => `${item._id}-${item.selectedSize}`));

  const toggleSelect = (itemKey) => {
    setSelectedItems(prev => 
      prev.includes(itemKey) 
        ? prev.filter(k => k !== itemKey) 
        : [...prev, itemKey]
    );
  };

  const filteredCart = cart.filter(item => selectedItems.includes(`${item._id}-${item.selectedSize}`));

  const subtotal = filteredCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = subtotal * 0.10; 
  const total = subtotal - discountAmount;

  const renderCartItem = (item) => {
    const itemKey = `${item._id}-${item.selectedSize}`;
    const isSelected = selectedItems.includes(itemKey);

    return (
      <View key={itemKey} style={styles.cartItem}>
        {/* Selection Circle */}
        <TouchableOpacity 
          style={[styles.selectionCircle, isSelected && styles.selectionCircleActive]}
          onPress={() => toggleSelect(itemKey)}
        >
          {isSelected && <View style={styles.selectionInner} />}
        </TouchableOpacity>

        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.image?.startsWith('http') ? item.image : `${API_BASE}${item.image}` }} 
            style={styles.productImage} 
          />
        </View>

        <View style={styles.productDetails}>
          <View style={styles.productHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.collectionText}>{item.category?.toUpperCase() || 'COLLECTION'}</Text>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.optionInfo}>Size: {item.selectedSize} | Color: {item.selectedColor}</Text>
            </View>
            <Text style={styles.productPrice}>Rs. {item.price}</Text>
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.optionLabel}>QTY</Text>
            <View style={styles.quantityPicker}>
              <TouchableOpacity onPress={() => updateQuantity(item._id, item.selectedSize, -1)}>
                <Text style={styles.quantityBtn}>—</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item._id, item.selectedSize, 1)}>
                <Text style={styles.quantityBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => addToWishlist(item)}>
              <Heart size={16} color="#666" />
              <Text style={styles.actionText}>ARCHIVE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => removeFromCart(item._id, item.selectedSize)}>
              <Trash2 size={16} color="#E53935" />
              <Text style={[styles.actionText, { color: '#E53935' }]}>REMOVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        <Text style={styles.headerLogo}>Atelier</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionSubtitle}>CURATED SELECTION</Text>
          <Text style={styles.title}>Your Wardrobe{"\n"}Essentials</Text>

          {cart.length > 0 ? (
            cart.map(renderCartItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your shopping bag is currently empty.</Text>
              <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('SHOP')}>
                <Text style={styles.shopNowText}>EXPLORE PIECES</Text>
              </TouchableOpacity>
            </View>
          )}

          {cart.length > 0 && (
            <>
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>CHOSEN ITEM SUMMARY ({filteredCart.length})</Text>
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
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>Rs. {total.toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.checkoutBtn, filteredCart.length === 0 && { opacity: 0.5 }]}
                onPress={() => filteredCart.length > 0 && navigation.navigate('CheckoutOverview', { 
                  total: total,
                  selectedItems: filteredCart 
                })}
                disabled={filteredCart.length === 0}
              >
                <Text style={styles.checkoutBtnText}>PROCEED TO ADDRESS</Text>
                <ArrowRight size={20} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.securityRow}>
                <Lock size={12} color="#999" />
                <Text style={styles.securityText}>SECURE ATELIER CHECKOUT</Text>
              </View>
            </>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerLogo: {
    fontSize: 20,
    color: '#00332B',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
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
    marginBottom: 35,
    lineHeight: 40,
  },
  cartItem: {
    marginBottom: 30,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    position: 'relative',
    flexDirection: 'row',
  },
  selectionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DDD',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleActive: {
    borderColor: '#00332B',
  },
  selectionInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00332B',
  },
  productImageContainer: {
    width: 120,
    height: 160,
    backgroundColor: '#FAF9F6',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  stockBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1,
  },
  productDetails: {
    marginTop: 5,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  collectionText: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionInfo: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00332B',
  },
  interactiveOptions: {
    marginTop: 5,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  colorSelectionRow: {
    flexDirection: 'row',
  },
  colorCircleWrapper: {
    padding: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 20,
    marginRight: 12,
  },
  activeColorCircle: {
    borderColor: '#00332B',
  },
  colorCircleMain: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sizeSelectionRow: {
    flexDirection: 'row',
  },
  sizeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EEE',
    marginRight: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  activeSizeChip: {
    backgroundColor: '#00332B',
    borderColor: '#00332B',
  },
  sizeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  activeSizeText: {
    color: '#FFF',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F4',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quantityBtn: {
    fontSize: 18,
    color: '#000',
    padding: 10,
  },
  quantityValue: {
    fontSize: 14,
    color: '#000',
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  actionText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  summarySection: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
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
  rowLabel: {
    fontSize: 14,
    color: '#666',
  },
  rowValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  rowSub: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  checkoutBtn: {
    backgroundColor: '#00332B',
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginRight: 10,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  securityText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 8,
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  shopNowBtn: {
    borderWidth: 1,
    borderColor: '#00332B',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shopNowText: {
    color: '#00332B',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
