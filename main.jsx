import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Award,
  BarChart3,
  Camera,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Download,
  Eye,
  Flame,
  Gamepad2,
  Gift,
  HeartPulse,
  LineChart,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Video
} from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './styles.css';

const EXERCISES = [
  {
    id: 'smile',
    title: 'Rainbow Smile',
    short: 'Smile evenly',
    prompt: 'Lift both corners of your mouth into a bright, even smile.',
    target: 'even smile',
    shape: 'wide grin',
    color: '#2f80ed',
    icon: 'smile',
    tips: ['Show your smile on both sides', 'Keep your head still', 'Try matching the rainbow arc']
  },
  {
    id: 'open',
    title: 'Lion Ahh',
    short: 'Open and close',
    prompt: 'Open your mouth for “ah,” then gently close it.',
    target: 'mouth opening',
    shape: 'ah',
    color: '#f2994a',
    icon: 'ah',
    tips: ['Open a little wider', 'Relax your jaw', 'Close softly before the next round']
  },
  {
    id: 'jaw',
    title: 'Side Glide',
    short: 'Jaw side to side',
    prompt: 'Move your jaw slowly left and right like following a small train track.',
    target: 'jaw range',
    shape: 'side arrows',
    color: '#27ae60',
    icon: 'jaw',
    tips: ['Slide left and right', 'Move slowly', 'Keep your lips relaxed']
  },
  {
    id: 'cheeks',
    title: 'Balloon Cheeks',
    short: 'Puff cheeks',
    prompt: 'Fill your cheeks with air and hold the balloon steady.',
    target: 'cheek movement',
    shape: 'puff',
    color: '#9b51e0',
    icon: 'cheeks',
    tips: ['Puff both cheeks', 'Hold the air gently', 'Try to keep both sides even']
  },
  {
    id: 'lips',
    title: 'Seal the Door',
    short: 'Lip closure',
    prompt: 'Close your lips together like saying “mmm.”',
    target: 'lip closure',
    shape: 'mmm',
    color: '#eb5757',
    icon: 'lips',
    tips: ['Close your lips a little more', 'Keep teeth apart if comfortable', 'Hold steady']
  },
  {
    id: 'shapes',
    title: 'Sound Shapes',
    short: 'Ah, ee, oh, mmm',
    prompt: 'Match each mouth shape as it appears: ah, ee, oh, then mmm.',
    target: 'expression matching',
    shape: 'sequence',
    color: '#00a7a5',
    icon: 'shapes',
    tips: ['Copy the shape on screen', 'Move smoothly between sounds', 'Hold each shape for a moment']
  },
  {
    id: 'chew',
    title: 'Crunch Tracker',
    short: 'Chewing motion',
    prompt: 'Practice a gentle chewing-like jaw motion with steady rhythm.',
    target: 'movement consistency',
    shape: 'chew',
    color: '#7f8c8d',
    icon: 'chew',
    tips: ['Use small comfortable motions', 'Keep the rhythm steady', 'Rest whenever needed']
  }
];

const LANDMARK_CONNECTIONS = [
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291],
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291],
  [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308],
  [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308],
  [33, 160], [160, 158], [158, 133], [362, 385], [385, 387], [387, 263],
  [70, 63], [63, 105], [300, 293], [293, 334],
  [50, 101], [101, 36], [280, 330], [330, 266], [152, 199], [199, 1]
];

const HISTORY_KEY = 'brightmouth-session-history';

const SESSION_PLANS = [
  {
    id: 'speech',
    label: 'Speech shapes',
    helper: 'Mouth shapes, lip closure, and even smile control',
    exercises: ['open', 'shapes', 'lips', 'smile']
  },
  {
    id: 'chewing',
    label: 'Chewing practice',
    helper: 'Jaw range, cheek control, and rhythmic motion',
    exercises: ['jaw', 'chew', 'cheeks', 'lips']
  },
  {
    id: 'balanced',
    label: 'Full facial warmup',
    helper: 'All activities in a short home-practice session',
    exercises: EXERCISES.map((exercise) => exercise.id)
  }
];

const DIFFICULTY = {
  gentle: { label: 'Gentle', target: 62, multiplier: 0.9 },
  standard: { label: 'Standard', target: 76, multiplier: 1 },
  challenge: { label: 'Challenge', target: 86, multiplier: 1.08 }
};

const HELPER_CREW = [
  {
    id: 'nova',
    name: 'Nova',
    role: 'Smile pilot',
    unlockLevel: 1,
    boost: 'Even smiles'
  },
  {
    id: 'mira',
    name: 'Mira',
    role: 'Mirror guide',
    unlockLevel: 2,
    boost: 'Left-right balance'
  },
  {
    id: 'pulse',
    name: 'Pulse',
    role: 'Rhythm coach',
    unlockLevel: 3,
    boost: 'Chewing rhythm'
  }
];

const DAILY_CHALLENGES = [
  {
    id: 'warmup',
    title: 'Warmup launch',
    description: 'Calibrate and score any movement above 50%.',
    xp: 80
  },
  {
    id: 'balance',
    title: 'Balance bridge',
    description: 'Reach 70% left-right balance or lip symmetry.',
    xp: 120
  },
  {
    id: 'collector',
    title: 'Badge collector',
    description: 'Complete two exercise badges in today’s plan.',
    xp: 160
  }
];

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function getExerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id) || EXERCISES[0];
}

function getPlanExercises(planId) {
  return SESSION_PLANS.find((plan) => plan.id === planId)?.exercises || SESSION_PLANS[0].exercises;
}

function getGuidance(exerciseId, metrics) {
  if (!metrics) {
    return ['Place the child in good light', 'Keep the face centered', 'Start with a relaxed mouth'];
  }

  const guidance = {
    smile: [
      metrics.lipSymmetryScore < 70 ? 'Watch the left-right smile balance.' : 'Smile balance is looking steady.',
      metrics.smileScore < 70 ? 'Invite a gentle wider smile.' : 'The smile lift is strong.',
      'Avoid pushing into discomfort.'
    ],
    open: [
      metrics.mouthOpenScore < 70 ? 'Cue a bigger comfortable ah opening.' : 'Mouth opening is meeting the target.',
      metrics.balanceScore < 72 ? 'Keep the chin centered while opening.' : 'Jaw stays nicely centered.',
      'Close softly between tries.'
    ],
    jaw: [
      metrics.jawRangeScore < 65 ? 'Try a small glide farther left and right.' : 'Side-to-side range is improving.',
      metrics.consistencyPulse > 80 ? 'Slow the glide slightly for control.' : 'Keep the glide slow and even.',
      'Stop if the jaw feels tired.'
    ],
    cheeks: [
      metrics.cheekScore < 65 ? 'Try filling both cheeks with a little more air.' : 'Cheek puff is visible.',
      metrics.cheekBalanceScore < 76 ? 'Look for equal cheek fullness.' : 'Both cheeks look balanced.',
      'Use short holds and easy breathing breaks.'
    ],
    lips: [
      metrics.lipClosureScore < 76 ? 'Try closing the lips a little more for mmm.' : 'Lip closure is strong.',
      metrics.balanceScore < 72 ? 'Keep closure centered, not pulled to one side.' : 'Closure balance looks steady.',
      'Keep the jaw relaxed.'
    ],
    shapes: [
      'Move smoothly from ah to ee to oh to mmm.',
      metrics.balanceScore < 72 ? 'Keep the shapes centered.' : 'Shape balance is steady.',
      'Hold each shape for one calm beat.'
    ],
    chew: [
      metrics.consistencyPulse < 42 ? 'Try a small repeated chewing motion.' : 'Rhythm is being detected.',
      metrics.balanceScore < 72 ? 'Watch for drifting to one side.' : 'Left-right balance is steady.',
      'Use gentle, pretend chewing only.'
    ]
  };

  return guidance[exerciseId] || guidance.smile;
}

function getInsight(progress) {
  const items = EXERCISES.map((exercise) => ({
    ...exercise,
    score: progress[exercise.id]?.score || 0,
    completed: Boolean(progress[exercise.id]?.completed)
  })).sort((a, b) => a.score - b.score);

  const focus = items[0];
  const strength = [...items].sort((a, b) => b.score - a.score)[0];

  return {
    focus: focus?.score > 0 ? focus : null,
    strength: strength?.score > 0 ? strength : null,
    completed: items.filter((item) => item.completed).length
  };
}

function getGameState({ progress, metrics, completionCount, planExerciseIds, sessionSeconds, calibrationState, peakXp = 0 }) {
  const scores = Object.values(progress).map((item) => item.score || 0);
  const samples = Object.values(progress).reduce((sum, item) => sum + (item.samples || 0), 0);
  const completed = completionCount;
  const scoreXp = scores.reduce((sum, score) => sum + Math.round(score * 2), 0);
  const badgeXp = completed * 180;
  const practiceXp = Math.min(240, Math.round(sessionSeconds * 2 + samples * 2));
  const calibrationXp = calibrationState === 'ready' ? 75 : 0;
  const challengeChecks = {
    warmup: calibrationState === 'ready' && scores.some((score) => score >= 50),
    balance: (metrics?.balanceScore || 0) >= 70 || (metrics?.lipSymmetryScore || 0) >= 70,
    collector: completed >= Math.min(2, planExerciseIds.length)
  };
  const challengeXp = DAILY_CHALLENGES.reduce((sum, challenge) => sum + (challengeChecks[challenge.id] ? challenge.xp : 0), 0);
  const rawXp = scoreXp + badgeXp + practiceXp + calibrationXp + challengeXp;
  const xp = Math.max(rawXp, peakXp);
  const level = Math.floor(xp / 500) + 1;
  const xpIntoLevel = xp % 500;
  const stars = completed * 3 + scores.filter((score) => score >= 85).length + Object.values(challengeChecks).filter(Boolean).length;
  const combo = Math.min(5, Math.floor((scores.filter((score) => score >= 70).length + completed) / 2));
  const activeCrew = HELPER_CREW.filter((helper) => helper.unlockLevel <= level);

  return {
    xp,
    level,
    xpIntoLevel,
    stars,
    combo,
    activeCrew,
    challenges: DAILY_CHALLENGES.map((challenge) => ({
      ...challenge,
      complete: Boolean(challengeChecks[challenge.id])
    }))
  };
}

function getMilestoneCalendar(history, progress) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const sessionByDate = new Map();

  history.forEach((session) => {
    const key = new Date(session.date).toISOString().slice(0, 10);
    const existing = sessionByDate.get(key) || { sessions: 0, badges: 0, bestScore: 0 };
    sessionByDate.set(key, {
      sessions: existing.sessions + 1,
      badges: existing.badges + (session.completed || 0),
      bestScore: Math.max(existing.bestScore, session.averageScore || 0)
    });
  });

  const todayKey = today.toISOString().slice(0, 10);
  const currentBadges = Object.values(progress).filter((item) => item.completed).length;
  const currentBest = Math.round(average(Object.values(progress).map((item) => item.score || 0)));
  if (currentBadges || currentBest) {
    const existing = sessionByDate.get(todayKey) || { sessions: 0, badges: 0, bestScore: 0 };
    sessionByDate.set(todayKey, {
      sessions: Math.max(1, existing.sessions),
      badges: Math.max(existing.badges, currentBadges),
      bestScore: Math.max(existing.bestScore, currentBest)
    });
  }

  const cells = [];
  for (let index = 0; index < startOffset; index += 1) {
    cells.push({ id: `blank-${index}`, blank: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = date.toISOString().slice(0, 10);
    const data = sessionByDate.get(key);
    cells.push({
      id: key,
      day,
      today: key === todayKey,
      practiced: Boolean(data),
      badges: data?.badges || 0,
      bestScore: data?.bestScore || 0
    });
  }

  const practicedDays = [...sessionByDate.values()].filter((day) => day.sessions > 0).length;
  const bestDay = [...sessionByDate.entries()].sort((a, b) => b[1].bestScore - a[1].bestScore)[0];
  const nextGoals = [
    currentBadges >= 2 ? 'Try a consistency streak on the next practice day.' : 'Earn two badges in one session.',
    currentBest >= 75 ? 'Move up one difficulty when a clinician agrees.' : 'Reach a 75% average score.',
    practicedDays >= 3 ? 'Keep the weekly practice routine going.' : 'Practice on three different days this month.'
  ];

  return {
    label: today.toLocaleDateString([], { month: 'long', year: 'numeric' }),
    cells,
    practicedDays,
    bestDay: bestDay ? { date: bestDay[0], ...bestDay[1] } : null,
    nextGoals
  };
}

function useLocalHistory() {
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const saveSession = useCallback((session) => {
    setHistory((current) => {
      const next = [session, ...current].slice(0, 12);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, saveSession, clearHistory };
}

function calculateMetrics(landmarks, baselineRef, previousRef) {
  if (!landmarks?.length) {
    return null;
  }

  const mouthWidth = distance(landmarks[61], landmarks[291]) || 0.001;
  const faceWidth = distance(landmarks[234], landmarks[454]) || 0.001;
  const mouthOpen = distance(landmarks[13], landmarks[14]) / mouthWidth;
  const lipSeal = 1 - clamp(mouthOpen * 5, 0, 1);
  const leftSmile = landmarks[61].y - landmarks[13].y;
  const rightSmile = landmarks[291].y - landmarks[13].y;
  const smileLift = clamp(((leftSmile + rightSmile) / 2) / mouthWidth * 120, 0, 1);
  const lipSymmetry = 1 - clamp(Math.abs(leftSmile - rightSmile) / mouthWidth * 4, 0, 1);
  const noseX = landmarks[1].x;
  const jawOffset = (landmarks[152].x - noseX) / faceWidth;
  const cheekSpread = distance(landmarks[50], landmarks[280]) / faceWidth;
  const browLift = ((landmarks[70].y + landmarks[300].y) / 2) - landmarks[10].y;
  const eyeOpen = (distance(landmarks[159], landmarks[145]) + distance(landmarks[386], landmarks[374])) / 2 / faceWidth;

  if (!baselineRef.current) {
    baselineRef.current = { cheekSpread, jawCenter: jawOffset, browLift, eyeOpen };
  }

  const previous = previousRef.current;
  const jawVelocity = previous ? Math.abs(jawOffset - previous.jawOffset) : 0;
  const openVelocity = previous ? Math.abs(mouthOpen - previous.mouthOpen) : 0;
  previousRef.current = { jawOffset, mouthOpen };

  return {
    mouthOpen,
    mouthOpenScore: clamp((mouthOpen - 0.08) * 360),
    lipClosureScore: clamp(lipSeal * 120),
    lipSymmetryScore: clamp(lipSymmetry * 100),
    smileScore: clamp(smileLift * 70 + lipSymmetry * 35),
    jawOffset,
    jawRangeScore: clamp(Math.abs(jawOffset - baselineRef.current.jawCenter) * 1200),
    cheekScore: clamp((cheekSpread - baselineRef.current.cheekSpread + 0.015) * 1200),
    cheekBalanceScore: clamp((1 - Math.abs(distance(landmarks[50], landmarks[1]) - distance(landmarks[280], landmarks[1])) / faceWidth * 3) * 100),
    eyeBrowScore: clamp((eyeOpen * 900 + Math.abs(browLift - baselineRef.current.browLift) * 400) / 2),
    consistencyPulse: clamp((jawVelocity + openVelocity) * 1400),
    balanceScore: clamp((lipSymmetry * 0.7 + (1 - Math.abs(jawOffset) * 4) * 0.3) * 100),
    raw: { cheekSpread, faceWidth, mouthWidth, jawVelocity, openVelocity }
  };
}

function scoreExercise(exerciseId, metrics, shapeStep) {
  if (!metrics) {
    return { score: 0, message: 'Move your face into the camera circle to begin.', done: false };
  }

  const shapeTarget = shapeStep % 4;
  const shapeScores = [
    metrics.mouthOpenScore,
    clamp(metrics.smileScore * 0.75 + metrics.lipSymmetryScore * 0.35),
    clamp((metrics.lipClosureScore * 0.35) + (100 - metrics.mouthOpenScore) * 0.25 + metrics.balanceScore * 0.4),
    metrics.lipClosureScore
  ];

  const map = {
    smile: {
      score: clamp(metrics.smileScore * 0.7 + metrics.lipSymmetryScore * 0.3),
      message: metrics.lipSymmetryScore > 78 ? 'Great even smile!' : 'Try lifting both mouth corners together.'
    },
    open: {
      score: metrics.mouthOpenScore,
      message: metrics.mouthOpenScore > 72 ? 'Great job opening your mouth wider!' : 'Try opening your mouth a little more for ah.'
    },
    jaw: {
      score: metrics.jawRangeScore,
      message: metrics.jawRangeScore > 65 ? 'Nice side-to-side jaw glide.' : 'Slide your jaw gently left or right.'
    },
    cheeks: {
      score: clamp(metrics.cheekScore * 0.65 + metrics.cheekBalanceScore * 0.35),
      message: metrics.cheekBalanceScore > 76 ? 'Good balloon cheeks on both sides!' : 'Try puffing both cheeks evenly.'
    },
    lips: {
      score: metrics.lipClosureScore,
      message: metrics.lipClosureScore > 76 ? 'Great lip closure for mmm.' : 'Try closing your lips a little more.'
    },
    shapes: {
      score: shapeScores[shapeTarget],
      message: ['Make a big ah shape.', 'Stretch into ee with an even smile.', 'Round your lips for oh.', 'Close your lips for mmm.'][shapeTarget]
    },
    chew: {
      score: clamp(metrics.consistencyPulse * 0.55 + metrics.balanceScore * 0.45),
      message: metrics.consistencyPulse > 48 ? 'Steady chewing rhythm. Keep it gentle.' : 'Try a small repeated chewing motion.'
    }
  };

  const current = map[exerciseId] || map.smile;
  return { ...current, done: current.score >= 78 };
}

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(0);
  const baselineRef = useRef(null);
  const previousRef = useRef(null);
  const scoreWindowRef = useRef([]);
  const completedRef = useRef(new Set());
  const sessionStartRef = useRef(Date.now());
  const shapeTimerRef = useRef(Date.now());
  const calibrationStartRef = useRef(0);

  const [cameraState, setCameraState] = useState('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [feedback, setFeedback] = useState('Start the camera when you are ready.');
  const [progress, setProgress] = useState({});
  const [running, setRunning] = useState(false);
  const [view, setView] = useState('coach');
  const [shapeStep, setShapeStep] = useState(0);
  const [planId, setPlanId] = useState('balanced');
  const [difficulty, setDifficulty] = useState('standard');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [calibrationState, setCalibrationState] = useState('needed');
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [caregiverNote, setCaregiverNote] = useState('');
  const [lastSavedSession, setLastSavedSession] = useState(null);
  const [peakXp, setPeakXp] = useState(0);
  const { history, saveSession, clearHistory } = useLocalHistory();

  const planExerciseIds = getPlanExercises(planId);
  const activeExerciseId = planExerciseIds[activeIndex % planExerciseIds.length];
  const targetScore = DIFFICULTY[difficulty].target;
  const activeExercise = getExerciseById(activeExerciseId);
  const activeScore = progress[activeExercise.id]?.score || 0;
  const completionCount = planExerciseIds.filter((id) => progress[id]?.completed).length;
  const totalScore = Math.round(average(Object.values(progress).map((item) => item.score)));
  const guidance = useMemo(() => getGuidance(activeExercise.id, metrics), [activeExercise.id, metrics]);
  const sessionInsight = useMemo(() => getInsight(progress), [progress]);
  const milestoneCalendar = useMemo(() => getMilestoneCalendar(history, progress), [history, progress]);
  const gameState = useMemo(
    () => getGameState({ progress, metrics, completionCount, planExerciseIds, sessionSeconds, calibrationState, peakXp }),
    [calibrationState, completionCount, metrics, peakXp, planExerciseIds, progress, sessionSeconds]
  );

  useEffect(() => {
    setPeakXp((current) => Math.max(current, gameState.xp));
  }, [gameState.xp]);

  const summary = useMemo(() => {
    const latest = history[0];
    const previous = history[1];
    const delta = latest && previous ? latest.averageScore - previous.averageScore : 0;
    return { latest, previous, delta };
  }, [history]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const drawOverlay = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    const width = video.videoWidth || 960;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!landmarks?.length) return;

    ctx.save();
    ctx.lineWidth = Math.max(2, width / 420);
    ctx.strokeStyle = 'rgba(31, 117, 255, 0.78)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    LANDMARK_CONNECTIONS.forEach(([start, end]) => {
      const a = landmarks[start];
      const b = landmarks[end];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    });

    [13, 14, 61, 291, 50, 280, 152, 70, 300, 33, 263].forEach((index) => {
      const point = landmarks[index];
      if (!point) return;
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, Math.max(3, width / 180), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }, []);

  const updateProgress = useCallback((exercise, score, done, message) => {
    setFeedback(message);
    setProgress((current) => {
      const prior = current[exercise.id] || { score: 0, completed: false };
      const nextScore = Math.round(Math.max(prior.score, score));
      const completed = prior.completed || done || nextScore >= targetScore;
      if (completed) completedRef.current.add(exercise.id);
      return {
        ...current,
        [exercise.id]: {
          score: nextScore,
          completed,
          samples: (prior.samples || 0) + 1
        }
      };
    });
  }, [targetScore]);

  const finishSession = useCallback(() => {
    const items = EXERCISES.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      score: progress[exercise.id]?.score || 0,
      completed: Boolean(progress[exercise.id]?.completed)
    }));
    const plan = SESSION_PLANS.find((entry) => entry.id === planId);
    const session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
      averageScore: Math.round(average(items.map((item) => item.score))),
      completed: items.filter((item) => item.completed).length,
      plan: plan?.label || 'Custom session',
      difficulty: DIFFICULTY[difficulty].label,
      caregiverNote: caregiverNote.trim(),
      focus: sessionInsight.focus?.title || '',
      strength: sessionInsight.strength?.title || '',
      level: gameState.level,
      xp: gameState.xp,
      stars: gameState.stars,
      items
    };
    saveSession(session);
    setLastSavedSession(session);
    setView('summary');
  }, [caregiverNote, difficulty, gameState.level, gameState.stars, gameState.xp, planId, progress, saveSession, sessionInsight.focus, sessionInsight.strength]);

  const runDetection = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2 || !running) {
      rafRef.current = requestAnimationFrame(runDetection);
      return;
    }

    const now = performance.now();
    const result = landmarker.detectForVideo(video, now);
    const landmarks = result.faceLandmarks?.[0];
    drawOverlay(landmarks);

    const nextMetrics = calculateMetrics(landmarks, baselineRef, previousRef);
    setMetrics(nextMetrics);

    if (calibrationState === 'capturing') {
      const elapsed = Date.now() - calibrationStartRef.current;
      setCalibrationProgress(clamp((elapsed / 3000) * 100));
      setFeedback('Hold a relaxed, comfortable face for neutral calibration.');
      if (elapsed >= 3000) {
        setCalibrationState('ready');
        setCalibrationProgress(100);
        setFeedback('Calibration complete. Start the first activity when ready.');
      }
      rafRef.current = requestAnimationFrame(runDetection);
      return;
    }

    if (Date.now() - shapeTimerRef.current > 1800) {
      shapeTimerRef.current = Date.now();
      setShapeStep((step) => step + 1);
    }

    const exercise = activeExercise;
    const scored = scoreExercise(exercise.id, nextMetrics, shapeStep);
    const adjustedScore = clamp(scored.score / DIFFICULTY[difficulty].multiplier);
    scoreWindowRef.current = [...scoreWindowRef.current.slice(-8), adjustedScore];
    updateProgress(exercise, average(scoreWindowRef.current), scored.done, scored.message);

    rafRef.current = requestAnimationFrame(runDetection);
  }, [activeExercise, calibrationState, difficulty, drawOverlay, running, shapeStep, updateProgress]);

  const startCamera = useCallback(async () => {
    try {
      setCameraState('loading');
      const fileset = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm');
      landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      baselineRef.current = null;
      previousRef.current = null;
      sessionStartRef.current = Date.now();
      setSessionSeconds(0);
      setRunning(true);
      setCameraState('ready');
      setCalibrationState('needed');
      setCalibrationProgress(0);
      setFeedback('Camera ready. Calibrate with a relaxed face before scoring.');
    } catch (error) {
      setCameraState('error');
      setFeedback('Camera or face tracking could not start. Check browser camera permission and try again.');
      console.error(error);
    }
  }, []);

  const beginCalibration = useCallback(() => {
    baselineRef.current = null;
    previousRef.current = null;
    scoreWindowRef.current = [];
    calibrationStartRef.current = Date.now();
    setCalibrationProgress(0);
    setCalibrationState('capturing');
    setRunning(true);
    setFeedback('Hold still with a relaxed mouth for three seconds.');
  }, []);

  const toggleRunning = useCallback(() => {
    setRunning((value) => !value);
  }, []);

  const resetSession = useCallback(() => {
    completedRef.current = new Set();
    baselineRef.current = null;
    previousRef.current = null;
    scoreWindowRef.current = [];
    sessionStartRef.current = Date.now();
    setSessionSeconds(0);
    setProgress({});
    setMetrics(null);
    setCaregiverNote('');
    setLastSavedSession(null);
    setCalibrationState('needed');
    setCalibrationProgress(0);
    setPeakXp(0);
    setFeedback('Session reset. Start with a comfortable face position.');
    setView('coach');
  }, []);

  const exportReport = useCallback((session = lastSavedSession) => {
    const reportSession = session || {
      date: new Date().toISOString(),
      durationSeconds: sessionSeconds,
      averageScore: totalScore,
      completed: completionCount,
      plan: SESSION_PLANS.find((entry) => entry.id === planId)?.label,
      difficulty: DIFFICULTY[difficulty].label,
      caregiverNote,
      focus: sessionInsight.focus?.title || '',
      strength: sessionInsight.strength?.title || '',
      level: gameState.level,
      xp: gameState.xp,
      stars: gameState.stars,
      items: EXERCISES.map((exercise) => ({
        title: exercise.title,
        score: progress[exercise.id]?.score || 0,
        completed: Boolean(progress[exercise.id]?.completed)
      }))
    };

    const lines = [
      'BrightMouth Practice Summary',
      `Date: ${new Date(reportSession.date).toLocaleString()}`,
      `Plan: ${reportSession.plan}`,
      `Difficulty: ${reportSession.difficulty}`,
      `Duration: ${formatDuration(reportSession.durationSeconds || 0)}`,
      `Average score: ${reportSession.averageScore || 0}%`,
      `Badges completed: ${reportSession.completed || 0}/${EXERCISES.length}`,
      `Game level: ${reportSession.level || 1}`,
      `XP earned: ${reportSession.xp || 0}`,
      `Stars collected: ${reportSession.stars || 0}`,
      reportSession.strength ? `Observed strength: ${reportSession.strength}` : '',
      reportSession.focus ? `Suggested focus: ${reportSession.focus}` : '',
      '',
      'Exercise scores:',
      ...(reportSession.items || []).map((item) => `- ${item.title}: ${Math.round(item.score || 0)}%${item.completed ? ' (badge)' : ''}`),
      '',
      'Caregiver notes:',
      reportSession.caregiverNote || 'No notes entered.',
      '',
      'Disclaimer: This report is for home-practice discussion only and is not a diagnosis or treatment plan.'
    ].filter((line) => line !== '');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brightmouth-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [caregiverNote, completionCount, difficulty, gameState.level, gameState.stars, gameState.xp, lastSavedSession, planId, progress, sessionInsight.focus, sessionInsight.strength, sessionSeconds, totalScore]);

  useEffect(() => {
    if (running) {
      stopLoop();
      rafRef.current = requestAnimationFrame(runDetection);
    }
    return stopLoop;
  }, [runDetection, running, stopLoop]);

  useEffect(() => {
    scoreWindowRef.current = [];
    baselineRef.current = null;
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
    scoreWindowRef.current = [];
  }, [planId]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setSessionSeconds(Math.round((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!autoAdvance || calibrationState !== 'ready') return;
    if (!progress[activeExercise.id]?.completed) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % planExerciseIds.length);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [activeExercise.id, autoAdvance, calibrationState, planExerciseIds.length, progress]);

  useEffect(() => {
    return () => {
      stopLoop();
      const stream = videoRef.current?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
    };
  }, [stopLoop]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><HeartPulse size={24} /></div>
          <div>
            <p>BrightMouth</p>
            <span>Facial-motor therapy practice coach</span>
          </div>
        </div>
        <nav className="tabs" aria-label="Views">
          <button className={view === 'coach' ? 'active' : ''} onClick={() => setView('coach')}><Video size={18} />Coach</button>
          <button className={view === 'summary' ? 'active' : ''} onClick={() => setView('summary')}><BarChart3 size={18} />Summary</button>
        </nav>
      </header>

      <section className="session-strip" aria-label="Session setup">
        <label>
          <ClipboardList size={18} />
          <span>Plan</span>
          <select value={planId} onChange={(event) => setPlanId(event.target.value)}>
            {SESSION_PLANS.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
          </select>
        </label>
        <label>
          <Settings size={18} />
          <span>Level</span>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            {Object.entries(DIFFICULTY).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
          </select>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={autoAdvance} onChange={(event) => setAutoAdvance(event.target.checked)} />
          <span>Auto advance</span>
        </label>
        <div className="session-stat"><Timer size={18} /><strong>{formatDuration(sessionSeconds)}</strong><span>session</span></div>
        <div className="session-stat"><Target size={18} /><strong>{targetScore}%</strong><span>badge target</span></div>
        <div className="session-stat game-stat"><Flame size={18} /><strong>Lv {gameState.level}</strong><span>{gameState.xp} XP</span></div>
      </section>

      <main>
        {view === 'coach' ? (
          <section className="coach-grid">
            <div className="camera-panel">
              <div className="camera-header">
                <div>
                  <h1>Practice with friendly face tracking</h1>
                  <p>Follow the prompt, watch the overlay, and collect badges as each movement becomes steadier.</p>
                </div>
                <div className={`status ${cameraState}`}>
                  <span />
                  {cameraState === 'ready' ? `Tracking ${calibrationState === 'ready' ? 'calibrated' : 'ready'}` : cameraState === 'loading' ? 'Starting camera' : cameraState === 'error' ? 'Needs permission' : 'Camera off'}
                </div>
              </div>

              <div className="video-stage">
                <div className="camera-frame">
                  <video ref={videoRef} playsInline muted />
                  <canvas ref={canvasRef} />
                  {cameraState !== 'ready' && (
                    <div className="camera-empty">
                      <Camera size={48} />
                      <h2>Camera preview</h2>
                      <p>Webcam access stays in your browser. Landmark measurements are used only for this practice session.</p>
                      <button className="primary" onClick={startCamera}><Camera size={18} />Start camera</button>
                    </div>
                  )}
                </div>
                <GameHud gameState={gameState} activeScore={activeScore} targetScore={targetScore} />
                <div className="motion-card" style={{ '--exercise': activeExercise.color }}>
                  <AnimatedPrompt exercise={activeExercise} step={shapeStep} score={activeScore} />
                </div>
              </div>

              <div className="control-row">
                <button onClick={() => setActiveIndex((index) => (index + planExerciseIds.length - 1) % planExerciseIds.length)}><ChevronLeft size={18} />Previous</button>
                <button onClick={cameraState === 'ready' ? toggleRunning : startCamera} className="primary">
                  {running ? <Pause size={18} /> : <Play size={18} />}
                  {cameraState === 'ready' ? (running ? 'Pause' : 'Resume') : 'Start'}
                </button>
                <button onClick={beginCalibration}><Eye size={18} />Calibrate</button>
                <button onClick={() => setActiveIndex((index) => (index + 1) % planExerciseIds.length)}>Next<ChevronRight size={18} /></button>
                <button onClick={resetSession}><RefreshCw size={18} />Reset</button>
                <button onClick={finishSession} className="success"><Trophy size={18} />Finish</button>
              </div>

              <div className="under-camera-grid">
                <MetricGrid metrics={metrics} />

                <div className="badges">
                  <div className="section-heading">
                    <h2>Completion badges</h2>
                    <span>{completionCount}/{planExerciseIds.length}</span>
                  </div>
                  <div className="badge-grid">
                    {planExerciseIds.map((id) => {
                      const exercise = getExerciseById(id);
                      const item = progress[exercise.id];
                      return (
                        <button
                          key={exercise.id}
                          className={item?.completed ? 'earned' : ''}
                          onClick={() => setActiveIndex(planExerciseIds.findIndex((entry) => entry === exercise.id))}
                        >
                          {item?.completed ? <Award size={18} /> : <Target size={18} />}
                          <span>{exercise.short}</span>
                          <small>{Math.round(item?.score || 0)}%</small>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="care-card notes-card">
                  <div className="section-heading">
                    <h2>Caregiver notes</h2>
                    <button onClick={() => exportReport()}><Download size={15} />Export</button>
                  </div>
                  <textarea
                    value={caregiverNote}
                    onChange={(event) => setCaregiverNote(event.target.value)}
                    placeholder="Add quick observations: fatigue, attention, food texture practice, clinician homework, or what helped today."
                  />
                </div>
              </div>
            </div>

            <aside className="side-panel">
              <GamePanel gameState={gameState} activeExercise={activeExercise} />

              <div className="care-card">
                <div className="section-heading">
                  <h2>Readiness check</h2>
                  <span>{calibrationState === 'ready' ? 'ready' : 'calibrate'}</span>
                </div>
                <div className="calibration-meter">
                  <progress value={calibrationProgress} max="100" />
                  <small>{calibrationState === 'ready' ? 'Neutral baseline saved for this session.' : 'Use a relaxed face before scoring starts.'}</small>
                </div>
                <ul>
                  <li>Good light on the face</li>
                  <li>Camera at eye level</li>
                  <li>Stop for pain, fatigue, or frustration</li>
                </ul>
              </div>

              <div className="exercise-card">
                <div className="exercise-title">
                  <div className="exercise-icon" style={{ background: activeExercise.color }}><Sparkles size={22} /></div>
                  <div>
                    <p>Current exercise</p>
                    <h2>{activeExercise.title}</h2>
                  </div>
                </div>
                <p className="prompt">{activeExercise.prompt}</p>
                <div className="exercise-steps">
                  {activeExercise.tips.map((tip) => <span key={tip}>{tip}</span>)}
                </div>
                <div className="score-ring" aria-label={`Progress score ${Math.round(activeScore)} percent`}>
                  <div style={{ '--score': `${activeScore * 3.6}deg`, '--color': activeExercise.color }}>
                    <strong>{Math.round(activeScore)}</strong>
                    <span>score</span>
                  </div>
                </div>
                <div className="feedback"><Star size={20} />{feedback}</div>
              </div>

              <div className="care-card">
                <div className="section-heading">
                  <h2>Adaptive coaching</h2>
                  <span>real-time</span>
                </div>
                {guidance.map((item) => (
                  <div className="coach-note" key={item}><Activity size={16} />{item}</div>
                ))}
              </div>
            </aside>
          </section>
        ) : (
          <SummaryScreen
            history={history}
            summary={summary}
            progress={progress}
            totalScore={totalScore}
            sessionInsight={sessionInsight}
            gameState={gameState}
            milestoneCalendar={milestoneCalendar}
            caregiverNote={caregiverNote}
            exportReport={exportReport}
            clearHistory={clearHistory}
            startNew={() => {
              resetSession();
              setView('coach');
            }}
          />
        )}

        <section className="disclaimer">
          <CircleAlert size={20} />
          <p>
            BrightMouth is an assistive home-practice and engagement tool. It does not diagnose, treat, or replace guidance from a speech-language pathologist, occupational therapist, dentist, orthodontist, physician, or other licensed clinician.
          </p>
        </section>
      </main>
    </div>
  );
}

function AnimatedPrompt({ exercise, step, score }) {
  const shape = exercise.id === 'shapes' ? ['ah', 'ee', 'oh', 'mmm'][step % 4] : exercise.shape;
  return (
    <div className={`prompt-face ${exercise.id}`} aria-hidden="true">
      <div className="face">
        <span className="eye left" />
        <span className="eye right" />
        <span className="brow left" />
        <span className="brow right" />
        <span className={`mouth ${shape.replace(' ', '-')}`} />
        <span className="cheek left" />
        <span className="cheek right" />
      </div>
      <div className="prompt-label">
        <strong>{shape}</strong>
        <span>{score >= 78 ? 'badge ready' : exercise.target}</span>
      </div>
    </div>
  );
}

function GameHud({ gameState, activeScore, targetScore }) {
  const targetReached = activeScore >= targetScore;
  return (
    <div className={`game-hud ${targetReached ? 'powered' : ''}`}>
      <div className="level-chip">
        <Rocket size={18} />
        <div>
          <strong>Level {gameState.level}</strong>
          <span>{gameState.xpIntoLevel}/500 XP</span>
        </div>
      </div>
      <div className="xp-track" aria-label="XP progress">
        <i style={{ width: `${(gameState.xpIntoLevel / 500) * 100}%` }} />
      </div>
      <div className="reward-row">
        <span><Star size={15} />{gameState.stars} stars</span>
        <span><Flame size={15} />x{Math.max(1, gameState.combo)} combo</span>
      </div>
      {targetReached && <div className="reward-burst">Target locked</div>}
    </div>
  );
}

function GamePanel({ gameState, activeExercise }) {
  return (
    <div className="game-card">
      <div className="section-heading">
        <h2>Quest lab</h2>
        <span><Gamepad2 size={14} /> therapy game</span>
      </div>
      <div className="quest-summary">
        <div>
          <strong>{gameState.stars}</strong>
          <span>stars</span>
        </div>
        <div>
          <strong>x{Math.max(1, gameState.combo)}</strong>
          <span>combo</span>
        </div>
        <div>
          <strong>{gameState.activeCrew.length}</strong>
          <span>helpers</span>
        </div>
      </div>
      <div className="daily-challenges">
        {gameState.challenges.map((challenge) => (
          <article className={challenge.complete ? 'complete' : ''} key={challenge.id}>
            <div>{challenge.complete ? <Check size={16} /> : <Gift size={16} />}</div>
            <section>
              <strong>{challenge.title}</strong>
              <p>{challenge.description}</p>
              <small>{challenge.xp} XP reward</small>
            </section>
          </article>
        ))}
      </div>
      <div className="helper-crew">
        {HELPER_CREW.map((helper) => {
          const unlocked = helper.unlockLevel <= gameState.level;
          return (
            <div className={unlocked ? 'unlocked' : ''} key={helper.id}>
              <span>{helper.name.slice(0, 1)}</span>
              <strong>{helper.name}</strong>
              <small>{unlocked ? `${helper.role}: ${helper.boost}` : `Unlocks at level ${helper.unlockLevel}`}</small>
            </div>
          );
        })}
      </div>
      <p className="active-mission">Current mission bonus: repeat {activeExercise.short.toLowerCase()} with steady effort.</p>
    </div>
  );
}

function MetricGrid({ metrics }) {
  const values = [
    ['Mouth opening', metrics?.mouthOpenScore || 0],
    ['Lip symmetry', metrics?.lipSymmetryScore || 0],
    ['Jaw range', metrics?.jawRangeScore || 0],
    ['Cheek movement', metrics?.cheekScore || 0],
    ['Consistency', metrics?.consistencyPulse || 0],
    ['Left-right balance', metrics?.balanceScore || 0]
  ];

  return (
    <div className="metrics">
      <div className="section-heading">
        <h2>Live measurements</h2>
        <span>landmarks</span>
      </div>
      {values.map(([label, value]) => (
        <div className="metric" key={label}>
          <div>
            <span>{label}</span>
            <strong>{Math.round(value)}%</strong>
          </div>
          <progress value={Math.round(value)} max="100" />
        </div>
      ))}
    </div>
  );
}

function SummaryScreen({ history, summary, progress, totalScore, sessionInsight, gameState, milestoneCalendar, caregiverNote, exportReport, clearHistory, startNew }) {
  const currentItems = EXERCISES.map((exercise) => ({
    ...exercise,
    score: Math.round(progress[exercise.id]?.score || 0),
    completed: Boolean(progress[exercise.id]?.completed)
  }));

  return (
    <section className="summary-grid">
      <div className="summary-main">
        <div className="summary-hero">
          <div>
            <p>Parent and therapist summary</p>
            <h1>Practice trends and movement notes</h1>
            <span>Use this summary to discuss home practice patterns with the child’s care team.</span>
          </div>
          <div className="summary-score">
            <strong>{totalScore || summary.latest?.averageScore || 0}</strong>
            <span>average score</span>
          </div>
        </div>

        <div className="summary-cards">
          <article>
            <ShieldCheck size={22} />
            <strong>{summary.latest ? `${summary.latest.completed}/7` : '0/7'}</strong>
            <span>badges in latest saved session</span>
          </article>
          <article>
            <LineChart size={22} />
            <strong>{summary.delta > 0 ? `+${summary.delta}` : summary.delta}</strong>
            <span>change from prior session</span>
          </article>
          <article>
            <Users size={22} />
            <strong>{history.length}</strong>
            <span>sessions stored on this device</span>
          </article>
          <article>
            <Flame size={22} />
            <strong>Lv {gameState.level}</strong>
            <span>{gameState.xp} XP earned today</span>
          </article>
        </div>

        <div className="game-summary">
          <div className="section-heading">
            <h2>Game progress</h2>
            <span>{gameState.stars} stars collected</span>
          </div>
          <div className="summary-xp">
            <strong>Level {gameState.level}</strong>
            <progress value={gameState.xpIntoLevel} max="500" />
            <span>{gameState.xpIntoLevel}/500 XP to next level</span>
          </div>
          <div className="summary-challenges">
            {gameState.challenges.map((challenge) => (
              <span className={challenge.complete ? 'complete' : ''} key={challenge.id}>
                {challenge.complete ? 'Complete' : 'Open'}: {challenge.title}
              </span>
            ))}
          </div>
        </div>

        <div className="clinical-notes">
          <article>
            <h2>Suggested focus</h2>
            <p>{sessionInsight.focus ? `${sessionInsight.focus.title}: continue short, comfortable repetitions and watch ${sessionInsight.focus.target}.` : 'Complete a few scored activities to generate a focus area.'}</p>
          </article>
          <article>
            <h2>Observed strength</h2>
            <p>{sessionInsight.strength ? `${sessionInsight.strength.title}: this was the strongest activity in the current session.` : 'Strengths will appear after practice begins.'}</p>
          </article>
          <article>
            <h2>Caregiver note</h2>
            <p>{caregiverNote || 'No note entered yet.'}</p>
          </article>
        </div>

        <div className="exercise-review">
          <div className="section-heading">
            <h2>Current session detail</h2>
            <button onClick={() => exportReport()}><Download size={15} />Export report</button>
          </div>
          {currentItems.map((item) => (
            <div className="review-row" key={item.id}>
              <div>
                {item.completed ? <Check size={18} /> : <Target size={18} />}
                <span>{item.title}</span>
              </div>
              <progress value={item.score} max="100" />
              <strong>{item.score}%</strong>
            </div>
          ))}
        </div>
      </div>

      <aside className="history-panel">
        <MilestoneCalendar calendar={milestoneCalendar} />

        <div className="section-heading">
          <h2>Session history</h2>
          <button onClick={clearHistory}>Clear</button>
        </div>
        {history.length ? history.map((session) => (
          <article className="history-item" key={session.id}>
            <div>
              <strong>{new Date(session.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</strong>
              <span>{Math.round(session.durationSeconds / 60)} min practice</span>
            </div>
            <p>{session.averageScore}% avg</p>
            <small>{session.completed}/7 badges</small>
          </article>
        )) : (
          <div className="empty-history">
            <Trophy size={34} />
            <p>Finish a session to save history and track improvement over time.</p>
          </div>
        )}
        <button className="primary wide" onClick={startNew}><Play size={18} />New practice session</button>
      </aside>
    </section>
  );
}

function MilestoneCalendar({ calendar }) {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="milestone-calendar">
      <div className="section-heading">
        <h2>Milestone calendar</h2>
        <span><CalendarDays size={14} /> {calendar.label}</span>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {calendar.cells.map((cell) => (
          <div
            className={[
              cell.blank ? 'blank' : '',
              cell.today ? 'today' : '',
              cell.practiced ? 'practiced' : '',
              cell.badges >= 2 ? 'milestone' : ''
            ].filter(Boolean).join(' ')}
            key={cell.id}
            title={cell.practiced ? `${cell.bestScore}% best score, ${cell.badges} badges` : ''}
          >
            {!cell.blank && (
              <>
                <strong>{cell.day}</strong>
                {cell.practiced && <i />}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="milestone-stats">
        <article>
          <strong>{calendar.practicedDays}</strong>
          <span>practice days</span>
        </article>
        <article>
          <strong>{calendar.bestDay ? `${calendar.bestDay.bestScore}%` : '0%'}</strong>
          <span>best day</span>
        </article>
      </div>
      <div className="next-goals">
        {calendar.nextGoals.map((goal) => <p key={goal}><Target size={14} />{goal}</p>)}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
