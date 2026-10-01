package com.ship_track_backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleRoutesService {

    @Value("${google.maps.api-key}")
    private String googleApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String ROUTES_API_URL =
            "https://routes.googleapis.com/directions/v2:computeRoutes";


    // =========================================================
    // CALCULATE ROUTE
    // =========================================================

    public Map<String, Object> calculateRoute(
            String origin,
            String destination) {

        // ================= REQUEST HEADERS =================

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.set(
                "X-Goog-Api-Key",
                googleApiKey
        );

        headers.set(
                "X-Goog-FieldMask",
                "routes.duration,"
                        + "routes.distanceMeters,"
                        + "routes.polyline.encodedPolyline"
        );


        // ================= CONVERT ORIGIN =================

        String[] originParts = origin.split(",");

        double originLatitude =
                Double.parseDouble(originParts[0].trim());

        double originLongitude =
                Double.parseDouble(originParts[1].trim());


        // ================= CONVERT DESTINATION =================

        String[] destinationParts = destination.split(",");

        double destinationLatitude =
                Double.parseDouble(destinationParts[0].trim());

        double destinationLongitude =
                Double.parseDouble(destinationParts[1].trim());


        // ================= ORIGIN LAT/LNG =================

        Map<String, Object> originLatLng =
                Map.of(
                        "latitude",
                        originLatitude,

                        "longitude",
                        originLongitude
                );


        // ================= DESTINATION LAT/LNG =================

        Map<String, Object> destinationLatLng =
                Map.of(
                        "latitude",
                        destinationLatitude,

                        "longitude",
                        destinationLongitude
                );


        // ================= ORIGIN WAYPOINT =================

        Map<String, Object> originWaypoint =
                Map.of(
                        "location",
                        Map.of(
                                "latLng",
                                originLatLng
                        )
                );


        // ================= DESTINATION WAYPOINT =================

        Map<String, Object> destinationWaypoint =
                Map.of(
                        "location",
                        Map.of(
                                "latLng",
                                destinationLatLng
                        )
                );


        // ================= REQUEST BODY =================

        Map<String, Object> requestBody =
                new HashMap<>();

        requestBody.put(
                "origin",
                originWaypoint
        );

        requestBody.put(
                "destination",
                destinationWaypoint
        );

        requestBody.put(
                "travelMode",
                "DRIVE"
        );


        // ================= HTTP REQUEST =================

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        requestBody,
                        headers
                );


        // ================= CALL GOOGLE ROUTES API =================

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        ROUTES_API_URL,
                        HttpMethod.POST,
                        request,
                        Map.class
                );


        // ================= RETURN RESPONSE =================

        return response.getBody();
    }


    // =========================================================
    // CALCULATE ETA FROM CURRENT LOCATION
    // =========================================================

    public Map<String, Object> calculateEta(
            Double latitude,
            Double longitude,
            String destination) {

        // ================= REQUEST HEADERS =================

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.set(
                "X-Goog-Api-Key",
                googleApiKey
        );

        headers.set(
                "X-Goog-FieldMask",
                "routes.duration,"
                        + "routes.distanceMeters"
        );


        // ================= CURRENT LOCATION =================

        Map<String, Object> originLocation =
                Map.of(
                        "location",
                        Map.of(
                                "latLng",
                                Map.of(
                                        "latitude",
                                        latitude,

                                        "longitude",
                                        longitude
                                )
                        )
                );


        // ================= REQUEST BODY =================

        Map<String, Object> requestBody =
                new HashMap<>();

        requestBody.put(
                "origin",
                originLocation
        );


        // ================= DESTINATION =================
     // ================= DESTINATION =================

        Map<String, Object> destinationWaypoint;

        if (destination != null
                && destination.matches(
                        "^-?\\d+(\\.\\d+)?\\s*,\\s*-?\\d+(\\.\\d+)?$")) {

            // Destination is latitude,longitude
            String[] destinationParts = destination.split(",");

            double destinationLatitude =
                    Double.parseDouble(destinationParts[0].trim());

            double destinationLongitude =
                    Double.parseDouble(destinationParts[1].trim());

            destinationWaypoint =
                    Map.of(
                            "location",
                            Map.of(
                                    "latLng",
                                    Map.of(
                                            "latitude",
                                            destinationLatitude,
                                            "longitude",
                                            destinationLongitude
                                    )
                            )
                    );

        } else {

            // Destination is an address
            destinationWaypoint =
                    Map.of(
                            "address",
                            destination
                    );
        }

        requestBody.put(
                "destination",
                destinationWaypoint
        );
 

        // ================= TRAVEL MODE =================

        requestBody.put(
                "travelMode",
                "DRIVE"
        );


        // ================= HTTP REQUEST =================

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        requestBody,
                        headers
                );


        // ================= CALL GOOGLE ROUTES API =================

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        ROUTES_API_URL,
                        HttpMethod.POST,
                        request,
                        Map.class
                );


        // ================= EXTRACT GOOGLE RESPONSE =================

        Map<String, Object> responseBody =
                response.getBody();

        if (responseBody == null) {

            throw new IllegalStateException(
                    "Empty response received from Google Routes API"
            );
        }


        // ================= EXTRACT ROUTES =================

        List<Map<String, Object>> routes =
                (List<Map<String, Object>>)
                        responseBody.get("routes");

        if (routes == null || routes.isEmpty()) {

            throw new IllegalStateException(
                    "No route found for ETA calculation"
            );
        }


        // ================= GET FIRST ROUTE =================

        Map<String, Object> route =
                routes.get(0);


        // ================= GET DISTANCE =================

        Long distanceMeters =
                ((Number)
                        route.get("distanceMeters"))
                        .longValue();


        // ================= GET DURATION =================

        String duration =
                (String) route.get("duration");


        // ================= CONVERT DISTANCE =================

        double distanceKm =
                distanceMeters / 1000.0;


        // ================= CONVERT DURATION =================

        long durationSeconds =
                Long.parseLong(
                        duration.replace("s", "")
                );


        long hours =
                durationSeconds / 3600;

        long minutes =
                (durationSeconds % 3600) / 60;


        // ================= CALCULATE ESTIMATED ARRIVAL =================

        LocalDateTime estimatedArrival =
                LocalDateTime.now()
                        .plusSeconds(durationSeconds);

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy HH:mm"
                );

        String estimatedArrivalTime =
                estimatedArrival.format(formatter);


        // ================= CREATE ETA RESPONSE =================

        Map<String, Object> etaResponse =
                new HashMap<>();

        etaResponse.put(
                "distanceKm",
                Math.round(
                        distanceKm * 100.0
                ) / 100.0
        );

        etaResponse.put(
                "travelTime",
                hours
                        + " hours "
                        + minutes
                        + " minutes"
        );

        etaResponse.put(
                "durationSeconds",
                durationSeconds
        );

        etaResponse.put(
                "estimatedArrival",
                estimatedArrivalTime
        );


        // ================= RETURN ETA RESPONSE =================

        return etaResponse;
    }


    // =========================================================
    // CALCULATE ROUTE THROUGH MULTIPLE LOCATIONS
    // =========================================================

    public Map<String, Object> calculateRouteThroughLocations(
            List<Map<String, Double>> locations) {

        if (locations == null || locations.size() < 2) {

            throw new IllegalArgumentException(
                    "At least two locations are required"
            );
        }


        // ================= REQUEST HEADERS =================

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.set(
                "X-Goog-Api-Key",
                googleApiKey
        );

        headers.set(
                "X-Goog-FieldMask",
                "routes.duration,"
                        + "routes.distanceMeters,"
                        + "routes.polyline.encodedPolyline"
        );


        // ================= FIRST LOCATION =================

        Map<String, Object> firstLocation =
                Map.of(
                        "latitude",
                        locations.get(0).get("latitude"),

                        "longitude",
                        locations.get(0).get("longitude")
                );


        // ================= LAST LOCATION =================

        Map<String, Object> lastLocation =
                Map.of(
                        "latitude",
                        locations.get(
                                locations.size() - 1
                        ).get("latitude"),

                        "longitude",
                        locations.get(
                                locations.size() - 1
                        ).get("longitude")
                );


        // ================= ORIGIN =================

        Map<String, Object> origin =
                Map.of(
                        "location",
                        Map.of(
                                "latLng",
                                firstLocation
                        )
                );


        // ================= DESTINATION =================

        Map<String, Object> destination =
                Map.of(
                        "location",
                        Map.of(
                                "latLng",
                                lastLocation
                        )
                );


        // ================= INTERMEDIATE LOCATIONS =================

        List<Map<String, Object>> intermediates =
                locations.subList(
                        1,
                        locations.size() - 1
                )
                .stream()
                .map(location -> {

                    Map<String, Object> latLng =
                            Map.of(
                                    "latitude",
                                    location.get("latitude"),

                                    "longitude",
                                    location.get("longitude")
                            );

                    return Map.of(
                            "via",
                            true,

                            "location",
                            Map.of(
                                    "latLng",
                                    latLng
                            )
                    );
                })
                .toList();


        // ================= REQUEST BODY =================

        Map<String, Object> requestBody =
                new HashMap<>();

        requestBody.put(
                "origin",
                origin
        );

        requestBody.put(
                "destination",
                destination
        );

        requestBody.put(
                "intermediates",
                intermediates
        );

        requestBody.put(
                "travelMode",
                "DRIVE"
        );

        requestBody.put(
                "polylineQuality",
                "HIGH_QUALITY"
        );


        // ================= HTTP REQUEST =================

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        requestBody,
                        headers
                );


        // ================= CALL GOOGLE ROUTES API =================

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        ROUTES_API_URL,
                        HttpMethod.POST,
                        request,
                        Map.class
                );


        // ================= RETURN RESPONSE =================

        return response.getBody();
    }
}