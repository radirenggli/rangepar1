export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  unit_preference: 'yards' | 'meters';
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionType = 'free' | '9_holes' | '18_holes';

export type PracticeSession = {
  id: string;
  user_id: string;
  session_type: SessionType;
  holes_completed: number;
  total_shots: number;
  unit_used: 'yards' | 'meters';
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export type FairwayWidth = 'narrow' | 'medium' | 'wide';

export type Hole = {
  id: string;
  session_id: string;
  hole_number: number;
  par: 4 | 5 | 6;
  distance: number;
  fairway_width: FairwayWidth;
  fairway_width_yards: number;
  created_at: string;
};

export type ShotDirection = 'straight' | 'draw' | 'hook' | 'push' | 'slice';

export type Shot = {
  id: string;
  hole_id: string;
  session_id: string;
  shot_number: number;
  direction: ShotDirection;
  distance_remaining: number;
  created_at: string;
};

export const PAR_RANGES = {
  4: {
    short: { min: 250, max: 350 },
    medium: { min: 350, max: 420 },
    long: { min: 420, max: 480 },
  },
  5: {
    short: { min: 450, max: 550 },
    medium: { min: 550, max: 620 },
    long: { min: 620, max: 710 },
  },
  6: {
    fun: { min: 670, max: 750 },
  },
};

export const FAIRWAY_WIDTHS = {
  narrow: { min: 24, max: 30 },
  medium: { min: 30, max: 35 },
  wide: { min: 35, max: 45 },
};
