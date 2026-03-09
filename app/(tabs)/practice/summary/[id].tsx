import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Shot, PracticeSession } from '@/types/database';
import { ArrowLeft, TrendingUp, Target } from 'lucide-react-native';

export default function SessionSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);

  useEffect(() => {
    loadSummary();
  }, [id]);

  const loadSummary = async () => {
    if (!id) return;

    const { data: sessionData } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: shotsData } = await supabase
      .from('shots')
      .select('*')
      .eq('session_id', id);

    if (sessionData) setSession(sessionData);
    if (shotsData) setShots(shotsData);

    setLoading(false);
  };

  if (loading || !session) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D7F3E" />
      </View>
    );
  }

  const directionCounts = shots.reduce(
    (acc, shot) => {
      acc[shot.direction] = (acc[shot.direction] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalShots = shots.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#2D7F3E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Complete</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.iconContainer}>
            <Target size={48} color="#2D7F3E" />
          </View>
          <Text style={styles.congratsText}>Great Practice Session!</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{session.holes_completed}</Text>
              <Text style={styles.statLabel}>Holes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalShots}</Text>
              <Text style={styles.statLabel}>Total Shots</Text>
            </View>
          </View>
        </View>

        <View style={styles.directionCard}>
          <View style={styles.cardHeader}>
            <TrendingUp size={24} color="#2D7F3E" />
            <Text style={styles.cardTitle}>Shot Direction Analysis</Text>
          </View>

          {Object.entries(directionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([direction, count]) => {
              const percentage = ((count / totalShots) * 100).toFixed(0);
              return (
                <View key={direction} style={styles.directionRow}>
                  <View style={styles.directionInfo}>
                    <Text style={styles.directionName}>
                      {direction.charAt(0).toUpperCase() + direction.slice(1)}
                    </Text>
                    <Text style={styles.directionCount}>
                      {count} shots ({percentage}%)
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7F3E',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E9',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7F3E',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2D7F3E',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  directionCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  directionRow: {
    marginBottom: 16,
  },
  directionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  directionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  directionCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D7F3E',
    borderRadius: 4,
  },
  doneButton: {
    backgroundColor: '#2D7F3E',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
