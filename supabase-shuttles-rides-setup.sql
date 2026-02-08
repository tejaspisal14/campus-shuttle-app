-- Run this in your Supabase SQL Editor to create shuttles and rides tables

-- Shuttles table for active vehicles
CREATE TABLE IF NOT EXISTS shuttles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL UNIQUE,
  vehicle_code TEXT, -- 4-digit code for boarding (e.g. '1001')
  route_type TEXT NOT NULL DEFAULT 'regular' CHECK (route_type IN ('regular', 'mens_hostel')),
  current_seats INTEGER DEFAULT 0,
  total_seats INTEGER DEFAULT 22,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  driver_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rides table for student ride entries
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  shuttle_id UUID REFERENCES shuttles(id),
  vehicle_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shuttles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

-- Shuttles: Anyone can read active shuttles
CREATE POLICY "Anyone can view active shuttles" ON shuttles
  FOR SELECT USING (is_active = true);

-- Rides: Students can view/insert their own rides
CREATE POLICY "Students can view own rides" ON rides
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own rides" ON rides
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Enable real-time for shuttles
ALTER PUBLICATION supabase_realtime ADD TABLE shuttles;
