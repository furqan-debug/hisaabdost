
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Palette, Sun, Moon, Monitor, History, LogOut, User, Settings, Wallet, ArrowRightLeft, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/hooks/use-currency';
import { useCarryoverPreferences } from '@/hooks/useCarryoverPreferences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { CURRENCY_OPTIONS, CurrencyCode } from '@/utils/currencyUtils';
import { toast } from '@/components/ui/use-toast';
import { useIncomeDate } from '@/hooks/useIncomeDate';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsSidebar = ({
  isOpen,
  onClose
}: SettingsSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const { currencyCode, setCurrencyCode, version } = useCurrency();
  const { incomeDate, setIncomeDate, isLoading: isLoadingIncomeDate, isUpdating: isUpdatingIncomeDate } = useIncomeDate();
  const { preferences, updatePreferences, isUpdating } = useCarryoverPreferences();
  const { user } = useAuth();
  const { signOut } = useSignOut();
  const navigate = useNavigate();

  const handleMonthlySummaryClick = () => {
    navigate('/app/history');
    onClose();
  };

  const handleManageFundsClick = () => {
    navigate('/app/manage-funds');
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleCarryoverToggle = (enabled: boolean) => {
    updatePreferences({ auto_carryover_enabled: enabled });
  };

  const handleCurrencyChange = (value: string) => {
    console.log('Currency changing from:', currencyCode, 'to:', value);
    try {
      const newCurrency = value as CurrencyCode;
      
      // Update the context
      setCurrencyCode(newCurrency);
      
      // Force immediate UI update
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      console.log('Currency change completed');
      toast({
        title: "Currency Updated",
        description: `Currency changed to ${value}. Page will refresh to apply changes.`,
      });
    } catch (error) {
      console.error('Error changing currency:', error);
      toast({
        title: "Error",
        description: "Failed to change currency",
        variant: "destructive"
      });
    }
  };

  const handleIncomeDateChange = (value: string) => {
    const dateValue = Number(value);
    if (dateValue >= 1 && dateValue <= 31) {
      setIncomeDate(dateValue);
      toast({
        title: "Income Date Updated",
        description: `Income date set to ${dateValue}${dateValue === 1 ? 'st' : dateValue === 2 ? 'nd' : dateValue === 3 ? 'rd' : 'th'} of each month`,
      });
    }
  };

  // Generate ordinal suffix for date display
  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  console.log('Current currency code in settings:', currencyCode, 'version:', version);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with proper safe area handling */}
      <div className="px-6 py-6 border-b safe-area-top">
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

          {/* Currency */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-medium">Currency</h2>
            </div>
            <div className="ml-11">
              <p className="text-xs text-muted-foreground mb-2">Current: {currencyCode}</p>
              <Select 
                value={currencyCode} 
                onValueChange={handleCurrencyChange}
                key={`currency-select-${currencyCode}-${version}`}
              >
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-popover border shadow-lg z-[9999]">
                  {CURRENCY_OPTIONS.map(currency => (
                    <SelectItem 
                      key={currency.code} 
                      value={currency.code}
                      className="cursor-pointer hover:bg-accent focus:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-muted-foreground min-w-[24px]">
                          {currency.symbol}
                        </span>
                        <span>{currency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Income Settings - Improved UI/UX */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-medium">Income Settings</h2>
                <p className="text-xs text-muted-foreground">Configure your income cycle</p>
              </div>
            </div>
            
            <div className="ml-11 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="income-date-select" className="text-sm font-medium text-foreground">
                    Your income day
                  </label>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                    {incomeDate}{getOrdinalSuffix(incomeDate)} of month
                  </span>
                </div>
                
                <Select 
                  value={incomeDate.toString()} 
                  onValueChange={handleIncomeDateChange}
                  disabled={isLoadingIncomeDate || isUpdatingIncomeDate}
                >
                  <SelectTrigger className="w-full bg-background border-input hover:border-ring transition-colors">
                    <SelectValue placeholder="Select income date" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-popover border shadow-lg z-[9999]">
                    {Array.from({ length: 31 }).map((_, idx) => {
                      const day = idx + 1;
                      return (
                        <SelectItem 
                          key={day} 
                          value={day.toString()}
                          className="cursor-pointer hover:bg-accent focus:bg-accent"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{day}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {day}{getOrdinalSuffix(day)}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">💡 Tip:</span> Set the date you typically receive your main income. This helps align monthly tracking and reports with your personal income cycle for better budget management.
                  </p>
                </div>
                
                {(isLoadingIncomeDate || isUpdatingIncomeDate) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLoadingIncomeDate ? 'Loading...' : 'Updating...'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Settings */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-medium">Wallet</h2>
            </div>
            <div className="ml-11">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Auto Carryover</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically carry over leftover balance to next month
                  </p>
                </div>
                <Switch
                  checked={preferences?.auto_carryover_enabled ?? true}
                  onCheckedChange={handleCarryoverToggle}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Theme - Fixed to properly handle theme changes */}
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
                onClick={() => {
                  setTheme('light');
                  // Force immediate application
                  setTimeout(() => {
                    document.documentElement.classList.remove('dark');
                  }, 0);
                }}
              >
                <Sun className="w-4 h-4 mr-3" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => {
                  setTheme('dark');
                  // Force immediate application
                  setTimeout(() => {
                    document.documentElement.classList.add('dark');
                  }, 0);
                }}
              >
                <Moon className="w-4 h-4 mr-3" />
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => {
                  setTheme('system');
                  // Force immediate application based on system preference
                  setTimeout(() => {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }, 0);
                }}
              >
                <Monitor className="w-4 h-4 mr-3" />
                System
              </Button>
            </div>
          </div>

          {/* Activity */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="font-medium">Activity</h2>
            </div>
            <div className="ml-11 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={handleMonthlySummaryClick}
              >
                <History className="w-4 h-4 mr-3" />
                Monthly Summary
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={handleManageFundsClick}
              >
                <Wallet className="w-4 h-4 mr-3" />
                Manage Funds
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="p-6 safe-area-bottom">
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
