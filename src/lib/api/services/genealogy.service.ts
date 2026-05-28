// import apiClient  from '@/lib/api/client'; 

// import { ENDPOINTS } from '@/lib/api/endpoints'; 
// import type { GenealogyNode } from '@/lib/types/genealogy.types';

// export const genealogyService = {
//   getGenealogy: async (memberId: string): Promise<GenealogyNode> => {
//     try {
//       const { data } = await apiClient.get(
//         ENDPOINTS.MEMBERS.GENEALOGY(memberId) // 🔥 CHANGED (use endpoint)
//       );

//       return data.data; // 🔥 CHANGED (match your API response structure)
//     } catch (error) {
//       console.error('Error fetching genealogy:', error);

//       throw new Error(
//         error?.response?.data?.message ||
//         'Failed to fetch genealogy data'
//       );
//     }
//   }
// };


import  apiClient  from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { GenealogyNode } from '@/lib/types/genealogy.types';

export const genealogyService = {
  getGenealogy: async (memberId: string): Promise<GenealogyNode> => {
    try {
      const { data } = await apiClient.get(
        ENDPOINTS.MEMBERS.GENEALOGY(memberId)
      );

      return data.data;
    } catch (error: any) {
      console.error('Error fetching genealogy:', error);

      // ── Dev fallback: use mock data when the endpoint isn't ready yet ──
      // Remove this block (and the mockGenealogy constant below) once
      // your backend endpoint is live.
      if (process.env.NODE_ENV === 'development') {
        console.warn('[genealogyService] Endpoint returned an error in DEV — using mock data.');
        return mockGenealogy;
      }

      throw new Error(
        error?.response?.data?.message || 'Failed to fetch genealogy data'
      );
    }
  },
};

// ─── Mock data (DEV only) ─────────────────────────────────────────────────────
// Mirrors the shape your real API will return.
// Remove once the endpoint is live.

const mockGenealogy: GenealogyNode = {
  id: '1',
  username: 'faithfullfaith',
  left: {
    id: '2',
    username: 'sharon',
    left: {
      id: '4',
      username: 'okeoghene',
    },
    right: {
      id: '5',
      username: 'giftpemu',
    },
  },
  right: {
    id: '3',
    username: 'sparkling',
    right: {
      id: '6',
      username: 'perpetual',
    },
  },
};
