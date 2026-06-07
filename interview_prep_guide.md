# AuraPlays Technical Interview Prep Guide

This guide contains the most critical technical questions, answers, and explanations you might face during interviews when presenting **AuraPlays** on your resume. It links directly to code patterns in your project to give you concrete, high-impact talking points.

---

## 🔒 1. Spring Security, JWT, and Authentication

### **Q1: Why did you choose stateless JWT authentication over stateful sessions for AuraPlays?**
**Answer:**
Stateless JWT (JSON Web Token) authentication is ideal for modern, scalable web applications because:
* **Statelessness:** The server doesn't need to maintain session records in memory or a database. This eliminates memory overhead and simplifies server horizontal scaling (running multiple backend instances behind a load balancer without needing session replication).
* **Decoupling:** The client stores the token (e.g., in `localStorage`) and sends it via HTTP headers, making it easy to support cross-domain API access (like linking React and Spring Boot across different origins).
* **Decentralized Validation:** The server validates the token cryptographically using a signature, resolving the user's details without hitting the session store database.

### **Q2: Walk me through the request lifecycle of a secured API call in your backend. How does Spring Boot validate a user's token?**
**Answer:**
Every HTTP request destined for a secured resource (e.g., `/api/bookings`) goes through the following lifecycle:
1. **Interceptor/Filter Trigger:** The request is intercepted by the `JwtAuthenticationFilter` (extending `OncePerRequestFilter`), which runs before Spring Security's default authorization checks.
2. **Token Extraction:** The filter extracts the `Authorization` header and strips the `Bearer ` prefix:
   ```java
   private String getTokenFromRequest(HttpServletRequest request) {
       String bearerToken = request.getHeader("Authorization");
       if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
           return bearerToken.substring(7);
       }
       return null;
   }
   ```
3. **Cryptographic Validation:** The filter invokes `JwtTokenProvider.validateToken()` to check that the signature is intact, using the JWT secret key, and that the token hasn't expired.
4. **Context Injection:** If valid, the username (email) is extracted from the token claims, user authorities are fetched via `CustomUserDetailsService`, and a `UsernamePasswordAuthenticationToken` is created and stored in the security context:
   ```java
   SecurityContextHolder.getContext().setAuthentication(authToken);
   ```
5. **Security Filter Chain Verification:** The request proceeds through the filter chain. Spring Security checks the endpoint policies configured in `SecurityConfig.java`. If the context has valid authorities matching the endpoint constraints (or method-level annotations like `@PreAuthorize("hasRole('CUSTOMER')")`), the controller method is executed. Otherwise, a `401 Unauthorized` is returned.

---

## ⚡ 2. Concurrency, Database Locking, and Conflict Resolution

### **Q3: How did you prevent double-bookings (race conditions) when multiple users try to reserve the same time slot at the exact same millisecond?**
**Answer:**
To guarantee transactional integrity and prevent double-booking under high concurrent requests, I implemented **Pessimistic Database Locking** (`PESSIMISTIC_WRITE`).
* **The Problem:** A typical check-and-write cycle (i.e., select slot -> if available -> create booking) is vulnerable to race conditions. Two concurrent threads can read the same slot as "available" before either changes its status, resulting in a double reservation.
* **The Solution:** In `CourtSlotRepository.java`, I annotated the lookup query with `@Lock(LockModeType.PESSIMISTIC_WRITE)`:
  ```java
  @Repository
  public interface CourtSlotRepository extends JpaRepository<CourtSlot, Long> {
      @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
      @Query("SELECT s FROM CourtSlot s WHERE s.id = :id")
      java.util.Optional<CourtSlot> findByIdForUpdate(@Param("id") Long id);
  }
  ```
* **How it works:** When a booking request comes in, `BookingServiceImpl.createBookingRequest()` executes `findByIdForUpdate()`. This compiles into a MySQL `SELECT ... FOR UPDATE` statement. The database places a transaction-scoped write lock on that specific row. Any other thread attempting to read or write that slot is blocked until the active transaction commits or rolls back, forcing serial execution for concurrent slot buyers.

### **Q4: How does the system handle booking conflicts when an owner approves a booking? Explain your conflict-resolution logic.**
**Answer:**
When a venue owner approves a pending booking request, all other overlapping bookings for that slot (or any slots intersecting that time block) must be automatically resolved to prevent schedule conflicts.
1. The system updates the approved booking status to `APPROVED`.
2. It fetches all overlapping available slots for that court on that date:
   ```java
   @Query("SELECT s FROM CourtSlot s WHERE s.court = :court AND s.slotDate = :date AND s.isAvailable = true AND s.startTime < :endTime AND s.endTime > :startTime")
   List<CourtSlot> findOverlappingAvailableSlots(...);
   ```
3. The server iterates through these overlapping slots, marks them as unavailable (`isAvailable = false`), and saves them.
4. For each deactivated slot, it finds all outstanding pending bookings and auto-rejects them:
   ```java
   private void markOverlappingSlotsAsUnavailable(CourtSlot bookedSlot, Long currentBookingId) {
       List<CourtSlot> overlappingSlots = courtSlotRepository.findOverlappingAvailableSlots(...);
       for (CourtSlot slot : overlappingSlots) {
           slot.setAvailable(false);
           courtSlotRepository.save(slot);

           // Auto-reject other pending bookings for this now-unavailable slot
           List<Booking> pendingBookings = bookingRepository.findBySlotIdAndStatus(slot.getId(), BookingStatus.PENDING);
           for (Booking b : pendingBookings) {
               if (!b.getId().equals(currentBookingId)) {
                   b.setStatus(BookingStatus.REJECTED);
                   bookingRepository.save(b);
               }
           }
       }
   }
   ```
This prevents duplicate active bookings and handles notification state cleanups automatically.

---

## 🗺️ 3. Geolocation and Third-Party GIS Integrations (OpenStreetMap)

### **Q5: How did you implement the "Nearby Discoveries" geolocation search on the homepage?**
**Answer:**
The Discovery feature combines browser-based location services, third-party reverse geocoding, and spatial database queries:
1. **Client-Side Geolocation:** The frontend homepage checks for `navigator.geolocation`. If approved, it retrieves the user's lat/long. If blocked or timed out, it falls back to IP-based location discovery via CORS-compliant geolocation APIs (`freeipapi.com` or `ipapi.co`).
2. **Reverse Geocoding:** The coordinates are sent to OpenStreetMap's **Nominatim API** on the frontend to display the user's friendly city/district name (e.g., "Bangalore") in the search bar.
3. **Database Proximity Search:** The app makes a request to `/api/courts/nearby?lat=...&lng=...&radius=...`. The backend uses SQL queries to calculate Euclidean/Haversine distance (using coordinates stored in MySQL) to return partner courts registered inside a 50km radius.
4. **External OSM Query:** In parallel, the backend queries public amenities using the Overpass API for real-time local results.

### **Q6: How does your backend query and parse public sport court facilities from the OpenStreetMap Overpass API?**
**Answer:**
To support searching public facilities without manually seeding them, I integrated the **Overpass API** (OpenStreetMap's read-only query API).
* **The Query:** In `OverpassService.java`, the coordinates are formatted into an Overpass Query Language (QL) script to request node and way elements tagged with `sport` or `leisure` (such as `pitch` or `sports_centre`) within a specified radius:
  ```java
  String query = "[out:json];" +
          "(" +
          "  node[\"sport\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
          "  way[\"sport\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
          "  node[\"leisure\"=\"sports_centre\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
          // ...
          ");" +
          "out center;";
  ```
* **The Integration:** Using Spring's `RestTemplate`, a GET request is sent to `https://overpass-api.de/api/interpreter?data=` with the query string.
* **Parsing & Normalization:** The JSON response is parsed into `RealCourtDTO` objects. We dynamically normalize names and sports (e.g., capitalizing words, substituting underscores like `sports_centre` with user-friendly names) and construct Google Maps direction links using latitude/longitude data.

---

## 💳 4. Payment Gateway Integration (Razorpay)

### **Q7: Walk me through your payment implementation flow. How do you verify that a payment is legitimate and protect against tampering?**
**Answer:**
The payment workflow leverages Razorpay's checkout flow coupled with server-side signature validation:
1. **Order Creation:** When an approved booking is selected, the customer initiates checkout. The backend receives the request, loads the booking, verifies ownership, and calls the Razorpay SDK to create an official order with the amount (in paise):
   ```java
   RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
   JSONObject orderRequest = new JSONObject();
   orderRequest.put("amount", booking.getTotalAmount().multiply(new BigDecimal("100")).intValue());
   orderRequest.put("currency", "INR");
   Order order = razorpay.orders.create(orderRequest);
   ```
   The backend saves this `gatewayOrderId` in the database with status `PENDING` and returns it to the client.
2. **Client Checkout:** The React frontend opens the Razorpay overlay with the Order ID.
3. **Cryptographic Verification:** Upon successful payment, Razorpay returns a `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` (an HMAC-SHA256 signature generated by hashing the Order ID and Payment ID using the Razorpay Secret Key).
4. The client submits these parameters to the backend's `/api/payments/verify` endpoint.
5. The backend validates the signature using the Razorpay SDK utility:
   ```java
   boolean status = Utils.verifyPaymentSignature(options, razorpayKeySecret);
   ```
   * **Why this is critical:** An attacker could try to intercept the client request and report a fake success. Since the secret key is stored strictly server-side, signature verification prevents malicious payment bypasses. If valid, the payment status changes to `SUCCESS`, the booking changes to `CONFIRMED`, and the slot is locked.

### **Q8: How did you implement a development payment flow without hardcoding real API keys or getting blocked?**
**Answer:**
To enable seamless local development and automated testing, I created a **Mock Payment Simulator** mode.
* In [PaymentServiceImpl.java](file:///e:/Mine/AuraPlays/backend/src/main/java/com/auraplays/backend/service/impl/PaymentServiceImpl.java#L35-L64), the application injects the Razorpay keys from environment properties, defaulting to `"mock"` if they aren't configured.
* If `razorpayKeyId` equals `"mock"`, the order generation step bypasses Razorpay APIs and returns a generated mock order string: `order_mock_...`.
* When the React frontend [SlotPicker.jsx](file:///e:/Mine/AuraPlays/frontend/src/components/SlotPicker.jsx#L91-L107) receives the mock order details, it skips launching the heavy Razorpay script overlay, displays a friendly alert dialog stating *"Test Mode: Simulating successful payment"*, and calls the backend `/verify` endpoint with a simulated payment payload.
* The backend `/verify` endpoint recognizes the mock key, skips signature verification, updates the payment record to success, and confirms the booking. This allows developers and reviewers to test the entire application end-to-end immediately upon cloning the repository.

---

## 💻 5. Frontend & Axios Configuration

### **Q9: How does your React frontend attach JWT tokens to API requests, and how does it handle routing security?**
**Answer:**
* **Axios Interceptors:** To avoid manual header attachment on every API call, I configured an Axios interceptor in [api.js](file:///e:/Mine/AuraPlays/frontend/src/services/api.js):
  ```javascript
  const api = axios.create({
    baseURL: 'http://localhost:8098/api',
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  ```
  This automatically intercepts all outgoing requests and appends the Bearer token in the headers if it exists in local storage.
* **ProtectedRoute Component:** Security on the frontend is controlled using a custom router wrapper `ProtectedRoute.jsx` inside the React Router setup. It extracts the authenticated user from the `AuthContext`, checks their role against the route's `allowedRoles` array, and dynamically redirects unauthenticated users or unauthorized roles to the login or home page.

---

## 🤝 6. Social Features ("Playo Mode")

### **Q10: Explain the "Play Feed" matchmaking engine. How does it leverage slot bookings?**
**Answer:**
The matchmaking flow binds social interaction directly into the venue booking lifecycle:
1. When a user books a slot, they check a checkbox labeled **Host a Game (Playo Mode)**.
2. If the venue has auto-approval, the payment is processed, and the backend calls `GameService.hostGame()`:
   ```java
   Game game = Game.builder()
           .title(request.getTitle())
           .host(host)
           .slot(slot)
           .sportType(request.getSportType())
           .maxPlayers(request.getMaxPlayers())
           .pricePerPlayer(request.getPricePerPlayer())
           .build();
   ```
3. The host is added as the first participant inside `game_players`.
4. Other players browse the public Play Feed page. When they click **Join**, the backend adds them to the game roster, increments `currentPlayers`, and awards **Karma Points** to reward active users (e.g., +50 points to the host, +20 points to the participant).
5. If the court has manual approval enabled, the game remains dormant and is only published to the feed once the court owner approves the booking request.
