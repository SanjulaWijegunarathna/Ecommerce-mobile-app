import React, { useState, useEffect } from 'react';
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
  Modal,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, MessageSquare, Star, Trash2, Reply, X, Send, User } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { API_BASE } from '../config/api';
import { RefreshControl } from 'react-native';

export default function ReviewManagementScreen({ navigation }) {
  const { user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/reviews/all`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Could not load reviews.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (orderId) => {
    Alert.alert(
      'Remove Review',
      'Are you sure you want to permanently delete this customer feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/orders/${orderId}/review`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user?.token}` }
              });
              if (response.ok) {
                setReviews(prev => prev.filter(r => r._id !== orderId));
                Alert.alert('Success', 'Review has been removed.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review.');
            }
          }
        }
      ]
    );
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/api/orders/${selectedReview._id}/review/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (response.ok) {
        setReviews(prev => prev.map(r => 
          r._id === selectedReview._id ? { ...r, review: { ...r.review, reply: replyText } } : r
        ));
        setIsReplyModalVisible(false);
        setReplyText('');
        Alert.alert('Reply Posted', 'Your response has been added to the review.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post reply.');
    } finally {
      setSaving(false);
    }
  };

  const openReplyModal = (order) => {
    setSelectedReview(order);
    setReplyText(order.review?.reply || '');
    setIsReplyModalVisible(true);
  };

  const filteredReviews = reviews.filter(r => 
    (r.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.review?.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#00332B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDITORIAL REVIEWS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MessageSquare size={18} color="#999" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Filter reviews by product or customer..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              fetchReviews();
            }}
            color="#00332B"
          />
        }
      >
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Feedback Hub</Text>
          <Text style={styles.summarySubtitle}>Manage and respond to client testimonials.</Text>
        </View>

        {filteredReviews.map(item => (
          <View key={item._id} style={styles.reviewCard}>
            <View style={styles.cardHeader}>
              <View style={styles.customerInfo}>
                <View style={styles.avatarPlaceholder}><User size={14} color="#00332B" /></View>
                <View>
                  <Text style={styles.customerName}>{item.user?.name || 'Guest User'}</Text>
                  <Text style={styles.productName}>{item.orderItems?.[0]?.name || 'Atelier Piece'}</Text>
                </View>
              </View>
              <View style={styles.ratingBox}>
                <Star size={12} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingText}>{item.review?.rating || 0}</Text>
              </View>
            </View>

            <Text style={styles.commentText}>{item.review?.comment}</Text>
            
            {item.review?.reply ? (
              <View style={styles.replyBox}>
                <Text style={styles.replyLabel}>YOUR RESPONSE:</Text>
                <Text style={styles.replyText}>{item.review.reply}</Text>
              </View>
            ) : null}

            <View style={styles.cardActions}>
              <Text style={styles.dateText}>{item.review?.createdAt ? new Date(item.review.createdAt).toLocaleDateString() : 'Recent'}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => openReplyModal(item)}
                >
                  <Reply size={16} color="#00332B" />
                  <Text style={styles.actionBtnText}>Reply</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                   style={[styles.actionBtn, { marginLeft: 15 }]}
                   onPress={() => handleDelete(item._id)}
                >
                  <Trash2 size={16} color="#E53935" />
                  <Text style={[styles.actionBtnText, { color: '#E53935' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {filteredReviews.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No client feedback found in recent logs.</Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Modal */}
      <Modal visible={isReplyModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>RESPOND TO FEEDBACK</Text>
                    <TouchableOpacity onPress={() => setIsReplyModalVisible(false)}>
                        <X size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                {selectedReview && (
                    <View>
                        <View style={styles.contextBox}>
                            <Text style={styles.contextLabel}>CUSTOMER SAYS:</Text>
                            <Text style={styles.contextText} numberOfLines={2}>"{selectedReview.comment}"</Text>
                        </View>
                        
                        <Text style={styles.inputLabel}>OFFICIAL ATELIER RESPONSE</Text>
                        <TextInput 
                            style={styles.replyInput}
                            placeholder="Type your response here..."
                            multiline
                            textAlignVertical="top"
                            value={replyText}
                            onChangeText={setReplyText}
                        />

                        <TouchableOpacity 
                            style={styles.sendBtn}
                            onPress={handleSendReply}
                        >
                            <Send size={18} color="#FFF" />
                            <Text style={styles.sendBtnText}>POST RESPONSE</Text>
                        </TouchableOpacity>
                    </View>
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
    height: 52,
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
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  productName: {
    fontSize: 11,
    color: '#8D6E63',
    fontWeight: '600',
    marginTop: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginLeft: 4,
  },
  commentText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 15,
  },
  replyBox: {
    backgroundColor: '#F9FAF9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#00332B',
  },
  replyLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#00332B',
    letterSpacing: 1,
    marginBottom: 5,
  },
  replyText: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  dateText: {
    fontSize: 11,
    color: '#BBB',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00332B',
    marginLeft: 6,
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
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#00332B',
  },
  contextBox: {
    backgroundColor: '#FAF9F6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  contextLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
  },
  contextText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: '#F3F5F4',
    height: 120,
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    color: '#000',
    marginBottom: 25,
  },
  sendBtn: {
    backgroundColor: '#00332B',
    height: 56,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginLeft: 10,
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
