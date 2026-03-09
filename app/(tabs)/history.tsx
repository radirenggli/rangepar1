import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PracticeSession } from '@/types/database';
import { History as HistoryIcon, Calendar, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AuthScreen from '@/components/AuthScreen';

export default function HistoryTab() {
  const { session, profile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadSessions();
    }
  }, [profile]);

  const loadSessions = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSessions(data);
    }

    setLoading(false);
  };

  if (!session) {
    return <AuthScreen />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'free':
        return 'Free Play';
      case '9_holes':
        return '9 Holes';
      case '18_holes':
        return '18 Holes';
      default:
        return type;
    }
  };

  const renderSession = ({ item }: { item: PracticeSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/practice/summary/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionType}>
          {getSessionTypeLabel(item.session_type)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            item.completed_at
              ? styles.statusCompleted
              : styles.statusIncomplete,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.completed_at
                ? styles.statusTextCompleted
                : styles.statusTextIncomplete,
            ]}
          >
            {item.completed_at ? 'Completed' : 'In Progress'}
          </Text>
        </View>
      </View>

      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <Target size={16} color="#666" />
          <Text style={styles.statText}>
            {item.holes_completed} holes
          </Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={16} color="#666" />
          <Text style={styles.statText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      {item.completed_at && (
        <View style={styles.sessionFooter}>
          <Text style={styles.shotsText}>
            {item.total_shots} total shots
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HistoryIcon size={32} color="#2D7F3E" />
        <Text style={styles.title}>Practice History</Text>
        <Text style={styles.subtitle}>
          View your past practice sessions
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D7F3E" />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Target size={48} color="#999" />
          <Text style={styles.emptyText}>No practice sessions yet</Text>
          <Text style={styles.emptySubtext}>
            Start your first practice session to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7F3E',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusIncomplete: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: '#2D7F3E',
  },
  statusTextIncomplete: {
    color: '#F57C00',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  sessionFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  shotsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7F3E',
  },
});
