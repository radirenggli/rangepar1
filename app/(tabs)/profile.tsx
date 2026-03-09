import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  User,
  Settings,
  LogOut,
  Ruler,
  Crown,
  Mail,
} from 'lucide-react-native';
import AuthScreen from '@/components/AuthScreen';

export default function ProfileTab() {
  const { session, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [changingUnit, setChangingUnit] = useState(false);

  if (!session || !profile) {
    return <AuthScreen />;
  }

  const saveProfile = async () => {
    setSaving(true);

    await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id);

    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const changeUnit = async (unit: 'yards' | 'meters') => {
    setChangingUnit(true);

    await supabase
      .from('profiles')
      .update({ unit_preference: unit })
      .eq('id', profile.id);

    await refreshProfile();
    setChangingUnit(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#2D7F3E" />
          </View>
          <Text style={styles.title}>
            {profile.display_name || 'Golf Player'}
          </Text>
          <Text style={styles.email}>{profile.email}</Text>

          {profile.is_premium && (
            <View style={styles.premiumBadge}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#2D7F3E" />
            <Text style={styles.sectionTitle}>Profile Settings</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Mail size={20} color="#666" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Display Name</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.settingValue}>
                    {profile.display_name || 'Not set'}
                  </Text>
                )}
              </View>
            </View>

            {editing ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setEditing(false);
                    setDisplayName(profile.display_name || '');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={saveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ruler size={20} color="#2D7F3E" />
            <Text style={styles.sectionTitle}>Unit Preference</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.unitOptions}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  profile.unit_preference === 'yards' &&
                    styles.unitOptionSelected,
                ]}
                onPress={() => changeUnit('yards')}
                disabled={changingUnit}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    profile.unit_preference === 'yards' &&
                      styles.unitOptionTextSelected,
                  ]}
                >
                  Yards
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  profile.unit_preference === 'meters' &&
                    styles.unitOptionSelected,
                ]}
                onPress={() => changeUnit('meters')}
                disabled={changingUnit}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    profile.unit_preference === 'meters' &&
                      styles.unitOptionTextSelected,
                  ]}
                >
                  Meters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {!profile.is_premium && (
          <View style={styles.section}>
            <View style={styles.premiumCard}>
              <Crown size={32} color="#FFD700" />
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDescription}>
                Unlock Par 6 holes and additional features
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <LogOut size={20} color="#E74C3C" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>RPG Golf v1.0.0</Text>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#E8F5E9',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7F3E',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#2D7F3E',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D7F3E',
  },
  unitOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  unitOption: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F0',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
  },
  unitOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2D7F3E',
  },
  unitOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  unitOptionTextSelected: {
    color: '#2D7F3E',
  },
  premiumCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingVertical: 24,
  },
});
