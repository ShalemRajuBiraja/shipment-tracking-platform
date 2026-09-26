package com.ship_track_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "delivery_confirmations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryConfirmationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Shipment for which delivery confirmation is required
    @OneToOne
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private ShipmentEntity shipment;

    // Customer who needs to confirm the delivery
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private UserEntity customer;

    // Operator who requested the delivery confirmation
    @ManyToOne
    @JoinColumn(name = "operator_id", nullable = false)
    private UserEntity operator;

    // Whether the customer has confirmed the delivery
    @Column(nullable = false)
    private boolean confirmed = false;

    // Customer name entered during confirmation
    @Column(name = "confirmed_by_name")
    private String confirmedByName;

    // Signature will be added in the next step
    @Column(name = "signature_path")
    private String signaturePath;

    // POD file will be added in the next step
    @Column(name = "pod_file_path")
    private String podFilePath;
    
    @Column(name = "delivery_image_path")
    private String deliveryImagePath;

    // When operator opened the delivery confirmation
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    // When customer confirmed the delivery
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
    }
}