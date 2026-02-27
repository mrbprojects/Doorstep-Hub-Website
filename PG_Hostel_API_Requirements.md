# UI-to-API Mapping for PG Hostels

This document maps every visual section of your PG/Hostel UI to the specific backend APIs and database fields required to power it dynamicall.

## 1. Home Page: Search Bar
**Where is it?**: The main search strip on `PremiumHomePage`.
**What it does**: Allows searching by name, area, or landmark.

| UI Element | Data Needed | Backend Field / API |
| :--- | :--- | :--- |
| **Search Input** | Autocomplete suggestions (Optional) | `GET /api/places/autocomplete?q=...` |
| **Search Action** | Query string | `GET /listings?query=koramangala` |
| **Location Auto** | User coordinates | `lat`, `lng` (from browser) send to API |

---

## 2. Listings Page: Filter Sidebar
**Where is it?**: The "Filters" sheet/modal on the results page.
**What it does**: Shows checkboxes and sliders to refine results.

| UI Element | Data Needed | Backend Field / API |
| :--- | :--- | :--- |
| **Price Slider** | Min/Max values of *all* inventory | `price_range.min`, `price_range.max` from Config API |
| **Room Type** | List: Single, Double, Dorm | `room_types` (enum in DB) |
| **Amenities** | List: WiFi, Food, AC, etc. | `amenities` (table or json array in DB) |
| **Gender** | List: Boys, Girls, Co-living | `category` (enum in DB) |
| **Move-In** | Date availability | `available_from` (date field) |

**Required API**: `GET /api/v1/pghostels/config/filters` (returns all these options dynamically).

---

## 3. Listing Card (The Grid Item)
**Where is it?**: The individual card showing a PG/Hostel in the grid.
**What it does**: Displays summary info to tempt the user to click.

| UI Element | Data Needed | Database Field Required |
| :--- | :--- | :--- |
| **Main Image** | High-res cover image URL | `cover_image` (URL string) |
| **Badges** | "Verified", "Near Metro" | `badges` or `tags` (Array of strings) |
| **Match Score** | % Match (e.g., "98% Match") | `match_score` (Calculated on backend based on user pref) |
| **Distance** | "0.8 km away" | Calculated using `lat`, `lng` of PG vs User |
| **Name** | "Green Valley PG" | `name` |
| **Location** | "Whitefield, Bangalore" | `address.area`, `address.city` |
| **Rating** | Star count (e.g., 4.5) | `rating_average` |
| **Orders** | "142 Orders" | `total_bookings_count` |
| **Availability**| "2 beds left" | `current_availability_count` |
| **Price** | "₹6,500/month" | `monthly_rent` |
| **Amenities** | Icons (WiFi, Food) | `amenities_list` (Array) |

---

## 4. Sorting & Tabs
**Where is it?**: The tabs above the grid ("All PGs", "Nearby") and hypothetical sort dropdown.

| UI Element | Data Needed | Backend Logic |
| :--- | :--- | :--- |
| **"Nearby" Tab** | Sort by distance | API must support `?sort=distance&lat=...&lng=...` |
| **"All PGs" Tab** | Default sort (e.g., by pop) | API must support `?sort=recommended` |

---

## 5. Hostel Detail Page (When clicked)
**Where is it?**: The single page view of a property.

| UI Element | Data Needed | Database Field Required |
| :--- | :--- | :--- |
| **Gallery** | Multiple images | `images_gallery` (Array of URLs) |
| **Description** | Full text description | `description` (Long text/HTML) |
| **Map** | Exact location pin | `latitude`, `longitude` (Float) |
| **Food Menu** | Mess menu details | `food_menu` (JSON or Image URL) |
| **Rules** | "No Smoking", "Curfew" | `house_rules` (Array of strings) |
| **Owner** | Contact details | `contact_phone`, `contact_whatsapp` |

---

## Summary of "Must-Have" Database Fields

To support the above UI, your `PG_Hostel` table needs these columns:

```sql
id                  INT / UUID
name                VARCHAR
slug                VARCHAR (for SEO friendly URLs)
category            ENUM ('Boys', 'Girls', 'Coliving')
description         TEXT
cover_image         VARCHAR (URL)
images_gallery      JSON (Array of URLs)
monthly_rent        DECIMAL
deposit             DECIMAL
address_area        VARCHAR
address_city        VARCHAR
latitude            DECIMAL
longitude           DECIMAL
rating_avg          DECIMAL
total_bookings      INT
current_availability INT
amenities           JSON (['wifi', 'ac', 'gym'])
badges              JSON (['verified', 'premium'])
created_at          TIMESTAMP
```
