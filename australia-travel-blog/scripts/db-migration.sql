-- Add location_data column to directory_listings table
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS location_data JSONB;

-- Update existing listings with coordinates if latitude and longitude are present
UPDATE directory_listings 
SET location_data = json_build_object(
  'lat', CAST(latitude AS NUMERIC), 
  'lng', CAST(longitude AS NUMERIC),
  'address', location
)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comments to the new columns
COMMENT ON COLUMN directory_listings.location_data IS 'Structured location data with lat, lng, and address';

-- Create an index for the location_data to improve performance
CREATE INDEX IF NOT EXISTS idx_directory_listings_location_data ON directory_listings USING GIN (location_data);

-- Update the schema version
INSERT INTO schema_versions (version, description, applied_at)
VALUES ('1.2.0', 'Added structured location data to directory listings', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING; 