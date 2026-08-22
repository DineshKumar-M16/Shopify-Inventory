export const writeCsvFile = (data, filename) => {
  const headers = ['Handle','Title','Option1 Name','Option1 Value','Option2 Name','Option2 Value',
                  'Option3 Name','Option3 Value','SKU','HS Code','COO','Location',
                  'Unavailable (not editable)','Committed (not editable)','Available (not editable)','On hand (new)'];
  
  const csvRows = [
    headers,
    ...data.map(item => [
      item.handleValue,
      item.title,
      item.option1n,
      item.option1v,
      item.option2n,
      item.option2v,
      item.option3n,
      item.option3v,
      item.skuno,
      item.hscode,
      item.coo,
      item.location,
      item.unavailable,
      item.committed,
      item.available,
      item.onhandnew
    ])
  ];
  
  const csvContent = csvRows.map(row => 
    row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};