import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import PracticeScreen from '@/components/PracticeScreen';

export default function HomeTab() {
  const { session, loading } = useAuth();

  if (loading) {
    return <View style={styles.container} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <PracticeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
});
