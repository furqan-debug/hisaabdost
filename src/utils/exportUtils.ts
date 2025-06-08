
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

// Check if we're on a mobile device (even in browser)
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Mobile-specific file download using Capacitor
const downloadFileOnMobile = async (content: string, filename: string, mimeType: string) => {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    
    console.log('Attempting to save file on mobile:', filename);
    
    // Write file to Documents directory
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: mimeType.includes('base64') ? undefined : undefined,
    });

    console.log('File written successfully:', result);

    // Try to share the file so user can save it to their preferred location
    try {
      const fileUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: filename
      });
      
      await Share.share({
        title: 'Export File',
        text: `Your exported ${filename}`,
        url: fileUri.uri,
      });
      
      toast({
        title: "Success",
        description: `File saved and shared: ${filename}`,
      });
    } catch (shareError) {
      console.log('Share failed, file still saved:', shareError);
      toast({
        title: "Success", 
        description: `File saved to Documents: ${filename}`,
      });
    }

    return result;
  } catch (error) {
    console.error('Mobile file save error:', error);
    
    // Fallback to web download
    console.log('Falling back to web download');
    downloadFileOnWeb(content, filename, mimeType);
    
    throw error;
  }
};

// Web-specific file download with mobile improvements
const downloadFileOnWeb = (content: string, filename: string, mimeType: string) => {
  try {
    console.log('Attempting web download:', filename, mimeType);
    
    // Create blob with proper MIME type
    const blob = new Blob([content], { type: mimeType });
    
    // For mobile browsers, try to open in new tab if download fails
    if (isMobileDevice()) {
      try {
        const dataUrl = URL.createObjectURL(blob);
        
        // Try traditional download first
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
        
        toast({
          title: "Download Started",
          description: "Check your downloads folder or browser notifications",
        });
      } catch (mobileError) {
        console.error('Mobile web download failed:', mobileError);
        
        // Last resort: try to open in new window
        const dataUrl = URL.createObjectURL(blob);
        window.open(dataUrl, '_blank');
        
        toast({
          title: "File Opened",
          description: "File opened in new tab. Use browser menu to save.",
        });
      }
    } else {
      // Desktop browser - standard download
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
    }
  } catch (error) {
    console.error('Web download error:', error);
    toast({
      title: "Error",
      description: "Failed to download file. Please try again.",
      variant: "destructive"
    });
  }
};

export const exportExpensesToCSV = async (expenses: Expense[]) => {
  try {
    console.log('Starting CSV export for', expenses.length, 'expenses');
    
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
    const mimeType = 'text/csv;charset=utf-8;';

    console.log('CSV content prepared, filename:', filename);

    // Check if running on mobile platform
    if (isNativePlatform()) {
      console.log('Using native platform download');
      await downloadFileOnMobile(csvContent, filename, mimeType);
    } else {
      console.log('Using web download');
      downloadFileOnWeb(csvContent, filename, mimeType);
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
    console.log('Starting PDF export for', expenses.length, 'expenses');
    
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

    console.log('PDF generated, filename:', filename);

    // Check if running on mobile platform
    if (isNativePlatform()) {
      try {
        console.log('Using native platform for PDF');
        // For mobile, get PDF as base64 string
        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1]; // Remove data:application/pdf;base64, prefix
        
        await downloadFileOnMobile(base64Data, filename, 'application/pdf;base64');
      } catch (error) {
        console.error('Native PDF save error, falling back:', error);
        // Fallback to web download
        const pdfBlob = doc.output('blob');
        const pdfDataUrl = URL.createObjectURL(pdfBlob);
        downloadFileOnWeb(pdfBlob, filename, 'application/pdf');
      }
    } else {
      console.log('Using web download for PDF');
      // For web, handle mobile browsers differently
      if (isMobileDevice()) {
        const pdfBlob = doc.output('blob');
        downloadFileOnWeb(pdfBlob, filename, 'application/pdf');
      } else {
        // Desktop - use jsPDF's built-in save
        doc.save(filename);
        
        toast({
          title: "Success",
          description: "PDF file exported successfully"
        });
      }
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
