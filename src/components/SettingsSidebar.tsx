
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Palette, Sun, Moon, Monitor, History, LogOut, User, Settings } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const { currencyCode, setCurrencyCode } = useCurrency();
  const { selectedMonth, setSelectedMonth } = useMonthContext();
  const { user } = useAuth();
  const { signOut } = useSignOut();
  const navigate = useNavigate();

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: '﷼' }
  ];

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
    <div className="h-full flex flex-col bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          
          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-base font-medium text-foreground">Date Range</h2>
            </div>
            <div className="ml-11">
              <MonthSelector selectedMonth={selectedMonth} onChange={handleMonthChange} />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Currency */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-base font-medium text-foreground">Currency</h2>
            </div>
            <div className="ml-11">
              <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger className="w-full h-11 bg-background border-border/60 hover:border-border transition-colors">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-muted-foreground min-w-[24px]">
                          {currency.symbol}
                        </span>
                        <span className="text-sm">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-base font-medium text-foreground">Appearance</h2>
            </div>
            <div className="ml-11 space-y-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'ghost'} 
                className="w-full justify-start h-11 font-normal" 
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-3" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'ghost'} 
                className="w-full justify-start h-11 font-normal" 
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-3" />
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'ghost'} 
                className="w-full justify-start h-11 font-normal" 
                onClick={() => setTheme('system')}
              >
                <Monitor className="w-4 h-4 mr-3" />
                System
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* History */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-base font-medium text-foreground">Activity</h2>
            </div>
            <div className="ml-11">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-11 font-normal hover:bg-accent/50" 
                onClick={handleHistoryClick}
              >
                <History className="w-4 h-4 mr-3" />
                View History
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Account Section - Fixed at bottom */}
      <div className="border-t border-border/50 bg-muted/30">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-medium text-foreground">Account</h2>
            </div>
            
            {/* User Info */}
            <div className="ml-11 mb-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {user?.email?.split('@')[0]}
                </p>
              </div>
            </div>

            {/* Sign Out */}
            <div className="ml-11">
              <Button 
                variant="destructive" 
                className="w-full justify-start h-11 font-normal" 
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
