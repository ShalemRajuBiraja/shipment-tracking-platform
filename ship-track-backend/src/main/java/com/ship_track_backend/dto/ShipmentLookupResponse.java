package com.ship_track_backend.dto;

import java.time.LocalDateTime;

import com.ship_track_backend.enums.ShipmentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShipmentLookupResponse {

    private String trackingNumber;

    private String customer;

    private String receiver;

    private String receiverPhone;

    private ShipmentStatus status;

    private String packageDescription;

    private String weight;

    // ================= PICKUP =================

    private String pickupAddress;

    private String pickupCity;

    private String pickupState;

    private String pickupPincode;

    // ================= DELIVERY =================

    private String deliveryAddress;

    private String deliveryCity;

    private String deliveryState;

    private String deliveryPincode;

    // ================= CURRENT LOCATION =================

    private String currentLocation;

    // ================= OPERATOR =================

    private String assignedOperator;

    // ================= DATE =================

    private LocalDateTime createdAt;
}