
import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import FinnyVisualization from '@/components/finny/FinnyVisualization';

interface MessageVisualizationProps {
  visualData?: any;
  chartData: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

const MessageVisualization = ({ visualData, chartData }: MessageVisualizationProps) => {
  // Return null if we don't have visualization data or chart data
  if (!visualData && (!chartData || chartData.length === 0)) {
    return null;
  }

  // Check if we have actual values in the chart data
  const hasValidData = chartData.some(item => item.value > 0);
  
  if (!hasValidData) {
    return (
      <Card className="p-3 mt-2 bg-background/90 dark:bg-background/30 border border-muted overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
          {visualData?.type === 'category' ? <BarChart3 size={14} /> : <PieChartIcon size={14} />}
          <span>Finance Visualization</span>
        </div>
        <div className="w-full h-24 flex items-center justify-center bg-muted/30 rounded-md">
          <span className="text-xs text-muted-foreground">No data available for visualization</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 mt-2 bg-background/90 dark:bg-background/30 border border-muted overflow-hidden">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
        {visualData?.type === 'category' ? <BarChart3 size={14} /> : <PieChartIcon size={14} />}
        <span>Finance Visualization</span>
      </div>
      <div className="w-full rounded-md overflow-hidden">
        <FinnyVisualization 
          data={chartData}
          type={visualData?.type === 'category' ? 'bar' : 'pie'}
          height={120}
        />
      </div>
    </Card>
  );
};

export default MessageVisualization;
