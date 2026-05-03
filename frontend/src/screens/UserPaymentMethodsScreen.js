import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { ChevronLeft, Plus, CreditCard, Trash2, CheckCircle, X } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { API_BASE } from '../config/api';

export default function UserPaymentMethodsScreen({ navigation }) {
  const { user, updateUser } = useUser();
  const [cards, setCards] = useState(user?.paymentMethods || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const syncPaymentMethodsToBackend = async (newMethods) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ paymentMethods: newMethods })
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        updateUser({ paymentMethods: updatedProfile.paymentMethods });
        return true;
      } else {
        Alert.alert('Error', 'Failed to save payment method to server.');
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while saving payment method.');
      return false;
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Card",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const updated = cards.filter(c => (c._id || c.id) !== id);
            const success = await syncPaymentMethodsToBackend(updated);
            if (success) setCards(updated);
          }
        }
      ]
    );
  };

  const handleSetDefault = async (id) => {
    const updated = cards.map(c => ({
      ...c,
      isDefault: (c._id || c.id) === id
    }));
    const success = await syncPaymentMethodsToBackend(updated);
    if (success) setCards(updated);
  };

  const handleAddCard = async () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv) {
      Alert.alert("Error", "Please fill in all card details.");
      return;
    }

    const cardToAdd = {
      cardholderName: newCard.name,
      cardNumber: newCard.number,
      expiry: newCard.expiry,
      isDefault: cards.length === 0
    };

    const updated = [...cards, cardToAdd];
    const success = await syncPaymentMethodsToBackend(updated);
    if (success) {
      setCards(updated);
      setModalVisible(false);
      setNewCard({ name: '', number: '', expiry: '', cvv: '' });
      Alert.alert("Success", "New payment method added successfully.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#00332B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionSubtitle}>PERSONAL ARCHIVE</Text>
          <Text style={styles.title}>Saved Cards</Text>
          <Text style={styles.description}>
            Manage your payment methods for a seamless checkout experience.
          </Text>
        </View>

        {cards.map(card => {
          const cardNum = card.cardNumber || '';
          const last4 = cardNum.slice(-4);
          const type = cardNum.startsWith('4') ? 'Visa' : 'Mastercard';
          
          return (
            <View key={card._id || card.id} style={styles.cardContainer}>
              <View style={styles.cardInfo}>
                <View style={styles.iconContainer}>
                  <CreditCard size={24} color="#1A1A1A" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{type} ending in {last4}</Text>
                  <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                {card.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <CheckCircle size={12} color="#00332B" style={{marginRight: 4}} />
                    <Text style={styles.defaultText}>DEFAULT</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => handleSetDefault(card._id || card.id)}
                  >
                    <Text style={styles.setDefaultText}>SET DEFAULT</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(card._id || card.id)}
                >
                  <Trash2 size={16} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity 
          style={styles.addCardBtn}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#00332B" style={{marginRight: 10}} />
          <Text style={styles.addCardText}>ADD NEW PAYMENT METHOD</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Card</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Julianne Moore"
                  value={newCard.name}
                  onChangeText={(text) => setNewCard({...newCard, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <TextInput
                  style={styles.input}
                  placeholder="**** **** **** 4242"
                  keyboardType="numeric"
                  maxLength={16}
                  value={newCard.number}
                  onChangeText={(text) => setNewCard({...newCard, number: text})}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                  <Text style={styles.inputLabel}>EXPIRY DATE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    maxLength={5}
                    value={newCard.expiry}
                    onChangeText={(text) => setNewCard({...newCard, expiry: text})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="***"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({...newCard, cvv: text})}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard}>
                <Text style={styles.saveBtnText}>SAVE CARD</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  headerSection: {
    marginBottom: 40,
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
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE9',
  },
  iconContainer: {
    width: 50,
    height: 35,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00332B',
    letterSpacing: 1,
  },
  actionBtn: {
    paddingVertical: 6,
  },
  setDefaultText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  addCardBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#00332B',
    borderStyle: 'dashed',
    paddingVertical: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  addCardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00332B',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F3F5F4',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A1A',
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  saveBtn: {
    backgroundColor: '#00332B',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
