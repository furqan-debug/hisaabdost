
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

// Enhanced mobile file download using Capacitor with proper Android handling
const downloadFileOnMobile = async (content: string, filename: string, mimeType: string, isBase64: boolean = false) => {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    
    console.log('Attempting to save file on mobile:', filename);
    
    // For Android, use Downloads directory for better user access
    const directory = Directory.Downloads;
    
    // Write file to Downloads directory
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: directory,
      encoding: isBase64 ? undefined : undefined, // Let Capacitor handle encoding
    });

    console.log('File written successfully to Downloads:', result);

    // Get the file URI for sharing
    const fileUri = await Filesystem.getUri({
      directory: directory,
      path: filename
    });
    
    console.log('File URI:', fileUri.uri);

    // Share the file so user can access it easily
    await Share.share({
      title: 'Hisaab Dost Export',
      text: `Your exported file: ${filename}`,
      url: fileUri.uri,
    });
    
    toast({
      title: "Success!",
      description: `File saved to Downloads folder and shared: ${filename}`,
    });

    return result;
  } catch (error) {
    console.error('Mobile file save error:', error);
    
    // Show more specific error message
    toast({
      title: "Download Failed",
      description: "Unable to save to device. Trying alternative method...",
      variant: "destructive"
    });
    
    // Fallback to web download
    console.log('Falling back to web download');
    downloadFileOnWeb(content, filename, mimeType);
    
    throw error;
  }
};

// Web-specific file download with enhanced mobile support
const downloadFileOnWeb = (content: string | Blob, filename: string, mimeType: string) => {
  try {
    console.log('Attempting web download:', filename, mimeType);
    
    // Create blob with proper MIME type
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    
    // Enhanced mobile browser handling
    if (isMobileDevice()) {
      try {
        const dataUrl = URL.createObjectURL(blob);
        
        // Create a hidden download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to DOM and trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(dataUrl);
        }, 1000);
        
        // Try to open in new tab as backup
        setTimeout(() => {
          const newWindow = window.open(dataUrl, '_blank');
          if (!newWindow) {
            console.log('Popup blocked, showing instructions');
            toast({
              title: "Download Ready",
              description: "If download didn't start, please check your browser's download settings.",
            });
          }
        }, 500);
        
        toast({
          title: "Download Started",
          description: "Check your Downloads folder or browser notifications",
        });
      } catch (mobileError) {
        console.error('Mobile web download failed:', mobileError);
        
        // Last resort: direct blob URL
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
    
    // Add UTF-8 BOM for proper encoding
    const BOM = '\uFEFF';
    
    // Add Hisaab Dost branding in header
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = BOM + [
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
      await downloadFileOnMobile(csvContent, filename, mimeType, false);
    } else {
      console.log('Using web download');
      downloadFileOnWeb(csvContent, filename, mimeType);
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast({
      title: "Export Failed",
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
        
        await downloadFileOnMobile(base64Data, filename, 'application/pdf', true);
      } catch (error) {
        console.error('Native PDF save error, falling back:', error);
        // Fallback to web download
        const pdfBlob = doc.output('blob');
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
      title: "Export Failed",
      description: "Failed to export PDF. Please try again.",
      variant: "destructive"
    });
  }
};
