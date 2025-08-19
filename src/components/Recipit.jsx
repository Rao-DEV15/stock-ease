import React, { useRef } from "react";

const Recipit = ({ customerName, products, totalAmount, totalCount, date }) => {
  const receiptRef = useRef();

  const exportPDF = () => {
    // Send raw props directly to backend for printing
    fetch("http://localhost:3000/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        products,
        totalAmount,
        totalCount,
        date,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Print response:", data);
      })
      .catch((err) => console.error("Print error:", err));
  };

  return (
    <div>
      <div
        id="Recipit"
        ref={receiptRef}
        className="p-2 w-[300px] bg-white text-black"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "12px",
          lineHeight: "1.3",
        }}
      >
        {/* Branding */}
        <h2 className="text-center font-bold mb-1" style={{ fontSize: "14px" }}>
          SA Cosmetics
        </h2>
        <p className="text-center mb-2" style={{ fontSize: "11px" }}>
          Beauty & Care Products
        </p>

        {/* Customer Info */}
        <p>
          <strong>Customer:</strong> {customerName}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {date
            ? new Date(date).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </p>
        <p className="mb-2">
          <strong>Time:</strong>{" "}
          {date
            ? new Date(date).toLocaleTimeString()
            : new Date().toLocaleTimeString()}
        </p>

        <hr className="border-gray-500 mb-2" />

        {/* Product Table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border-b border-gray-300">Item</th>
              <th className="text-center p-2 border-b border-gray-300">Qty</th>
              <th className="text-center p-2 border-b border-gray-300">Price</th>
              <th className="text-center p-2 border-b border-gray-300">Disc%</th>
              <th className="text-right p-2 border-b border-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-2 border-b border-dashed border-gray-300">
                  {p.name}
                </td>
                <td
                  className="text-center p-2 border-b border-dashed border-gray-300"
                  style={{ fontFamily: "monospace" }}
                >
                  {p.qty}
                </td>
                <td
                  className="text-center p-2 border-b border-dashed border-gray-300"
                  style={{ fontFamily: "monospace" }}
                >
                  Rs {p.price}
                </td>
                <td
                  className="text-center p-2 border-b border-dashed border-gray-300"
                  style={{ fontFamily: "monospace" }}
                >
                  {p.discount || 0}%
                </td>
                <td
                  className="text-right p-2 border-b border-dashed border-gray-300"
                  style={{
                    paddingRight: "10px",
                    minWidth: "40px",
                    fontFamily: "monospace",
                  }}
                >
                  Rs{" "}
                  {Math.round(p.price * p.qty * (1 - (p.discount || 0) / 100))}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="font-bold bg-gray-100">
              <td colSpan={4} className="text-right p-2 border-t border-gray-400">
                Grand Total
              </td>
              <td
                className="text-right p-2 border-t border-gray-400"
                style={{ paddingRight: "10px", fontFamily: "monospace" }}
              >
                Rs {Math.round(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Below Table */}
        <hr className="border-gray-500 my-2" />
        <p style={{ fontFamily: "monospace" }}>
          <strong>Total Items:</strong> {totalCount}
        </p>

        <hr className="border-gray-500 my-2" />
        <p className="text-center text-xs">
          Thank you for shopping with us!
        </p>
      </div>

      {/* Hidden Print Trigger */}
      <button onClick={exportPDF} id="exportPDFBtn" className="hidden"></button>
    </div>
  );
};

export default Recipit;
