import Assessment from '../models/Assessment.js';
import Profile from '../models/Profile.js';

// Get leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ completedAt: { $ne: null } })
      .sort({ totalScore: -1 });

    const leaderboard = await Promise.all(
      assessments.map(async (assessment) => {
        const profile = await Profile.findOne({ userId: assessment.userId });

        return {
          candidateId: assessment.candidateId,
          name: profile?.name || 'Unknown',
          email: profile?.email || 'Unknown',
          collegeName: profile?.collegeName || 'Unknown',
          totalScore: assessment.totalScore,
          gameScores: {
            minesweeper: assessment.games.minesweeper?.puzzlesCompleted || 0,
            unblockMe: assessment.games['unblock-me']?.puzzlesCompleted || 0,
            waterCapacity: assessment.games['water-capacity']?.puzzlesCompleted || 0,
          },
          completedAt: assessment.completedAt,
        };
      })
    );

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};
