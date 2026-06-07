package com.auraplays.backend.service;

import com.auraplays.backend.dto.response.RealCourtDTO;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class OverpassService {

    private final String OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

    public List<RealCourtDTO> getNearbyCourts(double lat, double lon, int radiusInMeters) {
        RestTemplate restTemplate = new RestTemplate();

        // Query Overpass API for sports facilities near the given location
        String query = "[out:json];" +
                "(" +
                "  node[\"sport\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
                "  way[\"sport\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
                "  node[\"leisure\"=\"sports_centre\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
                "  way[\"leisure\"=\"sports_centre\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
                "  node[\"leisure\"=\"pitch\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
                "  way[\"leisure\"=\"pitch\"](around:" + radiusInMeters + "," + lat + "," + lon + ");" +
                ");" +
                "out center;";

        try {
            String url = OVERPASS_API_URL + "?data=" + query;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            return parseOverpassResponse(response.getBody());
        } catch (Exception e) {
            // Log error and return empty list on failure
            System.err.println("Overpass API Error: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<RealCourtDTO> parseOverpassResponse(String jsonString) {
        List<RealCourtDTO> realCourts = new ArrayList<>();
        if (jsonString == null || jsonString.isEmpty()) {
            return realCourts;
        }

        JSONObject root = new JSONObject(jsonString);
        if (!root.has("elements")) return realCourts;

        JSONArray elements = root.getJSONArray("elements");
        for (int i = 0; i < elements.length(); i++) {
            JSONObject el = elements.getJSONObject(i);
            
            double lat = el.has("lat") ? el.getDouble("lat") : (el.has("center") ? el.getJSONObject("center").getDouble("lat") : 0);
            double lon = el.has("lon") ? el.getDouble("lon") : (el.has("center") ? el.getJSONObject("center").getDouble("lon") : 0);
            
            if (!el.has("tags")) continue;
            JSONObject tags = el.getJSONObject("tags");
            
            String sport = tags.optString("sport");
            String leisure = tags.optString("leisure");
            
            if (sport.isEmpty() && leisure.isEmpty()) continue;
            
            if (sport.isEmpty() && !leisure.isEmpty()) {
                sport = leisure.replace("_", " ");
            }
            
            // Capitalize first letter
            sport = sport.substring(0, 1).toUpperCase() + sport.substring(1);
            
            String name = tags.optString("name", "Public " + sport + " Facility");

            RealCourtDTO court = RealCourtDTO.builder()
                    .id("overpass_" + el.getLong("id"))
                    .name(name)
                    .sport(sport)
                    .lat(lat)
                    .lon(lon)
                    .address("Coordinates: " + lat + ", " + lon)
                    .build();
            
            realCourts.add(court);
        }

        return realCourts;
    }
}
