
import { LucideIcon } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasAction?: boolean;
  visualData?: any;
}

export interface QuickReply {
  text: string;
  action: string;
  icon?: React.ReactNode;
}
