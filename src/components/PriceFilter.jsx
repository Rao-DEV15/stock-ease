const PriceFilter = ({ minPrice, setMinPrice, maxPrice, setMaxPrice, maxPriceManuallyEdited, setMaxPriceManuallyEdited }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
    <input type="number" placeholder="Min Price" value={minPrice} onChange={e => { setMinPrice(e.target.value); setMaxPriceManuallyEdited(false); }} className="w-36 px-3 py-2 border rounded-md" />
    <input type="number" placeholder="Max Price" value={maxPrice} style={{ color: maxPriceManuallyEdited ? 'black' : 'gray' }} onChange={e => { setMaxPrice(e.target.value); setMaxPriceManuallyEdited(true); }} className="w-36 px-3 py-2 border rounded-md" />
  </div>
);
export default PriceFilter;
