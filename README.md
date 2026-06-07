# AuraPlays

**AuraPlays** is a premium, full-stack sports venue booking and social matchmaking platform (inspired by apps like Playo). The application enables sports enthusiasts to find nearby courts (both premium partner venues and free public facilities), book play slots, share split pricing, and host or join community matches to meet new players.

---

## 🚀 Tech Stack

### Backend
* **Framework:** Spring Boot (v3.2.5) with Java 17
* **Security:** Spring Security & Stateless JWT Authentication
* **Data Access:** Spring Data JPA (Hibernate)
* **Database:** MySQL
* **Integrations:**
  * **OpenStreetMap Overpass API:** Real-time query of local public sports facilities based on geographic coordinates.
  * **Razorpay Payment Gateway:** Unified payment gateway integration with signature verification.
  * **OSM Nominatim API:** Reverse geocoding to resolve GPS coordinates to city names.

### Frontend
* **Core:** React (v18.2) & Vite
* **Styling:** Tailwind CSS & Custom CSS
* **Animations:** Framer Motion (for premium micro-interactions)
* **Icons:** Lucide React
* **Client:** Axios (with interceptors to attach bearer JWT tokens automatically)

---

## ✨ Core Features Implemented

1. **Role-Based Access Control (RBAC):**
   * **Customers:** Search courts, book slots, host/join social games, pay for bookings, and rate venues.
   * **Court Owners:** List courts, manage schedules/slots, define pricing, create discount offers, and approve/reject bookings.
   * **Admins:** Oversee user accounts, verify court listings, and view global system statistics.

2. **Dual-Discovery Geolocation System:**
   * Uses HTML5 Geolocation (with an IP-location fallback via `freeipapi.com` / `ipapi.co`) to automatically identify the user's coordinates.
   * **Partner Venues:** Searches the internal MySQL database for premium courts registered on AuraPlays.
   * **Public Facilities:** Performs live, real-time queries to OpenStreetMap's **Overpass API** to fetch free public fields, pitches, and leisure centers near the user.
   * Leverages OSM **Nominatim API** for reverse-geocoding to display the user's detected city name in the hero search bar.

3. **Concurrency-Safe Slot Booking:**
   * Visual, interactive slot picking calendar.
   * Implements **Pessimistic Database Locking** (`SELECT FOR UPDATE`) on slot selection to prevent race conditions (double-bookings) under high concurrent traffic.
   * Supports **Auto-Approval** (instant confirmation) or **Manual Approval** workflows based on venue preferences.
   * **Overlapping Conflict Resolution:** Approving a booking automatically invalidates overlapping time slots and auto-rejects other pending booking requests for those slots.

4. **Social Play Feed ("Playo Mode"):**
   * While booking a court, customers can check a box to **Host a Game**.
   * The game is published to a public community feed, listing the sport, required skill level, maximum player slots, split price per player, and duration.
   * Other community players can join games directly, earning **Karma Points** for participation (encouraging active engagement).

5. **Integrated Razorpay Payments:**
   * Standard checkout flow with order generation (`RazorpayClient`) and webhook/signature verification (`Utils.verifyPaymentSignature`).
   * **Mock Payment Simulator:** Automatically falls back to a mock order flow during development if Razorpay API keys are not supplied, allowing developers to test the full checkout and confirmation flow out-of-the-box.

6. **Micro-Interaction Alerts:**
   * Dynamic, real-time-like pending notifications loaded on customer login to alert them when a venue owner has approved their booking.

---

## 🛠️ Project Structure

```text
AuraPlays/
├── backend/
│   ├── src/main/java/com/auraplays/backend/
│   │   ├── config/       # Security, Cors, and DB Seeders/Repair Runners
│   │   ├── controller/   # REST Endpoints (Auth, Booking, Court, Game, Offer, Payment, etc.)
│   │   ├── dto/          # Data Transfer Objects (Requests/Responses)
│   │   ├── entity/       # JPA Entities (User, Court, CourtSlot, Booking, Payment, Game, etc.)
│   │   ├── repository/   # Spring Data JPA Repositories (with locking queries)
│   │   ├── security/     # JWT Provider, Custom User Details, and Auth Filters
│   │   └── service/      # Business Logic & Overpass OSM integrations
│   └── pom.xml           # Backend Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI widgets (SlotPicker, BottomNav, Navbar, Footer, etc.)
│   │   ├── context/      # React contexts for Authentication and Themes
│   │   ├── pages/        # View Pages divided by roles (Admin, Auth, Customer, Owner)
│   │   ├── services/     # Axios client configuration
│   │   └── styles/       # Tailwind & styling files
│   ├── tailwind.config.js
│   └── package.json      # Frontend Dependencies
└── README.md
```

---

## ⚙️ Quick Start

### Prerequisites
* **Java:** JDK 17
* **Database:** MySQL
* **Node.js:** Node 18+

### Database Configuration
Create a database named `auraplays_db` in MySQL. Update the database credentials in [application.properties](file:///e:/Mine/AuraPlays/backend/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/auraplays_db?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Running the Backend
Navigate to the `backend` folder and run the Spring Boot app:
```bash
cd backend
mvn spring-boot:run
```
*The server will run on port `8098` by default.*

### Running the Frontend
Navigate to the `frontend` folder, install the dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The Vite application will start (usually on `http://localhost:5173`).*

---

## 📝 Resume Summary Points

If you are adding AuraPlays to your resume, here are high-impact bullet points you can use:

* **Full-Stack Sports Platform:** Developed a full-stack booking and social matchmaking web application using **React (Vite)**, **Spring Boot**, **Spring Security**, and **MySQL**.
* **Real-time Map & GIS Integrations:** Integrated HTML5 Geolocation, OSM Nominatim API, and OpenStreetMap **Overpass API** to fetch and display local sports venues dynamically in real-time based on the user's location.
* **Concurrency & Race Condition Mitigation:** Implemented **Pessimistic Database Locking** (`SELECT FOR UPDATE`) on booking slot schedules, preventing double-bookings under concurrent checkout requests.
* **Payment Integration:** Integrated the **Razorpay API** for secure, authenticated checkout processes, including verification of cryptographic signatures, and built a custom mock payment simulator to decouple testing in local development environments.
* **Complex Business Workflows:** Designed and coded an automated booking confirmation engine that invalidates overlapping slots and auto-rejects conflicting pending reservations upon a slot's approval.
* **Social Matchmaking engine:** Created a social "Play Feed" matchmaking engine featuring divided cost splits, community game hosting, role-based controls, and a custom gamified **Karma Points** reward system.
