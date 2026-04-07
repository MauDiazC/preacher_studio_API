-- Add key_locations column to sermons table
ALTER TABLE sermons ADD COLUMN key_locations TEXT[] DEFAULT '{}';
