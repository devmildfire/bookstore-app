-- Add 'vk' (ВКонтакте) to the author contact channel enum.
-- VK is the dominant contact channel for these authors; the VkIcon already
-- exists in BrandIcons and is now wired into the channel system.
ALTER TYPE author_contact_channel ADD VALUE IF NOT EXISTS 'vk';
