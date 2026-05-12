export type Campaign = {
  id: number;
  name: string;
  year: number;
  hijri_year: string | null;
  is_active: boolean;
};

export type Hotel = {
  id: number;
  campaign_id: number;
  name: string;
  city: string;
  address: string | null;
  total_floors: number | null;
};

export type Floor = {
  id: number;
  hotel_id: number;
  floor_number: number;
  floor_name: string;
};

export type Room = {
  id: number;
  floor_id: number;
  room_number: string;
  capacity: number;
  room_type: string | null;
  is_active: boolean;
};

export type Group = {
  id: number;
  campaign_id: number;
  group_number: number;
  group_name: string | null;
  leader_name: string | null;
  leader_phone: string | null;
};

export type Pilgrim = {
  id: number;
  campaign_id: number;
  group_id: number | null;
  full_name: string;
  national_id: string | null;
  passport_number: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  gender: "male" | "female" | null;
  nationality: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_notes: string | null;
  special_needs: string | null;
  auth_method: string;
  auth_identifier: string | null;
  status: "active" | "inactive" | "cancelled";
};

export type HousingAssignment = {
  id: number;
  pilgrim_id: number;
  room_id: number;
  is_current: boolean;
  check_in_date: string | null;
  check_out_date: string | null;
};

export type PilgrimHousingView = {
  pilgrim_id: number;
  full_name: string;
  national_id: string | null;
  passport_number: string | null;
  phone: string | null;
  group_number: number | null;
  group_name: string | null;
  room_number: string | null;
  room_capacity: number | null;
  floor_number: number | null;
  floor_name: string | null;
  hotel_name: string | null;
  hotel_city: string | null;
  campaign_name: string | null;
  campaign_year: number | null;
};

export type RoomOccupancy = {
  room_id: number;
  room_number: string;
  capacity: number;
  floor_number: number;
  floor_name: string;
  hotel_name: string;
  occupied: number;
  available: number;
};
