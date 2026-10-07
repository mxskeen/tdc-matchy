/**
 * MatchGuard Matching Engine
 * Combines deterministic rule-based dealbreaker filters with soft preference scoring.
 */

export function validateCandidateAgainstClient(candidate, client) {
  const dealbreakerClashes = [];
  const softWarnings = [];
  const matchHighlights = [];

  const cb = client.dealbreakers;
  const sp = client.softPreferences;

  // 1. Smoking Dealbreaker Check
  const clientRequiresNonSmoker = cb.smoking.toLowerCase().includes('never') || cb.smoking.toLowerCase().includes('non-smoker');
  const candidateSmokes = candidate.smoking.toLowerCase().includes('smoker') && !candidate.smoking.toLowerCase().includes('never');

  if (clientRequiresNonSmoker && candidateSmokes) {
    dealbreakerClashes.push({
      field: 'Smoking Habit',
      severity: 'CRITICAL',
      clientRule: cb.smoking,
      candidateValue: candidate.smoking,
      explanation: 'Client explicitly marked smoking as a hard non-negotiable dealbreaker.',
    });
  } else if (!candidateSmokes) {
    matchHighlights.push('Both aligned on non-smoking lifestyle');
  }

  // 2. Children / Family Plans Check
  const clientWantsKids = cb.children.toLowerCase().includes('wants children');
  const candidateNoKids = candidate.children.toLowerCase().includes('does not want');

  if (clientWantsKids && candidateNoKids) {
    dealbreakerClashes.push({
      field: 'Children / Family Planning',
      severity: 'CRITICAL',
      clientRule: cb.children,
      candidateValue: candidate.children,
      explanation: 'Direct clash on family planning. Client desires children; candidate explicitly does not.',
    });
  } else {
    matchHighlights.push(`Compatible family goals (${candidate.children})`);
  }

  // 3. Location Dealbreaker Check
  const candidateCity = candidate.location.split('(')[0].split(',')[0].trim().toLowerCase();
  const allowedCities = cb.locationsAllowed.map((loc) => loc.toLowerCase());
  const locationMatches = allowedCities.some((allowed) => candidateCity.includes(allowed) || allowed.includes(candidateCity));

  if (!locationMatches) {
    dealbreakerClashes.push({
      field: 'Location / City',
      severity: 'CRITICAL',
      clientRule: cb.locationsAllowed.join(', '),
      candidateValue: candidate.location,
      explanation: `Candidate is located in ${candidate.location}, outside client's permitted regions (${cb.locationsAllowed.join(', ')}).`,
    });
  } else {
    matchHighlights.push(`Co-located in approved region (${candidate.location})`);
  }

  // 4. Age Range Check
  if (candidate.age < cb.minAge || candidate.age > cb.maxAge) {
    dealbreakerClashes.push({
      field: 'Age Limits',
      severity: 'CRITICAL',
      clientRule: `${cb.minAge} - ${cb.maxAge} years`,
      candidateValue: `${candidate.age} years old`,
      explanation: `Candidate is ${candidate.age}, which sits outside client's required window (${cb.minAge}-${cb.maxAge}).`,
    });
  }

  // 5. Check if candidate violates dynamically learned client tags (from feedback)
  if (client.extractedTags && client.extractedTags.length > 0) {
    if (client.extractedTags.includes('allergy_cats_or_pets') || client.extractedTags.includes('no_pets')) {
      if (candidate.bio.toLowerCase().includes('cat') || candidate.lifestyleTags.some((t) => t.toLowerCase().includes('cat'))) {
        dealbreakerClashes.push({
          field: 'Pet Allergy Constraint (Learned)',
          severity: 'CRITICAL',
          clientRule: 'Strictly No Cats / Severe Pet Allergy',
          candidateValue: 'Owns / lives with cats',
          explanation: 'Extracted from previous rejection feedback: client has severe asthma/allergies.',
        });
      }
    }
  }

  // Soft Preferences Check
  // Diet
  if (sp.diet && sp.diet.toLowerCase().includes('vegetarian')) {
    if (candidate.diet.toLowerCase().includes('non-vegetarian')) {
      softWarnings.push({
        field: 'Dietary Alignment',
        clientPref: sp.diet,
        candidateValue: candidate.diet,
        explanation: 'Client prefers vegetarian lifestyle; candidate is non-vegetarian.',
      });
    } else {
      matchHighlights.push(`Aligned diet: ${candidate.diet}`);
    }
  }

  // Calculate Base Compatibility Score
  let score = 88;
  if (dealbreakerClashes.length > 0) {
    score -= dealbreakerClashes.length * 35;
  }
  if (softWarnings.length > 0) {
    score -= softWarnings.length * 8;
  }
  if (matchHighlights.length >= 3) {
    score += 8;
  }
  score = Math.max(12, Math.min(98, score));

  // Determine overall status
  let status = 'PASSED';
  if (dealbreakerClashes.length > 0) {
    status = 'BLOCKED';
  } else if (softWarnings.length > 0) {
    status = 'WARNING';
  }

  // Generate 3-bullet pitch draft for matchmaker intro email
  const pitchDraft = [
    `Educational & Professional caliber: ${candidate.name} is a ${candidate.profession} (${candidate.education}), matching ${client.name}'s preference for intellectual depth and shared ambition.`,
    `Lifestyle harmony: Based in ${candidate.location.split('(')[0].trim()} with a grounded routine (${candidate.lifestyleTags.slice(0, 3).join(', ')}).`,
    `Values alignment: Compatible long-term perspective on family (${candidate.children}) and clean habit alignment.`,
  ];

  return {
    status,
    score,
    dealbreakerClashes,
    softWarnings,
    matchHighlights,
    pitchDraft,
  };
}

/**
 * Parses unstructured email feedback and extracts structured tags
 */
export function parseUnstructuredFeedback(rawText) {
  const text = rawText.toLowerCase();
  const tagsToAdd = [];
  const detectedDealbreakers = [];
  const extractedInsights = [];

  // Smoking detection
  if (text.includes('smoke') || text.includes('smoking') || text.includes('smoker')) {
    tagsToAdd.push('dealbreaker_strict_non_smoker');
    detectedDealbreakers.push({
      category: 'Smoking Habits',
      tag: 'strict_non_smoker',
      severity: 'HARD DEALBREAKER',
      confidence: '99%',
      quote: 'Mentioned non-smoking as a strict non-negotiable.',
    });
  }

  // Pets / Allergies detection
  if (text.includes('cat') || text.includes('dog') || text.includes('pet') || text.includes('asthma') || text.includes('allerg')) {
    tagsToAdd.push('allergy_cats_or_pets');
    tagsToAdd.push('no_pets');
    detectedDealbreakers.push({
      category: 'Pet / Health Constraint',
      tag: 'allergy_cats_or_pets',
      severity: 'HARD DEALBREAKER',
      confidence: '95%',
      quote: 'Severe asthma / allergy flare-up around pets.',
    });
    extractedInsights.push('Revealed medical / health constraint previously missing from initial questionnaire.');
  }

  // Location / Relocation detection
  if (text.includes('relocat') || text.includes('move to') || text.includes('moving') || text.includes('london') || text.includes('travel')) {
    if (text.includes('cannot relocate') || text.includes('practice') || text.includes('settled')) {
      tagsToAdd.push('dealbreaker_no_relocation');
      detectedDealbreakers.push({
        category: 'Relocation Willingness',
        tag: 'strictly_local_no_relocation',
        severity: 'HARD DEALBREAKER',
        confidence: '97%',
        quote: 'Cannot relocate under any circumstances due to professional roots.',
      });
    }
  }

  // Career ambition / egalitarian values
  if (text.includes('career') || text.includes('ambiti') || text.includes('step back') || text.includes('work after marriage')) {
    tagsToAdd.push('egalitarian_career_celebration');
    extractedInsights.push('Stated cultural requirement: Demands a partner who actively champions ambitious women.');
  }

  return {
    extractedTags: Array.from(new Set(tagsToAdd)),
    detectedDealbreakers,
    extractedInsights,
    summary: `Extracted ${detectedDealbreakers.length} hard dealbreaker rule(s) and ${extractedInsights.length} qualitative preference nuance(s).`,
  };
}

const TAG_LABELS = {
  prefers_ambitious_career: 'Values ambition & career',
  values_family_oriented: 'Family-oriented',
  allergy_cats_or_pets: 'Severe pet allergy',
  no_pets: 'No pets in household',
  dealbreaker_strict_non_smoker: 'Strict non-smoker',
  dealbreaker_no_relocation: 'No relocation',
  strictly_local_no_relocation: 'Cannot relocate',
  egalitarian_career_celebration: 'Champions ambitious partner',
  pet_friendly: 'Pet-friendly',
  values_intellectual_banter: 'Intellectual conversation',
  high_career_drive: 'High career drive',
  prefers_calm_temperament: 'Calm temperament',
};

export function formatTag(tag) {
  if (TAG_LABELS[tag]) return TAG_LABELS[tag];
  return tag
    .replace(/^dealbreaker_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

