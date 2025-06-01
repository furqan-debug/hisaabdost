
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Calendar, DollarSign, Palette, Sun, Moon, Monitor, History } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/hooks/use-currency';
import { useMonthContext } from '@/hooks/use-month-context';
import { MonthSelector } from './MonthSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsSidebar = ({ isOpen, onClose }: SettingsSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const { currencyCode, setCurrencyCode } = useCurrency();
  const { selectedMonth, setSelectedMonth } = useMonthContext();
  const navigate = useNavigate();

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'PKR', name: 'Pakistani Rupee (Rs)', symbol: 'Rs' },
    { code: 'BDT', name: 'Bangladeshi Taka (৳)', symbol: '৳' },
    { code: 'LKR', name: 'Sri Lankan Rupee (Rs)', symbol: 'Rs' },
    { code: 'NPR', name: 'Nepalese Rupee (Rs)', symbol: 'Rs' },
    { code: 'AFN', name: 'Afghan Afghani (؋)', symbol: '؋' },
    { code: 'SAR', name: 'Saudi Riyal (﷼)', symbol: '﷼' },
    { code: 'AED', name: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
    { code: 'QAR', name: 'Qatari Riyal (﷼)', symbol: '﷼' },
    { code: 'KWD', name: 'Kuwaiti Dinar (د.ك)', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar (.د.ب)', symbol: '.د.ب' },
    { code: 'OMR', name: 'Omani Rial (﷼)', symbol: '﷼' },
  ];

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  const handleHistoryClick = () => {
    navigate('/app/history');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png"
                  alt="Hisab Dost logo"
                  className="h-8 w-8 bg-white rounded shadow-sm"
                />
                <SheetTitle className="text-xl font-bold bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
                  Hisaab Dost
                </SheetTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Date Range Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Date Range</h3>
              </div>
              <MonthSelector
                selectedMonth={selectedMonth}
                onChange={handleMonthChange}
              />
            </div>

            {/* Currency Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Currency</h3>
              </div>
              <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Theme</h3>
              </div>
              <div className="space-y-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System (light)
                </Button>
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">History</h3>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleHistoryClick}
              >
                <History className="mr-2 h-4 w-4" />
                View Activity History
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSidebar;
