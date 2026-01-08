import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  COMPARISONS_COUNT: '@review_comparisons_count',
  PRODUCTS_COUNT: '@review_products_count',
  APP_LAUNCHES: '@review_app_launches',
  LAST_REVIEW_PROMPT: '@review_last_prompt_date',
  REVIEW_COMPLETED: '@review_completed',
};

// Thresholds for triggering review
const THRESHOLDS = {
  MIN_COMPARISONS: 3,      // After 3 comparisons
  MIN_PRODUCTS: 10,        // After adding 10 products
  MIN_LAUNCHES: 5,         // After 5 app launches
  DAYS_BETWEEN_PROMPTS: 30, // Don't ask again for 30 days
};

/**
 * Check if enough time has passed since last prompt
 */
const canShowReviewPrompt = async () => {
  try {
    // Check if user already reviewed
    const hasReviewed = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_COMPLETED);
    if (hasReviewed === 'true') {
      return false;
    }

    // Check when we last prompted
    const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REVIEW_PROMPT);
    if (lastPromptDate) {
      const daysSinceLastPrompt = (Date.now() - parseInt(lastPromptDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt < THRESHOLDS.DAYS_BETWEEN_PROMPTS) {
        return false;
      }
    }

    // Check if store review is available
    const isAvailable = await StoreReview.isAvailableAsync();
    return isAvailable;
  } catch (error) {
    console.error('Error checking review prompt availability:', error);
    return false;
  }
};

/**
 * Check if user has met the criteria for review
 */
const hasMetReviewCriteria = async () => {
  try {
    const comparisons = await AsyncStorage.getItem(STORAGE_KEYS.COMPARISONS_COUNT);
    const products = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_COUNT);
    const launches = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCHES);

    const comparisonCount = parseInt(comparisons || '0');
    const productCount = parseInt(products || '0');
    const launchCount = parseInt(launches || '0');

    // User must meet at least 2 out of 3 criteria
    const criteriasMet = [
      comparisonCount >= THRESHOLDS.MIN_COMPARISONS,
      productCount >= THRESHOLDS.MIN_PRODUCTS,
      launchCount >= THRESHOLDS.MIN_LAUNCHES,
    ].filter(Boolean).length;

    return criteriasMet >= 2;
  } catch (error) {
    console.error('Error checking review criteria:', error);
    return false;
  }
};

/**
 * Increment comparison count
 */
export const trackComparison = async () => {
  try {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.COMPARISONS_COUNT);
    const newCount = parseInt(count || '0') + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.COMPARISONS_COUNT, newCount.toString());
    
    // Check if we should show review prompt
    await checkAndShowReview();
  } catch (error) {
    console.error('Error tracking comparison:', error);
  }
};

/**
 * Increment product count
 */
export const trackProductAdded = async () => {
  try {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_COUNT);
    const newCount = parseInt(count || '0') + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS_COUNT, newCount.toString());
    
    // Check if we should show review prompt
    await checkAndShowReview();
  } catch (error) {
    console.error('Error tracking product:', error);
  }
};

/**
 * Increment app launch count
 */
export const trackAppLaunch = async () => {
  try {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCHES);
    const newCount = parseInt(count || '0') + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.APP_LAUNCHES, newCount.toString());
  } catch (error) {
    console.error('Error tracking launch:', error);
  }
};

/**
 * Check if we should show review and show it
 */
const checkAndShowReview = async () => {
  try {
    const canShow = await canShowReviewPrompt();
    const hasMet = await hasMetReviewCriteria();

    if (canShow && hasMet) {
      // Show the review prompt
      await StoreReview.requestReview();
      
      // Update last prompt date
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_REVIEW_PROMPT, Date.now().toString());
    }
  } catch (error) {
    console.error('Error showing review prompt:', error);
  }
};

/**
 * Manually trigger review prompt (for testing or manual trigger)
 */
export const showReviewPrompt = async () => {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_REVIEW_PROMPT, Date.now().toString());
    }
  } catch (error) {
    console.error('Error showing review prompt:', error);
  }
};

/**
 * Mark review as completed (call this if user leaves a review)
 */
export const markReviewCompleted = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_COMPLETED, 'true');
  } catch (error) {
    console.error('Error marking review completed:', error);
  }
};
