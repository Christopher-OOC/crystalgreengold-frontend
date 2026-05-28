import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShoppingBag, 
  Store, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  History, 
  Gift, 
  Users, 
  User,
  ShieldCheck,
  Settings, 
  Info, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuthStore, selectMember } from "@/lib/store/authStore";
import { useAuth } from '@/features/auth/AuthContext';
import logo from '@/shared/assets/logo';

interface SidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isCollapsed, onToggle, activeTab, setActiveTab }) => {
 const member = useAuthStore(selectMember);
 const { impersonating } = useAuth();

 const isAdmin = React.useMemo(() => {
   const type = member?.memberType || '';
   const normalized = type.toUpperCase();
   return !impersonating && (
     normalized === 'ADMIN' ||
     normalized === 'SUPER_ADMIN' ||
     normalized === 'ROLE_ADMIN' ||
     normalized === 'ROLE_SUPER_ADMIN'
   );
 }, [impersonating, member?.memberType]);

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: BarChart3, label: 'Analysis', id: 'analysis', badge: '•' },

  { section: 'SHOPPING' },
  { icon: ShoppingBag, label: 'Discount Shop', id: 'discount-shop' },
  { icon: Store, label: 'Service Centers', id: 'service-centers' },
  { icon: Package, label: 'Premium Stores', id: 'premium-stores' },
  { icon: Package, label: 'Company Products', id: 'company-products' },
  { icon: ShoppingCart, label: 'My Cart', id: 'my-cart' },

  { section: 'ORDERS & HISTORY' },
  { icon: ClipboardList, label: 'My Orders', id: 'my-orders' },
   { icon: ClipboardList, label: 'Manage Orders', id: 'manage-orders' },
  { icon: History, label: 'Transactions', id: 'transactions' },
  { icon: Gift, label: 'Bonuses', id: 'bonuses' },

  { section: 'ACCOUNT' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Users, label: 'Genealogys', id: 'genealogys' },

  // ✅ ONLY ADMIN
  ...(isAdmin
    ? [{ icon: ShieldCheck, label: 'Admin Panel', id: 'admin-panel' }]
    : []),

  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: Info, label: 'About Us', id: 'about-us' },
];
  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-60'} h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col transition-all duration-500 relative group/sidebar`}>
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
      >
        <ChevronRight size={14} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      <div className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
          <img src={logo} alt="Logo" className="w-4 h-4 object-contain brightness-0 invert" />
        </div>
        {!isCollapsed && <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">TopNivo</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.section) {
            return !isCollapsed && (
              <div key={index} className="pt-2 pb-1 px-3 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] truncate">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={index}
              onClick={() => item.id && setActiveTab(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2.5 py-1.5 rounded-lg transition-all group ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-500' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon size={16} className={isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                {!isCollapsed && <span className="text-[11px] font-semibold truncate">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <>
                  {item.badge && <span className="text-amber-500 text-sm leading-none">{item.badge}</span>}
                  {!item.badge && isActive && <ChevronRight size={10} className="text-amber-500" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-200 dark:border-white/5">
        <button 
          onClick={onLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group`}
        >
          <LogOut size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-red-500 shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
