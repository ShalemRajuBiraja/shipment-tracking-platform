package com.ship_track_backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ship_track_backend.enums.ShipmentStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "shipments")
@Getter
@Setter
public class ShipmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "tracking_number", nullable = false, unique = true)
    private String trackingNumber;
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private UserEntity sender;
    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private UserEntity receiver;
    @Column(name = "receiver_name", nullable = false)
    private String receiverName;
    @Column(name = "receiver_phone", nullable = false)
    private String receiverPhone;


    // ================= PICKUP LOCATION =================

    @Column(name = "pickup_address", nullable = false, columnDefinition = "TEXT")
    private String pickupAddress;
    @Column(name = "pickup_city", nullable = false)
    private String pickupCity;
    @Column(name = "pickup_state", nullable = false)
    private String pickupState;
    @Column(name = "pickup_pincode", nullable = false)
    private String pickupPincode;
 // Pickup coordinates
    @Column(name = "pickup_latitude")
    private Double pickupLatitude;
    @Column(name = "pickup_longitude")
    private Double pickupLongitude;

    // ================= DELIVERY LOCATION =================

    @Column(name = "delivery_address", nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;
    @Column(name = "delivery_city", nullable = false)
    private String deliveryCity;
    @Column(name = "delivery_state", nullable = false)
    private String deliveryState;
    @Column(name = "delivery_pincode", nullable = false)
    private String deliveryPincode;
 // Delivery coordinates
    @Column(name = "delivery_latitude")
    private Double deliveryLatitude;
    @Column(name = "delivery_longitude")
    private Double deliveryLongitude;


    // ================= PACKAGE DETAILS =================

    @Column(name = "package_description", columnDefinition = "TEXT")
    private String packageDescription;
    @Column
    private BigDecimal weight;
    // ================= SHIPMENT STATUS =================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;
    // ================= ASSIGNED OPERATOR =================
    @ManyToOne
    @JoinColumn(name = "assigned_operator_id")
    private UserEntity assignedOperator;
    // ================= TIMESTAMPS =================
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}