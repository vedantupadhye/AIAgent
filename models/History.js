import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    starred: { type: Boolean, default: false }
});


const QuestionHistory = mongoose.models.QuestionHistory || mongoose.model('QuestionHistory', HistorySchema);

export default QuestionHistory;
