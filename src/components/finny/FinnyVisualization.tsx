
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { CATEGORY_COLORS } from '@/utils/chartUtils';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { useIsMobile } from '@/hooks/use-mobile';

interface FinnyVisualizationProps {
  data: Array<{name: string; value: number; color?: string}>;
  type: 'pie' | 'bar';
  height?: number;
}

const FinnyVisualization = ({ data, type = 'pie', height = 120 }: FinnyVisualizationProps) => {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-24 flex items-center justify-center bg-muted/30 rounded-md">
        <span className="text-xs text-muted-foreground">No data available for visualization</span>
      </div>
    );
  }

  // Ensure all data items have colors
  const processedData = data.map(item => ({
    ...item,
    color: item.color || CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS] || '#94A3B8'
  }));

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 25 : 35}
            outerRadius={isMobile ? 45 : 55}
            paddingAngle={2}
            cornerRadius={3}
            dataKey="value"
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            formatter={(value: any) => formatCurrency(value, currencyCode)}
            labelFormatter={(index: any) => processedData[index]?.name}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  } else {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={processedData}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10 }}
            height={isMobile ? 20 : 30} 
            dy={5}
            interval={isMobile ? 1 : 0}
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            width={isMobile ? 35 : 50}
            tickFormatter={(value) => {
              if (value >= 1000) return `${Math.floor(value / 1000)}k`;
              return value.toString();
            }}
          />
          <RechartsTooltip
            formatter={(value: any) => formatCurrency(value, currencyCode)}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
};

export default FinnyVisualization;
