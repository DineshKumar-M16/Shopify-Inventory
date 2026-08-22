export const DLD_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to DLD_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    
    // Split SKU into parts  
    let sku = '', size = '', width = '';
    if (!isEmpty(skuno)) {
      const cleanSkuno = skuno.trim().toUpperCase();
      const trimmedSkuno = cleanSkuno.replace(/^(LAREDO_|DANPOST_|DINGO_)/, '');
      const skuParts1 = trimmedSkuno.split('_');
      sku = skuParts1[0] || '';
      size = skuParts1[1] || '';
      width = skuParts1[2] || '';
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
      sku: sku,
      size: size,
      width: width,
      status: 'Pending'
    };
  });
};

export const DLD_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to DLD_Client');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 11) {
      paddedRow.push('');
    }
    
    return {
      sku: paddedRow[2] || '',
      size: paddedRow[5] || '',
      width: paddedRow[6] || '',
      available: paddedRow[10] || '0'
    };
  });
};

export const DLD_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for DLD_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for DLD_UpdateData');
    return shopifyData.map(item => ({
      ...item,
      onhandnew: '0',
      status: '❌ No client data'
    }));
  }
  
  return shopifyData.map(item1 => {
    const sku1 = cleanString(item1.sku || '');
    const size1 = cleanString(item1.size || '');
    const width1 = cleanString(item1.width || '');
    let found = false;
    let newOnHand = 0;
    
    for (const item2 of clientData) {
      const sku2 = cleanString(item2.sku || '');
      const size2 = cleanString(item2.size || '');
      const width2 = cleanString(item2.width || '');
      
      if (sku1 === sku2 && size1 === size2 && width1 === width2) {
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
const cleanString = (str) => {
  if (!str) return '';
  return str.toString().trim();
};

const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};