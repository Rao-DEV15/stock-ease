const MultiDeleteControls = ({ multiDeleteMode, selectedIds, setMultiDeleteMode, toggleSelection, deleteSelectedProducts }) => (
  multiDeleteMode && (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
      <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
      <div className="flex flex-col sm:flex-row gap-2">
        <button onClick={deleteSelectedProducts} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete Selected</button>
        <button onClick={() => { setMultiDeleteMode(false); }} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  )
);
export default MultiDeleteControls;
