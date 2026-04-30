import React, { useState, useCallback } from 'react';
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
  Platform,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { ChevronLeft, Bell, Heart, Star, ChevronDown, ShoppingBag, Send, Edit2, Trash2, X } from 'lucide-react-native';
import { API_BASE } from '../config/api';
import { useShop } from '../context/ShopContext';
import { useUser } from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params || { product: null };

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No product selected.</Text>
      </View>
    );
  }

  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState(product.sizeStocks ? Object.keys(product.sizeStocks)[0] : 'S');
  const [expandedTab, setExpandedTab] = useState(null);
  
  const { addToCart, addToWishlist, wishlist } = useShop();
  const { user } = useUser();
  const isWishlisted = wishlist.some(item => item._id === product._id);

  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/inventory`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const filtered = data.filter(p => p.category === product.category && p._id !== product._id);
        setRecommendations(filtered.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchReviews = async () => {
    const productId = String(product._id);
    const url = `${API_BASE}/api/reviews/product/${productId}`;
    console.log(`[Reviews] Fetching from: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };
  const checkEligibility = async () => {
    if (!user) {
      setCanReview(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const orders = await response.json();
      if (Array.isArray(orders)) {
        const hasDeliveredItem = orders.some(order => 
          order.status === 'Delivered' && 
          order.orderItems.some(item => (item.product?._id || item.product) === product._id)
        );
        setCanReview(hasDeliveredItem);
      }
    } catch (error) {
      console.log('Eligibility check failed', error);
      setCanReview(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (product?._id) {
        fetchReviews();
        fetchRecommendations();
        checkEligibility();
      }
    }, [product?._id])
  );

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Review deleted successfully');
                fetchReviews();
              } else {
                const errorData = await response.json().catch(() => ({}));
                Alert.alert('Error', errorData.message || 'Failed to delete review.');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting the review.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  const startEditReview = (r) => {
    setEditingReviewId(r._id);
    setNewRating(r.rating);
    setNewComment(r.comment);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setNewRating(5);
    setNewComment('');
  };

  const submitReview = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Please login to add a review.');
      return;
    }

    const productId = String(product._id);
    const method = editingReviewId ? 'PUT' : 'POST';
    const url = editingReviewId 
      ? `${API_BASE}/api/reviews/${editingReviewId}`
      : `${API_BASE}/api/reviews/${productId}`;

    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });

      if (response.ok) {
        setNewComment('');
        setNewRating(5);
        setEditingReviewId(null);
        fetchReviews();
        Alert.alert('Success', editingReviewId ? 'Review updated.' : 'Review added.');
      } else {
        const err = await response.json();
        Alert.alert('Error', err.message || 'Action failed.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Connection failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizes = product.sizeStocks ? Object.keys(product.sizeStocks) : ['XS', 'S', 'M', 'L', 'XL'];

  const getSafeColor = (colorName) => {
    if (!colorName) return '#E0E0E0';
    const c = colorName.toLowerCase().trim();
    const map = {
      'emerald': '#00332B',
      'midnight': '#1A1A1A',
      'cream': '#F5F5DC',
      'pearl': '#FDFDFD',
      'onyx': '#111111',
      'sage': '#9EB2A8',
      'rose': '#E5B7B7'
    };
    if (map[c]) return map[c];
    if (/^#([0-9A-F]{3}){1,2}$/i.test(c)) return c;
    const standard = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
    return standard.includes(c) ? c : '#E0E0E0';
  };

  const toggleAccordion = (title) => {
    setExpandedTab(expandedTab === title ? null : title);
  };

  const renderAccordion = (title, content) => {
    const isExpanded = expandedTab === title;
    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.accordion} onPress={() => toggleAccordion(title)}>
          <Text style={styles.accordionTitle}>{title}</Text>
          <ChevronDown 
            size={20} 
            color="#666" 
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} 
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionContentText}>{content}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Atelier</Text>
        <TouchableOpacity>
          <Bell size={22} color="#00332B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image 
          source={{ uri: product.image?.startsWith('http') ? product.image : `${API_BASE}${product.image}` }} 
          style={styles.heroImage} 
        />

        <View style={styles.content}>
          <Text style={styles.collectionText}>{product.collection || 'SIGNATURE COLLECTION'}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>Rs. {product.price}</Text>

          <Text style={styles.description}>{product.description}</Text>

          {/* Color Selection */}
          <Text style={styles.selectionLabel}>AVAILABLE COLORS</Text>
          <View style={[styles.colorRow, { flexWrap: 'wrap' }]}>
            {product.colors?.map((c) => (
              <TouchableOpacity 
                key={c} 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 30,
                  borderWidth: 1,
                  borderColor: selectedColor === c ? '#00332B' : '#EEE',
                  backgroundColor: selectedColor === c ? '#F3F5F4' : '#FFF',
                  marginRight: 10,
                  marginBottom: 10
                }}
                onPress={() => setSelectedColor(c)}
              >
                <View style={{ 
                  width: 14, 
                  height: 14, 
                  borderRadius: 7, 
                  backgroundColor: getSafeColor(c), 
                  marginRight: 8, 
                  borderWidth: 0.5, 
                  borderColor: '#CCC' 
                }} />
                <Text style={{ 
                  fontSize: 12, 
                  color: selectedColor === c ? '#00332B' : '#666', 
                  fontWeight: selectedColor === c ? '700' : '500' 
                }}>
                  {c.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Size Selection */}
          <View style={styles.sizeHeader}>
            <Text style={styles.selectionLabel}>SELECT SIZE</Text>
            <TouchableOpacity><Text style={styles.sizeGuide}>SIZE GUIDE</Text></TouchableOpacity>
          </View>
          <View style={styles.sizeRow}>
            {sizes.map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.sizeBox, selectedSize === s && styles.activeSize]}
                onPress={() => setSelectedSize(s)}
              >
                <Text style={[styles.sizeText, selectedSize === s && styles.activeSizeText]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => addToCart(product, selectedSize, selectedColor)}
            >
              <Text style={styles.addBtnText}>ADD TO BAG</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.wishBtn, isWishlisted && styles.activeWishBtn]}
              onPress={() => addToWishlist(product)}
            >
              <Heart size={24} color={isWishlisted ? "#FFF" : "#00332B"} fill={isWishlisted ? "#FFF" : "transparent"} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Info Accordions */}
          {renderAccordion('MATERIAL & CARE', product.materialCare || 'Dry clean only. Handle with care to preserve the delicate silk. Do not bleach or tumble dry. Cool iron if necessary.')}
          {renderAccordion('SHIPPING & RETURNS', product.shippingReturns || 'Complimentary express shipping on all orders. Returns are accepted within 14 days of delivery provided the item is unworn and tags remain attached.')}
          {renderAccordion('SUSTAINABILITY', product.sustainability || 'This garment is crafted from 100% peace silk, sourced from cruelty-free farms. Our packaging is fully recyclable and minimal to reduce environmental impact.')}

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>REVIEWS</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                  : '0.0'}
              </Text>
              <Star size={16} color="#D4AF37" fill="#D4AF37" />
              <Text style={styles.numReviews}>({reviews.length} REVIEWS)</Text>
            </View>
          </View>

          {reviews.length > 0 ? (
            reviews.map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUser}>{r.name}</Text>
                    <View style={styles.userRating}>
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={10} color={idx < r.rating ? "#D4AF37" : "#DDD"} fill={idx < r.rating ? "#D4AF37" : "transparent"} />
                      ))}
                    </View>
                  </View>
                  {/* Management actions (Edit/Delete) moved to Order history flow */}

                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
                <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet. Be the first to share your experience.</Text>
          )}

          {/* Reviews listed here, form moved to Orders flow */}


          <View style={styles.divider} />

          <Text style={styles.sectionTitleLarge}>You may also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recScroll}>
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <TouchableOpacity 
                  key={rec._id} 
                  style={styles.recItem}
                  onPress={() => navigation.push('ProductDetails', { product: rec })}
                >
                  <Image 
                    source={{ uri: rec.image?.startsWith('http') ? rec.image : `${API_BASE}${rec.image}` }} 
                    style={styles.recImage} 
                  />
                  <Text style={styles.recCat}>{rec.category?.toUpperCase()} COLLECTION</Text>
                  <Text style={styles.recName}>{rec.name}</Text>
                  <Text style={styles.recPrice}>Rs. {rec.price}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noRecommendations}>Discovering more pieces for you...</Text>
            )}
          </ScrollView>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
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
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    fontStyle: 'italic',
  },
  heroImage: {
    width: width,
    height: 500,
    resizeMode: 'cover',
  },
  content: {
    padding: 24,
  },
  collectionText: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 10,
    fontWeight: '700',
  },
  productName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 25,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    marginBottom: 35,
  },
  selectionLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 35,
  },
  colorOutline: {
    padding: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 25,
    marginRight: 15,
  },
  activeColor: {
    borderColor: '#00332B',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeGuide: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  sizeBox: {
    width: (width - 80) / 5,
    height: 48,
    borderWidth: 1,
    borderColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSize: {
    borderColor: '#00332B',
    borderWidth: 2,
  },
  sizeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  activeSizeText: {
    color: '#00332B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#00332B',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  wishBtn: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWishBtn: {
    backgroundColor: '#00332B',
    borderColor: '#00332B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  accordion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  accordionTitle: {
    fontSize: 12,
    color: '#333',
    fontWeight: '700',
    letterSpacing: 1,
  },
  accordionContent: {
    paddingBottom: 15,
    paddingRight: 20,
  },
  accordionContentText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 22,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 1.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: 'bold',
    marginRight: 5,
  },
  numReviews: {
    fontSize: 10,
    color: '#999',
    marginLeft: 5,
    fontWeight: '700',
  },
  reviewCard: {
    marginBottom: 25,
  },
  reviewUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  userRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 10,
    color: '#BBB',
  },
  noReviews: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  addReviewSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  addReviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
    letterSpacing: 1,
  },
  starPicker: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    paddingTop: 12,
    height: 80,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    backgroundColor: '#00332B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 0,
  },
  noRecommendations: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    paddingLeft: 5,
  },
  reviewActions: {
    flexDirection: 'row',
  },
  reviewActionBtn: {
    padding: 8,
    marginLeft: 5,
  },
  addReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  editingReviewSection: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    backgroundColor: '#FFFBF0',
  },
  sectionTitleLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 25,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 20,
  },
  recScroll: {
    flexDirection: 'row',
  },
  recItem: {
    width: 250,
    marginRight: 20,
  },
  recImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  recCat: {
    fontSize: 8,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 5,
    fontWeight: '700',
  },
  recName: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  verifiedInfo: {
    backgroundColor: '#F0F4F2',
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00332B',
  },
  verifiedInfoText: {
    fontSize: 12,
    color: '#00332B',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
