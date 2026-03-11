export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "rider" | "customer";
  branch_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Branch {
  id: number;
  name: string;
  district: string;
  address: string;
  phone: string;
}

export interface Parcel {
  id: number;
  tracking_code: string;
  sender_id: number;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_district: string;
  origin_branch_id: number;
  current_branch_id: number;
  destination_branch_id: number;
  assigned_rider_id: number | null;
  status: string;
  payment_type: string;
  weight_kg: string;
  price: string;
  cod_amount: string;
  cod_collected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  id: number;
  status: string;
  note: string | null;
  updated_by: number;
  timestamp: string;
}

export interface PaginatedParcels {
  items: Parcel[];
  total: number;
  page: number;
  per_page: number;
}

export interface DashboardStats {
  total_parcels: number;
  booked: number;
  in_transit: number;
  out_for_delivery: number;
  delivered: number;
  returned: number;
  cod_pending: number;
  today_bookings: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
