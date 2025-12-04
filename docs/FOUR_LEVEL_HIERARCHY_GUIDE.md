# 4-Level Cinema Management Hierarchy Guide

## Overview
Restructured the Cinema Management System from 3 levels to 4 levels, inserting Cinema Halls (Phòng chiếu) as the main action target between Cinemas and Showtimes.

## Navigation Hierarchy

```
Level 1: Cinema Chains (Chuỗi rạp)
    └─ Level 2: Cinemas (Rạp)
        └─ Level 3: Cinema Halls (Phòng chiếu) ← NEW
            └─ Level 4: Showtimes (Suất chiếu)
```

## Previous Structure (3 Levels)
```
Chains → Cinemas → Showtimes
```

## New Structure (4 Levels)
```
Chains → Cinemas → Halls → Showtimes
```

## Changes Made

### Frontend Changes (CinemaManagementHierarchy.js)

#### 1. **State Management**
- Added `selectedHall` state to track selected cinema hall
- Added `halls` state array to store cinema halls list
- Added `hallFormData` state for hall form inputs
- Added `selectedHallForEdit` state for editing operations
- Updated `currentLevel` to support: `'chains' | 'cinemas' | 'halls' | 'showtimes'`

#### 2. **API Functions**
New function added:
- `fetchHallsByCinema(cinemaId, pageNum, search)` - Fetch halls for a cinema
- `fetchShowtimesByHall(hallId, pageNum, search)` - Fetch showtimes by hall (refactored)

#### 3. **Navigation Handlers**
- `handleViewCinema()` - Now navigates to halls instead of showtimes
- `handleViewHall()` - NEW - Navigates to showtimes for selected hall
- `handleBackToHalls()` - NEW - Goes back from showtimes to halls
- Updated `handleBackToCinemas()` to reset `selectedHall`

#### 4. **Cinema Hall CRUD Operations**
New functions:
- `handleOpenHallModal()` - Open create/edit modal for halls
- `handleEditHall(hall)` - Load hall data for editing
- `handleSaveHall()` - Create/update cinema hall
- `handleDeleteHall(hallId, hallName)` - Delete cinema hall

#### 5. **Showtime CRUD Updates**
- `handleOpenShowtimeModal()` - Pre-fills `hallId` from selected hall, disables hall selection
- `handleSaveShowtime()` - Updated to call `fetchShowtimesByHall()`
- `handleDeleteShowtime()` - Updated to call `fetchShowtimesByHall()`

#### 6. **UI Components**
- **Breadcrumb Navigation**: Updated to show 4-level path
  - Chains > Selected Cinema > Selected Hall > (Showtimes at final level)
- **Page Headers**: Updated titles for each level
  - 🎪 for halls level
  - 🎬 for showtimes level
- **Search Placeholders**: Added "Tìm kiếm phòng chiếu..." for halls
- **New Table**: Added cinema halls table with:
  - Hall Name (Tên phòng)
  - Hall Number (Số phòng)
  - Total Seats (Tổng ghế)
  - Seat Layout (Sắp xếp ghế)
  - Actions (View, Edit, Delete)

#### 7. **Modal Form**
- Added Cinema Hall form with fields:
  - Hall Name (required)
  - Hall Number (required)
  - Total Seats (required, numeric)
  - Seat Layout (optional)
- Showtimes form: Hall display changed to read-only field showing selected hall

#### 8. **Pagination**
- Updated pagination handlers for all 4 levels:
  - Chains → `fetchCinemaChains()`
  - Cinemas → `fetchCinemasByChain()`
  - Halls → `fetchHallsByCinema()`
  - Showtimes → `fetchShowtimesByHall()`

### Backend Changes

#### Already Implemented
✅ CinemaHallController with all endpoints:
- `GET /api/cinema-halls/cinema/{cinemaId}` - List halls (public)
- `GET /api/cinema-halls/cinema/{cinemaId}/admin` - List halls (admin)
- `POST /api/cinema-halls/admin` - Create hall
- `PUT /api/cinema-halls/admin/{hallId}` - Update hall
- `DELETE /api/cinema-halls/admin/{hallId}` - Delete hall

✅ CinemaHallService with full CRUD logic
✅ CinemaHall Entity with proper ORM mapping
✅ CinemaHallRepository with JPA queries

#### ShowtimeRepository Updates
Fixed JPA query attribute mappings (4 corrections):
- `s.hall.hallId` → `s.hall.id`
- `s.hall.hall_Name` → `s.hall.hallName`
- `s.movie.movieName` → `s.movie.title`
- `c.cinemaId` → `c.id`

### API Endpoints Flow

**User Journey:**
1. View Cinema Chains → `GET /api/cinema-chains/admin/all`
2. Select Chain → View Cinemas → `GET /api/cinemas/chain/{chainId}/admin`
3. **NEW:** Select Cinema → View Halls → `GET /api/cinema-halls/cinema/{cinemaId}/admin`
4. Select Hall → View Showtimes → `GET /api/showtimes/hall/{hallId}`

**CRUD Operations:**

*Cinema Halls:*
- Create: `POST /api/cinema-halls/admin` (requires cinemaId)
- Update: `PUT /api/cinema-halls/admin/{hallId}` (requires cinemaId)
- Delete: `DELETE /api/cinema-halls/admin/{hallId}?cinemaId={cinemaId}`

*Showtimes:*
- Now filtered by hallId instead of cinemaId
- Create: `POST /api/showtimes/admin` (requires hallId)
- Update: `PUT /api/showtimes/admin/{id}` (requires hallId)
- Delete: `DELETE /api/showtimes/admin/{id}`

## Database Entities

### Cinema Hall Entity Fields
- `hallId` (Primary Key)
- `cinemaId` (Foreign Key to Cinema)
- `hallName` (String)
- `hallNumber` (String)
- `totalSeats` (Integer)
- `seatLayout` (String, optional)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Relationships
```
CinemaChain (1) ─── (N) Cinema
Cinema (1) ─────── (N) CinemaHall
CinemaHall (1) ──── (N) Showtime
```

## Testing Checklist

### Frontend Testing
- [ ] View Cinema Chains list
- [ ] Create/Edit/Delete Cinema Chain
- [ ] Navigate to Cinemas for a chain
- [ ] Create/Edit/Delete Cinema
- [ ] **NEW:** Navigate to Cinema Halls for a cinema
- [ ] **NEW:** Create/Edit/Delete Cinema Hall
- [ ] Navigate to Showtimes for a hall
- [ ] Create/Edit/Delete Showtime
- [ ] Breadcrumb navigation works correctly
- [ ] Search functionality works at all levels
- [ ] Pagination works correctly at all levels
- [ ] Back buttons work correctly

### Backend Testing
- [ ] GET /api/cinema-halls/cinema/{cinemaId} - Returns halls
- [ ] POST /api/cinema-halls/admin - Creates hall
- [ ] PUT /api/cinema-halls/admin/{hallId} - Updates hall
- [ ] DELETE /api/cinema-halls/admin/{hallId} - Deletes hall
- [ ] GET /api/showtimes/hall/{hallId} - Returns showtimes
- [ ] Showtimes are correctly filtered by hall

## Code Statistics
- Frontend Component Lines: ~1,450 lines
- State Variables: 23 (up from 17)
- Navigation Levels: 4 (up from 3)
- API Endpoints Used: 13 (up from 10)
- CRUD Functions: 16 (up from 12)

## Compilation Status
✅ Frontend: No errors
✅ Backend: BUILD SUCCESS (123 files compiled, 0 errors)

## Breaking Changes
⚠️ Users navigating to the Cinema Management page will now see 4 levels instead of 3
- Previous: Chains → Cinemas → Showtimes
- **Now:** Chains → Cinemas → **Halls** → Showtimes

This is intentional and provides better organizational structure for cinemas with multiple halls.
