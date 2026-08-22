export const GLOBEFW_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to GLOBEFW_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    let sku, color, size;
    
    if (skuno.includes('_')) {
      const skuParts = skuno.split('_');
      sku = skuParts[0] || '';
      color = skuParts[1] ? cleanString(skuParts[1]) : '';
      size = skuParts[2] || '';
    } else {
      sku = skuno;
      color = '';
      size = '';
    }
    
    sku = sku.toUpperCase();
    
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
      sku: sku,
      color: color,
      size: size
    };
  });
};

export const GLOBEFW_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to GLOBEFW_Client');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 6) {
      paddedRow.push('');
    }
    
    const color = cleanString(paddedRow[1] || '');
    
    return {
      sku: paddedRow[0] || '',
      color: color,
      size: paddedRow[4] || '',
      available: paddedRow[5] || '0'
    };
  });
};

export const GLOBEFW_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for GLOBEFW_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for GLOBEFW_UpdateData');
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
      if (item1.sku === item2.sku && 
          item1.color === item2.color && 
          item1.size === item2.size) {
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
  return str.toString().toUpperCase().replace(/[ -/]/g, '');
};

const cleanSKU = (sku) => {
  if (!sku) return '';
  return sku.toString().replace(/[\s\-/\\\.]+/g, '').toUpperCase();
};