export const MDM_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to MDM_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    const skuParts1 = skuno.split('_');
    
    const sku = cleanString(skuParts1[0] || '');
    const shoes = cleanString(skuParts1[1] || '');
    const color = cleanString(skuParts1[2] || '');
    const size = skuParts1[3] || '';
    const skutocompare = [sku, shoes, color, size].filter(Boolean).join('_');
    
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
      skutocompare: skutocompare,
      status: 'Pending'
    };
  });
};

export const MDM_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to MDM_Client');
    return [];
  }
  
  const result = [];
  const sizes = ['6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15'];
  
  data.forEach(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 35) { // 9 + 26 for sizes
      paddedRow.push('');
    }
    
    const sku = cleanString(paddedRow[1] || '');
    const shoes = cleanString(paddedRow[2] || '');
    const color = cleanString(paddedRow[3] || '');
    const availabilities = paddedRow.slice(9, 35); // Get size columns
    
    sizes.forEach((size, index) => {
      const skutocompare = [sku, shoes, color, size].filter(Boolean).join('_');
      const available = availabilities[index] || '0';
      
      result.push({
        skutocompare: skutocompare,
        available: available
      });
    });
  });
  
  return result;
};

export const MDM_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for MDM_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for MDM_UpdateData');
    return shopifyData.map(item => ({
      ...item,
      onhandnew: '0',
      status: '❌ No client data'
    }));
  }
  
  return shopifyData.map(item1 => {
    let foundMatch = false;
    let totalAvailable = 0;
    
    // For MDM, we need to sum all matching sizes
    for (const item2 of clientData) {
      if (item1.skutocompare === item2.skutocompare) {
        totalAvailable += parseInt(item2.available || '0');
        foundMatch = true;
      }
    }
    
    return {
      ...item1,
      onhandnew: foundMatch ? totalAvailable.toString() : '0',
      status: foundMatch ? '✅ Matched' : '❌ Not Found'
    };
  });
};

// Local helper functions
const cleanString = (str) => {
  if (!str) return '';
  return str.toString().replace(/[\s\-]/g, '').toUpperCase();
};