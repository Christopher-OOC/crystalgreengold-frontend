/**
 * Utilities to handle data integrity and normalization between 
 * backend (snake_case) and frontend (camelCase) naming conventions.
 */

export function normalizeMetrics(data: any): any {
  if (!data) return null;

  const availableBalance = data.availableBalance ?? data.available_balance ?? 0;
  const awaitingWallet = data.awaitingWallet ?? data.awaiting_wallet ?? 0;
  const dailyBinaryEarning = data.dailyBinaryEarning ?? data.daily_binary_earning ?? 0;
  const binaryLeftPv = data.binaryLeftPv ?? data.binary_left_pv ?? 0;
  const binaryRightPv = data.binaryRightPv ?? data.binary_right_pv ?? 0;
  const totalLeftBv = data.totalLeftBv ?? data.total_left_bv ?? 0;
  const totalRightBv = data.totalRightBv ?? data.total_right_bv ?? 0;
  const monthlyLeftPv = data.monthlyLeftPv ?? data.monthly_left_pv ?? 0;
  const monthlyRightPv = data.monthlyRightPv ?? data.monthly_right_pv ?? 0;
  const monthlySalesPv = data.monthlySalesPv ?? data.monthly_sales_pv ?? 0;
  const countNewlyRegisteredOnMonthlyWeakerLeg = data.countNewlyRegisteredOnMonthlyWeakerLeg ?? data.count_newly_registered_on_monthly_weaker_leg ?? 0;
  
  return {
    ...data,
    // Ensure both conventions coexist for safety
    sponsorUsername: data.sponsorUsername ?? data.sponsor_name ?? data.sponsor_username,
    placerUsername:  data.placerUsername  ?? data.placer_name  ?? data.placer_username,
    leftLegUsername: data.leftLegUsername ?? data.left_leg_name ?? data.left_leg_username,
    rightLegUsername:data.rightLegUsername ?? data.right_leg_name ?? data.right_leg_username,
    
    availableBalance,
    awaitingWallet,
    dailyBinaryEarning,
    binaryLeftPv,
    binaryRightPv,
    totalLeftBv,
    totalRightBv,
    monthlyLeftPv,
    monthlyRightPv,
    monthlySalesPv,
    countNewlyRegisteredOnMonthlyWeakerLeg,

    available_balance: availableBalance,
    awaiting_wallet: awaitingWallet,
    daily_binary_earning: dailyBinaryEarning,
    binary_left_pv: binaryLeftPv,
    binary_right_pv: binaryRightPv,
    total_left_bv: totalLeftBv,
    total_right_bv: totalRightBv,
    monthly_left_pv: monthlyLeftPv,
    monthly_right_pv: monthlyRightPv,
    monthly_sales_pv: monthlySalesPv,
  };
}

export function normalizeMember(member: any): any {
  if (!member) return null;
  
  // Handle roles nested inside objects (Spring Boot standard)
  let memberType = member.memberType;
  if (member.roles && !memberType) {
    const roles = member.roles.map((r: any) => 
      (typeof r === 'string' ? r : (r.name || r.authority || r.roleName || '')).toUpperCase()
    );
    
    if (roles.includes('ROLE_SUPER_ADMIN')) memberType = 'SUPER_ADMIN';
    else if (roles.includes('ROLE_ADMIN')) memberType = 'ADMIN';
    else if (roles.includes('ROLE_PREMIUM_STORE')) memberType = 'PREMIUM_STORE';
    else if (roles.includes('ROLE_SERVICE_CENTER')) memberType = 'SERVICE_CENTER';
    else memberType = 'REGULAR_MEMBER';
  }

  return {
    ...member,
    memberType,
    id: member.id || member._id || member.memberId,
    phoneNumber: member.phoneNumber || member.phone_number,
    registeredOn: member.registeredOn || member.registered_on || member.createdAt,
  };
}

export function normalizeOrder(order: any): any {
  if (!order) return null;
  return {
    ...order,
    id: order.id || order._id,
    items: (order.items || []).map((item: any) => ({
      ...item,
      id: item.id || item._id
    }))
  };
}

export function normalizeProduct(product: any): any {
  if (!product) return null;
  return {
    ...product,
    id: product.id || product._id
  };
}
