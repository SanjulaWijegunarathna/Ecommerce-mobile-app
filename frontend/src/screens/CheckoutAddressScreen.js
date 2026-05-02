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
  Alert
} from 'react-native';
import { ChevronLeft, MapPin, Plus, CheckCircle2 } from 'lucide-react-native';
import { useUser } from '../context/UserContext';

export default function CheckoutAddressScreen({ route, navigation }) {
  const { total, selectedItems } = route.params;
  const { user } = useUser();
  
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [selectedId, setSelectedId] = useState(defaultAddr?._id);

  const handleContinue = () => {
    if (!selectedId) {
      Alert.alert('Address Required', 'Please select a delivery address to continue.');
      return;
    }
    const selectedAddress = user.addresses.find(a => a._id === selectedId);
    navigation.navigate('Payment', { 
      amount: total, 
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
        <Text style={styles.headerTitle}>DELIVERY ADDRESS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionSubtitle}>STAGE 01 — 02</Text>
        <Text style={styles.title}>Where should we{"\n"}deliver your pieces?</Text>

        {user?.addresses?.length > 0 ? (
          user.addresses.map((addr) => (
            <TouchableOpacity 
              key={addr._id} 
              style={[styles.addressCard, selectedId === addr._id && styles.activeCard]}
              onPress={() => setSelectedId(addr._id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.labelGroup}>
                  <MapPin size={16} color={selectedId === addr._id ? '#00332B' : '#999'} />
                  <Text style={[styles.label, selectedId === addr._id && styles.activeLabel]}>
                    {addr.label.toUpperCase()}
                  </Text>
                </View>
                {selectedId === addr._id && <CheckCircle2 size={20} color="#00332B" />}
              </View>
              
              <Text style={styles.recipient}>{addr.recipient}</Text>
              <Text style={styles.street}>{addr.street}</Text>
              <Text style={styles.location}>{addr.city}, {addr.country}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You haven't saved any addresses yet.</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('DeliveryAddresses')}
        >
          <Plus size={20} color="#00332B" />
          <Text style={styles.addBtnText}>ADD NEW ADDRESS</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>CONTINUE TO PAYMENT</Text>
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
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  content: { padding: 24 },
  sectionSubtitle: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 35,
    lineHeight: 36,
  },
  addressCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 15,
    backgroundColor: '#FAFAF8',
  },
  activeCard: {
    borderColor: '#00332B',
    backgroundColor: '#FFF',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelGroup: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 10, color: '#999', fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  activeLabel: { color: '#00332B' },
  recipient: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  street: { fontSize: 14, color: '#666', marginBottom: 2 },
  location: { fontSize: 14, color: '#666' },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14, fontStyle: 'italic' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 10,
  },
  addBtnText: { fontSize: 12, fontWeight: 'bold', color: '#00332B', marginLeft: 10, letterSpacing: 1 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  continueBtn: {
    backgroundColor: '#00332B',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
});
