
import { Expense } from "@/components/expenses/types";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Helper to get formatted date for filenames
const getFormattedDate = () => format(new Date(), 'yyyy-MM-dd');

// Helper to get Hisaab Dost branded filename with date
const getBrandedFilename = (fileType: string) => `Hisaab_Dost_Expenses_${getFormattedDate()}.${fileType}`;

// Mobile-specific file download
const downloadFileOnMobile = async (content: string, filename: string, mimeType: string) => {
  try {
    // Write file to device storage
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: mimeType.includes('pdf') ? Encoding.UTF8 : Encoding.UTF8
    });

    toast({
      title: "Success",
      description: `File saved to Documents folder: ${filename}`,
    });

    return result;
  } catch (error) {
    console.error('Mobile file save error:', error);
    toast({
      title: "Error",
      description: "Failed to save file on mobile device",
      variant: "destructive"
    });
    throw error;
  }
};

// Web-specific file download (existing functionality)
const downloadFileOnWeb = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportExpensesToCSV = async (expenses: Expense[]) => {
  try {
    // Add Hisaab Dost branding in header
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      'Hisaab Dost - Expense Report',
      `Generated on: ${format(new Date(), 'PPP')}`,
      '',
      headers.join(','),
      ...expenses.map(exp => [
        format(new Date(exp.date), 'yyyy-MM-dd'),
        `"${exp.description}"`,
        exp.category,
        exp.amount
      ].join(','))
    ].join('\n');

    const filename = getBrandedFilename('csv');

    // Check if running on mobile platform
    if (Capacitor.isNativePlatform()) {
      await downloadFileOnMobile(csvContent, filename, 'text/csv;charset=utf-8;');
    } else {
      downloadFileOnWeb(csvContent, filename, 'text/csv;charset=utf-8;');
    }
    
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Success",
        description: "CSV file exported successfully"
      });
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast({
      title: "Error",
      description: "Failed to export CSV. Please try again.",
      variant: "destructive"
    });
  }
};

export const exportExpensesToPDF = async (expenses: Expense[]) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add Hisaab Dost branding header
    doc.setFontSize(18);
    doc.text('Hisaab Dost', 14, 22);
    
    doc.setFontSize(12);
    doc.text('Expense Report', 14, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 38);
    
    // Format data for table
    const tableData = expenses.map(exp => [
      format(new Date(exp.date), 'MMM dd, yyyy'),
      exp.description,
      exp.category,
      exp.amount.toFixed(2)
    ]);
    
    // Add table with expense data
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [67, 56, 202], // Primary color
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });
    
    // Add total at the bottom
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${total.toFixed(2)}`, 150, finalY + 10);
    
    const filename = getBrandedFilename('pdf');

    // Check if running on mobile platform
    if (Capacitor.isNativePlatform()) {
      // For mobile, get PDF as base64 string
      const pdfOutput = doc.output('datauristring');
      const base64Data = pdfOutput.split(',')[1]; // Remove data:application/pdf;base64, prefix
      
      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      toast({
        title: "Success",
        description: `PDF saved to Documents folder: ${filename}`
      });
    } else {
      // Save PDF for web
      doc.save(filename);
      
      toast({
        title: "Success",
        description: "PDF file exported successfully"
      });
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast({
      title: "Error",
      description: "Failed to export PDF. Please try again.",
      variant: "destructive"
    });
  }
};
