import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { LayoutDashboard, ShoppingBag, Users, TrendingUp, Settings, ChevronLeft, LogOut, CreditCard, MessageSquare, Sparkles } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { API_BASE } from '../config/api';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';



const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const { user: currentUser } = useUser();
  const [stats, setStats] = React.useState({ revenue: 0, orders: 0, customers: 0 });
  const [loading, setLoading] = React.useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/stats`, {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const dashboardStats = [
    { title: 'Revenue', value: loading ? "..." : `Rs. ${stats.revenue.toLocaleString()}`, icon: <TrendingUp size={24} color="#00332B" />, trend: '+12%' },
    { title: 'Orders', value: loading ? "..." : stats.orders.toLocaleString(), icon: <ShoppingBag size={24} color="#00332B" />, trend: '+5%' },
    { title: 'Customers', value: loading ? "..." : stats.customers.toLocaleString(), icon: <Users size={24} color="#00332B" />, trend: '+8%' },
  ];

  const renderStatCard = (stat, index) => (
    <View key={index} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>{stat.icon}</View>
        <Text style={styles.statTrend}>{stat.trend}</Text>
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <LogOut size={24} color="#00332B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADMIN CONSOLE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSubtitle}>SYSTEM OVERVIEW</Text>
          <Text style={styles.welcomeTitle}>Atelier Dashboard</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {dashboardStats.map(renderStatCard)}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>MANAGEMENT GATEWAY</Text>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('Inventory')}
        >
          <View style={styles.actionIcon}><ShoppingBag size={20} color="#00332B" /></View>
          <Text style={styles.actionText}>Inventory Management</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('SeasonalManagement')}
        >
          <View style={styles.actionIcon}><Sparkles size={20} color="#D4AF37" /></View>
          <Text style={styles.actionText}>Seasonal Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('UserAdmin')}
        >
          <View style={styles.actionIcon}><Users size={20} color="#00332B" /></View>
          <Text style={styles.actionText}>User Administration</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('Analytics')}
        >
          <View style={styles.actionIcon}><LayoutDashboard size={20} color="#00332B" /></View>
          <Text style={styles.actionText}>Analytics & Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('PaymentManagement')}
        >
          <View style={styles.actionIcon}><CreditCard size={20} color="#00332B" /></View>
          <Text style={styles.actionText}>Payment Management</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('ReviewManagement')}
        >
          <View style={styles.actionIcon}><MessageSquare size={20} color="#00332B" /></View>
          <Text style={styles.actionText}>Review Management</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('OrderManagement')}
        >
          <View style={styles.actionIcon}><ShoppingBag size={20} color="#D4AF37" /></View>
          <Text style={styles.actionText}>Order Management</Text>
        </TouchableOpacity>

        {/* Latest Activity section could go here */}
        <View style={styles.activityBox}>
          <Text style={styles.activityLabel}>REAL-TIME FEED</Text>
          <View style={styles.activityItem}>
            <View style={styles.dot} />
            <Text style={styles.activityText}>New order #ATL-8392 placed by Eleanor Vance</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: '#D4AF37' }]} />
            <Text style={styles.activityText}>System update: Catalog cache refreshed</Text>
          </View>
        </View>

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
  content: {
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeSubtitle: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F3F5F4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  actionIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginRight: 15,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  activityBox: {
    marginTop: 40,
    backgroundColor: '#FAF9F6',
    padding: 24,
    borderRadius: 20,
  },
  activityLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00332B',
    marginRight: 12,
  },
  activityText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});
