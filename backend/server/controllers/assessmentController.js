import Assessment from '../models/Assessment.js';

// Create or update assessment
export const createOrUpdateAssessment = async (req, res, next) => {
  try {
    const assessmentData = req.body;

    if (!assessmentData.userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const assessment = await Assessment.findOneAndUpdate(
      { userId: assessmentData.userId },
      assessmentData,
      { 
        new: true,
        upsert: true,
        runValidators: true 
      }
    );
    
    // ✅ Transform _id to id
    const assessmentObject = assessment.toObject();
    assessmentObject.id = assessmentObject._id.toString();
    delete assessmentObject._id;
    delete assessmentObject.__v;
    
    res.status(200).json(assessmentObject);
  } catch (error) {
    next(error);
  }
};

// Get assessment by userId
export const getAssessmentByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const assessment = await Assessment.findOne({ userId });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // ✅ Transform _id to id
    const assessmentObject = assessment.toObject();
    assessmentObject.id = assessmentObject._id.toString();
    delete assessmentObject._id;
    delete assessmentObject.__v;

    res.json(assessmentObject);
  } catch (error) {
    next(error);
  }
};

// Get all assessments
export const getAllAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find();
    
    const transformedAssessments = assessments.map(assessment => {
      const assessmentObject = assessment.toObject();
      assessmentObject.id = assessmentObject._id.toString();
      delete assessmentObject._id;
      delete assessmentObject.__v;
      return assessmentObject;
    });
    
    res.json(transformedAssessments);
  } catch (error) {
    next(error);
  }
};
