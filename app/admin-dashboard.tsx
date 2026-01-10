import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { stockApi, User } from '../services/stockApi';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
  });
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        stockApi.getAllUsers(),
        stockApi.getAdminStats(),
      ]);
      
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const validateUserCreation = () => {
    if (!newUserEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return false;
    }
    
    if (!newUserName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    
    if (!newUserPassword) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    
    if (newUserPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (newUserPassword !== newUserConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateUserCreation()) {
      return;
    }

    try {
      await stockApi.createUser({
        email: newUserEmail,
        name: newUserName,
        password: newUserPassword,
        status: 'active',
      });
      
      Alert.alert('Success', 'User created successfully');
      // Clear form
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      setNewUserConfirmPassword('');
      // Refresh the data
      loadDashboardData();
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        Alert.alert('Error', 'A user with this email already exists. Please use a different email.');
      } else {
        console.error('Error creating user:', error);
        Alert.alert('Error', 'Failed to create user');
      }
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'blocked') => {
    try {
      await stockApi.updateUserStatus(userId, status);
      Alert.alert('Success', 'User status updated successfully');
      loadDashboardData(); // Refresh the data
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await stockApi.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully');
              loadDashboardData(); // Refresh the data
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const borderColor = isDark ? Colors.dark.text + '40' : Colors.light.text + '40';

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.userItem, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
      <View style={styles.userInfo}>
        <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
        <ThemedText style={styles.userName}>{item.name}</ThemedText>
        <View style={styles.userStatusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: item.status === 'active' ? '#10b981' : item.status === 'blocked' ? '#ef4444' : '#f59e0b' }]} />
          <ThemedText style={styles.userStatus}>{item.status}</ThemedText>
        </View>
        <ThemedText style={styles.userActivity}>Last active: {new Date(item.lastActive).toLocaleString()}</ThemedText>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => handleUpdateUserStatus(item.id, 'active')}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
          onPress={() => handleUpdateUserStatus(item.id, 'inactive')}
        >
          <Ionicons name="pause" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleUpdateUserStatus(item.id, 'blocked')}
        >
          <Ionicons name="ban" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#6b7280' }]}
          onPress={() => handleDeleteUser(item.id)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Admin Dashboard</ThemedText>
      </View>

      <ScrollView style={styles.mainContent}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={30} color="#3b82f6" />
            </View>
            <View>
              <ThemedText style={styles.statValue}>{stats.totalUsers}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Users</ThemedText>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={30} color="#10b981" />
            </View>
            <View>
              <ThemedText style={styles.statValue}>${stats.totalRevenue.toLocaleString()}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Revenue</ThemedText>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash" size={30} color="#8b5cf6" />
            </View>
            <View>
              <ThemedText style={styles.statValue}>{stats.totalTransactions}</ThemedText>
              <ThemedText style={styles.statLabel}>Transactions</ThemedText>
            </View>
          </View>
        </View>

        {/* Create User Section */}
        <View style={[styles.section, { borderColor }]}>          <ThemedText style={styles.sectionTitle}>Create New User</ThemedText>
          <View style={styles.createUserForm}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="User Name"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserName}
              onChangeText={setNewUserName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="Email"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="Password"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="Confirm Password"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserConfirmPassword}
              onChangeText={setNewUserConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: '#10b981' }]}
              onPress={handleCreateUser}
            >
              <ThemedText style={styles.createButtonText}>Create User</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Users Management */}
        <View style={[styles.section, { borderColor }]}>          
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>User Management</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>{users.length} users</ThemedText>
          </View>
          
          <FlatList
            data={users.filter(user => user.email !== 'demo@gmail.com')} // Don't show admin user
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people" size={48} color={Colors.light.icon} />
                <ThemedText style={styles.emptyStateText}>No users found</ThemedText>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[isDark ? '#10b981' : '#10b981']}
              />
            }
          />
        </View>
  
        {/* Create User Section */}
        <View style={[styles.section, { borderColor }]}>          <ThemedText style={styles.sectionTitle}>Create New User</ThemedText>
          <View style={styles.createUserForm}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="User Name"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserName}
              onChangeText={setNewUserName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="Email"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="Password"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: textColor }]}
              placeholder="Confirm Password"
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
              value={newUserConfirmPassword}
              onChangeText={setNewUserConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: '#10b981' }]}
              onPress={handleCreateUser}
            >
              <ThemedText style={styles.createButtonText}>Create User</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Users Management */}
        <View style={[styles.section, { borderColor }]}>          
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>User Management</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>{users.length} users</ThemedText>
          </View>
            
          <FlatList
            data={users.filter(user => user.email !== 'demo@gmail.com')} // Don't show admin user
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people" size={48} color={Colors.light.icon} />
                <ThemedText style={styles.emptyStateText}>No users found</ThemedText>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[isDark ? '#10b981' : '#10b981']}
              />
            }
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  createUserForm: {
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  userStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  userActivity: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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