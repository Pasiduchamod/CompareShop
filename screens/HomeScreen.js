import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TextInput,
  Modal 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import Header from '../components/Header';

// Home Screen - displays list of categories/groups
const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { 
    categories, 
    addCategory,
    deleteCategory,
    togglePinCategory
  } = useProducts();

  // Sort categories: pinned first, then by creation date
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Add new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  // Navigate to category products screen
  const handleOpenCategory = (category) => {
    navigation.navigate('CategoryProducts', { category });
  };

  // Delete category with confirmation
  const handleDeleteCategory = (categoryId, categoryName) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}" and all its products?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCategory(categoryId)
        },
      ]
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon]}>📦</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Categories Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Tap the + button to add your first category
      </Text>
    </View>
  );

  // Render individual category card
  const renderCategory = ({ item }) => {
    const productCount = item.products?.length || 0;
    
    return (
      <TouchableOpacity
        style={[styles.categoryCard, { backgroundColor: colors.cardBackground }]}
        onPress={() => handleOpenCategory(item)}
        onLongPress={() => handleDeleteCategory(item.id, item.name)}
      >
        <TouchableOpacity
          style={styles.categoryIcon}
          onPress={() => togglePinCategory(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.categoryIconText}>{item.pinned ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryNameRow}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {item.name}
            </Text>
            {item.pinned && (
              <View style={[styles.pinnedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.pinnedBadgeText}>Pinned</Text>
              </View>
            )}
          </View>
          <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
            {productCount} {productCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Text style={[styles.categoryArrow, { color: colors.textSecondary }]}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with logo and cart button */}
      <Header 
        title="Categories"
        rightButton={{
          icon: '🛒',
          onPress: () => navigation.navigate('Cart')
        }}
      />

      {/* Category list */}
      <FlatList
        data={sortedCategories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          categories.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 80 }
        ]}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => setShowAddCategory(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New Category
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.inputText
                }
              ]}
              placeholder="e.g., Milk, Bread, Shampoo"
              placeholderTextColor={colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus={true}
              onSubmitEditing={handleAddCategory}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.inputBackground }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCategory}
                style={[styles.modalButton, styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 28,
    lineHeight: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  pinnedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pinnedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryCount: {
    fontSize: 14,
  },
  pinButton: {
    padding: 8,
    marginRight: 4,
  },
  pinIcon: {
    fontSize: 20,
  },
  categoryArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default HomeScreen;
