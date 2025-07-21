import React from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ExportButton = ({ products }) => {
  const handleExport = async () => {
    if (!products || products.length === 0) {
      alert("No products to export.");
      return;
    }

    const zip = new JSZip();
    const exportData = [];

    for (let i = 0; i < products.length; i++) {
      const { image, id, ...rest } = products[i];
      const imageFileName = `${i + 1}.jpg`; 

      exportData.push({ ...rest, image: imageFileName });

      if (image?.startsWith("data:image")) {
        const base64Data = image.split(',')[1];
        zip.file(imageFileName, base64Data, { base64: true });
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products_export.xlsx");

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, "product_images.zip");

    alert("Exported Excel and images!");
  };

  return (
    <button
      onClick={handleExport}
      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
    >
      Export Data
    </button>
  );
};

export default ExportButton;
