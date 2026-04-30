import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Star, Camera, Check, Package, Truck, Home, Edit2, Trash2, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE } from '../config/api';
import { useUser } from '../context/UserContext';

export default function TrackingScreen({ route, navigation }) {
  const { user } = useUser();
  const initialOrder = route.params?.order;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [productReviews, setProductReviews] = useState({}); // Stores existing reviews by productId
  const [rating, setRating] = useState({});
  const [reviews, setReviews] = useState({});
  const [reviewImages, setReviewImages] = useState({}); // Stores base64 images by productId
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // productId pending delete confirm

  const fetchOrderDetails = async (showLoading = true) => {
    if (!order?._id) return;
    try {
      if (showLoading) setLoading(true);
      const response = await fetch(`${API_BASE}/api/orders/${order._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order update:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      console.log('📥 Fetching reviews for product:', productId);
      console.log('👤 Current user ID:', String(user._id));
      const response = await fetch(`${API_BASE}/api/reviews/product/${productId}`);
      const data = await response.json();
      console.log('📦 Fetched reviews count:', data.length, 'reviews:', data);
      if (Array.isArray(data)) {
        const currentUserId = String(user._id);
        const userReview = data.find(r => {
          const reviewUserId = String(r.user._id || r.user);
          console.log('  Comparing:', reviewUserId, '===', currentUserId, '?', reviewUserId === currentUserId);
          return reviewUserId === currentUserId;
        });
        console.log('✅ User review found:', userReview);
        if (userReview) {
          setProductReviews(prev => {
            const updated = { ...prev, [productId]: userReview };
            console.log('💾 Stored review in state for product', productId);
            return updated;
          });
        } else {
          console.log('❌ No review found for this user');
          setProductReviews(prev => ({ ...prev, [productId]: null }));
        }
      }
    } catch (error) {
      console.log('🔴 Error fetching product review:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 Screen focused, fetching order details...');
      fetchOrderDetails(false);
    }, [order?._id])
  );

  // Separate effect to fetch reviews when order items are available
  useEffect(() => {
    if (order?.orderItems && order.orderItems.length > 0) {
      console.log('📋 Order items available, fetching reviews for', order.orderItems.length, 'items');
      order.orderItems.forEach(item => {
        console.log('  → Fetching review for product:', item.product);
        fetchProductReviews(item.product);
      });
    }
  }, [order?.orderItems?.length]);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <Package size={40} color="#DDD" />
        <Text style={{ marginTop: 10, color: '#999' }}>Order details not available.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#00332B', fontWeight: 'bold' }}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps = order.trackingSteps || [];

  const handleStarPress = (productId, val) => {
    setRating(prev => ({ ...prev, [productId]: val }));
  };

  const pickReviewImages = async (productId) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const images = result.assets.map(asset => ({
        filename: asset.fileName || `image-${Date.now()}.jpg`,
        data: `data:image/jpeg;base64,${asset.base64}`,
        size: asset.fileSize || 0
      }));
      setReviewImages(prev => ({ ...prev, [productId]: images }));
      Alert.alert('Success', `${images.length} image(s) selected for review`);
    }
  };

  const submitProductReview = async (productId) => {
    const productRating = rating[productId];
    const productReview = reviews[productId];
    const existingReview = productReviews[productId];
    const images = reviewImages[productId] || [];

    if (!productRating) {
      Alert.alert('Selection Required', 'Please select a star rating.');
      return;
    }

    try {
      setLoading(true);
      const url = existingReview
        ? `${API_BASE}/api/reviews/${existingReview._id}`
        : `${API_BASE}/api/reviews/${productId}`;

      console.log('=== REVIEW SUBMISSION ===');
      console.log('URL:', url);
      console.log('Token:', user?.token?.substring(0, 20) + '...');
      console.log('Rating:', productRating);
      console.log('Comment:', productReview);
      console.log('Images:', images.length, 'image(s)');

      const requestBody = JSON.stringify({
        rating: productRating,
        comment: productReview || 'Excellent product!',
        images: images
      });

      console.log('Request body size:', requestBody.length, 'bytes');

      const response = await fetch(url, {
        method: existingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: requestBody,
        timeout: 30000
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        Alert.alert('Success', existingReview ? 'Review updated!' : 'Review added!');
        setExpandedReviewId(null);
        setReviewImages(prev => ({ ...prev, [productId]: [] }));
        setReviews(prev => ({ ...prev, [productId]: '' }));
        setRating(prev => ({ ...prev, [productId]: 0 }));
        await fetchProductReviews(productId);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.log('=== SUBMISSION ERROR ===');
      console.error('Error details:', error);
      Alert.alert('Error', `Failed to submit review: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Just show the inline confirm strip — no Alert (Alert callbacks are unreliable on Android inside ScrollView)
  const deleteProductReview = (productId) => {
    setConfirmDeleteId(productId);
  };

  const performDeleteReview = async (productId, reviewId) => {
    try {
      setLoading(true);
      console.log('🗑️ Deleting review ID:', reviewId, 'for product:', productId);

      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      console.log('🔁 Delete response status:', response.status);

      if (response.ok) {
        console.log('✅ Review deleted successfully from server');

        // Clear state immediately so UI updates right away
        setProductReviews(prev => ({ ...prev, [productId]: null }));
        setReviews(prev => ({ ...prev, [productId]: '' }));
        setRating(prev => ({ ...prev, [productId]: 0 }));
        setReviewImages(prev => ({ ...prev, [productId]: [] }));
        setExpandedReviewId(null);

        Alert.alert('Deleted', 'Your review has been removed successfully.');
      } else {
        let errorMsg = 'Failed to delete review.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (_) { }
        console.log('❌ Delete failed:', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('❌ Delete network error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#00332B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrderDetails(false);
            }}
            color="#00332B"
          />
        }
      >
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>ORDER #{order._id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>Placed on {new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>

        {/* Progress Timeline */}
        <View style={styles.timelineContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepWrapper}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepIconContainer, step.isCompleted && styles.stepIconCompleted]}>
                  {step.isCompleted ? <Check size={14} color="#FFF" /> : <Package size={16} color="#BBB" />}
                </View>
                {index !== steps.length - 1 && (
                  <View style={[styles.stepLine, step.isCompleted && steps[index + 1]?.isCompleted && styles.stepLineCompleted]} />
                )}
              </View>
              <View style={styles.stepRight}>
                <Text style={[styles.stepTitle, step.isCompleted && styles.stepTitleCompleted]}>{step.text || step.title}</Text>
                <Text style={styles.stepSubtitle}>
                  {step.isCompleted ? `Update on ${new Date().toLocaleDateString()}` : 'Scheduled'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Per-Product Review Section */}
        {order.status === 'Delivered' && (
          <View style={styles.reviewSection}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Review Your Items</Text>
            <Text style={styles.sectionSubtitle}>Share your experience with each piece from this collection.</Text>

            {order.orderItems.map((item, idx) => {
              const existingReview = productReviews[item.product];
              const isExpanded = expandedReviewId === item.product;

              return (
                <View key={idx} style={styles.productReviewCard}>
                  <View style={styles.productReviewHeader}>
                    <Image
                      source={{ uri: item.image?.startsWith('http') ? item.image : `${API_BASE}${item.image}` }}
                      style={styles.reviewThumb}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewItemName}>{item.name}</Text>
                      {existingReview ? (
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={10} color={s <= existingReview.rating ? "#D4AF37" : "#DDD"} fill={s <= existingReview.rating ? "#D4AF37" : "transparent"} style={{ marginRight: 2 }} />
                            ))}
                            <Text style={{ fontSize: 9, color: '#D4AF37', fontWeight: 'bold', marginLeft: 5 }}>PUBLISHED</Text>
                          </View>
                          <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }} numberOfLines={1}>
                            "{existingReview.comment}"
                          </Text>
                          {existingReview.images && existingReview.images.length > 0 && (
                            <View style={{ flexDirection: 'row', marginTop: 8, gap: 6 }}>
                              {existingReview.images.slice(0, 3).map((img, i) => (
                                <Image
                                  key={i}
                                  source={{ uri: img.data }}
                                  style={{ width: 50, height: 50, borderRadius: 6 }}
                                />
                              ))}
                              {existingReview.images.length > 3 && (
                                <View style={{ width: 50, height: 50, borderRadius: 6, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' }}>
                                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>+{existingReview.images.length - 3}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      ) : (
                        <Text style={styles.reviewItemPrice}>Rs. {item.price}</Text>
                      )}
                    </View>

                    <View>
                      {!isExpanded && existingReview && confirmDeleteId !== item.product && (
                        <View style={{ flexDirection: 'row', marginRight: 10, gap: 4, marginBottom: 4, justifyContent: 'flex-end' }}>
                          <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => {
                              setRating(prev => ({ ...prev, [item.product]: existingReview.rating }));
                              setReviews(prev => ({ ...prev, [item.product]: existingReview.comment }));
                              setReviewImages(prev => ({ ...prev, [item.product]: existingReview.images || [] }));
                              setExpandedReviewId(item.product);
                            }}
                            style={{ padding: 8, backgroundColor: '#F0F0F0', borderRadius: 4 }}
                          >
                            <Edit2 size={20} color="#00332B" strokeWidth={1.5} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => deleteProductReview(item.product)}
                            style={{ padding: 8, backgroundColor: '#FFE0E0', borderRadius: 4 }}
                          >
                            <Trash2 size={20} color="#E53935" strokeWidth={1.5} />
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Inline delete confirmation — replaces Alert.alert (unreliable on Android) */}
                      {!isExpanded && existingReview && confirmDeleteId === item.product && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, gap: 6, marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, color: '#E53935', fontWeight: '600' }}>Delete?</Text>
                          <TouchableOpacity
                            onPress={() => {
                              setConfirmDeleteId(null);
                              performDeleteReview(item.product, existingReview._id);
                            }}
                            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E53935', borderRadius: 4 }}
                          >
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>YES</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setConfirmDeleteId(null)}
                            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EEE', borderRadius: 4 }}
                          >
                            <Text style={{ color: '#333', fontSize: 12, fontWeight: 'bold' }}>NO</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.reviewToggleBtn, !existingReview && { opacity: 1 }]}
                      onPress={() => setExpandedReviewId(isExpanded ? null : item.product)}
                      disabled={existingReview && !isExpanded}
                    >
                      {!existingReview && (
                        <Text style={styles.reviewToggleText}>
                          {isExpanded ? 'CLOSE' : 'REVIEW'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {isExpanded && (
                    <View style={styles.reviewFormBody}>
                      <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <TouchableOpacity key={s} onPress={() => handleStarPress(item.product, s)}>
                            <Star
                              size={28}
                              color={s <= (rating[item.product] || 0) ? "#D4AF37" : "#E0E0E0"}
                              fill={s <= (rating[item.product] || 0) ? "#D4AF37" : "transparent"}
                              style={styles.star}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TextInput
                        style={styles.reviewInput}
                        placeholder="How does this piece feel and fit?"
                        placeholderTextColor="#999"
                        multiline
                        value={reviews[item.product] || ''}
                        onChangeText={(txt) => setReviews(prev => ({ ...prev, [item.product]: txt }))}
                      />

                      {/* Image Upload Section */}
                      <TouchableOpacity
                        style={styles.photoBtn}
                        onPress={() => pickReviewImages(item.product)}
                      >
                        <Camera size={32} color="#00332B" />
                        <Text style={styles.photoBtnText}>
                          {(reviewImages[item.product]?.length || 0) > 0
                            ? `${reviewImages[item.product].length} image(s) selected`
                            : 'ADD PHOTOS (Optional)'}
                        </Text>
                      </TouchableOpacity>

                      {/* Show selected images */}
                      {reviewImages[item.product] && reviewImages[item.product].length > 0 && (
                        <View style={styles.selectedImagesContainer}>
                          <FlatList
                            scrollEnabled={false}
                            data={reviewImages[item.product]}
                            renderItem={({ item: img, index }) => (
                              <View style={styles.selectedImageWrapper}>
                                <Image
                                  source={{ uri: img.data }}
                                  style={styles.selectedImage}
                                />
                                <TouchableOpacity
                                  style={styles.removeImageBtn}
                                  onPress={() => {
                                    const updated = reviewImages[item.product].filter((_, i) => i !== index);
                                    setReviewImages(prev => ({ ...prev, [item.product]: updated }));
                                  }}
                                >
                                  <X size={16} color="#FFF" />
                                </TouchableOpacity>
                              </View>
                            )}
                            keyExtractor={(_, idx) => idx.toString()}
                            numColumns={3}
                            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                          />
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={() => submitProductReview(item.product)}
                        disabled={loading}
                      >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{existingReview ? 'UPDATE REVIEW' : 'ADD TO CATALOG'}</Text>}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 60 }} />
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
  orderInfo: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  orderId: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 2,
  },
  orderDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  timelineContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 8,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 40,
  },
  stepWrapper: {
    flexDirection: 'row',
    height: 90,
  },
  stepLeft: {
    alignItems: 'center',
    width: 30,
    marginRight: 20,
  },
  stepIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepIconCompleted: {
    backgroundColor: '#00332B',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F3F5F4',
    marginTop: -5,
  },
  stepLineCompleted: {
    backgroundColor: '#00332B',
  },
  stepRight: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BBB',
  },
  stepTitleCompleted: {
    color: '#1A1A1A',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reviewSection: {
    paddingHorizontal: 24,
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 8,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EBE9',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  star: {
    marginHorizontal: 8,
  },
  photoBtn: {
    height: 120,
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  photoBtnText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 10,
  },
  reviewInput: {
    height: 150,
    backgroundColor: '#F3F5F4',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  submitBtn: {
    backgroundColor: '#00332B',
    paddingVertical: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  savedReviewContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  starContainerSmall: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  savedComment: {
    fontSize: 16,
    color: '#1A1A1A',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  adminReplyBox: {
    width: '100%',
    backgroundColor: '#F3F5F4',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00332B',
  },
  adminReplyLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#00332B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  adminReplyText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  adminReplyDate: {
    fontSize: 10,
    color: '#AAA',
    textAlign: 'right',
  },
  productReviewCard: {
    padding: 15,
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    marginBottom: 15,
  },
  productReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewThumb: {
    width: 50,
    height: 70,
    borderRadius: 6,
    marginRight: 15,
    backgroundColor: '#EEE',
  },
  reviewItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  reviewItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  reviewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#00332B10',
  },
  reviewToggleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00332B',
  },
  reviewFormBody: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  photoBtn: {
    height: 140,
    borderWidth: 2,
    borderColor: '#00332B',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  photoBtnText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 12,
  },
  selectedImagesContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedImageWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#EEE',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#C0392B',
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  }
});
