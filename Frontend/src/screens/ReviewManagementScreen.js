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
  Platform,
  Modal,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  ChevronLeft,
  MessageSquare,
  Star,
  Trash2,
  X,
  User,
  CheckCircle,
  ShieldCheck,
  ImageIcon,
  Reply,
  Send,
} from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { API_BASE } from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReviewManagementScreen({ navigation }) {
  const { user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reviews/admin/all`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const performDelete = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (response.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setConfirmDeleteId(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setIsReplyModalVisible(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedReview) return;
    try {
      setSendingReply(true);
      const response = await fetch(`${API_BASE}/api/reviews/${selectedReview._id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (response.ok) {
        const updated = await response.json();
        setReviews((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
        setIsReplyModalVisible(false);
        setReplyText('');
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Reply error:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleVerify = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}/verify`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isVerified: true } : r))
        );
      }
    } catch (error) {
      console.error('Verify error:', error);
    }
  };

  // Reviews from /api/reviews/admin/all have: user, product, name, rating, comment, images[], isVerified
  const filteredReviews = reviews.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={12}
        color="#D4AF37"
        fill={s <= rating ? '#D4AF37' : 'transparent'}
        style={{ marginRight: 2 }}
      />
    ));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#00332B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDITORIAL REVIEWS</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MessageSquare size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, product or comment..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00332B" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchReviews(); }}
              colors={['#00332B']}
            />
          }
        >
          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Feedback Hub</Text>
            <Text style={styles.summarySubtitle}>
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} · {reviews.filter(r => r.isVerified).length} verified
            </Text>
          </View>

          {filteredReviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={40} color="#DDD" />
              <Text style={styles.emptyText}>No reviews found.</Text>
            </View>
          ) : (
            filteredReviews.map((item) => (
              <View key={item._id} style={styles.reviewCard}>

                {/* Card Header: Avatar + Name + Product + Rating */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarCircle}>
                    <User size={16} color="#00332B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.customerName}>{item.name || item.user?.name || 'User'}</Text>
                      {item.isVerified && (
                        <ShieldCheck size={14} color="#00332B" />
                      )}
                    </View>
                    <Text style={styles.productName}>
                      {item.product?.name || 'Atelier Product'}
                    </Text>
                  </View>
                  {/* Star Rating */}
                  <View style={styles.ratingBox}>
                    {renderStars(item.rating || 0)}
                    <Text style={styles.ratingNum}>{item.rating}</Text>
                  </View>
                </View>

                {/* Comment */}
                <Text style={styles.commentText}>"{item.comment}"</Text>

                {/* Images Row */}
                {item.images && item.images.length > 0 && (
                  <View style={styles.imagesSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <ImageIcon size={12} color="#999" />
                      <Text style={styles.imagesLabel}>{item.images.length} PHOTO{item.images.length > 1 ? 'S' : ''}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {item.images.map((img, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => setPreviewImage(img.data)}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: img.data }}
                            style={styles.reviewImage}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Admin Reply display */}
                {item.adminReply ? (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>ATELIER RESPONSE:</Text>
                    <Text style={styles.replyText}>{item.adminReply}</Text>
                    {item.repliedAt && (
                      <Text style={styles.replyDate}>
                        {new Date(item.repliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                ) : null}

                {/* Footer: Date + Actions */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Reply Button */}
                    <TouchableOpacity
                      style={styles.replyBtn}
                      onPress={() => openReplyModal(item)}
                    >
                      <Reply size={14} color="#00332B" />
                      <Text style={styles.replyBtnText}>
                        {item.adminReply ? 'Edit Reply' : 'Reply'}
                      </Text>
                    </TouchableOpacity>

                    {/* Verify button */}
                    {!item.isVerified && (
                      <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() => handleVerify(item._id)}
                      >
                        <CheckCircle size={14} color="#00332B" />
                        <Text style={styles.verifyBtnText}>Verify</Text>
                      </TouchableOpacity>
                    )}

                    {/* Delete / Confirm inline */}
                    {confirmDeleteId === item._id ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 12, color: '#E53935', fontWeight: '600' }}>Sure?</Text>
                        <TouchableOpacity
                          onPress={() => performDelete(item._id)}
                          style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#E53935', borderRadius: 4 }}
                        >
                          <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>YES</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setConfirmDeleteId(null)}
                          style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#EEE', borderRadius: 4 }}
                        >
                          <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold' }}>NO</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => setConfirmDeleteId(item._id)}
                      >
                        <Trash2 size={14} color="#E53935" />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Full-Screen Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setPreviewImage(null)}
          >
            <X size={28} color="#FFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Reply Modal */}
      <Modal visible={isReplyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>RESPOND TO REVIEW</Text>
              <TouchableOpacity onPress={() => { setIsReplyModalVisible(false); setReplyText(''); }}>
                <X size={22} color="#999" />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <>
                {/* Customer's comment preview */}
                <View style={styles.contextBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 5 }}>
                    <User size={12} color="#999" />
                    <Text style={styles.contextLabel}>{selectedReview.name || selectedReview.user?.name}</Text>
                  </View>
                  <Text style={styles.contextComment} numberOfLines={3}>"{selectedReview.comment}"</Text>
                </View>

                <Text style={styles.inputLabel}>YOUR OFFICIAL RESPONSE</Text>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write your response here..."
                  placeholderTextColor="#AAA"
                  multiline
                  textAlignVertical="top"
                  value={replyText}
                  onChangeText={setReplyText}
                />

                <TouchableOpacity
                  style={[styles.sendBtn, (!replyText.trim() || sendingReply) && { opacity: 0.6 }]}
                  onPress={handleSendReply}
                  disabled={!replyText.trim() || sendingReply}
                >
                  {sendingReply
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : <>
                        <Send size={16} color="#FFF" />
                        <Text style={styles.sendBtnText}>POST RESPONSE</Text>
                      </>
                  }
                </TouchableOpacity>
              </>
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
    paddingHorizontal: 24,
    height: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE9',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F4',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryBox: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1A1A1A',
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F7F5',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ratingNum: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginLeft: 4,
  },
  commentText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  imagesSection: {
    marginBottom: 14,
  },
  imagesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
    marginLeft: 5,
  },
  reviewImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#EEE',
  },
  cardFooter: {
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
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0F7F5',
    borderRadius: 6,
    gap: 4,
  },
  verifyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00332B',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFF0F0',
    borderRadius: 6,
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E53935',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#BBB',
    fontStyle: 'italic',
  },
  replyBox: {
    backgroundColor: '#F0F7F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#00332B',
  },
  replyLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#00332B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  replyDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0F7F5',
    borderRadius: 6,
    gap: 4,
  },
  replyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00332B',
  },
  // Reply Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00332B',
  },
  contextBox: {
    backgroundColor: '#FAF9F6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  contextComment: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 1,
    marginBottom: 10,
  },
  replyInput: {
    backgroundColor: '#F3F5F4',
    height: 130,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
  },
  sendBtn: {
    backgroundColor: '#00332B',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  // Full-screen image preview
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});
