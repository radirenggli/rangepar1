import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { SessionType, FairwayWidth } from '@/types/database';
import { Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { generateRandomHole } from '@/utils/holeGenerator';

type ParLength = 'short' | 'medium' | 'long';

export default function PracticeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [sessionType, setSessionType] = useState<SessionType>('free');
  const [fairwayWidth, setFairwayWidth] = useState<FairwayWidth>('medium');
  const [par4Length, setPar4Length] = useState<ParLength>('medium');
  const [par5Length, setPar5Length] = useState<ParLength>('medium');
  const [includePar6, setIncludePar6] = useState(false);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    if (!profile) return;

    setLoading(true);

    try {
      const holeCount =
        sessionType === 'free' ? 1 : sessionType === '9_holes' ? 9 : 18;

      const { data: session, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: profile.id,
          session_type: sessionType,
          unit_used: profile.unit_preference,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const holes = [];
      for (let i = 0; i < holeCount; i++) {
        const parOptions = [4, 5];
        if (includePar6 && profile.is_premium) {
          parOptions.push(6);
        }

        const randomPar =
          parOptions[Math.floor(Math.random() * parOptions.length)] as
            | 4
            | 5
            | 6;
        const lengthType = randomPar === 4 ? par4Length : par5Length;

        const hole = generateRandomHole(
          i + 1,
          session.id,
          profile.unit_preference,
          randomPar,
          lengthType,
          fairwayWidth
        );

        holes.push(hole);
      }

      const { error: holesError } = await supabase.from('holes').insert(holes);

      if (holesError) throw holesError;

      router.push({
        pathname: '/(tabs)/practice/[id]',
        params: { id: session.id },
      });
    } catch (error: any) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Start Practice Session</Text>
          <Text style={styles.subtitle}>
            Configure your randomized practice
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Type</Text>
          <View style={styles.optionGroup}>
            {(['free', '9_holes', '18_holes'] as SessionType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  sessionType === type && styles.optionSelected,
                ]}
                onPress={() => setSessionType(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    sessionType === type && styles.optionTextSelected,
                  ]}
                >
                  {type === 'free'
                    ? 'Free Play'
                    : type === '9_holes'
                      ? '9 Holes'
                      : '18 Holes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fairway Width</Text>
          <View style={styles.optionGroup}>
            {(['narrow', 'medium', 'wide'] as FairwayWidth[]).map((width) => (
              <TouchableOpacity
                key={width}
                style={[
                  styles.option,
                  fairwayWidth === width && styles.optionSelected,
                ]}
                onPress={() => setFairwayWidth(width)}
              >
                <Text
                  style={[
                    styles.optionText,
                    fairwayWidth === width && styles.optionTextSelected,
                  ]}
                >
                  {width.charAt(0).toUpperCase() + width.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Par 4 Length</Text>
          <View style={styles.optionGroup}>
            {(['short', 'medium', 'long'] as ParLength[]).map((length) => (
              <TouchableOpacity
                key={length}
                style={[
                  styles.option,
                  par4Length === length && styles.optionSelected,
                ]}
                onPress={() => setPar4Length(length)}
              >
                <Text
                  style={[
                    styles.optionText,
                    par4Length === length && styles.optionTextSelected,
                  ]}
                >
                  {length.charAt(0).toUpperCase() + length.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Par 5 Length</Text>
          <View style={styles.optionGroup}>
            {(['short', 'medium', 'long'] as ParLength[]).map((length) => (
              <TouchableOpacity
                key={length}
                style={[
                  styles.option,
                  par5Length === length && styles.optionSelected,
                ]}
                onPress={() => setPar5Length(length)}
              >
                <Text
                  style={[
                    styles.optionText,
                    par5Length === length && styles.optionTextSelected,
                  ]}
                >
                  {length.charAt(0).toUpperCase() + length.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {profile?.is_premium && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIncludePar6(!includePar6)}
            >
              <View
                style={[styles.checkbox, includePar6 && styles.checkboxChecked]}
              >
                {includePar6 && <View style={styles.checkboxInner} />}
              </View>
              <View>
                <Text style={styles.checkboxLabel}>Include Par 6</Text>
                <Text style={styles.checkboxSubtext}>Just for fun!</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={startSession}
          disabled={loading}
        >
          <Play size={24} color="#fff" fill="#fff" />
          <Text style={styles.startButtonText}>
            {loading ? 'Starting...' : 'Start Practice'}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D7F3E',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#2D7F3E',
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextSelected: {
    color: '#2D7F3E',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#2D7F3E',
    backgroundColor: '#2D7F3E',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  checkboxSubtext: {
    fontSize: 12,
    color: '#666',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#2D7F3E',
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
