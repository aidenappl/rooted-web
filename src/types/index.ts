
export interface Organisation {
  id: number;
  name: string;
  ein: string;
  dln: string;
  has_contributed_information: boolean;
  xml_batch_id: string;
  website: string;
  description: string;
  location: Location;
  metadata: Metadata;
  updated_at: string;
}

export interface Location {
  location_id: number;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  lat: number;
  lng: number;
}

export interface Metadata {
  id: number;
  gross_receipts: number;
  total_revenue: number;
  total_expenses: number;
  excess_or_deficit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
