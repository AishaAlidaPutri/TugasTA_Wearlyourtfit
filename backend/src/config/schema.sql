-- ==========================================================
-- WEALY DATABASE SCHEMA (PostgreSQL / Supabase compatible)
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wardrobe Items Table
CREATE TABLE IF NOT EXISTS wardrobe_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Tops, Bottoms, Outerwear, Shoes, Accessories
    color VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Outfits Table
CREATE TABLE IF NOT EXISTS outfits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    occasion VARCHAR(100) NOT NULL, -- Casual, Campus, Work, Party, Formal, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Outfit Items (Relation between Outfits and Wardrobe Items)
CREATE TABLE IF NOT EXISTS outfit_items (
    id SERIAL PRIMARY KEY,
    outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    wardrobe_item_id INTEGER NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
    CONSTRAINT unique_outfit_wardrobe_item UNIQUE (outfit_id, wardrobe_item_id)
);

-- 5. Outfit Schedules Table
CREATE TABLE IF NOT EXISTS outfit_schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    schedule_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_schedules_user_id ON outfit_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_schedules_date ON outfit_schedules(schedule_date);
