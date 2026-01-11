import { Schema, model, Document } from 'mongoose';

export interface IPollOption {
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  duration: number; // in seconds
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'closed';
  totalVotes: number;
}

const pollSchema = new Schema<IPoll>({
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  duration: { type: Number, required: true }, // in seconds
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  totalVotes: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Poll = model<IPoll>('Poll', pollSchema);

export default Poll;
