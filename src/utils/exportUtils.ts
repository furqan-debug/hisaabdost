
import { Expense } from "@/components/expenses/types";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";

// Helper to get formatted date for filenames
const getFormattedDate = () => format(new Date(), 'yyyy-MM-dd');

// Helper to get Hisaab Dost branded filename with date
const getBrandedFilename = (fileType: string) => `Hisaab_Dost_Expenses_${getFormattedDate()}.${fileType}`;

// Check if Capacitor is available and we're on a native platform
const isNativePlatform = () => {
  try {
    return typeof window !== 'undefined' && 
           window.Capacitor && 
           window.Capacitor.isNativePlatform && 
           window.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

// Mobile-specific file download using Capacitor
const downloadFileOnMobile = async (content: string, filename: string, isBase64: boolean = false) => {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: isBase64 ? undefined : undefined, // Let Capacitor handle encoding
    });

    console.log('File saved successfully:', result);
    
    toast({
      title: "Success",
      description: `File saved to Documents folder: ${filename}`,
    });

    return result;
  } catch (error) {
    console.error('Mobile file save error:', error);
    
    // Show user-friendly error message
    toast({
      title: "Error",
      description: "Failed to save file to device storage. Please check permissions.",
      variant: "destructive"
    });
    
    throw error;
  }
};

// Web-specific file download (fallback)
const downloadFileOnWeb = (content: string, filename: string, mimeType: string) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast({
      title: "Success",
      description: "File downloaded successfully"
    });
  } catch (error) {
    console.error('Web download error:', error);
    toast({
      title: "Error",
      description: "Failed to download file",
      variant: "destructive"
    });
  }
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
        `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes properly
        exp.category,
        exp.amount
      ].join(','))
    ].join('\n');

    const filename = getBrandedFilename('csv');

    // Check if running on mobile platform
    if (isNativePlatform()) {
      await downloadFileOnMobile(csvContent, filename, false);
    } else {
      downloadFileOnWeb(csvContent, filename, 'text/csv;charset=utf-8;');
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
    if (isNativePlatform()) {
      try {
        // For mobile, get PDF as base64 string
        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1]; // Remove data:application/pdf;base64, prefix
        
        await downloadFileOnMobile(base64Data, filename, true);
      } catch (error) {
        console.error('Mobile PDF save error:', error);
        // Fallback to web download
        doc.save(filename);
        toast({
          title: "Info",
          description: "Downloaded using browser download instead of mobile storage"
        });
      }
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
