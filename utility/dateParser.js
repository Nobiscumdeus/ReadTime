// Universal date parser utility
exports.parseAnyDate = (dateInput) => {
    // Try ISO format first
    let date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;
    
    // Fallback for MM/DD/YYYY
    date = new Date(dateInput.replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3'));
    if (!isNaN(date.getTime())) return date;
    
    // Final fallback - force YYYY-MM-DD
    const parts = String(dateInput).split(/[-/]/);
    if (parts.length === 3) {
      const year = parts[0].length === 2 ? `20${parts[0]}` : parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return new Date(`${year}-${month}-${day}`);
    }
    
    return null;
  };