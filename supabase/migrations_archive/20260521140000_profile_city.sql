-- Add Profiles.city — nullable TEXT for the user's city.
-- Surfaced in the /profile main panel below the nickname per the Figma
-- redesign (see docs/plans/profile-redesign.md).
ALTER TABLE "Profiles" ADD COLUMN IF NOT EXISTS city TEXT NULL;
