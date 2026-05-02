import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  FlatList,
  Platform,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Search, ShoppingBag, Heart, Quote, ArrowRight, X } from 'lucide-react-native';
import { API_BASE } from '../config/api';
import { useShop } from '../context/ShopContext';
import { useFocusEffect } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'Women', title: "Women's Collection", subtitle: 'The Silk Archive', image: { uri: `${API_BASE}/uploads/cat_women_new.png` } },
  { id: 'Men', title: "Men's Collection", subtitle: 'Modern Tailoring', image: { uri: `${API_BASE}/uploads/cat_men_new.png` } },
  { id: 'Accessories', title: 'Accessories', subtitle: 'Leather Goods', image: require('../assets/prod-bag.png') },
];

export default function HomeScreen({ navigation }) {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState({
    bannerTitle: 'SPRING / SUMMER 2026',
    bannerSubtitle: 'The Summer Collection',
    bannerImage: '/uploads/home_hero_new.png'
  });
  const { addToWishlist, wishlist } = useShop();

  useFocusEffect(
    React.useCallback(() => {
      fetchTrendingProducts();
      fetchHeroSettings();
    }, [])
  );


  const fetchHeroSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();
      if (data) setHeroSettings(data);
    } catch (e) {
      console.log('Error fetching hero settings:', e);
    }
  };


  const fetchTrendingProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/inventory`);
      const data = await response.json();
      // Logic: show top 3 or items with discount as "Trending"
      setTrendingProducts(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newsletterModalVisible, setNewsletterModalVisible] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address to join.");
      return;
    }
    setNewsletterModalVisible(false);
    setNewsletterEmail('');
    Alert.alert("Welcome to the Circle", "You are now an Atelier Insider. Check your inbox for your first exclusive reward.");
  };

  const renderProduct = (product) => (
    <TouchableOpacity 
      key={product._id || product.id} 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product })}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={typeof product.image === 'string' 
            ? { uri: product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}` } 
            : product.image} 
          style={styles.productImage} 
        />
        {product.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discountPercentage}% OFF</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => addToWishlist(product)}
        >
          <Heart 
            size={18} 
            color={wishlist.some(p => p._id === product._id) ? "#D4AF37" : "#000"} 
            fill={wishlist.some(p => p._id === product._id) ? "#D4AF37" : "transparent"} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productDetails}>
        <View style={styles.productRow}>
          <Text style={styles.productCategory}>{product.category}</Text>
          <View style={styles.likesRow}>
            <Heart size={10} color="#999" fill="#999" />
            <Text style={styles.likesText}>{product.likes || 0}</Text>
          </View>
        </View>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>Rs. {product.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />{/* Spacer on left to keep Logo centered */}
        <Text style={styles.headerLogo}>ATELIER</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SHOP')}>
          <Search size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: heroSettings.bannerImage?.startsWith('http') ? heroSettings.bannerImage : `${API_BASE}${heroSettings.bannerImage}` }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>{heroSettings.bannerTitle.toUpperCase()}</Text>
            <Text style={styles.heroTitle}>{heroSettings.bannerSubtitle.replace('Collection', 'Collection\n')}</Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.viewCollectionButton} onPress={() => navigation.navigate('SeasonalCollection')}>
                <Text style={styles.viewCollectionText}>VIEW COLLECTION</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Strategic Categories Section */}
        <View style={styles.section}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.departmentCard}
              onPress={() => navigation.navigate('CategoryDetail', { title: cat.title, categoryId: cat.id })}
            >
              <Image source={cat.image} style={styles.departmentImage} />
              <View style={styles.departmentOverlay}>
                <Text style={styles.departmentSubtitle}>{cat.subtitle}</Text>
                <Text style={styles.departmentTitle}>{cat.title}</Text>
                <View style={styles.exploreRow}>
                  <Text style={styles.exploreText}>EXPLORE PIECES</Text>
                  <ArrowRight size={14} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { justifyContent: 'center' }]}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.sectionSubtitle}>SELECTED WORKS</Text>
              <Text style={styles.sectionTitle}>Trending Now</Text>
            </View>
          </View>
          <View style={styles.productList}>
            {loading ? (
              <ActivityIndicator size="large" color="#00332B" style={{ marginVertical: 40 }} />
            ) : trendingProducts.length > 0 ? (
              trendingProducts.map(renderProduct)
            ) : (
              <Text style={{ textAlign: 'center', color: '#999', marginVertical: 40 }}>No trending products yet.</Text>
            )}
          </View>
        </View>

        {/* Manifesto Section */}
        <View style={styles.manifestoSection}>
          <Quote size={32} color="#00332B" style={styles.quoteIcon} />
          <Text style={styles.manifestoText}>
            "Style is a deeply personal form of self-expression; it is the silent language of the soul rendered in fabric and form."
          </Text>
          <View style={styles.manifestoLine} />
          <Text style={styles.manifestoLabel}>ATELIER MANIFESTO</Text>
        </View>

        {/* Insider Section */}
        <View style={styles.conciergeSection}>
          <Text style={styles.conciergeSubtitle}>STAY CONNECTED</Text>
          <Text style={styles.conciergeTitle}>Become an Insider</Text>
          <Text style={styles.conciergeText}>
            Join our luxury fashion community for early access to new collections, style inspiration, and exclusive member rewards.
          </Text>
          <TouchableOpacity 
            style={styles.conciergeBtn}
            onPress={() => setNewsletterModalVisible(true)}
          >
            <Text style={styles.conciergeBtnText}>JOIN THE CLUB</Text>
          </TouchableOpacity>
        </View>

        {/* Extra Padding for Bottom Tab */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Newsletter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newsletterModalVisible}
        onRequestClose={() => setNewsletterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.newsletterModalContent}
          >
            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setNewsletterModalVisible(false)}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>

            <View style={styles.newsletterIconCircle}>
              <Quote size={30} color="#00332B" />
            </View>

            <Text style={styles.newsletterTitle}>ATELIER INSIDER</Text>
            <Text style={styles.newsletterSubtitle}>ENROLL IN OUR LOYALTY PROGRAM</Text>
            
            <Text style={styles.newsletterText}>
              Be the first to explore seasonal drops and receive personal styling invitations.
            </Text>

            <TextInput 
              style={styles.newsletterInput}
              placeholder="ENTER YOUR EMAIL"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newsletterEmail}
              onChangeText={setNewsletterEmail}
            />

            <TouchableOpacity 
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeBtnText}>SUBSCRIBE</Text>
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              BY JOINING, YOU AGREE TO OUR PRIVACY POLICY AND TERMS OF SERVICE.
            </Text>
          </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    height: 70,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE9',
  },
  headerLogo: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: '#00332B',
    fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
  },
  heroSection: {
    width: '100%',
    height: 550,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroSubtitle: {
    color: '#FFF',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCollectionButton: {
    backgroundColor: '#00332B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginRight: 20,
  },
  viewCollectionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  readStoryButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
    paddingBottom: 2,
  },
  readStoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  section: {
    marginTop: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  shopAllLink: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  categoryList: {
    paddingLeft: 24,
    paddingRight: 10,
  },
  categoryCard: {
    marginRight: 14,
    width: width * 0.7,
  },
  categoryImage: {
    width: '100%',
    height: 350,
    borderRadius: 0,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  categoryTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryCount: {
    fontSize: 14,
    color: '#999',
  },
  productList: {
    paddingHorizontal: 24,
  },
  productCard: {
    marginBottom: 40,
  },
  productImageContainer: {
    width: '100%',
    height: 450,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#00332B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
  },
  discountText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  productDetails: {
    marginTop: 15,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    fontWeight: '600',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  productName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  manifestoSection: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  quoteIcon: {
    marginBottom: 30,
    opacity: 0.8,
  },
  manifestoText: {
    fontSize: 22,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 34,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  manifestoLine: {
    width: 40,
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 30,
  },
  manifestoLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 3,
    fontWeight: '700',
  },
  departmentCard: {
    width: '100%',
    height: 440,
    marginBottom: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  departmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  departmentOverlay: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 25,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  departmentSubtitle: {
    color: '#8D6E63',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  departmentTitle: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreText: {
    color: '#00332B',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00332B',
  },
  conciergeSection: {
    backgroundColor: '#00332B',
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  conciergeSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 15,
  },
  conciergeTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 20,
    textAlign: 'center',
  },
  conciergeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  conciergeBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  conciergeBtnText: {
    color: '#00332B',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 51, 43, 0.2)', // Emerald overlay
    justifyContent: 'flex-end',
  },
  newsletterModalContent: {
    backgroundColor: '#FFF',
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  newsletterIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  newsletterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  newsletterSubtitle: {
    fontSize: 9,
    color: '#D4AF37',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 5,
    marginBottom: 25,
  },
  newsletterText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  newsletterInput: {
    width: '100%',
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  subscribeBtn: {
    backgroundColor: '#00332B',
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginBottom: 20,
  },
  subscribeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  privacyNote: {
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
