import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Stock, stockApi } from '../../services/stockApi';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio' | 'trades'>('watchlist');
  const [portfolioValue, setPortfolioValue] = useState(58200);
  const [portfolioChange, setPortfolioChange] = useState(3200);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(5.82);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [tradeData, setTradeData] = useState<any[]>([]);

  // Load stocks from API
  const loadStocks = async () => {
    try {
      const stocksData = await stockApi.getStocks();
      setStocks(stocksData);
      setFilteredStocks(stocksData);
    } catch (error) {
      console.error('Error loading stocks:', error);
    }
  };

  useEffect(() => {
    loadStocks();
    loadPortfolio();
    loadTrades();
  }, []);
  
  const loadPortfolio = async () => {
    try {
      // In a real app, this would come from auth context
      const portfolio = await stockApi.getUserPortfolio('admin');
      setPortfolioData(portfolio);
      
      // Also load user balance to update portfolio value
      const balance = await stockApi.getUserBalance('admin');
      setPortfolioValue(balance.totalValue);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };
  
  const loadTrades = async () => {
    try {
      // In a real app, this would come from auth context
      const trades = await stockApi.getUserTransactions('admin');
      setTradeData(trades);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStocks(stocks);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const results = stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(lowerQuery) || 
        stock.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredStocks(results);
    }
  }, [searchQuery, stocks]);

  // Refresh stocks
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStocks();
    await loadPortfolio();
    await loadTrades();
    setRefreshing(false);
  };

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const borderColor = isDark ? Colors.dark.text + '40' : Colors.light.text + '40';

  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity 
      style={[styles.stockItem, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
      onPress={() => router.push(`/stock-detail?symbol=${item.symbol}`)}
    >
      <View style={styles.stockInfo}>
        <ThemedText style={styles.stockSymbol}>{item.symbol}</ThemedText>
        <ThemedText style={styles.stockName}>{item.name}</ThemedText>
      </View>
      <View style={styles.stockPriceContainer}>
        <ThemedText style={styles.stockPrice}>${item.price.toFixed(2)}</ThemedText>
        <View style={styles.stockChangeContainer}>
          <Ionicons 
            name={item.change >= 0 ? "trending-up" : "trending-down"} 
            size={16} 
            color={item.change >= 0 ? "#10b981" : "#ef4444"} 
          />
          <ThemedText style={[styles.stockChange, { color: item.change >= 0 ? "#10b981" : "#ef4444" }]}>
            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPortfolioItem = ({ item }: { item: any }) => {
    const stock = stocks.find(s => s.symbol === item.stockSymbol);
    const currentPrice = stock ? stock.price : 0;
    const currentValue = item.shares * currentPrice;
    const totalGain = currentValue - item.totalInvested;
    const gainPercent = (totalGain / item.totalInvested) * 100;
    
    return (
      <TouchableOpacity 
        style={[styles.stockItem, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
        onPress={() => router.push(`/stock-detail?symbol=${item.stockSymbol}`)}
      >
        <View style={styles.stockInfo}>
          <ThemedText style={styles.stockSymbol}>{item.stockSymbol}</ThemedText>
          <ThemedText style={styles.stockName}>{item.shares} shares</ThemedText>
        </View>
        <View style={styles.stockPriceContainer}>
          <ThemedText style={styles.stockPrice}>${currentValue.toFixed(2)}</ThemedText>
          <View style={styles.stockChangeContainer}>
            <Ionicons 
              name={totalGain >= 0 ? "trending-up" : "trending-down"} 
              size={16} 
              color={totalGain >= 0 ? "#10b981" : "#ef4444"} 
            />
            <ThemedText style={[styles.stockChange, { color: totalGain >= 0 ? "#10b981" : "#ef4444" }]}>              {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toFixed(2)} ({totalGain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTradeItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.stockItem, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
        onPress={() => router.push(`/stock-detail?symbol=${item.stockSymbol}`)}
      >
        <View style={styles.stockInfo}>
          <ThemedText style={styles.stockSymbol}>{item.stockSymbol} ({item.type.toUpperCase()})</ThemedText>
          <ThemedText style={styles.stockName}>{item.shares} shares at ${item.price.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.stockPriceContainer}>
          <ThemedText style={styles.stockPrice}>${item.total.toFixed(2)}</ThemedText>
          <ThemedText style={styles.stockChange}>{new Date(item.timestamp).toLocaleDateString()}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: '#10b981' }]}>
              <Ionicons name="cash" size={24} color="#fff" />
            </View>
            <View>
              <ThemedText style={styles.logoTitle}>TradeHub</ThemedText>
              <ThemedText style={styles.logoSubtitle}>Professional Trading</ThemedText>
            </View>
          </View>

          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} 
              onPress={() => router.push('/login')}
            >
              <ThemedText style={styles.navButtonText}>Login</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} 
              onPress={() => router.push('/register')}
            >
              <ThemedText style={styles.navButtonText}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={isDark ? "#94a3b8" : "#64748b"} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
          placeholder="Search stocks..."
          placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Portfolio Overview */}
      <View style={[styles.portfolioCard, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor }]}>
          <View style={styles.portfolioHeader}>
            <View>
              <ThemedText style={styles.portfolioLabel}>Total Portfolio Value</ThemedText>
              <ThemedText style={styles.portfolioValue}>${portfolioValue.toLocaleString()}</ThemedText>
              <View style={styles.portfolioChangeContainer}>
                <View style={styles.portfolioChangeRow}>
                  <Ionicons 
                    name={portfolioChange >= 0 ? "trending-up" : "trending-down"} 
                    size={20} 
                    color={portfolioChange >= 0 ? "#10b981" : "#ef4444"} 
                  />
                  <ThemedText style={[styles.portfolioChange, { color: portfolioChange >= 0 ? "#10b981" : "#ef4444" }]}>
                    {portfolioChange >= 0 ? '+' : ''}${Math.abs(portfolioChange).toLocaleString()} ({portfolioChangePercent}%)
                  </ThemedText>
                </View>
                <ThemedText style={styles.portfolioTime}>Today</ThemedText>
              </View>
            </View>
            <View style={styles.portfolioActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => router.push('/stock-detail?symbol=AAPL')}
              >
                <ThemedText style={styles.actionButtonText}>Buy AAPL</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                onPress={() => router.push('/stock-detail?symbol=AAPL')}
              >
                <ThemedText style={styles.actionButtonText}>Sell AAPL</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Placeholder for Chart */}
          <View style={[styles.chartContainer, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
            <ThemedText style={styles.chartPlaceholder}>Portfolio Chart</ThemedText>
            <ThemedText style={styles.chartSubtitle}>Chart visualization would go here</ThemedText>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderColor }]}>
          <View style={styles.tabsRow}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'watchlist' && styles.activeTab]}
              onPress={() => setActiveTab('watchlist')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'watchlist' && styles.activeTabText]}>Watchlist</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'portfolio' && styles.activeTab]}
              onPress={() => setActiveTab('portfolio')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>Holdings</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'trades' && styles.activeTab]}
              onPress={() => setActiveTab('trades')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'trades' && styles.activeTabText]}>Recent Trades</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'watchlist' && (
              <FlatList
                data={filteredStocks}
                renderItem={renderStockItem}
                keyExtractor={(item) => item.symbol}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[isDark ? '#10b981' : '#10b981']}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search" size={48} color={Colors.light.icon} />
                    <ThemedText style={styles.emptyStateText}>No stocks found</ThemedText>
                  </View>
                }
              />
            )}
            
            {activeTab === 'portfolio' && (
              <FlatList
                data={portfolioData}
                renderItem={renderPortfolioItem}
                keyExtractor={(item) => item.stockSymbol}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[isDark ? '#10b981' : '#10b981']}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.tabPlaceholder}>
                    <ThemedText style={styles.placeholderText}>No portfolio holdings yet</ThemedText>
                  </View>
                }
              />
            )}
            
            {activeTab === 'trades' && (
              <FlatList
                data={tradeData}
                renderItem={renderTradeItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[isDark ? '#10b981' : '#10b981']}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.tabPlaceholder}>
                    <ThemedText style={styles.placeholderText}>No recent trades</ThemedText>
                  </View>
                }
              />
            )}
          </View>
        </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubtitle: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },

  portfolioCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  portfolioHeader: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  portfolioLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  portfolioChangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portfolioChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioTime: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    height: 180,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  tabsContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.icon,
  },
  activeTabText: {
    color: '#10b981',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stockName: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  stockPriceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.icon,
    marginTop: 12,
  },
});