package com.ship_track_backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ship_track_backend.dto.AnalyticsResponseDto;
import com.ship_track_backend.service.AnalyticsReportPdfService;
import com.ship_track_backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AnalyticsReportPdfService analyticsReportPdfService;


    // =====================================================
    // ADMIN ANALYTICS
    // =====================================================

    @GetMapping("/admin")
    public ResponseEntity<AnalyticsResponseDto> getAdminAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getAdminAnalytics()
        );
    }
    
    @GetMapping("/admin/report")
    public ResponseEntity<byte[]> downloadAdminAnalyticsReport() {

        byte[] pdf = analyticsReportPdfService.generateReport();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=shipment-analytics-report.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }
}