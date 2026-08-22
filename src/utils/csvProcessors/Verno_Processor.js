export const Verno_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Verno_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    let itemno = '', color = '', neckSize = '', sleeveSize = '', final_sku = '';
    
    if (!isEmpty(skuno)) {
      const parts = skuno.split('_');
      itemno = parts[0] || '';
      color = cleanColor(parts[1] || '');
      const neckSleeve = parts[2] || '';
      const neckParts = neckSleeve.split('-');
      neckSize = neckParts[0] || '';
      sleeveSize = (parts[3] || '').replace('-', '/');
      final_sku = [itemno, color, neckSize, sleeveSize].filter(Boolean).join('_');
    }
    
    return {
      handleValue: paddedRow[0] || '',
      title: paddedRow[1] || '',
      option1n: paddedRow[2] || '',
      option1v: paddedRow[3] || '',
      option2n: paddedRow[4] || '',
      option2v: paddedRow[5] || '',
      option3n: paddedRow[6] || '',
      option3v: paddedRow[7] || '',
      skuno: skuno,
      hscode: paddedRow[9] || '',
      coo: paddedRow[10] || '',
      location: paddedRow[11] || '',
      unavailable: paddedRow[12] || '0',
      committed: paddedRow[13] || '0',
      available: paddedRow[14] || '0',
      onhandnew: paddedRow[15] || '0',
      itemno: itemno,
      color: color,
      neckSize: neckSize,
      sleeveSize: sleeveSize,
      final_sku: final_sku,
      status: 'Pending'
    };
  });
};

export const Verno_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Verno_Client');
    return [];
  }
  
  const result = [];
  let inTable = false;
  let header = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // Find the table header
    if (row[0] && row[0].toString().trim().startsWith('Item No')) {
      header = row;
      inTable = true;
      continue;
    }
    
    if (!inTable) continue;
    
    // Check for end of table
    const firstCell = (row[0] || '').toString().trim();
    if (!firstCell || firstCell.toLowerCase() === 'total') {
      inTable = false;
      continue;
    }
    
    const itemno = firstCell;
    const color = cleanColor((row[1] || '').toString().trim());
    
    // Process size columns (starting from column 3)
    for (let j = 3; j < header.length - 1 && j < row.length; j++) {
      const sizeLabel = (header[j] || '').toString().trim();
      if (!sizeLabel) continue;
      
      const sizeLabelParts = sizeLabel.split(' ');
      let neckSize = sizeLabelParts[0] || '';
      if (neckSize) {
        const floatNeck = parseFloat(neckSize);
        neckSize = (Math.floor(floatNeck) === floatNeck) ? 
                   parseInt(floatNeck).toString() : floatNeck.toString();
      }
      const sleeveSize = sizeLabelParts[1] || '';
      const available = parseInt((row[j] || '0').toString().trim()) || 0;
      
      const final_sku = [itemno, color, neckSize, sleeveSize].filter(Boolean).join('_');
      
      result.push({
        itemno: itemno,
        color: color,
        neckSize: neckSize,
        sleeveSize: sleeveSize,
        final_sku: final_sku,
        available: available.toString()
      });
    }
  }
  
  return result;
};

export const Verno_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for Verno_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for Verno_UpdateData');
    return shopifyData.map(item => ({
      ...item,
      onhandnew: '0',
      status: '❌ No client data'
    }));
  }
  
  return shopifyData.map(item1 => {
    let found = false;
    let newOnHand = 0;
    
    for (const item2 of clientData) {
      if (item1.final_sku === item2.final_sku) {
        newOnHand = item2.available || '0';
        found = true;
        break;
      }
    }
    
    return {
      ...item1,
      onhandnew: found ? newOnHand : '0',
      status: found ? '✅ Matched' : '❌ Not Found'
    };
  });
};

// Local helper functions
const cleanColor = (str) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/\s/g, '');
};

const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};