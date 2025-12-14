import { pipeline } from '@huggingface/transformers';

let classifier: any = null;

const STAT_CATEGORIES = {
  intelligence: ['study', 'learn', 'read', 'education', 'book', 'lecture', 'course', 'research', 'coding', 'programming', 'mathematics', 'problem solving', 'knowledge', 'academic'],
  strength: ['workout', 'exercise', 'gym', 'training', 'fitness', 'lifting', 'sports', 'physical', 'muscle', 'cardio', 'running', 'athletic'],
  sense: ['meditation', 'mindfulness', 'awareness', 'reflection', 'focus', 'concentration', 'zen', 'breathing', 'mental clarity', 'contemplation'],
  agility: ['speed', 'quick', 'reflex', 'reaction', 'agile', 'sprint', 'jumping', 'coordination', 'dexterity', 'nimble'],
  vitality: ['health', 'sleep', 'rest', 'nutrition', 'eating', 'diet', 'wellness', 'recovery', 'hydration', 'stretching', 'yoga', 'walking']
};

async function initializeClassifier() {
  if (!classifier) {
    console.log('Initializing AI quest analyzer...');
    classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
      device: 'wasm'
    });
    console.log('AI quest analyzer ready!');
  }
  return classifier;
}

export async function analyzeQuestWithAI(description: string): Promise<{
  stat: string;
  amount: number;
  xpReward: number;
  name: string;
}> {
  try {
    const model = await initializeClassifier();
    
    // Classify into stat categories
    const result = await model(description, Object.keys(STAT_CATEGORIES), {
      multi_label: false
    });
    
    const topStat = result.labels[0];
    const confidence = result.scores[0];
    
    // Analyze difficulty
    const lowerDesc = description.toLowerCase();
    let difficultyMultiplier = 1;
    
    if (lowerDesc.match(/hard|difficult|intense|advanced|challenging|tough|complex/)) {
      difficultyMultiplier = 1.5;
    } else if (lowerDesc.match(/easy|simple|quick|basic|short/)) {
      difficultyMultiplier = 0.7;
    }
    
    // Check for duration indicators
    let durationMultiplier = 1;
    const hourMatch = lowerDesc.match(/(\d+)\s*hours?/);
    const minuteMatch = lowerDesc.match(/(\d+)\s*minutes?/);
    
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      durationMultiplier = Math.min(hours * 0.5, 2);
    } else if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      durationMultiplier = Math.min(minutes / 60, 1.5);
    }
    
    // Base values by stat
    const baseXP: Record<string, number> = {
      intelligence: 50,
      strength: 50,
      sense: 40,
      agility: 40,
      vitality: 35
    };
    
    const baseAmount: Record<string, number> = {
      intelligence: 2,
      strength: 2,
      sense: 1,
      agility: 1,
      vitality: 1
    };
    
    // Combine AI prediction with keyword-based fallback
    const fallbackResult = fallbackAnalysis(description);
    let selectedStat = topStat;

    if (confidence < 0.5) {
      selectedStat = fallbackResult.stat;
    } else if (topStat === 'sense' && fallbackResult.stat !== 'sense') {
      selectedStat = fallbackResult.stat;
    }

    if (!baseXP[selectedStat]) {
      selectedStat = fallbackResult.stat || 'strength';
    }
    
    // Calculate final values
    const finalXP = Math.round(baseXP[selectedStat] * difficultyMultiplier * durationMultiplier * (0.8 + confidence * 0.4));
    const finalAmount = Math.max(1, Math.round(baseAmount[selectedStat] * difficultyMultiplier));
    
    // Generate clean name
    const cleanName = description.trim().split(/[.!?]/)[0].slice(0, 50);
    
    return {
      stat: selectedStat,
      amount: finalAmount,
      xpReward: Math.max(20, finalXP),
      name: cleanName
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    // Fallback to simple keyword matching
    return fallbackAnalysis(description);
  }
}

function fallbackAnalysis(description: string): {
  stat: string;
  amount: number;
  xpReward: number;
  name: string;
} {
  const lowerDesc = description.toLowerCase();
  
  let stat = 'strength';
  let xpReward = 30;
  let amount = 1;
  
  if (lowerDesc.match(/study|learn|read|code|program|research|math|problem|book|course|lecture|watch.*lecture/)) {
    stat = 'intelligence';
    xpReward = 50;
    amount = 2;
  } else if (lowerDesc.match(/workout|exercise|gym|run|train|fitness|sport|cardio|lift|push/)) {
    stat = 'strength';
    xpReward = 50;
    amount = 2;
  } else if (lowerDesc.match(/meditat|focus|aware|mindful|reflect|zen|calm|breath/)) {
    stat = 'sense';
    xpReward = 40;
    amount = 1;
  } else if (lowerDesc.match(/quick|fast|speed|agile|react|reflex|sprint|jump/)) {
    stat = 'agility';
    xpReward = 40;
    amount = 1;
  } else if (lowerDesc.match(/health|sleep|rest|eat|meal|water|stretch|walk|yoga/)) {
    stat = 'vitality';
    xpReward = 35;
    amount = 1;
  }
  
  if (lowerDesc.match(/hard|difficult|intense|advanced|challenging|tough/)) {
    xpReward += 20;
    amount += 1;
  } else if (lowerDesc.match(/easy|simple|quick|basic|short/)) {
    xpReward -= 10;
  }
  
  const cleanName = description.trim().split(/[.!?]/)[0].slice(0, 50);
  
  return {
    stat,
    amount: Math.max(1, amount),
    xpReward: Math.max(20, xpReward),
    name: cleanName
  };
}
