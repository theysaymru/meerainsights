// ─── Product Category Detection ────────────────────────────────────────────

const CATEGORIES = {
  clothing: {
    keywords: ['saree', 'shirt', 'kurta', 'kurti', 'dress', 'top', 'lehenga', 'lehnga',
      'dupatta', 'fabric', 'stitching', 'blouse', 'cloth', 'kapda', 'wear', 'fit', 'size',
      'cotton', 'silk', 'polyester', 'chiffon', 'georgette', 'material', 'sleeve', 'collar',
      'hem', 'print', 'embroidery', 'zari', 'border', 'pallu', 'pattern', 'shrink', 'wash',
      'silai', 'rang'],
    themes: {
      'Colour & Appearance': ['colour', 'color', 'shade', 'faded', 'fading', 'bleed', 'bleeding',
        'dye', 'looks different', 'not as shown', 'misleading photo', 'picture', 'image',
        'mismatch', 'wrong colour', 'vibrant', 'dull', 'bright', 'dark', 'light',
        'exactly as shown', 'accurate', 'as expected', 'rang', 'photo se alag', 'alag hai'],
      'Size & Fit': ['size', 'sizing', 'fit', 'fitting', 'small', 'large', 'too big', 'too small',
        'tight', 'loose', 'length', 'measurement', 'size chart', 'runs small', 'runs large',
        'true to size', 'does not fit', 'adjust', 'waist', 'chest', 'shoulder',
        'size chota', 'size bada', 'galat size', 'fitting sahi'],
      'Fabric Quality': ['fabric', 'material', 'cloth', 'texture', 'thin', 'transparent', 'soft',
        'rough', 'smooth', 'thick', 'lightweight', 'heavy', 'synthetic', 'blend',
        'cotton', 'silk', 'polyester', 'quality feels', 'feels cheap', 'feels premium', 'kapda'],
      'Stitching & Finish': ['stitch', 'stitching', 'border', 'hem', 'finish', 'edging', 'fall',
        'loose thread', 'unravel', 'fraying', 'coming apart', 'zari', 'embroidery',
        'sequin', 'mirror work', 'workmanship', 'poorly stitched', 'well stitched', 'silai'],
      'Print Quality': ['print', 'printed', 'pattern', 'design', 'graphic', 'fade after wash',
        'washed off', 'peeling print', 'cracked print', 'print quality'],
      'Shrinkage & Wash': ['shrink', 'shrank', 'wash', 'washed', 'after washing', 'machine wash',
        'hand wash', 'colour run', 'bleed after wash', 'faded after wash'],
      'Delivery & Packaging': ['delivery', 'shipping', 'courier', 'package', 'packaging', 'days',
        'late', 'delay', 'damaged', 'tampered', 'missing', 'wrong item', 'arrived'],
      'Value for Money': ['price', 'expensive', 'affordable', 'costly', 'overpriced', 'worth',
        'value', 'money', 'budget', 'reasonable', 'good deal', 'not worth', 'paisa', 'paise', 'mehnga', 'mahenga', 'sasta']
    }
  },
  electronics: {
    keywords: ['phone', 'mobile', 'laptop', 'earphone', 'headphone', 'speaker', 'charger',
      'cable', 'battery', 'charging', 'screen', 'display', 'bluetooth', 'wifi',
      'camera', 'processor', 'ram', 'storage', 'watch', 'smartwatch', 'tablet',
      'keyboard', 'mouse', 'adapter', 'usb', 'power bank', 'led', 'bulb', 'fan'],
    themes: {
      'Battery & Charging': ['battery', 'charge', 'charging', 'power', 'backup', 'dead',
        'drain', 'runtime', 'recharge', 'fast charge', 'slow charge', 'battery life',
        'does not charge', 'not charging', 'overheating while charging'],
      'Build Quality': ['build', 'quality', 'plastic', 'metal', 'sturdy', 'flimsy', 'cheap',
        'fragile', 'cracked', 'broke', 'fell apart', 'durable', 'premium feel', 'solid'],
      'Performance': ['slow', 'fast', 'lag', 'hang', 'freeze', 'performance', 'speed',
        'processor', 'smooth', 'response', 'works well', 'does not work', 'stopped working'],
      'Connectivity': ['bluetooth', 'wifi', 'connect', 'pair', 'disconnect', 'drops',
        'signal', 'range', 'connectivity', 'usb', 'port', 'not connecting'],
      'Sound & Display': ['sound', 'audio', 'volume', 'bass', 'screen', 'display', 'bright',
        'dim', 'resolution', 'clarity', 'picture quality', 'colour display'],
      'Delivery & Packaging': ['delivery', 'shipping', 'courier', 'package', 'packaging', 'days',
        'late', 'delay', 'damaged', 'tampered', 'missing', 'wrong item', 'arrived'],
      'Value for Money': ['price', 'expensive', 'affordable', 'costly', 'overpriced', 'worth',
        'value', 'money', 'budget', 'reasonable', 'good deal', 'not worth', 'paisa', 'paise', 'mehnga', 'mahenga', 'sasta']
    }
  },
  furniture: {
    keywords: ['chair', 'table', 'sofa', 'bed', 'shelf', 'cupboard', 'wardrobe', 'desk',
      'rack', 'cabinet', 'stool', 'bench', 'wood', 'wooden', 'assemble', 'assembly',
      'furniture', 'drawer', 'mattress', 'cushion', 'pillow'],
    themes: {
      'Assembly': ['assemble', 'assembly', 'instruction', 'screw', 'bolt', 'difficult to assemble',
        'easy to assemble', 'tools', 'missing parts', 'broken parts', 'setup'],
      'Material & Finish': ['wood', 'wooden', 'mdf', 'metal', 'finish', 'polish', 'laminate',
        'rough edges', 'smooth', 'material quality', 'feels cheap', 'feels solid'],
      'Stability': ['stable', 'wobble', 'shaky', 'strong', 'weak', 'sturdy', 'holds weight',
        'collapsed', 'breaks', 'durable', 'load capacity'],
      'Dimensions': ['size', 'dimension', 'measurement', 'smaller than expected', 'larger',
        'fits', 'does not fit', 'space', 'compact', 'too big', 'too small'],
      'Delivery & Packaging': ['delivery', 'shipping', 'courier', 'package', 'packaging', 'days',
        'late', 'delay', 'damaged', 'tampered', 'missing', 'wrong item', 'arrived'],
      'Value for Money': ['price', 'expensive', 'affordable', 'costly', 'overpriced', 'worth',
        'value', 'money', 'budget', 'reasonable', 'good deal', 'not worth', 'paisa', 'paise', 'mehnga', 'mahenga', 'sasta']
    }
  },
  kitchen: {
    keywords: ['cookware', 'pan', 'pot', 'tawa', 'pressure cooker', 'mixer', 'grinder',
      'bottle', 'container', 'storage', 'kitchen', 'cook', 'non-stick', 'steel',
      'plastic', 'glass', 'jar', 'spoon', 'spatula', 'knife', 'chopper', 'casserole'],
    themes: {
      'Durability': ['durable', 'broke', 'cracked', 'rusted', 'peeling', 'chipped', 'lasting',
        'holds up', 'fell apart', 'weak', 'strong', 'after one use', 'long lasting'],
      'Material Quality': ['material', 'steel', 'plastic', 'glass', 'non-stick', 'coating',
        'food grade', 'bpa', 'safe', 'toxic', 'odour', 'smell', 'chemical smell'],
      'Ease of Cleaning': ['clean', 'cleaning', 'wash', 'dishwasher', 'difficult to clean',
        'easy to clean', 'residue', 'stuck', 'rinse', 'stain', 'hygiene'],
      'Functionality': ['works well', 'does not work', 'leak', 'leaking', 'seal', 'lid',
        'capacity', 'size', 'fits', 'easy to use', 'difficult to use'],
      'Delivery & Packaging': ['delivery', 'shipping', 'courier', 'package', 'packaging', 'days',
        'late', 'delay', 'damaged', 'tampered', 'missing', 'wrong item', 'arrived'],
      'Value for Money': ['price', 'expensive', 'affordable', 'costly', 'overpriced', 'worth',
        'value', 'money', 'budget', 'reasonable', 'good deal', 'not worth', 'paisa', 'paise', 'mehnga', 'mahenga', 'sasta']
    }
  },
  beauty: {
    keywords: ['cream', 'lotion', 'serum', 'shampoo', 'conditioner', 'lipstick', 'foundation',
      'moisturizer', 'sunscreen', 'face wash', 'hair', 'skin', 'nail', 'makeup',
      'perfume', 'deodorant', 'soap', 'scrub', 'mask', 'oil', 'gel', 'toner'],
    themes: {
      'Effectiveness': ['works', 'does not work', 'effective', 'results', 'difference', 'improved',
        'no change', 'no effect', 'visible results', 'after use', 'weeks', 'days'],
      'Skin Reaction': ['irritation', 'rash', 'allergy', 'breakout', 'sensitive', 'reaction',
        'side effect', 'itching', 'burning', 'redness', 'safe for skin'],
      'Fragrance & Texture': ['smell', 'fragrance', 'scent', 'texture', 'thick', 'thin',
        'greasy', 'light', 'smooth', 'sticky', 'absorbs', 'heavy'],
      'Packaging & Authenticity': ['packaging', 'sealed', 'open', 'broken', 'leaking', 'fake',
        'duplicate', 'original', 'authentic', 'expiry', 'expired', 'tampered'],
      'Delivery': ['delivery', 'shipping', 'courier', 'days', 'late', 'delay', 'arrived'],
      'Value for Money': ['price', 'expensive', 'affordable', 'costly', 'overpriced', 'worth',
        'value', 'money', 'budget', 'reasonable', 'good deal', 'not worth', 'paisa', 'paise', 'mehnga', 'mahenga', 'sasta']
    }
  }
};

// Universal fallback themes for undetected categories
const UNIVERSAL_THEMES = {
  'Product Quality': ['quality', 'defective', 'broken', 'damaged', 'poor', 'cheap', 'bad quality',
    'not working', 'stopped working', 'faulty', 'useless', 'waste', 'cracked', 'torn',
    'inferior', 'substandard', 'low quality', 'fake', 'duplicate', 'as described'],
  'Delivery & Packaging': ['delivery', 'shipping', 'courier', 'package', 'packaging', 'days',
    'late', 'delay', 'damaged', 'tampered', 'missing', 'wrong item', 'arrived', 'fast delivery'],
  'Size & Dimensions': ['size', 'sizing', 'fit', 'small', 'large', 'too big', 'too small',
    'measurement', 'dimension', 'does not fit', 'smaller than expected', 'larger than expected'],
  'Colour & Appearance': ['colour', 'color', 'shade', 'faded', 'looks different', 'not as shown',
    'misleading', 'photo', 'mismatch', 'wrong colour', 'vibrant', 'dull', 'exactly as shown'],
  'Durability': ['durable', 'broke', 'breaking', 'fell apart', 'lasted', 'lasts', 'long lasting',
    'wear and tear', 'build', 'solid', 'weak', 'flimsy', 'fragile', 'after one use', 'one wash'],
  'Value for Money': ['price', 'expensive', 'affordable', 'costly', 'overpriced', 'worth',
    'value', 'money', 'budget', 'reasonable', 'good deal', 'not worth', 'paisa', 'paise', 'mehnga', 'mahenga', 'sasta'],
  'Returns & Support': ['return', 'refund', 'replacement', 'exchange', 'customer care', 'support',
    'complaint', 'response', 'helpful', 'resolved', 'unresolved', 'easy return', 'difficult return'],
  'Overall Satisfaction': ['love', 'excellent', 'amazing', 'perfect', 'wonderful', 'fantastic',
    'awesome', 'happy', 'satisfied', 'recommend', 'best purchase', 'will order again',
    'highly recommend', 'impressed', 'delighted', 'no complaints', 'absolutely love']
};

const POSITIVE_WORDS = [
  // Emotion / evaluation words that are unambiguously positive
  'love', 'loved', 'great', 'amazing', 'excellent', 'perfect', 'wonderful', 'fantastic',
  'best', 'awesome', 'happy', 'satisfied', 'recommend', 'beautiful',
  'impressed', 'delighted', 'exceeded', 'brilliant', 'outstanding',
  'no complaints', 'will order again', 'best purchase', 'five star', 'highly recommend',
  'very happy', 'as expected', 'as shown', 'exactly as described', 'true to size',
  'well packed', 'well packaged', 'no issues', 'no problem',
  'works well', 'fits perfectly', 'looks great', 'feels premium', 'good quality',
  'fast delivery', 'good value', 'worth it', 'worth the price', 'worth every',
  // Hinglish / transliterated Hindi — how most real Meesho reviews are written.
  // Longer distinctive tokens only, to avoid substring collisions with English words.
  'accha', 'achha', 'acha hai', 'bahut acha', 'badhiya', 'badiya', 'zabardast',
  'shandar', 'kamaal', 'ekdum sahi', 'ekdum mast', 'mast hai', 'mast product',
  'paisa vasool', 'paise vasool', 'dil khush', 'bahut sundar', 'sundar hai',
  'behtareen', 'lajawab', 'majboot', 'jhakas', 'jhakkas', 'bahut khoob',
  'ekdum perfect', 'bilkul sahi', 'sahi hai', 'pasand aaya', 'pasand aya',
  // NOTE: "good", "durable", "sturdy", "solid", "easy", "fast", "quick", "smooth", "soft"
  // are intentionally excluded — they appear in negative contexts like "drains quickly",
  // "too solid to open", "goes bad" etc. Handled via POSITIVE_OUTCOME_PATTERNS instead.
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'broken',
  'defective', 'damaged', 'poor', 'cheap', 'fake', 'duplicate', 'faded', 'bleeding',
  'mismatch', 'wrong', 'misleading', 'overpriced', 'fragile', 'flimsy', 'fell apart',
  'not working', 'useless', 'waste', 'refund', 'return', 'delay', 'late', 'missing',
  'tampered', 'torn', 'frustrating', 'annoying', 'disappointing', 'does not fit',
  'too small', 'too big', 'not as shown', 'not as expected', 'stopped working', 'cracked',
  'does not work', 'shrink', 'shrank', 'stitching loose', 'fraying', 'peeling',
  'do not buy', 'waste of money', 'very poor', 'very slow', 'extremely slow',
  'keep disconnecting', 'keeps disconnecting', 'keeps crashing', 'no response',
  'rejected', 'cheated', 'fraud', 'counterfeit', 'rusted', 'rust',
  // Hinglish / transliterated Hindi — longer distinctive tokens to avoid
  // substring collisions with English words.
  'bakwas', 'bakwaas', 'ghatiya', 'bekar', 'bekaar', 'kharab', 'kharaab',
  'faltu', 'nakli', 'dhokha', 'barbad', 'kachra', 'ganda hai', 'ganda product',
  'paisa waste', 'paise waste', 'paisa barbad', 'paise barbad', 'mat kharido',
  'mat lena', 'bilkul bekar', 'ekdum bakwas', 'third class', 'tut gaya',
  'toot gaya', 'phat gaya', 'fat gaya', 'kamzor', 'jhoot', 'galat product',
  'galat size', 'galat colour', 'galat color', 'der se aaya', 'late aaya',
  'wapas kar', 'return kar diya', 'mehnga', 'mahenga'
];

// ─── Outcome-based patterns (Meaning > Emotion words) ───────────────────────
// A sentence can be Positive or Negative even without emotional language
// E.g. "Battery lasts 3 days" = Positive; "Stopped working after a week" = Negative

const NEGATIVE_OUTCOME_PATTERNS = [
  /stopped\s+working/i,
  /doesn'?t\s+work|does\s+not\s+work|not\s+working|won'?t\s+work/i,
  /broke\s+(after|within|in\s+\d)|broken\s+(after|within)/i,
  /cracked\s+after/i,
  /failed\s+(after|within)/i,
  /dead\s+(after|within|on\s+arrival)/i,
  /wrong\s+(item|size|colo|product|piece)/i,
  /not\s+as\s+(shown|described|expected|advertised)/i,
  /misleading\s+(photo|image|listing|description)/i,
  /missing\s+(item|part|piece|component|product)/i,
  /damaged\s+(on|upon|during)\s+(arrival|delivery|opening)|arrived\s+damaged/i,
  /delayed\s+by\s+\d|took\s+\d+\s+day/i,
  /no\s+tracking\s+update/i,
  /doesn'?t\s+fit|does\s+not\s+fit/i,
  /doesn'?t\s+charge|does\s+not\s+charge|not\s+charging/i,
  /doesn'?t\s+connect|does\s+not\s+connect/i,
  /keeps?\s+disconnect/i,
  /peeling\s+(after|within)/i,
  /rusted\s+(within|after)/i,
  /coating\s+(coming\s+off|peeling|flaking)/i,
  /handle\s+broke/i,
  /lid\s+(doesn'?t|does\s+not)\s+(seal|fit|close)/i,
  /safety\s+concern/i,
  /serious\s+health\s+concern/i,
  /overheating/i,
  /very\s+slow\s+charging|charges\s+(over|more\s+than)\s+\d+\s+hour/i,
  /battery\s+(barely|only)\s+lasts/i,
  /sound\s+(is\s+)?(very\s+)?low|volume\s+(is\s+)?(very\s+)?low/i,
];

const POSITIVE_OUTCOME_PATTERNS = [
  /lasts?\s+\d+\s+(day|week|month|year)/i,
  /arrived\s+in\s+(just\s+)?\d+\s+day/i,
  /delivered\s+in\s+(just\s+)?\d+\s+day/i,
  /setup\s+(completed\s+)?in\s+\d+\s+minute/i,
  /charged\s+(from\s+\d+\s+to\s+\d+|in\s+\d+\s+minute)/i,
  /works?\s+(perfectly|well|great|fine|flawlessly|smoothly)/i,
  /working\s+(perfectly|well|great|fine|flawlessly|smoothly)/i,
  /no\s+(issues?|problems?|complaints?|damage|defects?)\s/i,
  /true\s+to\s+size/i,
  /exactly\s+as\s+(shown|described|expected|advertised)/i,
  /matches?\s+(the\s+)?(listing|photo|description|expectation)/i,
  /still\s+(working|looks?|feels?)\s+(good|well|great|fine|new|perfect|brand\s+new)/i,
  /using\s+it\s+(daily|every\s+day)\s+for\s+\d+\s+(day|week|month)/i,
  /using\s+\w+\s+for\s+\d+\s+(day|week|month)\s+with\s+no/i,
  /fast\s+charging\s+works/i,
  /delivery\s+was\s+(fast|quick|next\s+day|same\s+day)/i,
  /next\s+day\s+delivery|same\s+day\s+delivery/i,
  /got\s+(it|my\s+order)\s+(next|same)\s+day/i,
  /fits?\s+(perfectly|exactly|true)/i,
  /food\s+(cooks?\s+evenly|never\s+burns?)/i,
  /no\s+hot\s+spots?/i,
  /easy\s+to\s+(use|clean|setup|assemble|install)/i,
  /stays?\s+cool\s+(during|while)/i,
  /good\s+(value|quality|build|performance|battery|sound|display|material|design)/i,
  /very\s+(good|nice|neat|secure|smooth|soft|durable|sturdy)\s/i,
  /\b(sturdy|durable|solid)\s+(and|build|quality|construction|material)/i,
  /\b(soft|smooth)\s+(and|to\s+touch|fabric|material|texture)/i,
];


// ─── Category Detection ─────────────────────────────────────────────────────

function detectCategory(reviews) {
  const text = reviews.join(' ').toLowerCase();
  const scores = {};
  for (const [cat, def] of Object.entries(CATEGORIES)) {
    scores[cat] = def.keywords.filter(kw => text.includes(kw)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 2 ? best[0] : null;
}

// ─── Sentiment ──────────────────────────────────────────────────────────────
// Classify by MEANING first, then emotion words.
// Neutral is RARE — only pure factual statements with zero evaluative signal.
// Mixed = both positive AND negative signals in the SAME item.

// Optional AI override: a Map(reviewText -> sentiment) set by the server before
// analysis when the LLM gateway is reachable. detectSentiment consults it first
// and falls back to the deterministic keyword logic for any review the AI didn't
// label — so the engine keeps working everywhere, AI just improves accuracy.
let _aiOverride = null;
function setSentimentOverride(map) { _aiOverride = map || null; }

function detectSentiment(text) {
  if (_aiOverride) {
    const v = _aiOverride.get(text);
    if (v === 'positive' || v === 'negative' || v === 'mixed' || v === 'neutral') return v;
  }

  const lower = text.toLowerCase();

  // Step 1: outcome-based pattern signals (meaning > emotion words)
  const negPattern = NEGATIVE_OUTCOME_PATTERNS.some(p => p.test(lower));
  const posPattern = POSITIVE_OUTCOME_PATTERNS.some(p => p.test(lower));

  // Step 2: keyword-based signals
  const posScore = POSITIVE_WORDS.filter(w => lower.includes(w)).length;
  const negScore = NEGATIVE_WORDS.filter(w => lower.includes(w)).length;

  const hasPos = posPattern || posScore > 0;
  const hasNeg = negPattern || negScore > 0;

  // Mixed: BOTH positive AND negative signals exist in the same text
  if (hasPos && hasNeg) return 'mixed';

  // Clear positive or negative
  if (hasPos) return 'positive';
  if (hasNeg) return 'negative';

  // Neutral ONLY when truly no evaluative signal exists (pure facts)
  // e.g. "Black color", "Model A52", "Received on Monday"
  return 'neutral';
}

function determineThemeSentiment(reviews) {
  let pos = 0, neg = 0, total = reviews.length || 1;
  for (const r of reviews) {
    const s = detectSentiment(r);
    if (s === 'positive') pos++;
    else if (s === 'negative') neg++;
    else if (s === 'mixed') { pos += 0.5; neg += 0.5; }
  }
  const posRatio = pos / total;
  const negRatio = neg / total;
  if (posRatio >= 0.8) return 'positive';
  if (negRatio >= 0.8) return 'negative';
  if (pos > 0 && neg > 0) return 'mixed';
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

// ─── Quote Extraction ───────────────────────────────────────────────────────

function pickQuote(reviews, sentimentTarget) {
  // Pick a review whose sentiment matches the target, or the first one
  const match = reviews.find(r => detectSentiment(r) === sentimentTarget) || reviews[0];
  return match.length <= 140 ? match : match.substring(0, 137).trimEnd() + '…';
}

// ─── Complaint Extraction ───────────────────────────────────────────────────

function extractComplaintSummary(themeName, reviews) {
  // Summarise what customers actually said, not a generic description
  const negReviews = reviews.filter(r => ['negative', 'mixed'].includes(detectSentiment(r)));
  if (negReviews.length === 0) return `Customers mentioned ${themeName}.`;

  // Find the most common negative signal words in these reviews
  const allText = negReviews.join(' ').toLowerCase();
  const signals = NEGATIVE_WORDS.filter(w => allText.includes(w)).slice(0, 3);
  if (signals.length > 0) {
    return `Customers reported issues with ${themeName.toLowerCase()}: ${signals.join(', ')}.`;
  }
  return `${negReviews.length} customer${negReviews.length > 1 ? 's' : ''} expressed dissatisfaction with ${themeName.toLowerCase()}.`;
}

// ─── Evidence-based Fix Generation ─────────────────────────────────────────

function generateFix(themeName, category, reviews) {
  const negReviews = reviews.filter(r => ['negative', 'mixed'].includes(detectSentiment(r)));
  const allText = negReviews.map(r => r.toLowerCase()).join(' ');

  // Only generate fix if there's actual negative evidence
  if (negReviews.length < 1) return null;

  // Map specific observed signals to specific fixes
  const fixMap = {
    'Colour & Appearance': [
      { signal: ['fad', 'bleed', 'bleed after wash'], fix: 'Improve dye fixation to prevent colour fading or bleeding after washing.' },
      { signal: ['not as shown', 'looks different', 'misleading', 'mismatch', 'wrong colour', 'photo', 'image'], fix: 'Improve colour accuracy of product listing photos to match actual item.' },
    ],
    'Size & Fit': [
      { signal: ['too small', 'runs small', 'smaller than'], fix: 'Product runs small — update listing to recommend sizing up.' },
      { signal: ['too big', 'runs large', 'larger than'], fix: 'Product runs large — update listing to recommend sizing down.' },
      { signal: ['size chart', 'measurement', 'dimension'], fix: 'Standardise and verify the size chart against actual product measurements.' },
    ],
    'Fabric Quality': [
      { signal: ['thin', 'transparent', 'see-through'], fix: 'Customers found fabric too thin — review fabric weight with supplier.' },
      { signal: ['rough', 'scratchy', 'not soft'], fix: 'Address fabric texture complaints — review material sourcing.' },
      { signal: ['synthetic', 'not cotton', 'not silk', 'blend'], fix: 'Clarify fabric composition in listing to match actual material.' },
    ],
    'Stitching & Finish': [
      { signal: ['loose', 'unravel', 'fraying', 'coming apart', 'poorly stitched'], fix: 'Strengthen stitching quality checks before dispatch to reduce loose thread complaints.' },
      { signal: ['sequin', 'mirror', 'embroidery', 'falling off'], fix: 'Reinforce embellishment attachment to prevent items falling off after one use.' },
    ],
    'Print Quality': [
      { signal: ['fade after wash', 'washed off', 'peeling print', 'cracked print'], fix: 'Use higher-quality print process to prevent fading or cracking after washing.' },
    ],
    'Shrinkage & Wash': [
      { signal: ['shrink', 'shrank'], fix: 'Add wash care instructions to listing; address shrinkage with supplier.' },
      { signal: ['colour run', 'bleed after wash', 'faded after wash'], fix: 'Improve dye quality to prevent colour bleeding during washing.' },
    ],
    'Battery & Charging': [
      { signal: ['battery', 'drain', 'backup', 'does not last'], fix: 'Battery life is a recurring complaint — review product specifications with seller.' },
      { signal: ['slow charge', 'not charging', 'does not charge'], fix: 'Charging issues reported — seller should verify charger compatibility and cable quality.' },
    ],
    'Build Quality': [
      { signal: ['cracked', 'broke', 'fell apart', 'fragile'], fix: 'Multiple customers report breakage — review build materials with seller.' },
      { signal: ['cheap', 'flimsy', 'plastic', 'not premium'], fix: 'Customers feel build quality is below expectations — review listing description accuracy.' },
    ],
    'Performance': [
      { signal: ['slow', 'lag', 'hang', 'freeze'], fix: 'Performance complaints reported — verify product specifications match listing claims.' },
      { signal: ['stopped working', 'does not work', 'not working'], fix: 'Several customers report product stopped working — investigate with seller.' },
    ],
    'Assembly': [
      { signal: ['difficult to assemble', 'no instructions', 'missing parts'], fix: 'Improve assembly instructions and verify all parts are included before dispatch.' },
    ],
    'Durability': [
      { signal: ['broke', 'fell apart', 'after one use', 'one wash', 'cracked', 'peeling'], fix: 'Durability complaints are frequent — review product quality with seller.' },
    ],
    'Ease of Cleaning': [
      { signal: ['difficult to clean', 'hard to clean', 'residue stuck'], fix: 'Add cleaning instructions to listing; review product design for cleanability.' },
    ],
    'Effectiveness': [
      { signal: ['no effect', 'does not work', 'no change', 'no results'], fix: 'Effectiveness complaints reported — review product claims in listing for accuracy.' },
    ],
    'Skin Reaction': [
      { signal: ['rash', 'irritation', 'allergy', 'breakout', 'reaction'], fix: 'Skin reaction complaints reported — add ingredient list to listing; advise patch test.' },
    ],
    'Delivery & Packaging': [
      { signal: ['damaged', 'tampered', 'open box', 'broken in transit'], fix: 'Products arriving damaged — seller should improve protective packaging.' },
      { signal: ['late', 'delay', 'took too long', 'days'], fix: 'Delivery delays reported — review courier SLA for this seller and pin code.' },
      { signal: ['missing', 'wrong item'], fix: 'Wrong or missing items reported — review seller dispatch accuracy.' },
    ],
    'Value for Money': [
      { signal: ['overpriced', 'expensive', 'not worth'], fix: 'Customers feel product is overpriced for the quality received — review pricing relative to similar listings.' },
    ],
  };

  const themeFixOptions = fixMap[themeName] || [];
  for (const option of themeFixOptions) {
    if (option.signal.some(s => allText.includes(s))) {
      return option.fix;
    }
  }

  // Fallback: only if real negative evidence
  return `${negReviews.length} customer${negReviews.length > 1 ? 's' : ''} reported issues with ${themeName.toLowerCase()} — review with seller.`;
}

// ─── Evidence-based Auto Reply ──────────────────────────────────────────────

function generateReply(themeName, reviews, sentiment) {
  const negReviews = reviews.filter(r => ['negative', 'mixed'].includes(detectSentiment(r)));
  const posReviews = reviews.filter(r => detectSentiment(r) === 'positive');
  const allText = reviews.map(r => r.toLowerCase()).join(' ');

  if (sentiment === 'positive') {
    return `Thank you for the positive feedback about ${themeName.toLowerCase()}! We're glad the product met your expectations. Your review helps other customers make confident decisions.`;
  }

  // Build reply from specific signals found in reviews
  let issueDescription = themeName.toLowerCase();

  const specificSignals = {
    'Colour & Appearance': 'the colour not matching the listing photos',
    'Size & Fit': 'the size or fit not meeting expectations',
    'Fabric Quality': 'the fabric quality not meeting expectations',
    'Stitching & Finish': 'stitching or finish quality',
    'Print Quality': 'the print quality or durability after washing',
    'Shrinkage & Wash': 'shrinkage or colour changes after washing',
    'Battery & Charging': 'battery life or charging performance',
    'Build Quality': 'the build quality not meeting expectations',
    'Performance': 'performance issues with the product',
    'Connectivity': 'connectivity issues',
    'Sound & Display': 'sound or display quality',
    'Assembly': 'assembly difficulties',
    'Material & Finish': 'the material or finish quality',
    'Stability': 'product stability',
    'Dimensions': 'the dimensions not matching the listing',
    'Durability': 'the product not lasting as expected',
    'Ease of Cleaning': 'difficulty cleaning the product',
    'Functionality': 'the product not functioning as expected',
    'Effectiveness': 'the product not delivering the expected results',
    'Skin Reaction': 'a skin reaction to the product',
    'Fragrance & Texture': 'the fragrance or texture not meeting expectations',
    'Packaging & Authenticity': 'packaging or authenticity concerns',
    'Delivery & Packaging': 'delivery or packaging issues',
    'Value for Money': 'the product not feeling worth the price',
    'Returns & Support': 'a difficult returns or support experience',
    'Product Quality': 'the product quality not meeting expectations',
    'Size & Dimensions': 'the size or dimensions not matching the listing',
    'Overall Satisfaction': 'your experience with this product',
  };

  issueDescription = specificSignals[themeName] || issueDescription;

  let reply = `We're sorry to hear about ${issueDescription}.`;

  if (negReviews.length >= 3) {
    reply += ` This concern has been raised by multiple customers and we take it seriously.`;
  }

  reply += ` If your order is affected, please use the return or replacement option available in the Meesho app for eligible orders.`;

  if (['Colour & Appearance', 'Size & Fit', 'Fabric Quality', 'Size & Dimensions', 'Dimensions'].some(t => t === themeName)) {
    reply += ` We recommend checking the size chart and product photos carefully before ordering — if the listing is inaccurate, please report it using the "Report" option on the product page.`;
  }

  if (['Delivery & Packaging'].includes(themeName) && allText.includes('missing')) {
    reply += ` For missing items, please contact Meesho support immediately with your order ID and photos.`;
  }

  return reply;
}

// ─── Main Analysis ──────────────────────────────────────────────────────────

function analyzeReviews(rawReviews) {
  const lines = rawReviews
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 5);

  const totalReviews = lines.length;
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      overallSentiment: { positive: 0, neutral: 100, negative: 0 },
      productCategory: null,
      themes: [],
      topComplaints: [],
      topPraises: [],
      actions: [],
      autoReplies: []
    };
  }

  // Detect category
  const categoryKey = detectCategory(lines);
  const themeKeywords = categoryKey
    ? CATEGORIES[categoryKey].themes
    : UNIVERSAL_THEMES;

  // Match reviews to themes
  const themeMatches = {};
  for (const name of Object.keys(themeKeywords)) {
    themeMatches[name] = [];
  }

  let posCount = 0, negCount = 0, neutralCount = 0, mixedCount = 0;

  for (const review of lines) {
    const lower = review.toLowerCase();
    const s = detectSentiment(review);
    if (s === 'positive')      posCount++;
    else if (s === 'negative') negCount++;
    else if (s === 'mixed')    mixedCount++;
    else                       neutralCount++;

    for (const [name, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        themeMatches[name].push(review);
      }
    }
  }

  // Build themes — only include ones with actual matches
  const themes = Object.entries(themeMatches)
    .filter(([_, reviews]) => reviews.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, reviews]) => {
      const sentiment = determineThemeSentiment(reviews);
      const preferredQuoteSentiment = sentiment === 'positive' ? 'positive' : 'negative';
      return {
        name,
        count: reviews.length,
        sentiment,
        sampleQuote: pickQuote(reviews, preferredQuoteSentiment)
      };
    });

  // Top complaints: negative/mixed themes ranked by negative review count
  const complaintThemes = themes.filter(t => t.sentiment === 'negative' || t.sentiment === 'mixed');
  const praiseThemes = themes.filter(t => t.sentiment === 'positive');

  const topComplaints = complaintThemes.slice(0, 5).map(t => {
    const negCount = themeMatches[t.name].filter(r =>
      ['negative', 'mixed'].includes(detectSentiment(r))
    ).length;
    return `${t.name} — ${negCount} negative mention${negCount !== 1 ? 's' : ''} out of ${t.count} total`;
  });

  const topPraises = praiseThemes.slice(0, 5).map(t =>
    `${t.name} — praised in ${t.count} review${t.count !== 1 ? 's' : ''}`
  );

  // Actions with Fix Now / Big Fix tags
  const FIX_NOW_THEMES = new Set([
    'Colour & Appearance', 'Colour Accuracy', 'Size & Fit', 'Size & Dimensions',
    'Dimensions', 'Delivery & Packaging', 'Value for Money', 'Returns & Support',
    'Colour & Dye', 'Packaging & Delivery', 'Packaging & Authenticity', 'Delivery'
  ]);

  const rawActions = complaintThemes
    .slice(0, 5)
    .map(t => {
      const fix = generateFix(t.name, categoryKey, themeMatches[t.name]);
      if (!fix) return null;
      return {
        text: fix,
        type: FIX_NOW_THEMES.has(t.name) ? 'fix_now' : 'big_fix',
        theme: t.name
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  const actions = rawActions.length > 0
    ? rawActions
    : complaintThemes.length === 0
      ? [{ text: 'No significant complaints detected in the provided reviews.', type: 'fix_now', theme: null }]
      : [];

  // Auto-replies for all detected themes
  const autoReplies = themes.map((theme, idx) => ({
    id: idx + 1,
    theme: theme.name,
    complaintPattern: extractComplaintSummary(theme.name, themeMatches[theme.name]),
    affectedReviewsCount: theme.count,
    suggestedReply: generateReply(theme.name, themeMatches[theme.name], theme.sentiment),
    status: 'draft'
  }));

  // Mixed reviews split 0.5/0.5 into positive and negative (not silently neutral).
  // Cap negPercent so the two independently rounded values never sum past 100
  // (each can gain up to +0.5 from the mixed split, producing 101 otherwise).
  const effectivePos = posCount + mixedCount * 0.5;
  const effectiveNeg = negCount + mixedCount * 0.5;
  const posPercent     = Math.round((effectivePos / totalReviews) * 100);
  const negPercent     = Math.min(Math.round((effectiveNeg / totalReviews) * 100), 100 - posPercent);
  const neutralPercent = Math.max(0, 100 - posPercent - negPercent);

  // ─── Health Score ────────────────────────────────────────────────────────
  const CATEGORY_BENCHMARKS = {
    clothing:    { positive: 65, neutral: 18, negative: 17 },
    electronics: { positive: 58, neutral: 20, negative: 22 },
    furniture:   { positive: 62, neutral: 22, negative: 16 },
    kitchen:     { positive: 67, neutral: 19, negative: 14 },
    beauty:      { positive: 60, neutral: 22, negative: 18 },
  };
  const DEFAULT_BENCHMARK = { positive: 63, neutral: 20, negative: 17 };
  const benchmark = CATEGORY_BENCHMARKS[categoryKey] || DEFAULT_BENCHMARK;

  let healthScore = 100;
  healthScore -= negPercent * 0.8;
  const highPriority = complaintThemes.filter(t => t.sentiment === 'negative' && t.count >= 5).length;
  const medPriority  = complaintThemes.filter(t => t.sentiment === 'negative' && t.count < 5).length;
  const mixedThemes  = complaintThemes.filter(t => t.sentiment === 'mixed').length;
  healthScore -= highPriority * 8;
  healthScore -= medPriority  * 4;
  healthScore -= mixedThemes  * 2;
  healthScore += praiseThemes.length * 3;
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  const healthGrade =
    healthScore >= 80 ? 'A' :
    healthScore >= 65 ? 'B' :
    healthScore >= 50 ? 'C' :
    healthScore >= 35 ? 'D' : 'F';

  return {
    totalReviews,
    productCategory: categoryKey,
    overallSentiment: {
      positive: posPercent,
      neutral: neutralPercent,
      negative: negPercent
    },
    benchmark,
    healthScore,
    healthGrade,
    themes,
    topComplaints,
    topPraises,
    actions,
    autoReplies
  };
}

module.exports = { analyzeReviews, setSentimentOverride };
