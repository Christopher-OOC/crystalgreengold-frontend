// lib/api/index.ts
// Single import point for all crystalgreengold API services

export { authService }         from '@/lib/api/services/auth.service';
export { memberService }       from '@/lib/api/services/member.service';
export { productService }      from '@/lib/api/services/product.service';
export { orderService }        from '@/lib/api/services/order.service';
export { cartService }         from '@/lib/api/services/cart.service';
export { packageService }      from '@/lib/api/services/package.service';
export { categoryService }     from '@/lib/api/services/category.service';
export { rankService }         from '@/lib/api/services/rank.service';
export { promotionService }    from '@/lib/api/services/promotion.service';
export {
  earnedPromoService,
  bonusService,
  transactionService,
  paymentService,
  adminService,
  storePackageService,
  fileService,
}    from '@/lib/api/services/misc.service';

export { default as apiClient, tokenStorage } from '@/lib/api/client';
export { ENDPOINTS }           from '@/lib/api/endpoints';

