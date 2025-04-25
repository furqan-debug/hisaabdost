
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasAction?: boolean;
  visualData?: any;
  expiresAt?: Date;
}

export interface QuickReply {
  text: string;
  action: string;
  icon?: ReactNode;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  has_action: boolean;
  visual_data?: any;
  created_at: string;
  expires_at: string;
}
