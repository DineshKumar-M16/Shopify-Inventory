// Simple processor loader using ES modules

export const getProcessor = async (vendorCode) => {
  try {
    switch (vendorCode) {
      case 'BS':
        return await import('./csvProcessors/BS_Processor');
      case 'DLD':
        return await import('./csvProcessors/DLD_Processor');
      case 'EJS':
        return await import('./csvProcessors/EJS_Processor');
      case 'FERRINI':
        return await import('./csvProcessors/Ferrini_Processor');
      case 'GLOBEFW':
        return await import('./csvProcessors/GLOBEFW_Processor');
      case 'MDM':
        return await import('./csvProcessors/MDM_Processor');
      case 'PELLAGIO':
        return await import('./csvProcessors/Pellagio_Processor');
      case 'RIVELINO':
        return await import('./csvProcessors/Rivelino_Processor');
      case 'SA':
        return await import('./csvProcessors/SA_Processor');
      case 'STMNT':
        return await import('./csvProcessors/STMNT_Processor');
      case 'VERNO':
        return await import('./csvProcessors/Verno_Processor');
      case 'VINCI':
        return await import('./csvProcessors/Vinci_Processor');
      default:
        return await import('./csvProcessors/GLOBEFW_Processor');
    }
  } catch (error) {
    console.error('Error loading processor:', error);
    // Return a default processor or throw
    return await import('./csvProcessors/GLOBEFW_Processor');
  }
};