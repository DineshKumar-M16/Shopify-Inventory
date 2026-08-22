// Export all processors from a single location
import * as BS from '../csvProcessors/BS_Processor';
import * as DLD from '../csvProcessors/DLD_Processor';
import * as EJS from '../csvProcessors/EJS_Processor';
import * as FERRINI from '../csvProcessors/Ferrini_Processor';
import * as GLOBEFW from '../csvProcessors/GLOBEFW_Processor';
import * as MDM from '../csvProcessors/MDM_Processor';
import * as PELLAGIO from '../csvProcessors/Pellagio_Processor';
import * as RIVELINO from '../csvProcessors/Rivelino_Processor';
import * as SA from '../csvProcessors/SA_Processor';
import * as STMNT from '../csvProcessors/STMNT_Processor';
import * as VERNO from '../csvProcessors/Verno_Processor';
import * as VINCI from '../csvProcessors/Vinci_Processor';

// Helper to get processor by vendor code
export const getProcessor = (vendorCode) => {
  const processors = {
    BS: BS,
    GLOBEFW: GLOBEFW,
    DLD: DLD,
    EJS: EJS,
    FERRINI: FERRINI,
    MDM: MDM,
    PELLAGIO: PELLAGIO,
    RIVELINO: RIVELINO,
    SA: SA,
    STMNT: STMNT,
    VERNO: VERNO,
    VINCI: VINCI
  };
  
  return processors[vendorCode] || processors.GLOBEFW; // Default to GLOBEFW
};

// Also export all processors directly
export {
  BS,
  DLD,
  EJS,
  FERRINI,
  GLOBEFW,
  MDM,
  PELLAGIO,
  RIVELINO,
  SA,
  STMNT,
  VERNO,
  VINCI
};