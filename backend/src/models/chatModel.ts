import { Schema, model } from 'mongoose';

const chatSchema = new Schema({
  _id: String,

  participants: [
    {
      id: String,
      role: String,
    },
  ],

  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },

  lastMessageAt: Date,

  unreadCount: {
    type: Map,
    of: Number,
  },
});

export default model('Chat', chatSchema);
