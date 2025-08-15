import LowStockNotifications from './LowStockNotifications';
import Bill from './Bill';

const ActionsBar = ({ showMobileActions, clearAllProducts }) => (
  <div className={`flex flex-col sm:flex-row flex-wrap gap-2 mt-4 sm:mt-2 ${showMobileActions ? '' : 'hidden sm:flex'}`}>
    <LowStockNotifications />
    <Bill />
    <button onClick={clearAllProducts} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Clear All</button>
  </div>
);

export default ActionsBar;
