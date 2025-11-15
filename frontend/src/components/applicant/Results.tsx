import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAssessmentByUserId, getProfileByUserId } from '@/lib/storage';
import { Assessment, ApplicantProfile } from '@/types';
import { Trophy, CheckCircle, Clock, Target, LogOut, Bomb, Droplet, Award, Zap, Sparkles, Star, TrendingUp, AlertCircle, User, Mail, GraduationCap, MapPin, Briefcase, PartyPopper, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const Results: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ UPDATED: Now async with MongoDB
  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);

        // ✅ Fetch profile from MongoDB (now async)
        const userProfile = await getProfileByUserId(user.id);
        
        // ✅ Fetch assessment from MongoDB (now async)
        const userAssessment = await getAssessmentByUserId(user.id);

        // Check if both available games (Minesweeper and Water Capacity) are completed
        const bothGamesCompleted = userAssessment?.games.minesweeper !== null && 
                                   userAssessment?.games['water-capacity'] !== null;

        if (!userProfile || !userAssessment || !bothGamesCompleted) {
          toast.warning('Please complete both available games first. Redirecting to dashboard...', {
            duration: 3000,
            icon: '⚠️',
          });
          navigate('/applicant/assessment');
          return;
        }

        setProfile(userProfile);
        setAssessment(userAssessment);
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load results. Please try again.', {
          duration: 4000,
          icon: '❌',
        });
        navigate('/applicant/assessment');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [user, navigate]);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#8558ed] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#8558ed] font-semibold text-lg">Loading your results...</p>
        </motion.div>
      </div>
    );
  }

  if (!assessment || !profile) {
    return null;
  }

  const games = [
    {
      type: 'minesweeper',
      title: 'Minesweeper',
      icon: Bomb,
      skill: 'Risk Assessment & Deductive Logic',
      score: assessment.games.minesweeper,
      gradient: 'from-[#8558ed] to-[#b18aff]',
    },
    {
      type: 'water-capacity',
      title: 'Water Capacity',
      icon: Droplet,
      skill: 'Logical Sequencing & Optimization',
      score: assessment.games['water-capacity'],
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 15) return 'text-emerald-600';
    if (score >= 10) return 'text-[#8558ed]';
    if (score >= 5) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 15) return 'Excellent';
    if (score >= 10) return 'Good';
    if (score >= 5) return 'Average';
    return 'Needs Improvement';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 15) return { icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 10) return { icon: Award, color: 'text-[#8558ed]', bg: 'bg-[#8558ed]/10', border: 'border-[#8558ed]/30' };
    if (score >= 5) return { icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
  };

  // Calculate overall performance metrics (only for available games: Minesweeper and Water Capacity)
  const availableGames = games.filter(g => g.type !== 'unblock-me');
  const totalPuzzlesCompleted = availableGames.reduce((sum, game) => sum + (game.score?.puzzlesCompleted || 0), 0);
  const allGamesCompleted = availableGames.every(game => game.score && game.score.puzzlesCompleted > 0);
  const anyGameCompleted = availableGames.some(game => game.score && game.score.puzzlesCompleted > 0);
  
  const getOverallPerformance = () => {
    const score = assessment.totalScore;
    if (score >= 70) return { label: 'Outstanding Performance!', icon: PartyPopper, color: 'text-white' };
    if (score >= 50) return { label: 'Great Job!', icon: Trophy, color: 'text-white' };
    if (score >= 30) return { label: 'Good Effort!', icon: Award, color: 'text-white' };
    if (score > 0) return { label: 'Keep Improving!', icon: TrendingUp, color: 'text-white' };
    return { label: 'Assessment Incomplete', icon: AlertCircle, color: 'text-white/90' };
  };

  const performanceStatus = getOverallPerformance();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen playful-gradient relative overflow-hidden"
    >
      {/* Animated Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-[#8558ed]/20 rounded-full blur-3xl top-10 -left-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-[#b18aff]/20 rounded-full blur-3xl bottom-10 -right-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-72 h-72 bg-[#8558ed]/15 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Floating Decorative Icons */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 pointer-events-none"
      >
        <Sparkles className="w-8 h-8 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-16 pointer-events-none"
      >
        <Zap className="w-10 h-10 text-[#b18aff]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-24 left-20 pointer-events-none"
      >
        <Star className="w-7 h-7 text-[#8558ed]/30" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 18, 0],
          rotate: [0, -12, 0],
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 right-24 pointer-events-none"
      >
        <Target className="w-9 h-9 text-[#b18aff]/30" />
      </motion.div>

      <div className="max-w-7xl mx-auto p-6 py-10 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-[#8558ed]" />
              Assessment Results
            </h1>
            <p className="text-lg text-[#8558ed]/70 font-medium flex items-center gap-2">
              <Target className="w-5 h-5" />
              Candidate ID: <span className="font-mono font-semibold text-[#8558ed]">{profile.candidateId}</span>
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={logout}
              className="border-2 border-[#8558ed]/30 hover:bg-[#8558ed]/10 text-[#8558ed] font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-8 bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-2xl shadow-[#8558ed]/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8558ed]/5 to-[#b18aff]/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] via-[#b18aff] to-[#8558ed] flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-tr from-[#8558ed] to-[#b18aff] w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                Total Assessment Score
              </CardTitle>
              <CardDescription className="text-[#8558ed]/70 text-lg font-medium flex items-center gap-2 mt-2">
                <Clock className="w-5 h-5" />
                {assessment.completedAt ? `Completed on ${formatDate(assessment.completedAt)}` : 'Assessment in progress'}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                  className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] to-[#b18aff]"
                >
                  {assessment.totalScore}
                </motion.div>
                <div className="text-2xl font-semibold text-[#8558ed]/70">/ 100 points</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 rounded-full border-2 border-[#8558ed]/30">
                  <performanceStatus.icon className="w-5 h-5 text-[#8558ed]" />
                  <span className="font-bold text-[#8558ed]">{performanceStatus.label}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual Game Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {games.map((game, idx) => {
            const GameIcon = game.icon;
            const badge = game.score ? getScoreBadge(game.score.puzzlesCompleted) : null;
            const BadgeIcon = badge?.icon;
            
            return (
              <motion.div
                key={game.type}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/30 shadow-xl shadow-[#8558ed]/10 hover:shadow-2xl hover:shadow-[#8558ed]/20 transition-all duration-300 h-full group">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <GameIcon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-[#030303]">{game.title}</CardTitle>
                        <CardDescription className="text-[#8558ed]/70 font-medium mt-1">{game.skill}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {game.score && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#8558ed]/5 to-[#b18aff]/5 rounded-xl border border-[#8558ed]/20">
                          <span className="text-sm font-semibold text-[#8558ed]/80">Puzzles Completed</span>
                          <span className={`text-3xl font-extrabold ${getScoreColor(game.score.puzzlesCompleted)}`}>
                            {game.score.puzzlesCompleted}
                          </span>
                        </div>
                        
                        {badge && BadgeIcon && (
                          <div className={`flex items-center justify-between p-3 ${badge.bg} rounded-xl border-2 ${badge.border}`}>
                            <span className="text-sm font-semibold text-gray-700">Performance</span>
                            <div className="flex items-center gap-2">
                              <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                              <span className={`font-bold ${badge.color}`}>
                                {getScoreLabel(game.score.puzzlesCompleted)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Time Spent</span>
                          </div>
                          <span className="font-bold text-[#8558ed]">
                            {Math.floor(game.score.timeSpent / 60)}:{(game.score.timeSpent % 60).toString().padStart(2, '0')}
                          </span>
                        </div>

                        {game.score.errorRate !== undefined && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Errors</span>
                            </div>
                            <span className="font-bold text-gray-700">{game.score.errorRate}</span>
                          </div>
                        )}

                        {game.score.minimumMoves !== undefined && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Target className="w-4 h-4" />
                              <span className="text-sm font-medium">Total Moves</span>
                            </div>
                            <span className="font-bold text-gray-700">{game.score.minimumMoves}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className={`mb-8 backdrop-blur-xl ${
            allGamesCompleted 
              ? 'bg-white/80 border-2 border-green-500/30 shadow-xl shadow-green-500/20'
              : anyGameCompleted
              ? 'bg-white/80 border-2 border-amber-500/30 shadow-xl shadow-amber-500/20'
              : 'bg-white/80 border-2 border-red-500/30 shadow-xl shadow-red-500/20'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center text-2xl font-bold gap-3 ${
                allGamesCompleted ? 'text-green-600' : anyGameCompleted ? 'text-amber-600' : 'text-red-600'
              }`}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {allGamesCompleted ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : anyGameCompleted ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <AlertCircle className="w-8 h-8" />
                  )}
                </motion.div>
                {allGamesCompleted ? 'Assessment Complete' : anyGameCompleted ? 'Assessment Partially Complete' : 'Assessment Incomplete'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Game completion status */}
              {games.map((game) => {
                const completed = game.score && game.score.puzzlesCompleted > 0;
                return (
                  <div key={game.type} className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-xl border border-[#8558ed]/10">
                    {completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-700 font-medium">
                      {game.title}: {completed 
                        ? `Completed ${game.score?.puzzlesCompleted} puzzle${game.score?.puzzlesCompleted !== 1 ? 's' : ''}`
                        : 'Not completed - terminated or no puzzles solved'
                      }
                    </p>
                  </div>
                );
              })}
              
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-xl border border-[#8558ed]/10">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">Your results have been recorded and submitted</p>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-xl border border-[#8558ed]/10">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">Recruiters can now view your performance on the leaderboard</p>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-[#8558ed]/10 to-[#b18aff]/10 rounded-xl border-2 border-[#8558ed]/30">
                <p className="text-[#8558ed] font-bold text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {allGamesCompleted 
                    ? 'Thank you for completing all available games in the IFA Hiring Platform assessment. We will review your performance and contact you soon!'
                    : totalPuzzlesCompleted > 0
                    ? 'Your partial results have been recorded. Complete both available games to improve your score.'
                    : 'Your assessment was recorded but no puzzles were completed. You may want to try again.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-white/80 backdrop-blur-xl border-2 border-[#8558ed]/20 shadow-xl shadow-[#8558ed]/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#8558ed] flex items-center gap-2">
                <User className="w-6 h-6" />
                Your Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-lg">
                <User className="w-5 h-5 text-[#8558ed] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[#8558ed]/70 uppercase">Name</div>
                  <div className="font-bold text-gray-800">{profile.name}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-lg">
                <Mail className="w-5 h-5 text-[#8558ed] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[#8558ed]/70 uppercase">Email</div>
                  <div className="font-bold text-gray-800">{profile.email}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-lg">
                <GraduationCap className="w-5 h-5 text-[#8558ed] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[#8558ed]/70 uppercase">College</div>
                  <div className="font-bold text-gray-800">{profile.collegeName}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-lg">
                <Award className="w-5 h-5 text-[#8558ed] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[#8558ed]/70 uppercase">CGPA</div>
                  <div className="font-bold text-gray-800">{profile.cgpa}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-lg">
                <MapPin className="w-5 h-5 text-[#8558ed] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[#8558ed]/70 uppercase">Location</div>
                  <div className="font-bold text-gray-800">{profile.location}</div>
                </div>
              </div>
              
              <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gradient-to-r from-[#8558ed]/5 to-transparent rounded-lg">
                <Briefcase className="w-5 h-5 text-[#8558ed] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[#8558ed]/70 uppercase">Interested Roles</div>
                  <div className="font-bold text-gray-800">{profile.interestedRoles.join(', ')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => navigate('/applicant/assessment')} 
              className="bg-gradient-to-r from-[#8558ed] to-[#b18aff] hover:from-[#7347dc] hover:to-[#a078ee] text-white font-bold px-8 py-6 text-lg shadow-xl shadow-[#8558ed]/30"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
