import { Schema, model, Document, Types } from 'mongoose';

export interface IVote extends Document {
  pollId: Types.ObjectId;
  studentName: string;
  socketId: string;
  optionIndex: number;
  votedAt: Date;
}

const voteSchema = new Schema<IVote>({
  pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
  studentName: { type: String, required: true },
  socketId: { type: String, required: true },
  optionIndex: { type: Number, required: true },
  votedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate votes
voteSchema.index({ pollId: 1, socketId: 1 }, { unique: true });

const Vote = model<IVote>('Vote', voteSchema);

export default Vote;
