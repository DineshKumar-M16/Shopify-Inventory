export const Pellagio_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Pellagio_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    let itemNo = '', model = '', size = '', final_sku1 = '';
    
    if (!isEmpty(skuno)) {
      const parts = skuno.split('_');
      itemNo = cleanItemNo(parts[0] || '');
      model = cleanModel(parts[1] || '');
      size = parts[2] || '';
      final_sku1 = [itemNo, model, size].filter(Boolean).join('_');
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
      itemNo: itemNo,
      model: model,
      size: size,
      final_sku1: final_sku1,
      status: 'Pending'
    };
  });
};

export const Pellagio_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Pellagio_Client');
    return [];
  }
  
  const result = [];
  
  data.forEach(row => {
    const paddedRow = [...row];
    
    const itemNo = cleanItemNo(paddedRow[0] || '');
    const model = cleanModel(paddedRow[1] || '');
    const itemNo_model = [itemNo, model].filter(Boolean).join('_');
    
    if (!itemNo_model) return;
    
    let sizes = [];
    if (itemNo_model.includes('PUFFERVEST')) {
      sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    } else {
      sizes = ['36L', '38L', '40L', '42L', '44L', '46L', '48L', '50L', '52L',
               '36R', '38R', '40R', '42R', '44R', '46R', '48R', '50R', '52R',
               '36S', '38S', '40S', '42S', '44S', '46S', '48S', '50S'];
    }
    
    const availabilities = paddedRow.slice(4, 4 + sizes.length);
    
    // Create a map to aggregate sizes
    const sizeMap = {};
    
    sizes.forEach((size, index) => {
      const final_sku2 = itemNo_model + '_' + size;
      const available = parseInt(availabilities[index] || '0');
      
      if (!sizeMap[final_sku2]) {
        sizeMap[final_sku2] = {
          final_sku2: final_sku2,
          size: size,
          available: 0
        };
      }
      
      sizeMap[final_sku2].available += available;
    });
    
    // Add aggregated results
    Object.values(sizeMap).forEach(item => {
      result.push(item);
    });
  });
  
  return result;
};

export const Pellagio_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for Pellagio_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for Pellagio_UpdateData');
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
      onhandnew: foundMatch ? newOnHand.toString() : '0',
      status: foundMatch ? '✅ Matched' : '❌ Not Found'
    };
  });
};

// Local helper functions
const cleanItemNo = (str) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[\s\-SO6]/g, '');
};

const cleanModel = (str) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[\s\-]/g, '');
};

const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};