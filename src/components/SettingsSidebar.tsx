
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-0">
          
          {/* Date Range */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-medium">Date Range</h2>
            </div>
            <div className="ml-11">
              <MonthSelector selectedMonth={selectedMonth} onChange={handleMonthChange} />
            </div>
          </div>

          {/* Currency */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-medium">Currency</h2>
            </div>
            <div className="ml-11">
              <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-muted-foreground min-w-[24px]">
                          {currency.symbol}
                        </span>
                        <span>{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Theme */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-medium">Appearance</h2>
            </div>
            <div className="ml-11 space-y-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-3" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-3" />
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setTheme('system')}
              >
                <Monitor className="w-4 h-4 mr-3" />
                System
              </Button>
            </div>
          </div>

          {/* History */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="font-medium">Activity</h2>
            </div>
            <div className="ml-11">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={handleHistoryClick}
              >
                <History className="w-4 h-4 mr-3" />
                View History
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="font-medium">Account</h2>
            </div>
            
            {/* User Info */}
            <div className="ml-11 mb-4">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium truncate">
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
                className="w-full justify-start" 
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
