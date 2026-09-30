package com.ship_track_backend.service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ship_track_backend.entity.DeliveryConfirmationEntity;
import com.ship_track_backend.entity.ShipmentEntity;
import com.ship_track_backend.entity.UserEntity;
import com.ship_track_backend.enums.ShipmentStatus;
import com.ship_track_backend.pojo.DeliveryConfirmationResponseDto;
import com.ship_track_backend.pojo.DeliveryImageRequest;
import com.ship_track_backend.pojo.SignatureRequest;
import com.ship_track_backend.repository.DeliveryConfirmationRepository;
import com.ship_track_backend.repository.ShipmentRepository;
import com.ship_track_backend.repository.UserRepository;

@Service
public class DeliveryConfirmationService {

    private final DeliveryConfirmationRepository deliveryConfirmationRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PodPdfService podPdfService;

    public DeliveryConfirmationService(
            DeliveryConfirmationRepository deliveryConfirmationRepository,
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            PodPdfService podPdfService) {

        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.podPdfService = podPdfService;
    }

    // ================= OPEN DELIVERY CONFIRMATION =================

    public DeliveryConfirmationEntity openDeliveryConfirmation(
            String trackingNumber) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        ShipmentEntity shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));

        UserEntity operator = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Operator not found"));

        UserEntity customer = shipment.getReceiver();

        if (customer == null) {
            throw new RuntimeException(
                    "No customer is associated with this shipment");
        }

        if (deliveryConfirmationRepository
                .findByShipment_TrackingNumber(trackingNumber)
                .isPresent()) {

            throw new RuntimeException(
                    "Delivery confirmation already sent for this shipment");
        }

        DeliveryConfirmationEntity confirmation = new DeliveryConfirmationEntity();

        confirmation.setShipment(shipment);
        confirmation.setCustomer(customer);
        confirmation.setOperator(operator);
        confirmation.setConfirmed(false);

        DeliveryConfirmationEntity savedConfirmation =  deliveryConfirmationRepository.save(confirmation);

        notificationService.createNotification(
                customer,
                shipment,
                "Delivery Confirmation Required");

        return savedConfirmation;
    }

    // ================= FINAL CONFIRM DELIVERY =================

    public DeliveryConfirmationResponseDto confirmDelivery(
            String trackingNumber) {

        DeliveryConfirmationEntity confirmation =
                deliveryConfirmationRepository
                        .findByShipment_TrackingNumber(trackingNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Delivery confirmation request not found"));

        if (confirmation.isConfirmed()) {
            throw new RuntimeException(
                    "Delivery has already been confirmed");
        }

        // Signature must be saved first
        if (confirmation.getSignaturePath() == null ||
                confirmation.getSignaturePath().isBlank()) {

            throw new RuntimeException(
                    "Please save your signature before confirming delivery");
        }

        // Delivery image must be saved first
        if (confirmation.getDeliveryImagePath() == null ||
                confirmation.getDeliveryImagePath().isBlank()) {

            throw new RuntimeException(
                    "Please save the delivery image before confirming delivery");
        }

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        UserEntity customer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"));

        if (!confirmation.getCustomer().getId().equals(customer.getId())) {

            throw new RuntimeException( "You are not authorized to confirm this delivery");
        }

        // Final confirmation
     // Final confirmation
        confirmation.setConfirmed(true);

        confirmation.setConfirmedByName(
                customer.getName());

        confirmation.setConfirmedAt(
                LocalDateTime.now());

        ShipmentEntity shipment =
                confirmation.getShipment();

        // Change shipment status
        shipment.setStatus(
                ShipmentStatus.DELIVERED);

        shipment.setUpdatedAt(
                LocalDateTime.now());

        shipmentRepository.save(shipment);


        // =========================
        // GENERATE POD
        // =========================

        try {

            String podPath = podPdfService.generatePodPdf(
                    shipment.getTrackingNumber(),
                    shipment.getReceiverName(),
                    shipment.getDeliveryAddress(),
                    shipment.getPackageDescription(),
                    shipment.getWeight() != null
                            ? shipment.getWeight().toString()
                            : "",
                    confirmation.getConfirmedByName(),
                    confirmation.getConfirmedAt().toString(),
                    confirmation.getSignaturePath(),
                    confirmation.getDeliveryImagePath()
            );

            confirmation.setPodFilePath(podPath);

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to generate Proof of Delivery");
        }


        // Save confirmation
        DeliveryConfirmationEntity savedConfirmation =
                deliveryConfirmationRepository.save(
                        confirmation);

        return new DeliveryConfirmationResponseDto(
                savedConfirmation.getId(),
                shipment.getTrackingNumber(),
                savedConfirmation.isConfirmed(),
                savedConfirmation.getConfirmedByName(),
                savedConfirmation.getRequestedAt(),
                savedConfirmation.getConfirmedAt(),
                shipment.getStatus().name());
    }

    // ================= SAVE SIGNATURE =================

    public String saveSignature(
            String trackingNumber,
            SignatureRequest request) {

        DeliveryConfirmationEntity confirmation =
                deliveryConfirmationRepository
                        .findByShipment_TrackingNumber(trackingNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Delivery confirmation request not found"));

        // IMPORTANT:
        // Do NOT require confirmation.isConfirmed() here.
        // Signature must be saved BEFORE final confirmation.

        if (confirmation.isConfirmed()) {
            throw new RuntimeException(
                    "Delivery has already been confirmed");
        }

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        UserEntity customer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"));

        if (!confirmation.getCustomer().getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to save this signature");
        }

        if (request == null ||
                request.getSignature() == null ||
                request.getSignature().isBlank()) {

            throw new RuntimeException(
                    "Signature is required");
        }

        try {
            String signatureData =
                    request.getSignature();

            if (signatureData.contains(",")) {
                signatureData =
                        signatureData.substring(
                                signatureData.indexOf(",") + 1);
            }

            byte[] imageBytes =
                    Base64.getDecoder()
                            .decode(signatureData);

            File uploadDirectory =
                    new File("uploads/signatures");

            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            String fileName =
                    trackingNumber + "_" +
                    System.currentTimeMillis() +
                    ".png";

            File signatureFile =
                    new File(uploadDirectory, fileName);

            try (FileOutputStream outputStream =
                         new FileOutputStream(signatureFile)) {

                outputStream.write(imageBytes);
            }

            String signaturePath =
                    "uploads/signatures/" + fileName;

            confirmation.setSignaturePath(
                    signaturePath);

            deliveryConfirmationRepository.save(
                    confirmation);

            return signaturePath;

        } catch (IllegalArgumentException ex) {

            throw new RuntimeException(
                    "Invalid signature image");

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to save signature");
        }
    }

    // ================= SAVE DELIVERY IMAGE =================

    public String saveDeliveryImage(
            String trackingNumber,
            DeliveryImageRequest request) {

        DeliveryConfirmationEntity confirmation =
                deliveryConfirmationRepository
                        .findByShipment_TrackingNumber(trackingNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Delivery confirmation request not found"));

        // IMPORTANT:
        // Do NOT require confirmation.isConfirmed() here.
        // Image must be saved BEFORE final confirmation.

        if (confirmation.isConfirmed()) {
            throw new RuntimeException(
                    "Delivery has already been confirmed");
        }

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        UserEntity customer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"));

        if (!confirmation.getCustomer().getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to save this delivery image");
        }

        if (request == null ||
                request.getImage() == null ||
                request.getImage().isBlank()) {

            throw new RuntimeException(
                    "Delivery image is required");
        }

        try {
            String imageData =
                    request.getImage();

            if (imageData.contains(",")) {
                imageData =
                        imageData.substring(
                                imageData.indexOf(",") + 1);
            }

            byte[] imageBytes =
                    Base64.getDecoder()
                            .decode(imageData);

            File uploadDirectory =
                    new File("uploads/delivery-images");

            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            String fileName =
                    trackingNumber + "_" +
                    System.currentTimeMillis() +
                    ".png";

            File imageFile =
                    new File(uploadDirectory, fileName);

            try (FileOutputStream outputStream =
                         new FileOutputStream(imageFile)) {

                outputStream.write(imageBytes);
            }

            String imagePath =
                    "uploads/delivery-images/" + fileName;

            confirmation.setDeliveryImagePath(
                    imagePath);

            deliveryConfirmationRepository.save(
                    confirmation);

            return imagePath;

        } catch (IllegalArgumentException ex) {

            throw new RuntimeException(
                    "Invalid delivery image");

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to save delivery image");
        }
    }
    
    
    // ================= GET DELIVERY CONFIRMATION STATUS =================
 // ================= DOWNLOAD POD =================

    public File getPodFile(String trackingNumber) {

        // Get logged-in user's email
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        // Find logged-in user
        UserEntity loggedInUser = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find shipment
        ShipmentEntity shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));

        // Get user role
        String role = loggedInUser.getRole().name();

        // ================= AUTHORIZATION =================

        // ADMIN and SUPPORT_AGENT can access all shipments
        boolean isAdmin =
                role.equals("ADMIN");

        boolean isSupportAgent =
                role.equals("SUPPORT_AGENT");

        // CUSTOMER / BUSINESS_CLIENT
        // can access their own shipments
        boolean isSender =
                shipment.getSender() != null &&
                shipment.getSender().getId()
                        .equals(loggedInUser.getId());

        boolean isReceiver =
                shipment.getReceiver() != null &&
                shipment.getReceiver().getId()
                        .equals(loggedInUser.getId());

        // LOGISTICS_OPERATOR
        // can access shipments assigned to them
        boolean isAssignedOperator =
                shipment.getAssignedOperator() != null &&
                shipment.getAssignedOperator().getId()
                        .equals(loggedInUser.getId());

        System.out.println("========== POD DOWNLOAD DEBUG ==========");
        System.out.println("Logged-in email: " + email);
        System.out.println("Logged-in user ID: " + loggedInUser.getId());
        System.out.println("Logged-in role: " + role);

        System.out.println("Shipment tracking: " + trackingNumber);

        System.out.println(
            "Shipment sender ID: " +
            (shipment.getSender() != null
                ? shipment.getSender().getId()
                : "NULL")
        );

        System.out.println(
            "Assigned operator ID: " +
            (shipment.getAssignedOperator() != null
                ? shipment.getAssignedOperator().getId()
                : "NULL")
        );

    
        System.out.println("========================================");
        // Allow access if user has permission
        if (!isAdmin &&
                !isSupportAgent &&
                !isSender &&
                !isReceiver &&
                !isAssignedOperator) {

            throw new RuntimeException(
                    "You are not authorized to download this POD");
        }

        // ================= FIND POD =================

        DeliveryConfirmationEntity confirmation =
                deliveryConfirmationRepository
                        .findByShipment_TrackingNumber(trackingNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Delivery confirmation not found"));

        if (confirmation.getPodFilePath() == null ||
                confirmation.getPodFilePath().isBlank()) {

            throw new RuntimeException(
                    "Proof of Delivery not available");
        }

        File podFile = new File(
                confirmation.getPodFilePath());

        if (!podFile.exists()) {

            throw new RuntimeException(
                    "Proof of Delivery file not found");
        }

        return podFile;
    }
}