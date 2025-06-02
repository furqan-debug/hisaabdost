

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Palette, Sun, Moon, Monitor, History, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/hooks/use-currency';
import { useMonthContext } from '@/hooks/use-month-context';
import { MonthSelector } from './MonthSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useSignOut } from '@/hooks/auth/useSignOut';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsSidebar = ({
  isOpen,
  onClose
}: SettingsSidebarProps) => {
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    currencyCode,
    setCurrencyCode
  } = useCurrency();
  const {
    selectedMonth,
    setSelectedMonth
  } = useMonthContext();
  const {
    user
  } = useAuth();
  const {
    signOut
  } = useSignOut();
  const navigate = useNavigate();

  const currencies = [{
    code: 'USD',
    name: 'US Dollar ($)',
    symbol: '$'
  }, {
    code: 'EUR',
    name: 'Euro (€)',
    symbol: '€'
  }, {
    code: 'GBP',
    name: 'British Pound (£)',
    symbol: '£'
  }, {
    code: 'JPY',
    name: 'Japanese Yen (¥)',
    symbol: '¥'
  }, {
    code: 'CAD',
    name: 'Canadian Dollar (C$)',
    symbol: 'C$'
  }, {
    code: 'AUD',
    name: 'Australian Dollar (A$)',
    symbol: 'A$'
  }, {
    code: 'CHF',
    name: 'Swiss Franc (CHF)',
    symbol: 'CHF'
  }, {
    code: 'CNY',
    name: 'Chinese Yuan (¥)',
    symbol: '¥'
  }, {
    code: 'INR',
    name: 'Indian Rupee (₹)',
    symbol: '₹'
  }, {
    code: 'PKR',
    name: 'Pakistani Rupee (Rs)',
    symbol: 'Rs'
  }, {
    code: 'BDT',
    name: 'Bangladeshi Taka (৳)',
    symbol: '৳'
  }, {
    code: 'LKR',
    name: 'Sri Lankan Rupee (Rs)',
    symbol: 'Rs'
  }, {
    code: 'NPR',
    name: 'Nepalese Rupee (Rs)',
    symbol: 'Rs'
  }, {
    code: 'AFN',
    name: 'Afghan Afghani (؋)',
    symbol: '؋'
  }, {
    code: 'SAR',
    name: 'Saudi Riyal (﷼)',
    symbol: '﷼'
  }, {
    code: 'AED',
    name: 'UAE Dirham (د.إ)',
    symbol: 'د.إ'
  }, {
    code: 'QAR',
    name: 'Qatari Riyal (﷼)',
    symbol: '﷼'
  }, {
    code: 'KWD',
    name: 'Kuwaiti Dinar (د.ك)',
    symbol: 'د.ك'
  }, {
    code: 'BHD',
    name: 'Bahraini Dinar (.د.ب)',
    symbol: '.د.ب'
  }, {
    code: 'OMR',
    name: 'Omani Rial (﷼)',
    symbol: '﷼'
  }];

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  const handleHistoryClick = () => {
    navigate('/app/history');
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Clean Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
            <img src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" alt="Hisab Dost logo" className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Settings
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Date Range Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Date Range</h3>
            </div>
            <div className="pl-7">
              <MonthSelector selectedMonth={selectedMonth} onChange={handleMonthChange} />
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Currency Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Currency</h3>
            </div>
            <div className="pl-7">
              <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger className="h-9 bg-background border-border/50 hover:border-border transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">{currency.symbol}</span>
                        <span className="text-sm">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Theme Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Theme</h3>
            </div>
            <div className="pl-7 space-y-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'ghost'} 
                className="w-full justify-start h-9 text-sm font-normal" 
                onClick={() => setTheme('light')}
              >
                <Sun className="mr-3 h-4 w-4" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'ghost'} 
                className="w-full justify-start h-9 text-sm font-normal" 
                onClick={() => setTheme('dark')}
              >
                <Moon className="mr-3 h-4 w-4" />
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'ghost'} 
                className="w-full justify-start h-9 text-sm font-normal" 
                onClick={() => setTheme('system')}
              >
                <Monitor className="mr-3 h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* History Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">History</h3>
            </div>
            <div className="pl-7">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9 text-sm font-normal hover:bg-accent/50 transition-colors" 
                onClick={handleHistoryClick}
              >
                <History className="mr-3 h-4 w-4" />
                View Activity History
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Section - Fixed at bottom */}
      <div className="border-t border-border/40 bg-background">
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Account</h3>
          </div>
          
          {/* User info */}
          <div className="pl-7 mb-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground/70 truncate">
                {user?.email?.split('@')[0]}
              </p>
            </div>
          </div>

          {/* Sign out button */}
          <div className="pl-7">
            <Button 
              variant="destructive" 
              className="w-full justify-start h-9 text-sm font-normal" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
