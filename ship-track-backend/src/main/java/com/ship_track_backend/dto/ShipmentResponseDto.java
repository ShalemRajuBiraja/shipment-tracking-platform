package com.ship_track_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ship_track_backend.enums.ShipmentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShipmentResponseDto {

    private Long id;

    private String trackingNumber;


    // ================= SENDER INFORMATION =================

    private String senderName;


    // ================= RECEIVER INFORMATION =================

    private String receiverName;

    private String receiverPhone;


    // ================= PICKUP LOCATION =================

    private String pickupAddress;

    private String pickupCity;

    private String pickupState;

    private String pickupPincode;


    // ================= DELIVERY LOCATION =================

    private String deliveryAddress;

    private String deliveryCity;

    private String deliveryState;

    private String deliveryPincode;


    // ================= PACKAGE INFORMATION =================

    private String packageDescription;

    private BigDecimal weight;


    // ================= SHIPMENT STATUS =================

    private ShipmentStatus status;


    // ================= ASSIGNED OPERATOR =================

    private String assignedOperatorName;


    // ================= DATES =================

    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;

    private LocalDateTime updatedAt;
}