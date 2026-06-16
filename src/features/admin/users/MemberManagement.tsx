import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Users,
  Store,
  Shield,
  UserCog,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  User,
  Wallet,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  Loader2,
  LogIn,
} from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ServiceCenterManagement } from "@/features/admin/service-centers/ServiceCenterManagement";
import { PremiumStoreManagement } from "@/features/admin/stores/PremiumStoreManagement";
import { AdminUserManagement } from "@/features/admin/users/AdminUserManagement";
import { memberService } from "@/lib/api/services/member.service";
import { CreateServiceCenterModal } from "@/features/admin/service-centers/CreateServiceCenterModal";
import { CreatePremiumStoreModal } from "@/features/admin/stores/CreatePremiumStoreModal";
import { CreateAdminModal } from "@/features/admin/users/CreateAdminModal";
import { premiumStoreService } from "@/lib/api/services/premium-store.service";
import { adminService } from "@/lib/api/services/admin.service";
import { useAuth } from "@/features/auth/AuthContext";
import type { Member } from "@/lib/types/member.types";

interface MemberData extends Member {
  memberId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  availableBalance?: number;
  sponsorUsername?: string;
  placerUsername?: string;
  enabled?: boolean;
  phoneNumber?: string;
  address?: string;
  registeredOn?: string;
  roles?: ({ id?: number | string; name?: string; authority?: string } | string)[];
  currentPackage?: any;
}

interface MemberManagementProps {
  onBack: () => void;
}

const ServiceCenterManagementWrapper: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <ServiceCenterManagement
        key={refreshKey}
        onBack={() => undefined}
        onAddCenter={() => {
          setEditingCenter(null);
          setShowModal(true);
        }}
        onEditCenter={(center) => {
          setEditingCenter(center);
          setShowModal(true);
        }}
        onDeleteCenter={async (memberId) => {
          if (!window.confirm("Deactivate this local center?")) return;
          try {
            const { serviceCenterService } =
              await import("@/lib/api/services/service-center.service");
            await serviceCenterService.toggleStatus(memberId, false);
            setRefreshKey((k) => k + 1);
          } catch {
            alert("Failed to deactivate local center.");
          }
        }}
      />
      {showModal && (
        <CreateServiceCenterModal
          center={editingCenter}
          onClose={() => {
            setShowModal(false);
            setEditingCenter(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingCenter(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
};

const PremiumStoreManagementWrapper: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PremiumStoreManagement
        key={refreshKey}
        onAddStore={() => {
          setEditingStore(null);
          setShowModal(true);
        }}
        onEditStore={(store) => {
          setEditingStore(store);
          setShowModal(true);
        }}
        onDeleteStore={async (memberId) => {
          if (!window.confirm("Deactivate this state center?")) return;
          try {
            await premiumStoreService.toggleStatus(memberId, false);
            setRefreshKey((k) => k + 1);
          } catch {
            alert("Failed to deactivate state center.");
          }
        }}
      />
      {showModal && (
        <CreatePremiumStoreModal
          store={editingStore}
          onClose={() => {
            setShowModal(false);
            setEditingStore(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingStore(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
};

const AdminUserManagementWrapper: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <AdminUserManagement
        key={refreshKey}
        onAddAdmin={() => {
          setEditingAdmin(null);
          setShowModal(true);
        }}
        onEditAdmin={(admin) => {
          setEditingAdmin(admin);
          setShowModal(true);
        }}
        onDeleteAdmin={async (memberId) => {
          if (!window.confirm("Deactivate this admin user?")) return;
          try {
            await adminService.toggleStatus(memberId, false);
            setRefreshKey((k) => k + 1);
          } catch {
            alert("Failed to deactivate admin user.");
          }
        }}
      />
      {showModal && (
        <CreateAdminModal
          admin={editingAdmin}
          onClose={() => {
            setShowModal(false);
            setEditingAdmin(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAdmin(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
};

export const MemberManagement: React.FC<MemberManagementProps> = ({
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState("All Members");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByBV, setSortByBV] = useState("ALL");
  const [enabledFilter, setEnabledFilter] = useState("ALL");
  const [showActionToast, setShowActionToast] = useState<{
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [impersonatingMemberId, setImpersonatingMemberId] = useState<string | null>(null);

  const { loginAsUser } = useAuth();
  const fetchMembers = useCallback(
    async (
      page = 1,
      size = rowsPerPage,
      search = searchQuery,
      sortBv = sortByBV,
      enabled = enabledFilter,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await memberService.getAll(
          page,
          size,
          search,
          "ALL",
          sortBv,
          enabled,
        );
        setMembers(result.data);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load members.");
      } finally {
        setIsLoading(false);
      }
    },
    [rowsPerPage],
  );

  useEffect(() => {
    if (activeTab === "All Members") {
      fetchMembers(
        currentPage,
        rowsPerPage,
        searchQuery,
        sortByBV,
        enabledFilter,
      );
    }
  }, [
    activeTab,
    currentPage,
    rowsPerPage,
    sortByBV,
    enabledFilter,
    fetchMembers,
  ]);

  // Debounce search
  useEffect(() => {
    if (activeTab !== "All Members") return;
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchMembers(1, rowsPerPage, searchQuery, sortByBV, enabledFilter);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, fetchMembers, rowsPerPage, sortByBV, enabledFilter]);

  const handleAction = (message: string) => {
    setShowActionToast({ message });
    setTimeout(() => setShowActionToast(null), 3000);
  };

  const getMemberLoginId = (member: MemberData) => member.memberId || member.id;

  const handleLoginAsMember = async (member: MemberData) => {
    const memberId = getMemberLoginId(member);
    if (!memberId) {
      handleAction('No member ID found');
      return;
    }

    setImpersonatingMemberId(memberId);
    await loginAsUser(memberId, member);
    setImpersonatingMemberId(null);
  };

  const getRoleName = (member: MemberData) => {
    const roles = member.roles ?? [];
    const roleNames = roles.map((role) =>
      (typeof role === "string" ? role : role.name || role.authority || "").toUpperCase(),
    );
    if (roleNames.some((role) => role === "ROLE_SUPER_ADMIN" || role === "SUPER_ADMIN")) return "Super Admin";
    if (roleNames.some((role) => role === "ROLE_ADMIN" || role === "ADMIN")) return "Admin";
    if (roleNames.some((role) => role === "ROLE_PREMIUM_STORE" || role === "PREMIUM_STORE"))
      return "State Center";
    if (roleNames.some((role) => role === "ROLE_SERVICE_CENTER" || role === "SERVICE_CENTER"))
      return "Local Center";
    return "Regular Member";
  };

  const tabs = [
    { id: "All Members", icon: Users, label: "All Members" },
    { id: "Local Centers", icon: Shield, label: "Local Centers" },
    { id: "State Centers", icon: Store, label: "State Centers" },
    { id: "Admins", icon: UserCog, label: "Admins" },
  ];

  if (isLoading && activeTab === "All Members" && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">
          Loading Member Data...
        </p>
      </div>
    );
  }

  if (error && activeTab === "All Members") {
    return (
      <ErrorState
        title="Directory Error"
        message={error}
        onRetry={() => fetchMembers()}
        onBack={onBack}
      />
    );
  }

  if (selectedMember) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        <button
          onClick={() => setSelectedMember(null)}
          className="flex items-center space-x-2 text-emerald-600 hover:text-yellow-500 transition-colors font-bold text-sm group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Member List</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 p-8 space-y-6 border-none shadow-2xl h-fit">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-yellow-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20">
                <User size={48} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest">
                  {selectedMember.username}
                </p>
              </div>
              <div
                className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedMember.enabled
                    ? "bg-emerald-50 text-emerald-500 border border-emerald-100"
                    : "bg-rose-50 text-rose-500 border border-rose-100"
                }`}
              >
                {selectedMember.enabled ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white dark:border-white/5">
              <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
                <Mail size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">
                  {selectedMember.email}
                </span>
              </div>
              {selectedMember.phoneNumber && (
                <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
                  <Phone size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    {selectedMember.phoneNumber}
                  </span>
                </div>
              )}
              {selectedMember.address && (
                <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
                  <MapPin size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    {selectedMember.address}
                  </span>
                </div>
              )}
              {selectedMember.registeredOn && (
                <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
                  <Calendar size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    Joined{" "}
                    {new Date(selectedMember.registeredOn).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Balance
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-950 dark:text-white">
                  ₦{selectedMember.availableBalance?.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Available balance
                </p>
              </Card>
              <Card className="p-6 border-none shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Role
                  </span>
                </div>
                <p className="text-lg font-black text-emerald-950 dark:text-white">
                  {getRoleName(selectedMember)}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Member type
                </p>
              </Card>
            </div>

            <Card className="p-8 border-none shadow-xl space-y-6">
              <h3 className="text-lg font-black text-emerald-950 dark:text-white tracking-tight">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Sponsor
                  </p>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {selectedMember.sponsorUsername ?? "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Placer
                  </p>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {selectedMember.placerUsername ?? "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Member ID
                  </p>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 font-mono">
                    {selectedMember.memberId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Package
                  </p>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {selectedMember.currentPackage?.name ?? "No Package"}
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-end space-x-4">
              <Button
                onClick={() => handleAction(`Suspend action initiated`)}
                className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Suspend Account
              </Button>
              <Button
                onClick={() => handleLoginAsMember(selectedMember)}
                disabled={impersonatingMemberId === getMemberLoginId(selectedMember)}
                className="bg-yellow-500 text-white hover:bg-yellow-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2"
              >
                {impersonatingMemberId === getMemberLoginId(selectedMember) ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                <span>{impersonatingMemberId === getMemberLoginId(selectedMember) ? 'Starting Session...' : 'Login as User'}</span>
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showActionToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-50 flex items-center space-x-3 bg-emerald-950 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest text-xs"
            >
              <CheckCircle2 size={20} className="text-amber-400" />
              <span>{showActionToast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Local Centers":
        return <ServiceCenterManagementWrapper />;
      case "State Centers":
        return <PremiumStoreManagementWrapper />;
      case "Admins":
        return <AdminUserManagementWrapper />;
      default:
        return (
          <div className="space-y-6">
            <Card className="p-4 border-none shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                      Sort By BV:
                    </span>
                    <select
                      value={sortByBV}
                      onChange={(e) => {
                        setSortByBV(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-black uppercase outline-none cursor-pointer"
                    >
                      <option value="ALL">ALL</option>
                      <option value="HIGHEST">HIGHEST</option>
                      <option value="LOWEST">LOWEST</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                      Enabled:
                    </span>
                    <select
                      value={enabledFilter}
                      onChange={(e) => {
                        setEnabledFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-black uppercase outline-none cursor-pointer"
                    >
                      <option value="ALL">ALL</option>
                      <option value="TRUE">TRUE</option>
                      <option value="FALSE">FALSE</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card noPadding className="overflow-hidden border-none shadow-2xl">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-yellow-50/50 dark:bg-white/5 border-b border-yellow-100 dark:border-white/5">
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          S/N
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          NAME
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          EMAIL
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          USERNAME
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          BALANCE
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          SPONSOR
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                          PLACER
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest text-center">
                          STATUS
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-yellow-600 uppercase tracking-widest text-center">
                          ACTIONS
                        </th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white dark:divide-white/5">
                      {members.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-12 text-center text-emerald-400 font-bold"
                          >
                            No members found.
                          </td>
                        </tr>
                      ) : (
	                        members.map((member, i) => {
                            const memberLoginId = getMemberLoginId(member);
                            const isImpersonating = impersonatingMemberId === memberLoginId;

                            return (
	                          <motion.tr
	                            key={member.id || member.memberId || member.username || i}
	                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => setSelectedMember(member)}
                            className="hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          >
                            <td className="px-4 py-4 text-xs font-bold text-emerald-400">
                              {(currentPage - 1) * rowsPerPage + i + 1}.
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-xs font-black text-emerald-950 dark:text-white group-hover:text-yellow-500 transition-colors">
                                {member.firstName} {member.lastName}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-emerald-600">
                              {member.email}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-emerald-600">
                              {member.username}
                            </td>
                            <td className="px-4 py-4 text-xs font-black text-emerald-950 dark:text-white">
                              ₦{member.availableBalance?.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-emerald-600">
                              {member.sponsorUsername ?? "—"}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-emerald-600">
                              {member.placerUsername ?? "—"}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  member.enabled
                                    ? "bg-emerald-50 text-emerald-500 border border-emerald-100"
                                    : "bg-rose-50 text-rose-500 border border-rose-100"
                                }`}
                              >
                                {member.enabled ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
	                              <button
	                                onClick={(e) => {
	                                  e.stopPropagation();
	                                  handleLoginAsMember(member);
	                                }}
                                  disabled={isImpersonating}
	                                className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg transition-all"
	                                title="Login as user"
	                              >
	                                {isImpersonating ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
	                              </button>
	                            </td>
	                          </motion.tr>
	                        );
                          })
	                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white dark:border-white/5 bg-white/30 dark:bg-white/[0.01]">
                <p className="text-xs font-bold text-emerald-400">
                  Showing{" "}
                  <span className="text-emerald-950 dark:text-white">
                    {members.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-emerald-950 dark:text-white">
                    {totalElements}
                  </span>{" "}
                  members
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase">
                      Rows:
                    </span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-lg transition-all disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from(
                      { length: Math.min(totalPages, 9) },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          currentPage === page
                            ? "bg-yellow-500 text-white"
                            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    {totalPages > 9 && (
                      <MoreHorizontal
                        size={16}
                        className="text-emerald-400 mx-1"
                      />
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-lg transition-all disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-emerald-600 hover:text-yellow-500 transition-colors font-bold text-sm group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Admin Dashboard</span>
        </button>
      </div>

      <div className="flex items-center justify-center space-x-2 bg-white dark:bg-emerald-950 p-1.5 rounded-2xl shadow-sm w-fit mx-auto border border-emerald-50 dark:border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                : "text-emerald-600 hover:bg-white dark:hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
