
package com.ship_track_backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ship_track_backend.entity.DeliveryConfirmationEntity;
import com.ship_track_backend.payload.ApiResponse;
import com.ship_track_backend.pojo.DeliveryConfirmationResponseDto;
import com.ship_track_backend.pojo.DeliveryImageRequest;
import com.ship_track_backend.pojo.SignatureRequest;
import com.ship_track_backend.service.DeliveryConfirmationService;
import java.io.File;
import java.nio.file.Files;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;



@RestController
@RequestMapping("/api/delivery-confirmations")
public class DeliveryConfirmationController {

    private final DeliveryConfirmationService deliveryConfirmationService;

    public DeliveryConfirmationController(
            DeliveryConfirmationService deliveryConfirmationService) {

        this.deliveryConfirmationService =
                deliveryConfirmationService;
    }

    // ================= OPEN DELIVERY CONFIRMATION =================

    @PostMapping("/open/{trackingNumber}")
    public ResponseEntity<ApiResponse<DeliveryConfirmationEntity>>
            openDeliveryConfirmation(
                    @PathVariable String trackingNumber) {

        DeliveryConfirmationEntity confirmation =
                deliveryConfirmationService
                        .openDeliveryConfirmation(trackingNumber);

        ApiResponse<DeliveryConfirmationEntity> response =
                new ApiResponse<>(
                        true,
                        "Delivery confirmation opened successfully",
                        confirmation
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ================= CONFIRM DELIVERY =================

    @PostMapping("/confirm/{trackingNumber}")
    public ResponseEntity<ApiResponse<DeliveryConfirmationResponseDto>>
            confirmDelivery(
                    @PathVariable String trackingNumber) {

        DeliveryConfirmationResponseDto confirmation =
                deliveryConfirmationService
                        .confirmDelivery(trackingNumber);

        ApiResponse<DeliveryConfirmationResponseDto> response =
                new ApiResponse<>(
                        true,
                        "Delivery confirmed successfully",
                        confirmation
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    // ================= SAVE SIGNATURE =================

    @PostMapping("/signature/{trackingNumber}")
    public ResponseEntity<ApiResponse<String>>
            saveSignature(
                    @PathVariable String trackingNumber,
                    @RequestBody SignatureRequest request) {

        String signaturePath =
                deliveryConfirmationService
                        .saveSignature(
                                trackingNumber,
                                request
                        );

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        "Signature saved successfully",
                        signaturePath
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
    
   // ================= SAVE DELIVERY IMAGE =================
    @PostMapping("/delivery-image/{trackingNumber}")
    public ResponseEntity<ApiResponse<String>>
            saveDeliveryImage(
                    @PathVariable String trackingNumber,
                    @RequestBody DeliveryImageRequest request) {

        String imagePath =
                deliveryConfirmationService
                        .saveDeliveryImage(
                                trackingNumber,
                                request
                        );

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        "Delivery image saved successfully",
                        imagePath
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
   
    // 	GENERATE POD PDF
 // ================= DOWNLOAD POD =================

    @GetMapping("/pod/{trackingNumber}")
    public ResponseEntity<Resource> downloadPod(
            @PathVariable String trackingNumber) {

        try {

            File podFile = deliveryConfirmationService.getPodFile(trackingNumber);

            byte[] fileBytes =
                    Files.readAllBytes(podFile.toPath());

            ByteArrayResource resource =
                    new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.APPLICATION_PDF)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" +
                                    podFile.getName() +
                                    "\"")
                    .contentLength(fileBytes.length)
                    .body(resource);

        } catch (Exception ex) {

            ex.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }
    }

}

