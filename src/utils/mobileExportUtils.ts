
import { toast } from "@/components/ui/use-toast";

// Platform detection utilities
export const isNativePlatform = () => {
  try {
    return typeof window !== 'undefined' && 
           window.Capacitor && 
           window.Capacitor.isNativePlatform && 
           window.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const isAndroid = () => {
  try {
    return typeof window !== 'undefined' && 
           navigator.userAgent.toLowerCase().includes('android');
  } catch {
    return false;
  }
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Enhanced mobile file download using Capacitor
export const downloadFileOnMobile = async (content: string, filename: string, mimeType: string, isBase64: boolean = false) => {
  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    
    console.log('Attempting to save budget file on mobile:', filename);
    
    let savedPath = '';
    let savedUri = '';
    
    if (isAndroid()) {
      try {
        // For Android, try to write to Documents directory first
        const docResult = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Documents,
          encoding: isBase64 ? undefined : Encoding.UTF8
        });
        
        savedPath = docResult.uri;
        console.log('Budget file saved to Documents:', savedPath);
        
        // Get URI for documents file
        const docUri = await Filesystem.getUri({
          directory: Directory.Documents,
          path: filename
        });
        savedUri = docUri.uri;
        
      } catch (docError) {
        console.log('Documents directory failed, trying Cache:', docError);
        
        // Fallback to Cache directory
        const cacheResult = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
          encoding: isBase64 ? undefined : Encoding.UTF8
        });
        
        savedPath = cacheResult.uri;
        console.log('Budget file saved to Cache:', savedPath);
        
        // Get URI for cache file
        const cacheUri = await Filesystem.getUri({
          directory: Directory.Cache,
          path: filename
        });
        savedUri = cacheUri.uri;
      }
    } else {
      // For iOS, use Documents directory
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        encoding: isBase64 ? undefined : Encoding.UTF8
      });
      
      savedPath = result.uri;
      console.log('Budget file saved to Documents:', savedPath);
      
      // Get URI for documents file
      const docUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: filename
      });
      savedUri = docUri.uri;
    }
    
    console.log('Budget file URI for sharing:', savedUri);

    // Always share the file so user can save it to Downloads
    await Share.share({
      title: 'Hisaab Dost Budget Export',
      text: `Your exported budget file: ${filename}`,
      url: savedUri,
      dialogTitle: 'Save or Share your budget export'
    });
    
    toast({
      title: "Budget Export Complete!",
      description: `Budget file exported successfully. Use the share dialog to save to Downloads or share with other apps.`,
    });

    return { uri: savedPath };
  } catch (error) {
    console.error('Mobile budget file save error:', error);
    
    toast({
      title: "Budget Export Failed",
      description: "Unable to export budget file on mobile. Please try again.",
      variant: "destructive"
    });
    
    throw error;
  }
};

// Web-specific file download
export const downloadFileOnWeb = (content: string, filename: string, mimeType: string) => {
  try {
    console.log('Attempting web budget download:', filename, mimeType);
    
    // Create blob with proper MIME type
    const blob = new Blob([content], { type: mimeType });
    
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
        
        toast({
          title: "Budget Download Started",
          description: "Check your Downloads folder or browser notifications",
        });
      } catch (mobileError) {
        console.error('Mobile web budget download failed:', mobileError);
        
        // Last resort: direct blob URL
        const dataUrl = URL.createObjectURL(blob);
        window.open(dataUrl, '_blank');
        
        toast({
          title: "Budget File Opened",
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
        title: "Budget Export Success",
        description: "Budget file downloaded successfully"
      });
    }
  } catch (error) {
    console.error('Web budget download error:', error);
    toast({
      title: "Budget Export Error",
      description: "Failed to download budget file. Please try again.",
      variant: "destructive"
    });
  }
};
