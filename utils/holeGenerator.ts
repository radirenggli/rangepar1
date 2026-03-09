import {
  PAR_RANGES,
  FAIRWAY_WIDTHS,
  FairwayWidth,
  Hole,
} from '@/types/database';

type ParLength = 'short' | 'medium' | 'long';

export function generateRandomHole(
  holeNumber: number,
  sessionId: string,
  unitPreference: 'yards' | 'meters',
  parType: 4 | 5 | 6 = 4,
  lengthType: ParLength = 'medium',
  fairwayWidth: FairwayWidth = 'medium'
): Omit<Hole, 'id' | 'created_at'> {
  const parRange =
    parType === 6
      ? PAR_RANGES[6].fun
      : PAR_RANGES[parType][lengthType as keyof typeof PAR_RANGES[4]];

  const distance =
    Math.floor(Math.random() * (parRange.max - parRange.min + 1)) +
    parRange.min;

  const fairwayRange = FAIRWAY_WIDTHS[fairwayWidth];
  const fairwayWidthYards =
    Math.floor(Math.random() * (fairwayRange.max - fairwayRange.min + 1)) +
    fairwayRange.min;

  const finalDistance =
    unitPreference === 'meters'
      ? Math.round(distance * 0.9144)
      : distance;

  return {
    session_id: sessionId,
    hole_number: holeNumber,
    par: parType,
    distance: finalDistance,
    fairway_width: fairwayWidth,
    fairway_width_yards: fairwayWidthYards,
  };
}

export function yardsToMeters(yards: number): number {
  return Math.round(yards * 0.9144);
}

export function metersToYards(meters: number): number {
  return Math.round(meters / 0.9144);
}
