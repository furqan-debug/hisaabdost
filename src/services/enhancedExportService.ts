
import { format } from 'date-fns';
import { Expense } from '@/components/expenses/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

interface ExportOptions {
  format: 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  includeReceiptUrls?: boolean;
  includeNotes?: boolean;
  groupByCategory?: boolean;
}

interface BudgetExportData {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export class EnhancedExportService {
  static async exportExpenses(expenses: Expense[], options: ExportOptions) {
    try {
      const filteredExpenses = this.filterExpenses(expenses, options);
      
      if (options.format === 'csv') {
        return this.exportExpensesToCSV(filteredExpenses, options);
      } else {
        return this.exportExpensesToPDF(filteredExpenses, options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
      throw error;
    }
  }

  static async exportBudgetReport(budgets: BudgetExportData[], month: string, options: ExportOptions) {
    try {
      if (options.format === 'csv') {
        return this.exportBudgetToCSV(budgets, month);
      } else {
        return this.exportBudgetToPDF(budgets, month);
      }
    } catch (error) {
      console.error('Budget export failed:', error);
      toast.error('Budget export failed. Please try again.');
      throw error;
    }
  }

  private static filterExpenses(expenses: Expense[], options: ExportOptions): Expense[] {
    let filtered = expenses;

    // Filter by date range
    if (options.dateRange?.start && options.dateRange?.end) {
      filtered = filtered.filter(expense => 
        expense.date >= options.dateRange!.start && expense.date <= options.dateRange!.end
      );
    }

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(expense => 
        options.categories!.includes(expense.category)
      );
    }

    return filtered;
  }

  private static exportExpensesToCSV(expenses: Expense[], options: ExportOptions) {
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Category',
      'Payment Method'
    ];

    if (options.includeNotes) headers.push('Notes');
    if (options.includeReceiptUrls) headers.push('Receipt URL');

    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => {
        const row = [
          expense.date,
          `"${expense.description.replace(/"/g, '""')}"`,
          expense.amount.toFixed(2),
          expense.category,
          expense.paymentMethod || 'Cash'
        ];

        if (options.includeNotes) {
          row.push(`"${(expense.notes || '').replace(/"/g, '""')}"`);
        }
        if (options.includeReceiptUrls) {
          row.push(expense.receiptUrl || '');
        }

        return row.join(',');
      })
    ].join('\n');

    this.downloadFile(csvContent, `expenses-export-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
    toast.success(`Exported ${expenses.length} expenses to CSV`);
  }

  private static exportExpensesToPDF(expenses: Expense[], options: ExportOptions) {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(16);
    pdf.text('Expense Report', 14, 22);
    
    // Date range info
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 32);
    
    if (options.dateRange?.start && options.dateRange?.end) {
      pdf.text(`Period: ${format(new Date(options.dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(options.dateRange.end), 'MMM dd, yyyy')}`, 14, 38);
    }

    // Summary
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    pdf.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 14, 48);
    pdf.text(`Number of Transactions: ${expenses.length}`, 14, 54);

    // Table headers
    const headers = ['Date', 'Description', 'Amount', 'Category'];
    if (options.includeNotes) headers.push('Notes');

    // Table data
    const tableData = expenses.map(expense => {
      const row = [
        format(new Date(expense.date), 'MM/dd/yyyy'),
        expense.description.length > 30 ? expense.description.substring(0, 30) + '...' : expense.description,
        `$${expense.amount.toFixed(2)}`,
        expense.category
      ];

      if (options.includeNotes && expense.notes) {
        row.push(expense.notes.length > 20 ? expense.notes.substring(0, 20) + '...' : expense.notes);
      } else if (options.includeNotes) {
        row.push('');
      }

      return row;
    });

    // Add table
    (pdf as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    pdf.save(`expenses-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success(`Exported ${expenses.length} expenses to PDF`);
  }

  private static exportBudgetToCSV(budgets: BudgetExportData[], month: string) {
    const headers = ['Category', 'Budget', 'Spent', 'Remaining', 'Percentage Used'];
    
    const csvContent = [
      headers.join(','),
      ...budgets.map(budget => [
        budget.category,
        budget.budget.toFixed(2),
        budget.spent.toFixed(2),
        budget.remaining.toFixed(2),
        `${budget.percentage.toFixed(1)}%`
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, `budget-report-${month}.csv`, 'text/csv');
    toast.success(`Exported budget report for ${month}`);
  }

  private static exportBudgetToPDF(budgets: BudgetExportData[], month: string) {
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text(`Budget Report - ${month}`, 14, 22);
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 32);

    // Summary calculations
    const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    pdf.text(`Total Budget: $${totalBudget.toFixed(2)}`, 14, 48);
    pdf.text(`Total Spent: $${totalSpent.toFixed(2)}`, 14, 54);
    pdf.text(`Total Remaining: $${totalRemaining.toFixed(2)}`, 14, 60);

    const tableData = budgets.map(budget => [
      budget.category,
      `$${budget.budget.toFixed(2)}`,
      `$${budget.spent.toFixed(2)}`,
      `$${budget.remaining.toFixed(2)}`,
      `${budget.percentage.toFixed(1)}%`
    ]);

    (pdf as any).autoTable({
      head: [['Category', 'Budget', 'Spent', 'Remaining', 'Used %']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    pdf.save(`budget-report-${month}.pdf`);
    toast.success(`Exported budget report for ${month}`);
  }

  private static downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
