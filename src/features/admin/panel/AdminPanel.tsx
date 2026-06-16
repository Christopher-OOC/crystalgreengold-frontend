

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  LayoutGrid, 
  Package, 
  Trophy, 
  Megaphone, 
  Medal, 
  Users, 
  Wallet, 
  Settings,
  Store,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ProductInventory } from '@/features/admin/products/ProductInventory';
import { CategoryManagement } from '@/features/admin/categories/CategoryManagement';
import { PackageManagement } from '@/features/admin/packages/PackageManagement';
import { RankManagement } from '@/features/admin/ranks/RankManagement';
import { PromotionManagement } from '@/features/admin/promotions/PromotionManagement';
import { EarnedPromotions } from '@/features/admin/promotions/EarnedPromotions';
import { MemberManagement } from '@/features/admin/users/MemberManagement';
import { PayoutManagement } from '@/features/admin/finance/PayoutManagement';
import { PayrollManagement } from '@/features/admin/finance/PayrollManagement';
import { SystemSettingsManagement } from '@/features/admin/system/SystemSettingsManagement';
import { ServiceCenterManagement } from '@/features/admin/service-centers/ServiceCenterManagement';
import { CreateServiceCenterModal } from '@/features/admin/service-centers/CreateServiceCenterModal';
import { ErrorState } from '@/shared/ui/ErrorState';
import { getAdminViewFromPath, getAdminViewPath, type AdminView } from '@/features/navigation/paths';
import type { ServiceCenter } from '@/lib/types/service-center.types';

export const AdminPanel: React.FC = () => {
  const pathname = usePathname();
  const routeView = getAdminViewFromPath(pathname) ?? 'dashboard';
  const [activeView, setActiveViewState] = useState<AdminView>(routeView);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setActiveViewState(routeView);
  }, [routeView]);

  const setActiveView = (view: AdminView) => {
    setActiveViewState(view);
    const nextPath = getAdminViewPath(view);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call for admin dashboard data
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.99) {
            reject(new Error("Failed to load admin dashboard data. Please try again."));
          } else {
            resolve(true);
          }
        }, 1200);
      });
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Local Center Management
  const handleAddCenter = () => {
    setEditingCenter(null);
    setShowCreateModal(true);
  };

  const handleEditCenter = (center: ServiceCenter) => {
    setEditingCenter(center);
    setShowCreateModal(true);
  };

  const handleDeleteCenter = async (centerId: string) => {
    if (confirm('Are you sure you want to delete this local center?')) {
      try {
        const { serviceCenterService } = await import('@/lib/api/services/service-center.service');
        await serviceCenterService.toggleStatus(centerId, false);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Failed to delete center:', error);
        alert('Failed to delete local center');
      }
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingCenter(null);
  };

  const handleModalSuccess = () => {
    setShowCreateModal(false);
    setEditingCenter(null);
    setRefreshKey(prev => prev + 1);
  };

  const managementCards = [
    { 
      id: 'products',
      title: 'Products', 
      desc: 'Create, edit, and manage products', 
      icon: ShoppingBag, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      id: 'categories',
      title: 'Categories', 
      desc: 'Organize products with categories', 
      icon: LayoutGrid, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
    { 
      id: 'packages',
      title: 'Packages', 
      desc: 'Manage product packages and bundles', 
      icon: Package, 
      color: 'text-amber-400', 
      bg: 'bg-amber-400/10' 
    },
    { 
      id: 'ranks',
      title: 'Ranks', 
      desc: 'Configure member ranking system', 
      icon: Trophy, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-500/10' 
    },
    { 
      id: 'promotions',
      title: 'Promotions', 
      desc: 'Setup and manage promotions', 
      icon: Megaphone, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10' 
    },
    { 
      id: 'earned-promotions',
      title: 'Earned Promotions', 
      desc: 'Track member promotion achievements', 
      icon: Medal, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/10' 
    },
    { 
      id: 'members',
      title: 'Members', 
      desc: 'Manage member accounts and roles', 
      icon: Users, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      id: 'service-centers',
      title: 'Local Centers', 
      desc: 'Manage local center locations', 
      icon: Store, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-500/10' 
    },
    { 
      id: 'payouts',
      title: 'Payouts', 
      desc: 'Process member payments', 
      icon: Wallet, 
      color: 'text-cyan-500', 
      bg: 'bg-cyan-500/10' 
    },
    { 
      id: 'settings',
      title: 'System Settings', 
      desc: 'Configure business parameters', 
      icon: Settings, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-600/10' 
    },
  ];

  if (isLoading && activeView === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (error && activeView === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <ErrorState 
          title="Admin Panel Error"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'products':
        return <ProductInventory onBack={() => setActiveView('dashboard')} />;
      case 'categories':
        return <CategoryManagement onBack={() => setActiveView('dashboard')} />;
      case 'packages':
        return <PackageManagement onBack={() => setActiveView('dashboard')} />;
      case 'ranks':
        return <RankManagement onBack={() => setActiveView('dashboard')} />;
      case 'promotions':
        return <PromotionManagement onBack={() => setActiveView('dashboard')} />;
      case 'earned-promotions':
        return <EarnedPromotions onBack={() => setActiveView('dashboard')} />;
      case 'members':
        return <MemberManagement onBack={() => setActiveView('dashboard')} />;
      case 'service-centers':
        return (
          <>
            <ServiceCenterManagement 
              key={refreshKey}
              onAddCenter={handleAddCenter}
              onEditCenter={handleEditCenter}
              onDeleteCenter={handleDeleteCenter}
              onBack={() => setActiveView('dashboard')}
            />
            {showCreateModal && (
              <CreateServiceCenterModal 
                center={editingCenter}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
              />
            )}
          </>
        );
      case 'payouts':
        return <PayoutManagement onBack={() => setActiveView('dashboard')} onNavigateToPayroll={() => setActiveView('payroll')} />;
      case 'payroll':
        return <PayrollManagement onBack={() => setActiveView('payouts')} />;
      case 'settings':
        return <SystemSettingsManagement onBack={() => setActiveView('dashboard')} />;
      default:
        return (
          <div className="space-y-12 max-w-7xl mx-auto pb-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium">Manage all aspects of your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementCards.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    onClick={() => setActiveView(item.id as AdminView)}
                    className="p-8 h-full flex flex-col justify-between border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                  >
                    <div className="space-y-6">
                      <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon size={28} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">{item.title}</h3>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white dark:border-white/5 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Manage</span>
                      <div className="w-8 h-8 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-white transition-all">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
    }
  };

  return renderView();
};
