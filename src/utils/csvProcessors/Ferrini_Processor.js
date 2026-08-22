export const Ferrini_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Ferrini_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    const skuTrim = skuno.replace(/^FERRINI-/, '');
    const sku = cleanSKU(skuTrim);
    
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
      status: 'Pending'
    };
  });
};

export const Ferrini_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Ferrini_Client');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 4) {
      paddedRow.push('');
    }
    
    const sku = cleanSKU(paddedRow[1] || '');
    
    return {
      sku: sku,
      onhandnew: paddedRow[3] || '0'
    };
  });
};

export const Ferrini_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for Ferrini_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for Ferrini_UpdateData');
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
      if (item1.sku === item2.sku) {
        const parts = (item2.onhandnew || '0').split('.');
        newOnHand = parts[0] || '0';
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
  return sku.toString().replace(/[\s\-_\/\\\.]+/g, '').toUpperCase();
};