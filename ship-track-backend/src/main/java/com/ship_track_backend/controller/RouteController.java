package com.ship_track_backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ship_track_backend.dto.DelayPredictionResponseDto;
import com.ship_track_backend.dto.DeliveryForecastResponseDto;
import com.ship_track_backend.payload.ApiResponse;
import com.ship_track_backend.service.DelayPredictionService;
import com.ship_track_backend.service.DeliveryForecastingService;
import com.ship_track_backend.service.GoogleRoutesService;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private GoogleRoutesService googleRoutesService;
    @Autowired
    private DelayPredictionService DelayPredictionService;
    @Autowired
    private DeliveryForecastingService deliveryForecastingService;


    // ================= CALCULATE SHIPMENT FULL ROUTE (Get:ShipmentRoute) =================
    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateRoute(

            @RequestParam String origin,
            @RequestParam String destination) {

        Map<String, Object> routeResponse =   googleRoutesService.calculateRoute(
                        origin,
                        destination
                );
        
        ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(true, "Route calculated successfully", routeResponse);

        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }
    
    
 // ================= CALCULATE SHIPMENT ETA =================
    @GetMapping("/eta")
    public ResponseEntity<Map<String, Object>> calculateEta(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam String destination) {

        Map<String, Object> etaResponse =
                googleRoutesService.calculateEta(
                        latitude,
                        longitude,
                        destination
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(etaResponse);
    }
    
    
 // ================= PREDICT SHIPMENT DELAY =================
    @GetMapping("/delay-prediction/{trackingNumber}")
    public ResponseEntity<ApiResponse<DelayPredictionResponseDto>> predictDelay( @PathVariable String trackingNumber) {

        DelayPredictionResponseDto response = DelayPredictionService.predictDelay( trackingNumber );
        
        ApiResponse<DelayPredictionResponseDto> apiResponse = new ApiResponse<>(true, "Delay prediction fetched successfully", response);

        return ResponseEntity .status(HttpStatus.OK).body(apiResponse);
    }
    
 // ================= DELIVERY FORECAST =================

    @GetMapping("/delivery-forecast/{trackingNumber}")
    public ResponseEntity<DeliveryForecastResponseDto> forecastDelivery(  @PathVariable String trackingNumber) {

        DeliveryForecastResponseDto response = deliveryForecastingService.forecastDelivery( trackingNumber );

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    
}