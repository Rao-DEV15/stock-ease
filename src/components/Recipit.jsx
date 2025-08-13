import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Recipit = ({ customerName, products, totalAmount, totalCount, date }) => {
  const receiptRef = useRef();

  const exportPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("receipt.pdf");
    });
  };

  return (
    <div>
      <div
        id="Recipit"
        ref={receiptRef}
        className="font-sans p-6 w-[350px] border border-gray-300 bg-white text-gray-800 rounded-lg shadow-md"
      >
        {/* Branding */}
        <h2 className="text-center text-xl font-bold text-gray-900 mb-1">
          SA Cosmetics
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Beauty & Care Products
        </p>

        {/* Customer Info */}
        <p className="text-sm">
          <strong>Customer:</strong> {customerName}
        </p>
        <p className="text-sm">
          <strong>Date:</strong>{" "}
          {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}
        </p>
        <p className="text-sm mb-4">
          <strong>Time:</strong>{" "}
          {date ? new Date(date).toLocaleTimeString() : new Date().toLocaleTimeString()}
        </p>

        <hr className="border-gray-200 mb-4" />

        {/* Product Table */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border-t border-b border-gray-300">Item</th>
              <th className="text-center p-2 border-t border-b border-gray-300">Qty</th>
              <th className="text-center p-2 border-t border-b border-gray-300">Price</th>
              <th className="text-center p-2 border-t border-b border-gray-300">Disc%</th>
              <th className="text-right p-2 border-t border-b border-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-2 border-b border-dashed border-gray-300">{p.name}</td>
                <td className="text-center p-2 border-b border-dashed border-gray-300">{p.qty}</td>
                <td className="text-center p-2 border-b border-dashed border-gray-300">Rs {p.price}</td>
                <td className="text-center p-2 border-b border-dashed border-gray-300">{p.discount || 0}%</td>
                <td className="text-right p-2 border-b border-dashed border-gray-300">
                  Rs {Math.round(p.price * p.qty * (1 - (p.discount || 0) / 100))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-gray-200 my-4" />

        {/* Totals */}
        <p className="text-sm"><strong>Total Items:</strong> {totalCount}</p>
        <p className="text-lg font-bold text-blue-700"><strong>Grand Total:</strong> Rs {Math.round(totalAmount)}</p>

        <hr className="border-gray-200 my-4" />
        <p className="text-center text-xs text-gray-500">Thank you for shopping with us!</p>
      </div>

      {/* Hidden PDF Export Trigger */}
      <button
        onClick={exportPDF}
        id="exportPDFBtn"
        className="hidden"
      ></button>
    </div>
  );
};

export default Recipit;
