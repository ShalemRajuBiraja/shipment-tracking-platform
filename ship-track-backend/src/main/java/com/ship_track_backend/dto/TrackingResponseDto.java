package com.ship_track_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.ship_track_backend.enums.ShipmentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrackingResponseDto {

    // Tracking Information
    private String trackingNumber;
    private ShipmentStatus currentStatus;
    private LocalDateTime createdAt;

    // Sender Information
    private String senderName;

    // Receiver Information
    private String receiverName;
    private String receiverPhone;

    // Package Information
    private String packageDescription;
    private BigDecimal weight;

    // Address Information
    private String pickupAddress;
    private String pickupCity;
    private String pickupState;
    private String pickupPincode;

    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;
    private String deliveryPincode;

    // Tracking Timeline
    private List<TrackingHistoryDto> trackingHistory;
}