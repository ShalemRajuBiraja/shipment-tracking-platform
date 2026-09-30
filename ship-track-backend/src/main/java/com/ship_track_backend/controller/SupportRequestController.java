package com.ship_track_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ship_track_backend.dto.SupportRequestResponse;
import com.ship_track_backend.dto.SupportStatsResponse;
import com.ship_track_backend.payload.ApiResponse;
import com.ship_track_backend.pojo.SupportRequestPojo;
import com.ship_track_backend.service.SupportRequestService;

@RestController
@RequestMapping("/api/support-requests")
public class SupportRequestController {

    @Autowired
    private SupportRequestService supportRequestService;


    // ================= CREATE SUPPORT REQUEST =================

    @PostMapping
    public ResponseEntity<ApiResponse<Void>>
    createSupportRequest(
            @RequestBody SupportRequestPojo supportRequestPojo) {

        supportRequestService
                .createSupportRequest(supportRequestPojo);

        ApiResponse<Void> apiResponse =
                new ApiResponse<>(
                        true,
                        "Support Request Submitted",
                        null
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(apiResponse);
    }


    // ================= GET DASHBOARD STATISTICS =================

    @GetMapping("/stats")
    public ResponseEntity<SupportStatsResponse>
    getSupportRequestStats() {

        return ResponseEntity.ok(
                supportRequestService
                        .getSupportRequestStats()
        );
    }


    // ================= GET ALL ACTIVE SUPPORT REQUESTS =================

    @GetMapping
    public ResponseEntity<List<SupportRequestResponse>>
    getAllSupportRequests() {

        return ResponseEntity.ok(
                supportRequestService
                        .getAllSupportRequests()
        );
    }


    // ================= SEARCH SUPPORT REQUESTS =================

    @GetMapping("/search")
    public ResponseEntity<List<SupportRequestResponse>>
    searchSupportRequests(
            @RequestParam String name) {

        return ResponseEntity.ok(
                supportRequestService
                        .searchSupportRequests(name)
        );
    }


    // ================= GET RESOLVED REQUESTS =================

    @GetMapping("/resolved")
    public ResponseEntity<List<SupportRequestResponse>>
    getResolvedRequests() {

        return ResponseEntity.ok(
                supportRequestService
                        .getResolvedRequests()
        );
    }


    // ================= GET SUPPORT REQUEST BY ID =================

    @GetMapping("/{id}")
    public ResponseEntity<SupportRequestResponse>
    getSupportRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                supportRequestService
                        .getSupportRequestById(id)
        );
    }


    // ================= UPDATE REQUEST STATUS =================

    @PutMapping("/{id}/status")
    public ResponseEntity<SupportRequestResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                supportRequestService
                        .updateStatus(id, status)
        );
    }


    // ================= DELETE SUPPORT REQUEST =================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>>  deleteSupportRequest( @PathVariable Long id) {

        supportRequestService.deleteSupportRequest(id);

        ApiResponse<Void> apiResponse =
                new ApiResponse<>(
                        true,
                        "Support request deleted successfully",
                        null
                );

        return ResponseEntity.ok(
                apiResponse
        );
    }
}