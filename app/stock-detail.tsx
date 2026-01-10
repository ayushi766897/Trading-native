import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Stock, stockApi } from '../services/stockApi';

export default function StockDetailScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const symbol = params.symbol as string;
  
  const [stock, setStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [isBuyMode, setIsBuyMode] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      if (symbol) {
        const stockData = await stockApi.getStockBySymbol(symbol);
        if (stockData) {
          setStock(stockData);
        } else {
          Alert.alert('Error', 'Stock not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
      Alert.alert('Error', 'Failed to load stock data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!stock) return;
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // In a real app, we would get the actual user from auth context
    // For demo purposes, we'll use the admin user
    try {
      const result = await stockApi.executeTrade({
        userId: 'admin', // Demo user ID
        stockSymbol: stock.symbol,
        type: isBuyMode ? 'buy' : 'sell',
        shares: qty,
        price: stock.price,
      });

      Alert.alert(
        'Success', 
        `${isBuyMode ? 'Bought' : 'Sold'} ${qty} shares of ${stock.symbol} for $${(qty * stock.price).toFixed(2)}`
      );
      
      // Refresh stock data after successful trade
      loadStockData();
    } catch (error: any) {
      console.error('Trade error:', error);
      Alert.alert('Error', error.message || 'Failed to execute trade');
    }
  };

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const borderColor = isDark ? Colors.dark.text + '40' : Colors.light.text + '40';

  if (loading || !stock) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color={Colors.light.icon} style={styles.loadingIcon} />
          <ThemedText style={styles.loadingText}>Loading stock data...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{stock.symbol}</ThemedText>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView style={styles.mainContent}>
        {/* Stock Header */}
        <View style={styles.stockHeader}>
          <View>
            <ThemedText style={styles.stockName}>{stock.name}</ThemedText>
            <ThemedText style={styles.stockSymbol}>{stock.symbol}</ThemedText>
          </View>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>${stock.price.toFixed(2)}</ThemedText>
            <View style={styles.changeContainer}>
              <Ionicons 
                name={stock.change >= 0 ? "trending-up" : "trending-down"} 
                size={16} 
                color={stock.change >= 0 ? "#10b981" : "#ef4444"} 
              />
              <ThemedText style={[styles.changeText, { color: stock.change >= 0 ? "#10b981" : "#ef4444" }]}>                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Stock Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Volume</ThemedText>
            <ThemedText style={styles.infoValue}>{stock.volume}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Market Cap</ThemedText>
            <ThemedText style={styles.infoValue}>{stock.marketCap || 'N/A'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>P/E Ratio</ThemedText>
            <ThemedText style={styles.infoValue}>{stock.peRatio?.toFixed(2) || 'N/A'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Dividend Yield</ThemedText>
            <ThemedText style={styles.infoValue}>{stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : 'N/A'}</ThemedText>
          </View>
        </View>

        {/* Chart Placeholder */}
        <View style={[styles.chartContainer, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
          <ThemedText style={styles.chartTitle}>Price Chart</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Interactive chart would go here</ThemedText>
        </View>

        {/* Trade Section */}
        <View style={[styles.tradeContainer, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <View style={styles.tradeHeader}>
            <TouchableOpacity 
              style={[styles.tradeModeButton, isBuyMode && styles.activeTradeMode]}
              onPress={() => setIsBuyMode(true)}
            >
              <ThemedText style={[styles.tradeModeText, isBuyMode && styles.activeTradeModeText]}>Buy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tradeModeButton, !isBuyMode && styles.activeTradeMode]}
              onPress={() => setIsBuyMode(false)}
            >
              <ThemedText style={[styles.tradeModeText, !isBuyMode && styles.activeTradeModeText]}>Sell</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.tradeForm}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Quantity</ThemedText>
              <TextInput
                style={[styles.quantityInput, { backgroundColor: isDark ? '#0f172a' : '#e2e8f0', color: textColor }]}
                placeholder="Enter quantity"
                placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoGroup}>
              <ThemedText style={styles.infoLabel}>Price per share</ThemedText>
              <ThemedText style={styles.infoValue}>${stock.price.toFixed(2)}</ThemedText>
            </View>

            <View style={styles.infoGroup}>
              <ThemedText style={styles.infoLabel}>Total cost</ThemedText>
              <ThemedText style={styles.infoValue}>
                ${(parseInt(quantity || '0') * stock.price).toFixed(2)}
              </ThemedText>
            </View>

            <TouchableOpacity 
              style={[styles.tradeButton, { backgroundColor: isBuyMode ? '#10b981' : '#ef4444' }]}
              onPress={handleTrade}
            >
              <ThemedText style={styles.tradeButtonText}>
                {isBuyMode ? 'Buy Stock' : 'Sell Stock'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.text + '20',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  tradeContainer: {
    borderRadius: 12,
    padding: 16,
  },
  tradeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tradeModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTradeMode: {
    borderBottomColor: '#10b981',
  },
  tradeModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.icon,
  },
  activeTradeModeText: {
    color: '#10b981',
  },
  tradeForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quantityInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  infoGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});