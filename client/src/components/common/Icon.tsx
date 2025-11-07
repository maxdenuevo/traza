import {
  Calendar,
  ClipboardList,
  Wallet,
  Users,
  FileText,
  ScrollText,
  StickyNote,
  Bell,
  Home,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Menu,
  Check,
  AlertCircle,
  Info,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Building,
  Search,
  MapPin,
  Inbox,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Wrench,
  LogIn,
  UserPlus,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Navigation
  'calendar': Calendar,
  'clipboard-list': ClipboardList,
  'wallet': Wallet,
  'users': Users,
  'file-text': FileText,
  'scroll-text': ScrollText,
  'sticky-note': StickyNote,
  'bell': Bell,
  'home': Home,

  // UI Controls
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'plus': Plus,
  'x': X,
  'menu': Menu,
  'check': Check,

  // Status
  'alert-circle': AlertCircle,
  'info': Info,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,

  // Actions
  'edit-2': Edit2,
  'trash-2': Trash2,

  // Other
  'building': Building,
  'search': Search,
  'map-pin': MapPin,
  'inbox': Inbox,

  // Auth & User
  'mail': Mail,
  'lock': Lock,
  'user': User,
  'phone': Phone,
  'briefcase': Briefcase,
  'wrench': Wrench,
  'log-in': LogIn,
  'user-plus': UserPlus,
  'layout-grid': LayoutGrid,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const Icon = ({ name, size = 20, className = '', strokeWidth = 2 }: IconProps) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
};
