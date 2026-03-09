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
import { Hole, Shot, ShotDirection, PracticeSession } from '@/types/database';
import { ArrowLeft, Target, Flag } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const SHOT_DIRECTIONS: { value: ShotDirection; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'draw', label: 'Draw' },
  { value: 'hook', label: 'Hook' },
  { value: 'push', label: 'Push' },
  { value: 'slice', label: 'Slice' },
];

export default function ActivePracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [distanceRemaining, setDistanceRemaining] = useState(0);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    if (!id) return;

    const { data: sessionData } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: holesData } = await supabase
      .from('holes')
      .select('*')
      .eq('session_id', id)
      .order('hole_number');

    const { data: shotsData } = await supabase
      .from('shots')
      .select('*')
      .eq('session_id', id)
      .order('created_at');

    if (sessionData) setSession(sessionData);
    if (holesData) {
      setHoles(holesData);
      if (holesData[0]) {
        setDistanceRemaining(holesData[0].distance);
      }
    }
    if (shotsData) setShots(shotsData);

    setLoading(false);
  };

  const recordShot = async (direction: ShotDirection) => {
    if (!holes[currentHoleIndex]) return;

    const currentHole = holes[currentHoleIndex];
    const shotNumber = shots.filter((s) => s.hole_id === currentHole.id).length + 1;

    const { error } = await supabase.from('shots').insert({
      hole_id: currentHole.id,
      session_id: id!,
      shot_number: shotNumber,
      direction,
      distance_remaining: distanceRemaining,
    });

    if (!error) {
      await loadSession();
    }
  };

  const completeHole = async () => {
    if (currentHoleIndex < holes.length - 1) {
      const nextIndex = currentHoleIndex + 1;
      setCurrentHoleIndex(nextIndex);
      setDistanceRemaining(holes[nextIndex].distance);
    } else {
      await supabase
        .from('practice_sessions')
        .update({
          completed_at: new Date().toISOString(),
          holes_completed: holes.length,
          total_shots: shots.length,
        })
        .eq('id', id!);

      router.push({
        pathname: '/(tabs)/practice/summary/[id]',
        params: { id: id! },
      });
    }
  };

  if (loading || !holes[currentHoleIndex]) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D7F3E" />
      </View>
    );
  }

  const currentHole = holes[currentHoleIndex];
  const currentHoleShots = shots.filter((s) => s.hole_id === currentHole.id);
  const unit = profile?.unit_preference === 'meters' ? 'm' : 'yd';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#2D7F3E" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Hole {currentHole.hole_number}
          </Text>
          <Text style={styles.headerSubtitle}>
            Par {currentHole.par} • {currentHole.distance} {unit}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.holeCard}>
          <View style={styles.holeStats}>
            <View style={styles.statItem}>
              <Target size={32} color="#2D7F3E" />
              <Text style={styles.statValue}>{currentHole.distance}</Text>
              <Text style={styles.statLabel}>Total Distance ({unit})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Flag size={32} color="#2D7F3E" />
              <Text style={styles.statValue}>{currentHole.fairway_width_yards}</Text>
              <Text style={styles.statLabel}>Fairway Width (yd)</Text>
            </View>
          </View>
        </View>

        <View style={styles.shotsSection}>
          <Text style={styles.sectionTitle}>
            Shot {currentHoleShots.length + 1}
          </Text>
          <Text style={styles.sectionSubtitle}>Select shot direction</Text>

          <View style={styles.directionGrid}>
            {SHOT_DIRECTIONS.map((dir) => (
              <TouchableOpacity
                key={dir.value}
                style={styles.directionButton}
                onPress={() => recordShot(dir.value)}
              >
                <Text style={styles.directionButtonText}>{dir.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {currentHoleShots.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Shot History</Text>
            {currentHoleShots.map((shot, index) => (
              <View key={shot.id} style={styles.historyItem}>
                <Text style={styles.historyNumber}>Shot {index + 1}</Text>
                <Text style={styles.historyDirection}>
                  {SHOT_DIRECTIONS.find((d) => d.value === shot.direction)?.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.completeButton}
          onPress={completeHole}
        >
          <Text style={styles.completeButtonText}>
            {currentHoleIndex < holes.length - 1
              ? 'Next Hole'
              : 'Finish Session'}
          </Text>
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
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7F3E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  holeCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  holeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7F3E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  shotsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  directionButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  directionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D7F3E',
  },
  historySection: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyNumber: {
    fontSize: 14,
    color: '#666',
  },
  historyDirection: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7F3E',
  },
  completeButton: {
    backgroundColor: '#2D7F3E',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
