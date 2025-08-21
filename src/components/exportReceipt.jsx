// exportReceipt.js
export const exportReceiptAsPDF = async (props) => {
  // props = { customerName, products, totalAmount, totalCount, date }
  const { customerName, products, totalAmount, totalCount, date } = props;

  try {
    const response = await fetch("http://localhost:3000/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, products, totalAmount, totalCount, date }),
    });

    const data = await response.json();
    console.log("Print response:", data);
  } catch (err) {
    console.error("Print error:", err);
    alert("Failed to export receipt.");
  }
};
