import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Calculator as CalcIcon, ArrowRight } from 'lucide-react-native';
import { yardsToMeters, metersToYards } from '@/utils/holeGenerator';
import AuthScreen from '@/components/AuthScreen';

export default function CalculatorTab() {
  const { session, profile } = useAuth();
  const [distance, setDistance] = useState('');
  const [result, setResult] = useState<number | null>(null);

  if (!session) {
    return <AuthScreen />;
  }

  const unit = profile?.unit_preference || 'yards';
  const oppositeUnit = unit === 'yards' ? 'meters' : 'yards';

  const calculate = () => {
    const value = parseFloat(distance);
    if (isNaN(value)) {
      setResult(null);
      return;
    }

    if (unit === 'yards') {
      setResult(yardsToMeters(value));
    } else {
      setResult(metersToYards(value));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CalcIcon size={32} color="#2D7F3E" />
        <Text style={styles.title}>Distance Calculator</Text>
        <Text style={styles.subtitle}>
          Convert between yards and meters
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.calculatorCard}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Enter distance in {unit}
            </Text>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholder={`Distance in ${unit}`}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
            <Text style={styles.calculateButtonText}>Calculate</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>

          {result !== null && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Result</Text>
              <Text style={styles.resultValue}>
                {result.toFixed(1)} {oppositeUnit}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Reference</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>1 yard = 0.9144 meters</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>1 meter = 1.094 yards</Text>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  calculatorCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
  },
  calculateButton: {
    backgroundColor: '#2D7F3E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D7F3E',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});
