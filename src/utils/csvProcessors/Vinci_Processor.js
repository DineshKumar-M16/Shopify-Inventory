export const Vinci_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Vinci_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    const parts = skuno.split('_');
    const sku = cleanSKU(parts[0] || '');
    const color = parts[1] || '';
    const size = parts[2] || '';
    
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
      size: size,
      status: 'Pending'
    };
  });
};

export const Vinci_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Vinci_Client');
    return [];
  }
  
  const result = [];
  const scaleSizeMap = {
    'A': ['36R', '38R', '40R', '42R', '44R', '46R', '48R', '38L', '40L',
          '42L', '44L', '46L', '48L', '36S', '38S', '40S', '42S', '44S',
          '46S', '48S', '*', '36L', '34R', '34S'],
    'B': ['50R', '52R', '54R', '56R', '50L', '52L', '54L', '56L', '*', '50S'],
    'L': ['38XL', '40XL', '42XL', '44XL', '46XL', '48XL', '50XL', '52XL', '54XL', '56XL'],
    'T': ['34R', '36R', '38R', '40R', '42R', '44R', '46R', '48R', '34L', '36L', '38L', '40L',
          '42L', '44L', '46L', '48L', '34S', '36S', '38S', '40S', '42S', '44S',
          '46S', '48S'],
    'C': ['58R', '60R', '62R', '58L', '60L', '62L'],
    'D': ['64R', '66R', '68R', '70R', '72R', '74R', '76R', '78R', '80R', '64L', '66L', '68L',
          '70L', '72L', '74L', '76L', '78L', '80L'],
    'G': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    'Z': ['S', 'M', 'L', 'XL', '2X', '3X', '4X', '5X', '6X'],
    'F': ['30/30', '30/32', '30/34', '30/36', '30/38', '30/40', '32/32', '32/34', '32/36',
          '32/38', '32/40', '32/42', '32/44', '32/46', '32/48', '34/34', '34/36', '34/38',
          '34/40', '34/42', '34/44', '34/46', '34/48', '34/50'],
    'P': ['28/30', '30/30', '32/30', '34/30', '36/30', '38/30', '40/30', '32/32', '34/32',
          '36/32', '38/32', '40/32', '42/32', '44/32', '46/32', '40/34', '42/34', '44/34',
          '46/34', '48/34', '50/34', '52/34', '48/32', '0'],
    'M': ['44/32', '46/32', '48/32', '50/32', '52/32', '54/32', '56/32', '58/32', '60/32',
          '62/32', '64/32', '66/32', '44/34', '46/34', '48/34', '50/34', '52/34', '44/30',
          '46/30', '48/30', '50/30', '52/30'],
    'Q': ['28/30', '30/30', '32/30', '34/30', '36/30', '38/30', '32/32', '34/32', '36/32',
          '38/32', '40/32', '42/32', '44/32', '46/32', '34/34', '36/34', '38/34', '40/34',
          '42/34', '44/34', '46/34', '48/34', '50/34', '52/34'],
    'E': ['32/34', '34/34', '36/34', '38/34'],
    'W': ['28/30', '30/30', '32/30', '34/30', '36/30', '38/30', '30/32', '32/32', '34/32',
          '36/32', '38/32', '40/32', '42/32'],
    'Y': ['26/30', '28/30', '30/30', '32/30', '34/30', '36/30', '38/30', '40/30', '42/30',
          '30/32', '32/32', '34/32', '36/32', '38/32', '40/32', '42/32', '44/32'],
    'I': ['14.5', '15', '15-15.5', '15.5', '16', '16-16.5', '16.5', '17', '17-17.5',
          '17.5', '18.5', '19.5', '20.5', '21.5'],
    'V': ['30S', '32S', '34S', '36S', '38S', '40S', '42S', '44S', '46S',
          '48S', '50S']
  };
  
  data.forEach(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 40) {
      paddedRow.push('');
    }
    
    const sku = cleanSKU(paddedRow[0] || '');
    const colorno = paddedRow[5] || '';
    const color = cleanColor(colorno);
    const scale = (paddedRow[10] || '').toUpperCase();
    
    const sizes = scaleSizeMap[scale] || [];
    const availabilities = paddedRow.slice(16, 16 + sizes.length);
    
    sizes.forEach((size, index) => {
      const available = (availabilities[index] || '0').toString().trim();
      if (available !== '0') {
        result.push({
          sku: sku,
          color: color,
          size: size,
          available: available
        });
      }
    });
  });
  
  return result;
};

export const Vinci_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for Vinci_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for Vinci_UpdateData');
    return shopifyData.map(item => ({
      ...item,
      onhandnew: '0',
      status: '❌ No client data'
    }));
  }
  
  return shopifyData.map(item1 => {
    const sku1 = cleanString(item1.sku || '');
    const color1 = cleanColor(item1.color || '');
    const size1 = cleanString(item1.size || '');
    let foundMatch = false;
    let newOnHand = 0;
    
    for (const item2 of clientData) {
      const sku2 = cleanString(item2.sku || '');
      const color2 = cleanColor(item2.color || '');
      const size2 = cleanString(item2.size || '');
      
      if (sku1 === sku2 && color1 === color2 && size1 === size2) {
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
const cleanSKU = (sku) => {
  if (!sku) return '';
  return sku.toString().replace('SO1', '').toUpperCase();
};

const cleanColor = (str) => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[\s\-]/g, '');
};

const cleanString = (str) => {
  if (!str) return '';
  return str.toString().trim();
};