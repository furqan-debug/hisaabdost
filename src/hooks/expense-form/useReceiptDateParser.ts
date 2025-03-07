
export function useReceiptDateParser() {
  const parseReceiptDate = (dateString: string): string => {
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      } 
      else if (dateString.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/)) {
        const dateParts = dateString.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
          let month = parseInt(dateParts[0], 10);
          let day = parseInt(dateParts[1], 10);
          let year = parseInt(dateParts[2], 10);
          
          if (isNaN(month) || isNaN(day) || isNaN(year) || 
              month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error("Invalid date components");
          }
          
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        } else {
          throw new Error("Invalid date format");
        }
      } 
      else {
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
          const isoDate = dateObj.toISOString().split('T')[0];
          
          const year = parseInt(isoDate.split('-')[0], 10);
          if (year >= 1900 && year <= 2100) {
            return isoDate;
          } else {
            throw new Error("Year out of reasonable range");
          }
        } else {
          throw new Error("Invalid date");
        }
      }
    } catch (err) {
      console.warn("Failed to parse date from receipt:", err);
      return new Date().toISOString().split('T')[0];
    }
  };

  return { parseReceiptDate };
}
