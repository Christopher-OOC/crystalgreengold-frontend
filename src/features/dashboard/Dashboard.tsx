import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Clock,
  CircleDollarSign,
  ArrowLeftRight,
  Layers,
  UserPlus,
  Trophy,
  Bell,
  ChevronDown,
  Star,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';
import { Sidebar } from '@/features/dashboard/layout/Sidebar';
import { useAuth } from '@/features/auth/AuthContext';
import { LoginAsUserInitializer } from '@/features/auth/LoginAsUserInitializer';
import apiClient from '@/lib/api/client';
import logo from '@/shared/assets/logo';
import { StatsCard } from '@/shared/ui/StatsCard';
import { MainChart } from '@/shared/ui/MainChart';
import { NetworkStructure, FinancialMetrics, SalesDistribution, MonthlyPVAnalysis } from '@/features/dashboard/views/misc/Details';
import { useAuthStore, selectMember } from "@/lib/store/authStore";
import { TransferModal } from '@/features/finance/TransferModal';
import { DiscountShop } from '@/features/commerce/products/DiscountShop';
import { ServiceCenters } from '@/features/commerce/service-centers/ServiceCenters';
import { ServiceCenterProducts } from '@/features/commerce/service-centers/ServiceCenterProducts';
import { PremiumStoreProducts } from "@/features/commerce/stores/PremiumStoreProducts"
import { CompanyProducts } from '@/features/commerce/products/CompanyProducts';
import { PremiumStores } from '@/features/commerce/stores/PremiumStores';
import { ProductDescription } from '@/features/commerce/products/ProductDescription';
import { Packages } from '@/features/commerce/packages/Packages';
import { PackageDetails } from '@/features/commerce/packages/PackageDetails';
import { Cart } from '@/features/commerce/cart/Cart';
import { OrderHistory } from '@/features/commerce/orders/OrderHistory';
import { ManageOrders } from '@/features/commerce/orders/ManageOrders';
import { Transactions } from '@/features/finance/Transactions';
import { Bonuses } from '@/features/dashboard/views/misc/Bonuses';
import { Settings } from '@/features/dashboard/views/misc/Settings';
import { Profile } from '@/features/profile/Profile';
import { AboutUs } from '@/features/dashboard/views/misc/AboutUs';
import { AdminPanel } from '@/features/admin/panel/AdminPanel';
import { Genealogys } from '@/features/dashboard/views/misc/Genealogys';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';
import { formatCurrency } from '@/lib/utils/format';
import { DashboardMetrics } from '@/lib/types/metrics.types';

interface DashboardProps {
  onLogout: () => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

// Define the type for selected center/store
interface SelectedCenter {
  id: string;
  name: string;
}

import { normalizeMetrics } from '@/lib/utils/data-normalization';

export const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
  isDark,
  setIsDark,
  initialTab = 'dashboard',
  onTabChange,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTabState] = useState(initialTab);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedServiceCenter, setSelectedServiceCenter] = useState<SelectedCenter | null>(null);
  const [selectedPremiumStore, setSelectedPremiumStore] = useState<{ name: string; id: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(() => initialTab === 'dashboard' || initialTab === 'analysis');
  const [error, setError] = useState<string | null>(null);
  const member = useAuthStore(selectMember);
  const { impersonating } = useAuth();
  const currentMemberId = member?.memberId ?? member?.id;
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setActiveTabState(initialTab);
  }, [initialTab]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    onTabChange?.(tab);
  };

  const isAdmin =
    !impersonating && (
      member?.memberType?.toUpperCase() === 'ADMIN' ||
      member?.memberType?.toUpperCase() === 'SUPER_ADMIN' ||
      member?.memberType?.toUpperCase() === 'ROLE_ADMIN' ||
      member?.memberType?.toUpperCase() === 'ROLE_SUPER_ADMIN'
    );
  const isMetricsTab = activeTab === 'dashboard' || activeTab === 'analysis';

  const fetchData = async () => {
    if (!currentMemberId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch core member metrics
      const response = await apiClient.get(`/api/v1/members/${currentMemberId}`);
      
      setDashboardData(normalizeMetrics(response.data.data));

      setIsLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      setIsLoading(false);
    }

    // Fetch analysis data separately (non-critical)
    try {
      const analysisRes = await apiClient.get(`/api/v1/members/${currentMemberId}/analysis`);
      setAnalysisData(analysisRes.data.data || analysisRes.data);
    } catch (err) {
      console.warn("Analysis data not found, falling back to dashboard metrics.");
    }
  };

  useEffect(() => {
    if (currentMemberId && isMetricsTab) {
      fetchData();
      return;
    }

    if (activeTab !== 'login-as-user') {
      setIsLoading(false);
    }
  }, [isMetricsTab, currentMemberId, activeTab]);

  useEffect(() => {
    setUsername(member?.username || null);
  }, [member?.username]);

  const stats = [
    {
      label: 'Available Balance',
      value: formatCurrency(dashboardData?.availableBalance ?? 0),
      icon: Wallet,
      color: 'purple',
      trend: '↑ 0%'
    },
    {
      label: 'Awaiting Wallet',
      value: formatCurrency(dashboardData?.awaitingWallet ?? 0),
      icon: Clock,
      color: 'amber'
    },
    {
      label: 'Cashback',
      value: formatCurrency(dashboardData?.cashback ?? 0),
      icon: CircleDollarSign,
      color: 'orange'
    },
    {
      label: 'Daily Binary Earnings',
      value: formatCurrency(dashboardData?.dailyBinaryEarning ?? 0),
      icon: ArrowLeftRight,
      color: 'emerald',
      trend: '↑ 0%'
    },
    {
      label: 'Binary Left PV',
      value: String(dashboardData?.binaryLeftPv ?? 0),
      icon: Layers,
      color: 'blue'
    },
    {
      label: 'Binary Right PV',
      value: String(dashboardData?.binaryRightPv ?? 0),
      icon: Layers,
      color: 'orange'
    },
    {
      label: 'Total Left BV',
      value: String(dashboardData?.totalLeftBv ?? 0),
      icon: Layers,
      color: 'blue'
    },
    {
      label: 'Total Right BV',
      value: String(dashboardData?.totalRightBv ?? 0),
      icon: Layers,
      color: 'orange'
    },
  ];

  if (activeTab === 'login-as-user') {
    return <LoginAsUserInitializer />;
  }

  if (isLoading && isMetricsTab) {
    return (
      <div className="flex h-screen bg-white dark:bg-emerald-950 items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mx-auto" />
          <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">
            {currentMemberId ? "Initializing Dashboard..." : "Loading session..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-white dark:bg-emerald-950 items-center justify-center p-8">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={fetchData}
          onBack={onLogout}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-emerald-950 text-emerald-950 dark:text-emerald-100 overflow-hidden font-sans transition-colors duration-500">
      <Sidebar
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedServiceCenter(null);
          setSelectedPremiumStore(null);
          setSelectedProduct(null);
          setShowPackages(false);
          setSelectedPackage(null);
          setShowOrderDetails(false);
        }}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 via-transparent to-amber-400/5 pointer-events-none" />

        {/* Top Bar */}
        <header className="h-12 border-b border-emerald-100 dark:border-white/5 px-3 flex items-center justify-between bg-white/80 dark:bg-emerald-950/50 backdrop-blur-xl z-10">
          <div className="flex-1" /> {/* Spacer */}

          <div className="flex items-center space-x-1.5">
            <img src={logo} alt="Logo" className="w-4 h-4 object-contain" />
            <span className="text-base font-bold text-emerald-950 dark:text-white tracking-tight">crystalgreengold</span>
          </div>

          <div className="flex-1 flex justify-end items-center space-x-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-amber-400 transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="relative p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white transition-colors">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-amber-400 rounded-full border border-white dark:border-emerald-950" />
            </button>

            <div className="h-5 w-px bg-emerald-100 dark:bg-white/10" />

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1.5 group"
              >
                <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-white transition-all overflow-hidden">
                  <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <ChevronDown size={12} className={`text-emerald-400 group-hover:text-amber-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-100 dark:border-white/5 overflow-hidden z-20"
                    >
                      <div className="p-4 border-b border-emerald-50 dark:border-white/5">
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-emerald-950 dark:text-white truncate">{member?.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-amber-400 hover:text-white transition-all group"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-white/5 group-hover:bg-white/20">
                            <Star size={14} />
                          </div>
                          <span>Your Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-amber-400 hover:text-white transition-all group"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-white/5 group-hover:bg-white/20">
                            <ArrowLeftRight size={14} />
                          </div>
                          <span>Settings</span>
                        </button>
                      </div>
                      <div className="p-2 border-t border-emerald-50 dark:border-white/5">
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all group"
                        >
                          <div className="p-1.5 rounded-lg bg-rose-500/10 group-hover:bg-white/20">
                            <ArrowLeftRight size={14} className="rotate-180" />
                          </div>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar relative z-0">
          <div className="max-w-5xl mx-auto space-y-3">
            {activeTab === 'dashboard' ? (
              <div className="space-y-3">
                {/* Dashboard Header */}
                <Card rounded="xl" className="p-2.5 flex flex-col md:flex-row justify-between items-center gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-950 dark:text-white">
                      Hello, {username || member?.username || "User"}
                    </h2>
                    <p className="text-emerald-600 text-sm">See your metrics, and upgrade your current package to a higher package.</p>
                  </div>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-400 text-white px-3 py-1 rounded-lg font-bold transition-all shadow-lg shadow-amber-400/20 text-[9px]"
                  >
                    Transfer
                  </button>
                </Card>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <Card rounded="xl" className="p-3 text-center" hover>
                    <p className="text-emerald-600 font-medium mb-0.5 text-sm">Available Balance</p>
                    <p className="text-lg font-bold text-emerald-950 dark:text-white">
                      {formatCurrency(dashboardData?.availableBalance ?? 0)}
                    </p>
                  </Card>

                  <Card rounded="xl" className="p-3 text-center" hover>
                    <p className="text-emerald-600 font-medium mb-0.5 text-sm">Pending Wallet</p>
                    <p className="text-lg font-bold text-emerald-950 dark:text-white">
                      {formatCurrency(dashboardData?.awaitingWallet ?? 0)}
                    </p>
                  </Card>

                  <Card rounded="xl" className="p-3 text-center" hover>
                    <p className="text-emerald-600 font-medium mb-0.5 text-sm">Rank</p>
                    <p className="text-lg font-bold text-emerald-950 dark:text-white">
                      {dashboardData?.rank?.name || "Member"}
                    </p>
                  </Card>

                  <Card rounded="xl" className="p-3 text-center" hover>
                    <p className="text-emerald-600 font-medium mb-0.5 text-sm">Current Members Counter</p>
                    <p className="text-lg font-bold text-emerald-950 dark:text-white mb-0.5">{dashboardData?.countNewlyRegisteredOnMonthlyWeakerLeg
 || 0} out of 20.</p>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Award: ₦20000.00</p>
                  </Card>
                </div>
              </div>
            ) : activeTab === 'analysis' ? (
              <div className="space-y-3">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-950 dark:text-white tracking-tight">Member Analysis</h2>
                    <p className="text-emerald-600 text-[10px] font-medium">Comprehensive metrics for your growth</p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-emerald-950/50 border border-emerald-100 dark:border-white/5 px-2 py-0.5 rounded-lg shadow-sm">
                    <Clock size={10} className="text-amber-400" />
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Last Earned: 2025-11-01</span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 space-y-3">
                    <MainChart />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FinancialMetrics data={dashboardData} />
                      <NetworkStructure data={dashboardData} />
                    </div>

                    <MonthlyPVAnalysis data={dashboardData} />
                  </div>

                  <div className="space-y-3">
                    <SalesDistribution data={dashboardData} />

                    {/* Rank Card */}
                    <Card className="bg-linear-to-br from-amber-400 to-yellow-600 text-white shadow-2xl shadow-amber-400/20 relative overflow-hidden group p-4">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/20">
                            <Trophy size={16} />
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] bg-black/20 px-1.5 py-0.5 rounded-full">Current Rank</span>
                        </div>
                        <h4 className="text-xl font-bold mb-0.5">No Rank Yet!</h4>
                        <p className="text-white/80 text-[9px] font-medium leading-relaxed">Keep growing your network to unlock prestigious ranks and exclusive rewards.</p>
                        <button className="mt-3 w-full py-1.5 bg-white text-yellow-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg text-[10px]">
                          View Rank Requirements
                        </button>
                      </div>
                    </Card>

                    {/* Promotions Card */}
                    <Card className="flex flex-col items-center justify-center text-center min-h-[160px] p-4">
                      <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mb-2">
                        <Star size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-0.5">Promotions</h3>
                      <p className="text-emerald-600 text-[9px] max-w-[140px]">No active promotions or awards at the moment.</p>
                    </Card>

                    {/* Newly Registered Card */}
                    <Card className="p-4">
                      <div className="flex items-center space-x-1.5 mb-2">
                        <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <UserPlus size={14} />
                        </div>
                        <h3 className="text-sm font-bold text-emerald-950 dark:text-white">New Members</h3>
                      </div>
                      <div className="text-center py-1">
                        <p className="text-xl font-bold text-emerald-950 dark:text-white mb-0.5">0</p>
                        <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">On Weak Leg</p>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Stats Grid - Moved to bottom */}
                <div className="pt-3 border-t border-emerald-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-white mb-2">Key Performance Indicators</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <StatsCard {...stat} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'discount-shop' ? (
               selectedProduct ? (
                <ProductDescription
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                />
              ) : (
                <DiscountShop onSelectProduct={setSelectedProduct} />
              )
            ) : activeTab === 'service-centers' ? (
              selectedPackage ? (
                <PackageDetails
                  pkg={selectedPackage}
                  buyFrom="service-center"
                  storeId={selectedServiceCenter?.id ?? null}
                  onBack={() => setSelectedPackage(null)}
                  onViewOrder={() => {
                    setShowOrderDetails(true);
                    setActiveTab('my-orders');
                    setSelectedPackage(null);
                    setShowPackages(false);
                  }}
                />
              ) : showPackages ? (
                <Packages
                  onBack={() => setShowPackages(false)}
                  onSelectPackage={setSelectedPackage}
                  storeId={selectedServiceCenter?.id ?? null}
                />
              ) : selectedProduct ? (
                <ProductDescription
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                />
              ) : selectedServiceCenter ? (
                <ServiceCenterProducts
                  centerName={selectedServiceCenter.name}
                  centerId={selectedServiceCenter.id}
                  onBack={() => setSelectedServiceCenter(null)}
                  onSelectProduct={setSelectedProduct}
                  onBuyPackage={() => setShowPackages(true)}
                />
              ) : (
                <ServiceCenters onSelectCenter={(id, name) => setSelectedServiceCenter({ id, name })} />
              )
            ) : activeTab === 'premium-stores' ? (
              selectedPackage ? (
                <PackageDetails
                  pkg={selectedPackage}
                  buyFrom="premium-stores"
                  storeId={selectedPremiumStore?.id ?? null}
                  onBack={() => setSelectedPackage(null)}
                  onViewOrder={() => {
                    setShowOrderDetails(true);
                    setActiveTab('my-orders');
                    setSelectedPackage(null);
                    setShowPackages(false);
                  }}
                />
              ) : showPackages ? (
                <Packages
                  onBack={() => setShowPackages(false)}
                  onSelectPackage={setSelectedPackage}
                  storeId={selectedPremiumStore?.id ?? null}
                />
              ) : selectedProduct ? (
                <ProductDescription
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                />
              ) : selectedPremiumStore ? (
                <PremiumStoreProducts
                  storeName={selectedPremiumStore.name}
                  storeId={selectedPremiumStore.id}
                  onBack={() => setSelectedPremiumStore(null)}
                  onSelectProduct={setSelectedProduct}
                  onBuyPackage={() => setShowPackages(true)}
                />
              ) : (
                <PremiumStores onSelectStore={(name, id) => setSelectedPremiumStore({ name, id })} />
              )
            ) : activeTab === 'company-products' ? (
              selectedPackage ? (
                <PackageDetails
                  pkg={selectedPackage}
                  buyFrom="admin"
                  storeId={null}
                  onBack={() => setSelectedPackage(null)}
                  onViewOrder={() => {
                    setShowOrderDetails(true);
                    setActiveTab('my-orders');
                    setSelectedPackage(null);
                    setShowPackages(false);
                  }}
                />
              ) : showPackages ? (
                <Packages
                  onBack={() => setShowPackages(false)}
                  onSelectPackage={setSelectedPackage}
                  storeId={null}
                />
              ) : selectedProduct ? (
                <ProductDescription
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                />
              ) : (
                <CompanyProducts
                  onSelectProduct={setSelectedProduct}
                  onBuyPackage={() => setShowPackages(true)}
                />
              )
            ) : activeTab === 'my-cart' ? (
              <Cart
                onStartShopping={() => setActiveTab('company-products')}
                onNavigateToOrders={() => setActiveTab('my-orders')}
              />
            ) : activeTab === 'my-orders' ? (
              <OrderHistory initialShowDetails={showOrderDetails} />
            ) : activeTab === 'manage-orders' ? (
              <ManageOrders />
            ) : activeTab === 'transactions' ? (
              <Transactions />
            ) : activeTab === 'bonuses' ? (
              <Bonuses />
            ) : activeTab === 'profile' ? (
              <Profile
                onBack={() => setActiveTab('dashboard')}
                onViewAnalysis={() => setActiveTab('analysis')}
              />
            ) : activeTab === 'genealogys' ? (
              <Genealogys
                memberId={currentMemberId || ''}
                sponsorUsername={username || member?.username || ''}
              />
            ) : activeTab === 'settings' ? (
              <Settings onBack={() => setActiveTab('dashboard')} />
            ) : activeTab === 'about-us' ? (
              <AboutUs />
            ) : activeTab === 'admin-panel' && isAdmin ? (
              <AdminPanel />
            ) : (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <Star size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-950 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-emerald-600">This section is coming soon.</p>
                </div>
              </div>
            )}</div>

          {/* Footer */}
          <footer className="mt-8 pt-4 border-t border-emerald-100 dark:border-white/5 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center">
                    <img src={logo} alt="Logo" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
                  </div>
                  <span className="text-sm font-bold text-emerald-950 dark:text-white">crystalgreengold</span>
                </div>
                <div className="space-y-0.5">
                  <button className="block text-[10px] text-emerald-600 hover:text-amber-400 transition-colors">Privacy Policy</button>
                  <button className="block text-[10px] text-emerald-600 hover:text-amber-400 transition-colors">Terms and Condition</button>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[9px] font-bold text-emerald-950 dark:text-white uppercase tracking-[0.2em]">Information</h5>
                <p className="text-[10px] text-emerald-600 leading-relaxed">
                  26 oluwadarasimi st okuola Bustop Egbeda Lagos
                </p>
                <div className="space-y-0.5">
                  <button className="block text-[10px] text-amber-400 hover:underline">About us</button>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[9px] font-bold text-emerald-950 dark:text-white uppercase tracking-[0.2em]">Help</h5>
                <div className="space-y-0.5">
                  <button className="block text-[10px] text-emerald-600 hover:text-amber-400 transition-colors">My Account</button>
                  <button className="block text-[10px] text-emerald-600 hover:text-amber-400 transition-colors">Cart</button>
                  <button className="block text-[10px] text-emerald-600 hover:text-amber-400 transition-colors">Order Status</button>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[9px] font-bold text-emerald-950 dark:text-white uppercase tracking-[0.2em]">Social Media</h5>
                <div className="flex space-x-2">
                  {['instagram', 'twitter', 'youtube'].map((social) => (
                    <button key={social} className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-white/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-amber-400 hover:text-white transition-all">
                      <span className="sr-only">{social}</span>
                      <div className="w-3 h-3 bg-current rounded-sm opacity-50" />
                    </button>
                  ))}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-emerald-600">090crystalgreengold</p>
                  <p className="text-[9px] text-emerald-600">crystalgreengoldinfo@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="pb-4 flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="flex flex-wrap gap-2 text-[8px] font-bold text-emerald-400 dark:text-emerald-700 uppercase tracking-widest">
                <span>Category</span>
                <span className="text-emerald-200 dark:text-emerald-400">Perfumes</span>
                <span className="text-emerald-200 dark:text-emerald-400">Cosmetics</span>
                <span className="text-emerald-200 dark:text-emerald-400">Soaps</span>
                <span className="text-emerald-200 dark:text-emerald-400">and So Much More...</span>
              </div>
              <p className="text-[8px] font-bold text-emerald-400 dark:text-emerald-700 uppercase tracking-widest">
                © 2025 crystalgreengold. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </main>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};
