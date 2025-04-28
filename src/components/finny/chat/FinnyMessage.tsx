
import React, { useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { PieChart as PieChartIcon, BarChart3, Check, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCurrency } from '@/hooks/use-currency';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { CATEGORY_COLORS } from '@/utils/chartUtils';
import { formatCurrency } from '@/utils/formatters';

interface FinnyMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasAction?: boolean;
  visualData?: any;
}

const FinnyMessage = ({ content, isUser, timestamp, hasAction, visualData }: FinnyMessageProps) => {
  const { currencyCode } = useCurrency();

  // Remove any action markers from the message content for display
  const formattedContent = content.replace(/\[ACTION:(.*?)\]/g, '');
  
  // Check for links in the content
  const hasLinks = formattedContent.includes('http://') || formattedContent.includes('https://');
  
  // Format the timestamp
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Check for success/error indicators
  const isSuccess = formattedContent.includes('✅');
  const isError = formattedContent.includes('❌');

  // Detect emotional tone in message to apply appropriate styling
  const isEmpathetic = 
    !isUser &&
    (formattedContent.toLowerCase().includes("i understand") ||
     formattedContent.toLowerCase().includes("don't worry") ||
     formattedContent.toLowerCase().includes("sorry to hear") ||
     formattedContent.toLowerCase().includes("completely understand"));

  // Generate visualization data based on content
  const chartData = useMemo(() => {
    // Default data if no visualization data is provided or for spending-chart
    if (!visualData || visualData.type === 'spending-chart') {
      // Extract spending amounts from message content
      const foodMatch = formattedContent.match(/Food:?\s*\$?(\d+\.?\d*)/i);
      const utilitiesMatch = formattedContent.match(/Utilities:?\s*\$?(\d+\.?\d*)/i);
      const entertainmentMatch = formattedContent.match(/Entertainment:?\s*\$?(\d+\.?\d*)/i);
      const housingMatch = formattedContent.match(/Housing:?\s*\$?(\d+\.?\d*)/i);
      const transportationMatch = formattedContent.match(/Transportation:?\s*\$?(\d+\.?\d*)/i);
      const shoppingMatch = formattedContent.match(/Shopping:?\s*\$?(\d+\.?\d*)/i);
      
      const data = [
        { name: 'Food', value: foodMatch ? parseFloat(foodMatch[1]) : 0, color: CATEGORY_COLORS['Groceries'] || '#FF9F7A' },
        { name: 'Utilities', value: utilitiesMatch ? parseFloat(utilitiesMatch[1]) : 0, color: CATEGORY_COLORS['Utilities'] || '#A17FFF' },
        { name: 'Entertainment', value: entertainmentMatch ? parseFloat(entertainmentMatch[1]) : 0, color: CATEGORY_COLORS['Entertainment'] || '#FACC15' },
        { name: 'Housing', value: housingMatch ? parseFloat(housingMatch[1]) : 0, color: CATEGORY_COLORS['Housing'] || '#4ADE80' },
        { name: 'Transportation', value: transportationMatch ? parseFloat(transportationMatch[1]) : 0, color: CATEGORY_COLORS['Transportation'] || '#F87DB5' },
        { name: 'Shopping', value: shoppingMatch ? parseFloat(shoppingMatch[1]) : 0, color: CATEGORY_COLORS['Shopping'] || '#FF7A92' }
      ];
      
      // Filter out categories with zero value
      return data.filter(item => item.value > 0);
    }
    
    // Use provided visual data if available
    if (visualData && visualData.transactions && Array.isArray(visualData.transactions)) {
      return visualData.transactions.map((transaction: any) => ({
        name: transaction.description || transaction.category,
        value: transaction.amount,
        color: CATEGORY_COLORS[transaction.category] || '#94A3B8'
      })).slice(0, 5); // Limit to top 5 for clarity
    }
    
    // If we have category data
    if (visualData && visualData.type === 'category' && visualData.category) {
      const categoryName = visualData.category;
      const monthlyData = [];
      
      // Create monthly trend data for this category
      const currentDate = new Date();
      for (let i = 3; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        // Generate some sample values for the trend
        const baseValue = visualData.total ? visualData.total / (i+1) * (Math.random() * 0.5 + 0.75) : (Math.random() * 100 + 50);
        
        monthlyData.push({
          name: monthName,
          value: Math.round(baseValue * 100) / 100, 
          color: CATEGORY_COLORS[categoryName] || '#94A3B8'
        });
      }
      
      return monthlyData;
    }
    
    // Default empty data
    return [];
  }, [formattedContent, visualData]);

  const renderVisualization = () => {
    // Choose chart type based on visualData type
    const chartType = visualData?.type === 'category' ? 'bar' : 'pie';
    
    if (chartData.length === 0) {
      return (
        <div className="w-full h-24 flex items-center justify-center bg-muted/30 rounded-md">
          <span className="text-xs text-muted-foreground">No data available for visualization</span>
        </div>
      );
    }
    
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={45}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: any) => formatCurrency(value, currencyCode)}
              labelFormatter={(index: any) => chartData[index]?.name}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={30} />
            <RechartsTooltip 
              formatter={(value: any) => formatCurrency(value, currencyCode)}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <motion.div
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: isUser ? 0 : 0.1
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar>
              <AvatarImage 
                src={
                  isUser 
                    ? "/lovable-uploads/636d3f3b-f98d-4539-a003-5afe36b96701.png" 
                    : "/lovable-uploads/37d37218-6a8c-434e-b03d-977ee786a0b1.png"
                } 
                alt={isUser ? "User" : "Finny"}
              />
              <AvatarFallback>
                {isUser ? 'You' : 'F'}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isUser ? 'You' : 'Finny'} • {timeAgo}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className={`
        max-w-[85%] rounded-lg px-3.5 py-2.5 shadow-sm
        ${isUser 
          ? 'bg-green-500 text-white' 
          : isEmpathetic 
            ? 'bg-[#3e3559] text-white' // More empathetic tone for supportive messages
            : 'bg-[#352F44] text-white'
        }
        ${hasLinks || hasAction || visualData ? 'space-y-2' : ''}
      `}>
        <div className="text-sm whitespace-pre-wrap break-words">
          {formattedContent}
        </div>
        
        {/* Visual Data - Renders actual charts instead of placeholder */}
        {(visualData || formattedContent.includes('$')) && (
          <Card className="p-3 mt-2 bg-background/90 dark:bg-background/30 border border-muted overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              {visualData?.type === 'category' ? <BarChart3 size={14} /> : <PieChartIcon size={14} />}
              <span>Finance Visualization</span>
            </div>
            <div className="w-full rounded-md overflow-hidden">
              {renderVisualization()}
            </div>
          </Card>
        )}

        {/* Action result indicators */}
        {hasAction && (
          <div className="flex gap-1.5 items-center mt-1">
            <Badge variant="outline" className={`
              text-[10px] py-0 px-1.5 
              ${isSuccess 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                : isError 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'}
            `}>
              <span className="flex items-center gap-1">
                {isSuccess && <Check size={10} />}
                {isError && <AlertCircle size={10} />}
                {isSuccess ? 'Action completed' : isError ? 'Action failed' : 'Action'}
              </span>
            </Badge>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-1.5 flex-wrap">
            {!isUser && content.toLowerCase().includes('budget') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
                budget
              </Badge>
            )}
            {!isUser && content.toLowerCase().includes('expense') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
                expense
              </Badge>
            )}
            {!isUser && content.toLowerCase().includes('goal') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                goal
              </Badge>
            )}
            {!isUser && isEmpathetic && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                support
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-white/70 ml-auto flex items-center gap-1">
            <Clock size={10} />
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

export default FinnyMessage;
