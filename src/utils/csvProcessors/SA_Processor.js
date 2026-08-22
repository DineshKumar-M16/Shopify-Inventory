export const SA_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to SA_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const sku1 = paddedRow[8] || '';
    const optimizedSku1 = cleanSKU(sku1);
    
    return {
      handleValue: paddedRow[0] || '',
      title: paddedRow[1] || '',
      option1n: paddedRow[2] || '',
      option1v: paddedRow[3] || '',
      option2n: paddedRow[4] || '',
      option2v: paddedRow[5] || '',
      option3n: paddedRow[6] || '',
      option3v: paddedRow[7] || '',
      skuno: sku1,
      hscode: paddedRow[9] || '',
      coo: paddedRow[10] || '',
      location: paddedRow[11] || '',
      unavailable: paddedRow[12] || '0',
      committed: paddedRow[13] || '0',
      available: paddedRow[14] || '0',
      onhandnew: paddedRow[15] || '0',
      optimizedSku1: optimizedSku1,
      status: 'Pending'
    };
  });
};

export const SA_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to SA_Client');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 4) {
      paddedRow.push('');
    }
    
    const sku2 = paddedRow[0] || '';
    const optimizedSku2 = cleanSKU(sku2);
    
    return {
      optimizedSku2: optimizedSku2,
      quantity: paddedRow[3] || '0'
    };
  });
};

export const SA_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for SA_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for SA_UpdateData');
    return shopifyData.map(item => ({
      ...item,
      onhandnew: '0',
      status: '❌ No client data'
    }));
  }
  
  return shopifyData.map(item1 => {
    let foundMatch = false;
    let newOnHand = 0;
    
    for (const item2 of clientData) {
      if (item1.optimizedSku1 === item2.optimizedSku2) {
        const availability = item2.quantity || '0';
        // Set to 0 if not a valid number
        newOnHand = isNumeric(availability) ? parseInt(availability).toString() : '0';
        foundMatch = true;
        break;
      }
    }
    
    return {
      ...item1,
      onhandnew: foundMatch ? newOnHand : '0',
      status: foundMatch ? '✅ Matched' : '❌ Not Found'
    };
  });
};

// Local helper functions
const cleanSKU = (sku) => {
  if (!sku) return '';
  let cleaned = sku.toString()
    .replace(/^(SO4|CO-|PE-|TZ-|TZ-K-)/i, '')
    .replace(/[\s_\-/\\\.]+/g, '')
    .toUpperCase();
  return cleaned;
};

const isNumeric = (str) => {
  if (typeof str !== 'string') return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};