
package com.ship_track_backend.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ship_track_backend.dto.DeliveryForecastResponseDto;
import com.ship_track_backend.entity.ShipmentEntity;
import com.ship_track_backend.entity.ShipmentLocationEntity;
import com.ship_track_backend.repository.ShipmentLocationRepository;
import com.ship_track_backend.repository.ShipmentRepository;

@Service
public class DeliveryForecastingService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentLocationRepository shipmentLocationRepository;

    @Autowired
    private GoogleRoutesService googleRoutesService;

    // ================= DELIVERY FORECAST =================

    public DeliveryForecastResponseDto forecastDelivery(
            String trackingNumber) {

        System.out.println("========================================");
        System.out.println("Delivery forecast started");
        System.out.println("Tracking Number: " + trackingNumber);
        System.out.println("========================================");

        // ================= FIND SHIPMENT =================

        ShipmentEntity shipment =
                shipmentRepository
                        .findByTrackingNumber(trackingNumber)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Shipment not found"
                                )
                        );

        System.out.println("Shipment found successfully");

        DeliveryForecastResponseDto response =
                new DeliveryForecastResponseDto();

        response.setTrackingNumber(trackingNumber);

        // ================= CHECK SHIPMENT STATUS =================

        if (shipment.getStatus() == null) {

            System.out.println("Shipment status is NULL");

            response.setForecast("NOT_STARTED");

            response.setMessage(
                    "Shipment status is not available."
            );

            return response;
        }

        response.setCurrentStatus(
                shipment.getStatus().name()
        );

        System.out.println(
                "Shipment Status: " +
                shipment.getStatus().name()
        );

        // ================= CHECK DELIVERED STATUS =================

        if (shipment.getStatus().name().equals("DELIVERED")) {

            response.setForecast("DELIVERED");

            response.setMessage(
                    "Shipment has already been delivered."
            );

            System.out.println(
                    "Shipment is already DELIVERED."
            );

            System.out.println(
                    "Skipping ETA calculation."
            );

            return response;
        }

        // ================= GET CURRENT LOCATION =================

        ShipmentLocationEntity currentLocation =
                shipmentLocationRepository
                        .findTopByShipmentTrackingNumberOrderByRecordedAtDesc(
                                trackingNumber
                        )
                        .orElse(null);

        if (currentLocation == null) {

            System.out.println(
                    "Current shipment location NOT FOUND"
            );

            response.setForecast("NOT_STARTED");

            response.setMessage(
                    "Current shipment location is not available yet."
            );

            return response;
        }

        System.out.println("Current location found");

        System.out.println(
                "Current Latitude: " +
                currentLocation.getLatitude()
        );

        System.out.println(
                "Current Longitude: " +
                currentLocation.getLongitude()
        );

        // ================= DELIVERY ADDRESS =================

        String destination =
                shipment.getDeliveryAddress()
                + ", "
                + shipment.getDeliveryCity()
                + ", "
                + shipment.getDeliveryState()
                + ", "
                + shipment.getDeliveryPincode();

        System.out.println("========================================");
        System.out.println("DELIVERY FORECAST ETA DEBUG");

        System.out.println(
                "Tracking Number: " + trackingNumber
        );

        System.out.println(
                "Current Latitude: " +
                currentLocation.getLatitude()
        );

        System.out.println(
                "Current Longitude: " +
                currentLocation.getLongitude()
        );

        System.out.println(
                "Destination: " +
                destination
        );

        System.out.println("========================================");

        // ================= CALCULATE ETA =================

        Map<String, Object> etaResponse;

        try {

            etaResponse =
                    googleRoutesService.calculateEta(
                            currentLocation.getLatitude(),
                            currentLocation.getLongitude(),
                            destination
                    );

        } catch (Exception e) {

            System.out.println(
                    "ERROR INSIDE calculateEta()"
            );

            System.out.println(
                    "Exception Type: " +
                    e.getClass().getName()
            );

            System.out.println(
                    "Exception Message: " +
                    e.getMessage()
            );

            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to calculate delivery forecast",
                    e
            );
        }

        // ================= CHECK ETA RESPONSE =================

        System.out.println("========================================");
        System.out.println("ETA RESPONSE");
        System.out.println("ETA Response: " + etaResponse);
        System.out.println("========================================");

        if (etaResponse == null) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to calculate delivery forecast"
            );
        }

        // ================= GET DURATION =================

        Object durationObject =
                etaResponse.get("durationSeconds");

        if (durationObject == null) {

            System.out.println(
                    "ERROR: durationSeconds is missing"
            );

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Travel duration is not available"
            );
        }

        long durationSeconds;

        try {

            durationSeconds =
                    ((Number) durationObject).longValue();

        } catch (Exception e) {

            System.out.println(
                    "ERROR: Invalid durationSeconds: " +
                    durationObject
            );

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Invalid travel duration"
            );
        }

        // ================= TRAVEL TIME =================

        long travelTimeMinutes =
                durationSeconds / 60;

        // ================= DISTANCE =================

        Object distanceObject =
                etaResponse.get("distanceKm");

        double distanceKm = 0.0;

        if (distanceObject instanceof Number) {

            distanceKm =
                    ((Number) distanceObject).doubleValue();
        }

        long distanceMeters =
                Math.round(distanceKm * 1000);

        // ================= FORECASTED DELIVERY TIME =================

        LocalDateTime forecastedDelivery =
                LocalDateTime.now()
                        .plusSeconds(durationSeconds);

        // ================= SET RESPONSE =================

        response.setForecastedDeliveryTime(
                forecastedDelivery
                        .atZone(
                                ZoneId.systemDefault()
                        )
                        .toInstant()
                        .toEpochMilli()
        );

        response.setEstimatedTravelTimeMinutes(
                travelTimeMinutes
        );

        response.setEstimatedDistanceMeters(
                distanceMeters
        );

        // ================= FORECAST RESULT IN DAYS =================

        response.setForecast("EXPECTED");

        long estimatedDays =
                (long) Math.ceil(durationSeconds / 86400.0);

        String forecastMessage;

        if (durationSeconds <= 0) {

            forecastMessage =
                    "Shipment is expected to be delivered today.";

        } else if (estimatedDays == 1) {

            forecastMessage =
                    "Shipment is expected to be delivered in 1 day.";

        } else {

            forecastMessage =
                    "Shipment is expected to be delivered in "
                    + estimatedDays
                    + " days.";
        }

        response.setMessage(forecastMessage);

        System.out.println(
                "Delivery Forecast Message: " +
                forecastMessage
        );

        // ================= FINAL DEBUG =================

        System.out.println("========================================");
        System.out.println("DELIVERY FORECAST SUCCESS");

        System.out.println(
                "Tracking Number: " + trackingNumber
        );

        System.out.println(
                "Travel Time Minutes: " +
                travelTimeMinutes
        );

        System.out.println(
                "Distance KM: " +
                distanceKm
        );

        System.out.println(
                "Distance Meters: " +
                distanceMeters
        );

        System.out.println(
                "Estimated Delivery Days: " +
                estimatedDays
        );

        System.out.println(
                "Forecast: " +
                response.getForecast()
        );

        System.out.println("========================================");

        return response;
    }
}

