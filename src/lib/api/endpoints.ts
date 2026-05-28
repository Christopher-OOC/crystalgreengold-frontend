// ─────────────────────────────────────────────────────────────────────────────
// All Spring Boot endpoint URL constants for topnivo
// Base: http://localhost:8080  (set via NEXT_PUBLIC_API_URL)
// Version prefix: /api/v1
// ─────────────────────────────────────────────────────────────────────────────

const V1 = '/api/v1';

export const ENDPOINTS = {

  // ── Authentication ──────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:   `${V1}/auth/login`,
    REFRESH: `${V1}/auth/refresh`,
  },

  // ── Members ─────────────────────────────────────────────────────────────────
  MEMBERS: {
    BASE:                           `${V1}/members`,
    BY_ID:           (id: string)=> `${V1}/members/${id}`,
    CHECK_USERNAME:  (u: string) => `${V1}/members/check/${u}`,
    CHECK_LEG:                      `${V1}/members/check-leg`,
    CHECK_DOWNLINE:                 `${V1}/members/check-downline`,
    SERVICE_CENTERS:                `${V1}/members/service-centers`,
    PREMIUM_STORES:                 `${V1}/members/premium-stores`,
    GENEALOGY:       (id: string)=> `${V1}/members/${id}/genealogy`,
    ANALYSIS:        (id: string)=> `${V1}/members/${id}/analysis`,
    ACCOUNT_DETAILS: (id: string)=> `${V1}/members/${id}/account-details`,
    ADD_ACCOUNT_DETAILS:(id: string)=>`${V1}/members/${id}/add-account-details`,
    ADD_STORE_INFO:  (id: string)=> `${V1}/members/${id}/add-store-info`,
    ADD_ROOTS:       (id: string)=> `${V1}/members/${id}/add-roots`,
    BUY_PACKAGE:     (id: string)=> `${V1}/members/${id}/buy-package`,
    ACTIVATE_PACKAGE:(id: string)=> `${V1}/members/${id}/activate-package`,
    TRANSFER_FUNDS:  (id: string)=> `${V1}/members/${id}/transfer-funds`,
    CHANGE_PASSWORD: (id: string)=> `${V1}/members/${id}/change-password`,
    FORGOT_PASSWORD:                `${V1}/members/forgot-password`,
    CAN_RECEIVE_PAYMENT:(id: string)=>`${V1}/members/${id}/can-receive-payment`,
  },

  // ── Products ─────────────────────────────────────────────────────────────────
  PRODUCTS: {
    BASE:                              `${V1}/products`,
    BY_ID:        (id: string)      => `${V1}/products/${id}`,
    DISCOUNTED:                        `${V1}/products/discounted`,
    STORE_BY_MEMBER:(memberId: string)=>`${V1}/products/stores/${memberId}`,
    STORE_PRODUCT:  (id: string)    => `${V1}/products/stores/products/${id}`,
  },

  // ── Orders ───────────────────────────────────────────────────────────────────
  ORDERS: {
    BASE:                                            `${V1}/orders`,
    ALL_ORDERS:                                      `${V1}/orders`,
    BY_MEMBER:       (memberId: string)           => `${V1}/orders/members/${memberId}`,
    BY_ID_AND_MEMBER:(orderId: string, memberId: string) => `${V1}/orders/${orderId}/members/${memberId}`,
    UPDATE:          (orderId: string, memberId: string) => `${V1}/orders/${orderId}/members/${memberId}`,
    CONFIRM:         (orderId: string, memberId: string) => `${V1}/orders/${orderId}/confirm-orders/${memberId}`,
    VALIDATE:        (memberId: string)           => `${V1}/orders/validate/${memberId}`,
    CREATE:          (memberId: string)           => `${V1}/orders/create-order/${memberId}`,
    MANAGE:          (storeId: string)            => `${V1}/orders/manage-orders/members/${storeId}`,
  },

  // ── Cart ─────────────────────────────────────────────────────────────────────
  CART: {
    BY_MEMBER:    (memberId: string) => `${V1}/carts/${memberId}`,
    ADD_TO_CART:  (memberId: string) => `${V1}/carts/add-to-cart/${memberId}`,
  },

  // ── Packages ─────────────────────────────────────────────────────────────────
  PACKAGES: {
    BASE:                         `${V1}/packages`,
    BY_ID: (id: string)        => `${V1}/packages/${id}`,
  },

  // ── Categories ───────────────────────────────────────────────────────────────
  CATEGORIES: {
    BASE:                         `${V1}/categories`,
    BY_ID: (id: string)        => `${V1}/categories/${id}`,
  },

  // ── Ranks ────────────────────────────────────────────────────────────────────
  RANKS: {
    BASE:                         `${V1}/ranks`,
    BY_ID: (id: string)        => `${V1}/ranks/${id}`,
  },

  // ── Promotions ───────────────────────────────────────────────────────────────
  PROMOTIONS: {
    BASE:                         `${V1}/promotions`,
    BY_ID: (id: string)        => `${V1}/promotions/${id}`,
  },

  // ── Earned Promotions ────────────────────────────────────────────────────────
  EARNED_PROMOS: {
    BASE:                         `${V1}/earned-promos`,
    BY_ID: (id: string)        => `${V1}/earned-promos/${id}`,
  },

  // ── Bonuses / Commissions ────────────────────────────────────────────────────
  BONUSES: {
    BY_MEMBER: (memberId: string) => `${V1}/bonuses/members/${memberId}`,
  },

  // ── Transactions ─────────────────────────────────────────────────────────────
  TRANSACTIONS: {
    BY_MEMBER: (memberId: string) => `${V1}/transactions/members/${memberId}`,
  },

  // ── Payments ─────────────────────────────────────────────────────────────────
  PAYMENTS: {
    ALL_BANKS:       `${V1}/payments/all-banks`,
    PREPARE_PAYROLL: `${V1}/payments/prepare-payroll`,
    GET_PAYROLL:     `${V1}/payments/get-payroll`,
    SEND_PAYROLL:    `${V1}/payments/send-payroll`,
    DELETE_ENTRY:    (id: string) => `${V1}/payments/payroll-entry/${id}`,
  },

  // ── Admin ────────────────────────────────────────────────────────────────────
  ADMIN: {
    UPDATE_MEMBER:      (memberId: string)              => `${V1}/admins/${memberId}/members`,
    UPDATE_MEMBER_INFO: (memberId: string)              => `${V1}/admins/update-member-info/${memberId}`,
    SETTINGS:                                              `${V1}/admins/settings`,
    SETTING_BY_ID:      (id: string)                   => `${V1}/admins/settings/${id}`,
    SETTING_BY_NAME:    (name: string)                 => `${V1}/admins/settings/name/${name}`,
    LOGIN_AS_USER:      (adminId: string, memberId: string) => `${V1}/admins/login-as-user/${adminId}/${memberId}`,
    UPDATE_ROLE: (memberId: string) => `${V1}/admins/${memberId}/role`,
  },

  // ── Store Packages ───────────────────────────────────────────────────────────
  STORE_PACKAGES: {
    BY_ID:    (id: string)      => `${V1}/store-packages/${id}`,
    BY_STORE: (storeId: string) => `${V1}/store-packages/stores/${storeId}`,
  },

  // ── Files / Resources ────────────────────────────────────────────────────────
  FILES: {
    ORDER_RESOURCE: (id: string) => `${V1}/resources/orders/${id}`,
  },

} as const;
