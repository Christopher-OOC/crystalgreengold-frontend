import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { premiumStoreService } from "@/lib/api/services/premium-store.service";
import type { PremiumStore } from "@/lib/types/premium-store.types";

interface CreatePremiumStoreModalProps {
  store?: PremiumStore | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePremiumStoreModal: React.FC<
  CreatePremiumStoreModalProps
> = ({ store, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    businessName: "",
    sponsorId: "",
    placementId: "",
    leg: "LEFT" as "LEFT" | "RIGHT",
  });

  useEffect(() => {
    if (store) {
      // Edit mode - populate form with existing data
      setFormData({
        username: store.username || "",
        email: store.email || "",
        firstName: store.firstName || "",
        lastName: store.lastName || "",
        phoneNumber: store.phoneNumber || "",
        address: store.address || "",
        businessName: store.businessName || "",
        sponsorId: "",
        placementId: "",
        leg: "LEFT",
      });
    }
  }, [store]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (store) {
        // Update existing store
        await premiumStoreService.update(store.memberId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          businessName: formData.businessName,
          storeDescription: undefined,
        });
      } else {
        // Create new store
        await premiumStoreService.create({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          businessName: formData.businessName,
          sponsorId: formData.sponsorId || undefined,
          placementId: formData.placementId || undefined,
          leg: formData.leg,
        });
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error saving state center:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save state center. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl"
      >
        <Card className="p-0 overflow-hidden border-none shadow-2xl">
          {/* Header */}
          <div className="relative bg-linear-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {store ? "Edit State Center" : "Register New State Center"}
                </h2>
                <p className="text-yellow-100 text-xs font-medium mt-0.5">
                  {store
                    ? "Update center information"
                    : "Create a new state center in the network"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
          >
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username - only for new stores */}
              {!store && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                    <User size={12} />
                    <span>Username *</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                    placeholder="e.g., premium_store_001"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <Mail size={12} />
                  <span>Email *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!store}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium disabled:opacity-50"
                  placeholder="store@example.com"
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <User size={12} />
                  <span>First Name *</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="John"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <User size={12} />
                  <span>Last Name *</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="Doe"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <Phone size={12} />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="+234 800 000 0000"
                />
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <Building size={12} />
                  <span>Business Name</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                  placeholder="My State Center"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                  <MapPin size={12} />
                  <span>Address</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium resize-none"
                  placeholder="Full address of the store"
                />
              </div>

              {/* MLM Placement - only for new stores */}
              {!store && (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                      <Award size={12} />
                      <span>Sponsor ID (Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="sponsorId"
                      value={formData.sponsorId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                      placeholder="Sponsor username or ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                      <Award size={12} />
                      <span>Placer ID (Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="placementId"
                      value={formData.placementId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                      placeholder="Placer username or ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                      <Award size={12} />
                      <span>Leg (Optional)</span>
                    </label>
                    <select
                      name="leg"
                      value={formData.leg}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
                    >
                      <option value="LEFT">Left</option>
                      <option value="RIGHT">Right</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald-50 dark:border-white/5">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>{store ? "Update Store" : "Create Store"}</span>
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
