export const EJS_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to EJS_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    let styleNo = '', color = '', size = '', subSize = '', final_sku1 = '';
    
    if (!isEmpty(skuno)) {
      const parts = skuno.split('-');
      styleNo = cleanString(parts[0] || '');
      color = cleanColor(parts[1] || '');
      size = cleanString(parts[2] || '');
      subSize = cleanSubSize(parts[3] || '');
      final_sku1 = [styleNo, color, size, subSize].filter(Boolean).join('_');
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
      styleNo: styleNo,
      color: color,
      size: size,
      subSize: subSize,
      final_sku1: final_sku1,
      status: 'Pending'
    };
  });
};

export const EJS_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to EJS_Client');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 5) {
      paddedRow.push('');
    }
    
    const styleNo = cleanString(paddedRow[0] || '');
    const color = cleanColor(paddedRow[2] || '');
    const size = cleanString(paddedRow[3] || '');
    const subSize = cleanSubSize(paddedRow[1] || '');
    const final_sku2 = [styleNo, color, size, subSize].filter(Boolean).join('_');
    
    return {
      styleNo: styleNo,
      color: color,
      size: size,
      subSize: subSize,
      final_sku2: final_sku2,
      available: paddedRow[4] || '0'
    };
  });
};

export const EJS_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for EJS_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for EJS_UpdateData');
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
      if (item1.final_sku1 === item2.final_sku2) {
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
  return str.toString().trim().toUpperCase();
};

const cleanColor = (str) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[\.\s\/]/g, '');
};

const cleanSubSize = (str) => {
  if (!str) return '';
  const cleaned = str.toString().trim().toUpperCase();
  return cleaned.includes('REG') ? 'Regular' : cleaned;
};

const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};