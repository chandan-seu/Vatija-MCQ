import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  BrainCircuit,
  Trophy,
  AlertCircle,
  Loader2,
  Home as HomeIcon,
  Linkedin,
  Facebook
} from 'lucide-react';
import { generateMCQs } from './services/geminiService';
import { MCQ, Category, ExamConfig, ExamResult } from './types';

// --- Constants ---
const CATEGORY_MAP: Record<Category, string> = {
  "Bangladesh Affairs": "বাংলাদেশ বিষয়াবলি",
  "ICT": "তথ্য ও যোগাযোগ প্রযুক্তি",
  "English": "ইংরেজি ভাষা ও সাহিত্য",
  "Mathematics": "গাণিতিক যুক্তি",
  "Physics": "পদার্থবিজ্ঞান",
  "History": "ইতিহাস",
  "General Knowledge": "সাধারণ জ্ঞান",
  "International Affairs": "আন্তর্জাতিক বিষয়াবলি",
  "Geography": "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা",
  "Ethics & Good Governance": "নৈতিকতা, মূল্যবোধ ও সুশাসন",
  "Random": "র‍্যান্ডম (সব মিক্সড)",
  "Sports": "খেলাধুলা"
};

const CATEGORIES = Object.keys(CATEGORY_MAP) as Category[];

const QUESTION_COUNTS = [25, 30, 40, 50];

// --- Components ---

const Header = ({ onHome }: { onHome: () => void }) => (
  <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onHome}
      >
        <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
          Vatija<span className="text-indigo-600">MCQ</span>
        </h1>
      </div>
    </div>
  </header>
);

const Home = ({ onStart }: { onStart: (config: ExamConfig) => void, key?: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [selectedCount, setSelectedCount] = useState<number>(25);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
          Practice হোক ধুপধাপ
        </h2>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            কোন ক্যাটাগরি ট্রাই দিবি?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-card ${selectedCategory === cat ? 'selected' : ''}`}
              >
                <span className="text-sm font-medium">{CATEGORY_MAP[cat]}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            প্রশ্নের সংখ্যা
          </h3>
          <div className="flex flex-wrap gap-3">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setSelectedCount(count)}
                className={`px-6 py-2 rounded-full border-2 transition-all font-medium ${
                  selectedCount === count 
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                }`}
              >
                {count}টি প্রশ্ন
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500 italic">
            * প্রতিটি প্রশ্নের জন্য ১ মিনিট সময়। মোট সময়: {selectedCount} মিনিট।
          </p>
        </section>

        <div className="pt-6">
          <button 
            onClick={() => onStart({ category: selectedCategory, questionCount: selectedCount })}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 group"
          >
            শুরু করে দে
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Loading = ({ category }: { category: string, key?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-indigo-200 blur-3xl rounded-full opacity-20 animate-pulse"></div>
      <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
    </div>
    <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
      প্রশ্ন তৈরি হচ্ছে...
    </h2>
    <p className="text-slate-600">
      আমাদের এআই আপনার জন্য <span className="font-semibold text-indigo-600">{CATEGORY_MAP[category as Category]}</span> বিষয়ের নতুন প্রশ্ন তৈরি করছে।
    </p>
  </div>
);

const Exam = ({ 
  questions, 
  config, 
  onSubmit 
}: { 
  questions: MCQ[], 
  config: ExamConfig, 
  onSubmit: (answers: (string | null)[]) => void,
  key?: string
}) => {
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(new Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(config.questionCount * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0) {
      onSubmit(userAnswers);
    }
  }, [timeLeft, onSubmit, userAnswers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (qIdx: number, option: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = option;
    setUserAnswers(newAnswers);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">কোনো প্রশ্ন পাওয়া যায়নি</h2>
        <button onClick={() => window.location.reload()} className="btn-secondary">আবার চেষ্টা করুন</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="sticky top-20 z-40 mb-8">
        <div className="glass-card p-4 rounded-2xl flex items-center justify-between shadow-indigo-100/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">অবশিষ্ট সময়</p>
              <p className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">অগ্রগতি</p>
            <p className="text-xl font-display font-bold text-slate-900">
              {userAnswers.filter(a => a !== null).length} / {questions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <motion.div 
            key={qIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: qIdx * 0.05 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                {qIdx + 1}
              </span>
              <h4 className="text-lg font-medium text-slate-800 leading-tight">
                {q.question}
              </h4>
            </div>
            <div className="grid gap-3 ml-12">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelect(qIdx, opt)}
                  className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                    userAnswers[qIdx] === opt 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="text-sm md:text-base">{opt}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    userAnswers[qIdx] === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'
                  }`}>
                    {userAnswers[qIdx] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => onSubmit(userAnswers)}
            className="w-full btn-primary py-4 text-lg"
          >
            জমা দে
          </button>
        </div>
      </div>
    </div>
  );
};

const Results = ({ result, onRestart }: { result: ExamResult, onRestart: () => void, key?: string }) => {
  const getResultMessage = (percentage: number) => {
    if (percentage >= 90) return "সাবাস বাঘের বাচ্চা";
    if (percentage >= 80) return "আরো ভালো করা লাগবে";
    if (percentage >= 70) return "ছি ছি ছি ননি";
    if (percentage >= 60) return "আমার বাচ্চার মতো কাম করছোস";
    if (percentage >= 50) return "এতে কাম হইতো না কাকা";
    return "বা**র পড়াশোনা করোস?";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-6">
          <Trophy className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
          {getResultMessage(result.scorePercentage)}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">মোট প্রশ্ন</p>
          <p className="text-2xl font-display font-bold text-slate-900">{result.totalQuestions}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">সঠিক</p>
          <p className="text-2xl font-display font-bold text-green-600">{result.correctCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">ভুল</p>
          <p className="text-2xl font-display font-bold text-red-600">{result.wrongCount}</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-center">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">স্কোর</p>
          <p className="text-2xl font-display font-bold text-white">{result.scorePercentage}%</p>
        </div>
      </div>

      <div className="space-y-8 mb-12">
        <h3 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          বিস্তারিত পর্যালোচনা
        </h3>
        {result.questions.map((q, qIdx) => {
          const userAnswer = result.userAnswers[qIdx];
          const isCorrect = userAnswer?.trim() === q.correct_answer?.trim();
          
          return (
            <div key={qIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex gap-4 mb-4">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {qIdx + 1}
                </span>
                <h4 className="text-lg font-medium text-slate-800 leading-tight">
                  {q.question}
                </h4>
              </div>
              <div className="grid gap-3 ml-12">
                {q.options.map((opt, oIdx) => {
                  const isSelected = userAnswer?.trim() === opt?.trim();
                  const isCorrectOpt = q.correct_answer?.trim() === opt?.trim();
                  
                  let borderClass = 'border-slate-100';
                  let bgClass = 'bg-white';
                  let icon = null;

                  if (isCorrectOpt) {
                    borderClass = 'border-green-500';
                    bgClass = 'bg-green-50';
                    icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                  } else if (isSelected && !isCorrect) {
                    borderClass = 'border-red-500';
                    bgClass = 'bg-red-50';
                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between ${borderClass} ${bgClass}`}
                    >
                      <span className={`text-sm md:text-base ${isCorrectOpt ? 'font-semibold text-green-900' : 'text-slate-600'}`}>
                        {opt}
                      </span>
                      {icon}
                    </div>
                  );
                })}
              </div>
              {!isCorrect && (
                <div className="mt-4 ml-12 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">সঠিক উত্তর:</span> {q.correct_answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={onRestart}
        className="w-full btn-secondary py-4 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        আরেকবার হোক
      </button>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'home' | 'loading' | 'exam' | 'results'>('home');
  const [config, setConfig] = useState<ExamConfig | null>(null);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startExam = async (examConfig: ExamConfig) => {
    setConfig(examConfig);
    setView('loading');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const generatedQuestions = await generateMCQs(examConfig.category, examConfig.questionCount);
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("কোনো প্রশ্ন পাওয়া যায়নি। আবার চেষ্টা করুন।");
      }
      setQuestions(generatedQuestions);
      setView('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`প্রশ্ন তৈরি করতে সমস্যা হয়েছে: ${errorMessage}`);
      setView('home');
    }
  };

  const submitExam = useCallback((userAnswers: (string | null)[]) => {
    if (!questions.length) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const userAns = userAnswers[idx]?.trim();
      const correctAns = q.correct_answer?.trim();
      if (userAns === correctAns) {
        correctCount++;
      }
    });

    const total = questions.length;
    const wrongCount = total - correctCount;
    const scorePercentage = Math.round((correctCount / total) * 100);

    setResult({
      totalQuestions: total,
      correctCount,
      wrongCount,
      scorePercentage,
      userAnswers,
      questions
    });
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [questions]);

  const reset = () => {
    setView('home');
    setQuestions([]);
    setResult(null);
    setConfig(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onHome={reset} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto px-4 mt-4"
            >
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {view === 'home' && (
            <Home key="home" onStart={startExam} />
          )}

          {view === 'loading' && config && (
            <Loading key="loading" category={config.category} />
          )}

          {view === 'exam' && config && (
            <Exam 
              key="exam" 
              questions={questions} 
              config={config} 
              onSubmit={submitExam} 
            />
          )}

          {view === 'results' && result && (
            <Results 
              key="results" 
              result={result} 
              onRestart={reset} 
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-10 text-center border-t border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-indigo-600 font-medium mb-4">Birthday Gift For Shourav From Vatija</p>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-500 text-sm">Developed By - <span className="font-semibold text-slate-900">Chandan</span></p>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/in/chaandan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/chaandan.ni2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            
            <p className="text-slate-400 text-xs mt-4">
              © {new Date().getFullYear()} VatijaMCQ • এআই-চালিত বিসিএস প্রস্তুতি
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

