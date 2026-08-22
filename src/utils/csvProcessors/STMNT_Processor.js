export const STMNT_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to STMNT_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    const skuParts = skuno.split('_');
    let sku1 = skuno;
    
    if (skuParts.length >= 3) {
      const style1 = (skuParts[0] || '').toUpperCase();
      const color1 = cleanString(skuParts[1] || '');
      const size1 = (skuParts[2] || '').toUpperCase();
      sku1 = `${style1}_${color1}_${size1}`;
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
      sku1: sku1,
      status: 'Pending'
    };
  });
};

export const STMNT_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to STMNT_Client');
    return [];
  }
  
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    const currentRow = data[i];
    if (!currentRow || currentRow.length < 2) continue;
    
    const sku = currentRow[0] || '';
    const color = cleanString(currentRow[1] || '');
    
    // Check if next row exists and has data
    if (i + 1 < data.length && data[i + 1].length > 2) {
      const nextRow = data[i + 1];
      const sizes = currentRow.slice(2); // All columns from index 2 are sizes
      const available = nextRow.slice(2); // Corresponding quantities
      
      // Match each size with its availability
      const minLength = Math.min(sizes.length, available.length);
      for (let j = 0; j < minLength; j++) {
        const size = (sizes[j] || '').toString().trim();
        if (size) {
          const sku_combined = `${sku}_${color}_${size}`;
          result.push({
            sku2: sku_combined,
            color: color,
            size: size,
            available: (available[j] || '0').toString()
          });
        }
      }
    }
  }
  
  return result;
};

export const STMNT_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for STMNT_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for STMNT_UpdateData');
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
      if (item1.sku1 === item2.sku2) {
        newOnHand = item2.available || '0';
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
const cleanString = (str) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[\s\-]/g, '');
};