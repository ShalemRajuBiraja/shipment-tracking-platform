package com.ship_track_backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ship_track_backend.dto.ShipmentLatitudeResponse;
import com.ship_track_backend.dto.ShipmentLocationResponseDto;
import com.ship_track_backend.entity.ShipmentEntity;
import com.ship_track_backend.entity.ShipmentLocationEntity;
import com.ship_track_backend.entity.UserEntity;
import com.ship_track_backend.enums.ShipmentStatus;
import com.ship_track_backend.repository.ShipmentLocationRepository;
import com.ship_track_backend.repository.ShipmentRepository;

@Service
public class ShipmentLocationService {

    @Autowired
    private ShipmentLocationRepository shipmentLocationRepository;
    @Autowired
    private ShipmentRepository shipmentRepository;
    @Autowired
    private GoogleRoutesService googleRoutesService;
    @Autowired
    private NewLocationService newLocationService;


 // ================= SAVE SHIPMENT LOCATION =================
    public ShipmentLocationResponseDto saveLocation(   String trackingNumber,   String newLocation) {

        // ================= GET LOGGED-IN USER =================
    	String email = SecurityContextHolder.getContext().getAuthentication().getName();


        // ================= FIND SHIPMENT =================
    	ShipmentEntity shipment = shipmentRepository .findByTrackingNumber(trackingNumber) .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Shipment not found"
                                )
                        );
    	    	
    	// ================= CHECK DELIVERY STATUS =================

    	if (shipment.getStatus() == ShipmentStatus.DELIVERED) {

    	    throw new ResponseStatusException(
    	            HttpStatus.BAD_REQUEST,
    	            "Cannot update shipment location after delivery"
    	    );
    	}
    	
        // ================= CHECK ASSIGNED OPERATOR =================
        UserEntity assignedOperator =  shipment.getAssignedOperator();

        if (assignedOperator == null) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Shipment is not assigned to any logistics operator"
            );
        }
        
        // ================= VERIFY OPERATOR =================
        if (!assignedOperator.getEmail().equalsIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to update this shipment location"
            );
        }

     // ================= CONVERT LOCATION TO COORDINATES =================

        Map<String, Double> coordinates =
                newLocationService.convertLocationToCoordinates(
                        newLocation
                );

        Double latitude =
                coordinates.get("latitude");

        Double longitude =
                coordinates.get("longitude");        

        // ================= CREATE LOCATION =================
        ShipmentLocationEntity location = new ShipmentLocationEntity();

        location.setShipment(shipment);

        location.setLatitude(latitude);

        location.setLongitude(longitude);

        location.setRecordedAt(LocalDateTime.now());


        // ================= SAVE LOCATION =================
        ShipmentLocationEntity savedLocation =  shipmentLocationRepository.save(location);


        // ================= RETURN CLEAN DTO =================
        return convertToDto(savedLocation);
    }


    
// ================= GET LOCATION Pickup to delivery  =================
public ShipmentLatitudeResponse getLocation(String trackingNumber) {
    	
		ShipmentEntity shipment = shipmentRepository
				.findByTrackingNumber(trackingNumber)
				.orElseThrow(() ->
						new ResponseStatusException(
								HttpStatus.NOT_FOUND,
								"Shipment not found"
						)
				);
		
		ShipmentLatitudeResponse shipmentLatitudeResponse= new ShipmentLatitudeResponse();
		shipmentLatitudeResponse.setPickupLatitude(shipment.getPickupLatitude());
		shipmentLatitudeResponse.setPickupLongitude(shipment.getPickupLongitude());
		shipmentLatitudeResponse.setDeliveryLatitude(shipment.getDeliveryLatitude());
		shipmentLatitudeResponse.setDeliveryLongitude(shipment.getDeliveryLongitude());
		
		return shipmentLatitudeResponse;		
	}
    

		public ShipmentLocationResponseDto getLatestLocation(   String trackingNumber) {
		
		    ShipmentLocationEntity location =  shipmentLocationRepository
		                    .findTopByShipmentTrackingNumberOrderByRecordedAtDesc(
		                            trackingNumber
		                    )
		                    .orElseThrow(() ->
		                            new ResponseStatusException(
		                                    HttpStatus.NOT_FOUND,
		                                    "No location found for shipment"
		                            )
		                    );
		
		    return convertToDto(location);
		}


    // ================= GET LOCATION HISTORY =================
    public List<ShipmentLocationResponseDto> getLocationHistory(
            String trackingNumber) {

        // CHECK SHIPMENT EXISTS

        shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Shipment not found"
                        )
                );


        List<ShipmentLocationEntity> locations =
                shipmentLocationRepository
                        .findByShipmentTrackingNumberOrderByRecordedAtAsc(
                                trackingNumber
                        );


        return locations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
 // ================= GET CURRENT LOCATION → DELIVERY ROUTE =================
    public Map<String, Object> getCurrentLocationToDeliveryRoute(
            String trackingNumber) {

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

        // ================= GET LATEST LIVE LOCATION =================
        ShipmentLocationEntity currentLocation =
                shipmentLocationRepository
                        .findTopByShipmentTrackingNumberOrderByRecordedAtDesc(
                                trackingNumber
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "No live location found for shipment"
                                )
                        );

        // ================= CHECK DELIVERY COORDINATES =================
        if (shipment.getDeliveryLatitude() == null
                || shipment.getDeliveryLongitude() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Delivery coordinates are not available"
            );
        }

        // ================= CURRENT LIVE LOCATION =================
        String origin =
                currentLocation.getLatitude()
                        + ","
                        + currentLocation.getLongitude();

        // ================= DELIVERY LOCATION =================
        String destination =
                shipment.getDeliveryLatitude()
                        + ","
                        + shipment.getDeliveryLongitude();

        // ================= CALCULATE CURRENT ROUTE =================
        return googleRoutesService.calculateRoute(
                origin,
                destination
        );
    }
    
    // ================= GET ROAD-FOLLOWING ROUTE HISTORY =================
    public Map<String, Object> getRoadFollowingRouteHistory(
            String trackingNumber) {

        shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Shipment not found"
                        )
                );

        List<ShipmentLocationEntity> locations =
                shipmentLocationRepository
                        .findByShipmentTrackingNumberOrderByRecordedAtAsc(
                                trackingNumber
                        );

        if (locations.size() < 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least two location points are required for route history"
            );
        }

        List<Map<String, Double>> routeLocations =
                locations.stream()
                        .map(location -> {

                            Map<String, Double> point =
                                    new HashMap<>();

                            point.put(
                                    "latitude",
                                    location.getLatitude()
                            );

                            point.put(
                                    "longitude",
                                    location.getLongitude()
                            );

                            return point;
                        })
                        .toList();

        return googleRoutesService
                .calculateRouteThroughLocations(
                        routeLocations
                );
    }

    // ================= ENTITY → DTO =================

    private ShipmentLocationResponseDto convertToDto(
            ShipmentLocationEntity location) {

        ShipmentLocationResponseDto dto =
                new ShipmentLocationResponseDto();

        dto.setId(location.getId());

        dto.setTrackingNumber(
                location.getShipment().getTrackingNumber()
        );

        dto.setLatitude(
                location.getLatitude()
        );

        dto.setLongitude(
                location.getLongitude()
        );

        dto.setRecordedAt(
                location.getRecordedAt()
        );

        return dto;
    }
    
}