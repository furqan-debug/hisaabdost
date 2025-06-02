import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Calendar, DollarSign, Palette, Sun, Moon, Monitor, History, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/hooks/use-currency';
import { useMonthContext } from '@/hooks/use-month-context';
import { MonthSelector } from './MonthSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  return <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 pb-4 border-b bg-gradient-to-r from-[#6E59A5]/5 to-[#9b87f5]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <img src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" alt="Hisab Dost logo" className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
              Hisaab Dost
            </h2>
          </div>
          
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Date Range Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-foreground">Date Range</h3>
          </div>
          <div className="ml-11">
            <MonthSelector selectedMonth={selectedMonth} onChange={handleMonthChange} />
          </div>
        </div>

        {/* Currency Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground">Currency</h3>
          </div>
          <div className="ml-11">
            <Select value={currencyCode} onValueChange={setCurrencyCode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.name}</span>
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Theme Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-foreground">Theme</h3>
          </div>
          <div className="ml-11 space-y-2">
            <Button variant={theme === 'light' ? 'default' : 'ghost'} className="w-full justify-start h-10" onClick={() => setTheme('light')}>
              <Sun className="mr-3 h-4 w-4" />
              Light
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'ghost'} className="w-full justify-start h-10" onClick={() => setTheme('dark')}>
              <Moon className="mr-3 h-4 w-4" />
              Dark
            </Button>
            <Button variant={theme === 'system' ? 'default' : 'ghost'} className="w-full justify-start h-10" onClick={() => setTheme('system')}>
              <Monitor className="mr-3 h-4 w-4" />
              System (light)
            </Button>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <History className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-foreground">History</h3>
          </div>
          <div className="ml-11">
            <Button variant="ghost" className="w-full justify-start h-10 hover:bg-muted" onClick={handleHistoryClick}>
              <History className="mr-3 h-4 w-4" />
              View Activity History
            </Button>
          </div>
        </div>
      </div>

      {/* Account Section - Fixed at bottom */}
      <div className="border-t bg-muted/30 p-6 py-[13px] px-[25px]">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950/30">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="font-semibold text-foreground">Account</h3>
          </div>
          
          {/* User info */}
          <div className="ml-11 mb-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email?.split('@')[0]}
              </p>
            </div>
          </div>

          {/* Sign out button */}
          <div className="ml-11">
            <Button variant="destructive" className="w-full justify-start h-10" onClick={handleSignOut}>
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default SettingsSidebar;