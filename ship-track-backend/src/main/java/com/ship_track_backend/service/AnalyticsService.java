package com.ship_track_backend.service;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.ship_track_backend.dto.AnalyticsResponseDto;
import com.ship_track_backend.entity.ShipmentEntity;
import com.ship_track_backend.enums.ShipmentStatus;
import com.ship_track_backend.repository.ShipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ShipmentRepository shipmentRepository;


    // =====================================================
    // ADMIN ANALYTICS
    // =====================================================

    public AnalyticsResponseDto getAdminAnalytics() {

        List<ShipmentEntity> shipments =
                shipmentRepository.findAll();

        AnalyticsResponseDto response =
                new AnalyticsResponseDto();


        // =================================================
        // SUMMARY
        // =================================================

        long totalShipments = shipments.size();

        long delivered = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
                .count();

        long inTransit = shipments.stream()
                .filter(s ->
                        s.getStatus() == ShipmentStatus.IN_TRANSIT ||
                        s.getStatus() == ShipmentStatus.PICKED_UP ||
                        s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY
                )
                .count();

        long pending = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.CREATED)
                .count();

        long cancelled = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.CANCELLED)
                .count();


        double deliveryRate = 0;

        if (totalShipments > 0) {
            deliveryRate =
                    (delivered * 100.0) / totalShipments;
        }


        response.setTotalShipments(totalShipments);
        response.setDelivered(delivered);
        response.setInTransit(inTransit);
        response.setPending(pending);
        response.setCancelled(cancelled);
        response.setDeliveryRate(
                Math.round(deliveryRate * 10.0) / 10.0
        );


        // =================================================
        // STATUS DISTRIBUTION
        // =================================================

        List<AnalyticsResponseDto.StatusData> statusData =
                new ArrayList<>();

        statusData.add(
                new AnalyticsResponseDto.StatusData(
                        "Delivered",
                        delivered
                )
        );

        statusData.add(
                new AnalyticsResponseDto.StatusData(
                        "In Transit",
                        inTransit
                )
        );

        statusData.add(
                new AnalyticsResponseDto.StatusData(
                        "Created",
                        pending
                )
        );

        statusData.add(
                new AnalyticsResponseDto.StatusData(
                        "Cancelled",
                        cancelled
                )
        );

        long pickedUp = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.PICKED_UP)
                .count();

        long outForDelivery = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY)
                .count();

        statusData.add(
                new AnalyticsResponseDto.StatusData(
                        "Picked Up",
                        pickedUp
                )
        );

        statusData.add(
                new AnalyticsResponseDto.StatusData(
                        "Out for Delivery",
                        outForDelivery
                )
        );

        response.setStatusDistribution(statusData);


        // =================================================
        // SHIPMENT ACTIVITY
        // =================================================

        List<AnalyticsResponseDto.ActivityData> activityData =
                new ArrayList<>();

        for (Month month : Month.values()) {

            long count = shipments.stream()
                    .filter(s -> s.getCreatedAt() != null)
                    .filter(s ->
                            s.getCreatedAt()
                                    .getMonth() == month
                    )
                    .count();

            String monthName =
                    month.getDisplayName(
                            TextStyle.SHORT,
                            Locale.ENGLISH
                    );

            activityData.add(
                    new AnalyticsResponseDto.ActivityData(
                            monthName,
                            count
                    )
            );
        }

        response.setShipmentActivity(activityData);


        // =================================================
        // DELIVERY PERFORMANCE
        // =================================================

        long onTime = shipments.stream()
                .filter(s ->
                        s.getStatus() == ShipmentStatus.DELIVERED
                )
                .filter(s ->
                        s.getDeliveredAt() != null
                )
                .count();

        long delayed = delivered - onTime;

        if (delayed < 0) {
            delayed = 0;
        }

        List<AnalyticsResponseDto.PerformanceData>
                performanceData = new ArrayList<>();

        performanceData.add(
                new AnalyticsResponseDto.PerformanceData(
                        "Delivered",
                        delivered
                )
        );

        performanceData.add(
                new AnalyticsResponseDto.PerformanceData(
                        "On Time",
                        onTime
                )
        );

        performanceData.add(
                new AnalyticsResponseDto.PerformanceData(
                        "Delayed",
                        delayed
                )
        );

        response.setDeliveryPerformance(performanceData);


        return response;
    }
    
    public String generateAdminAnalyticsReport() {

        AnalyticsResponseDto analytics = getAdminAnalytics();

        StringBuilder report = new StringBuilder();

        // REPORT TITLE
        report.append("SHIPMENT ANALYTICS REPORT\n");
        report.append("\n");

        // SUMMARY
        report.append("SUMMARY\n");
        report.append("Metric,Value\n");
        report.append("Total Shipments,")
                .append(analytics.getTotalShipments())
                .append("\n");

        report.append("Delivered,")
                .append(analytics.getDelivered())
                .append("\n");

        report.append("In Transit,")
                .append(analytics.getInTransit())
                .append("\n");

        report.append("Pending,")
                .append(analytics.getPending())
                .append("\n");

        report.append("Cancelled,")
                .append(analytics.getCancelled())
                .append("\n");

        report.append("Delivery Rate,")
                .append(analytics.getDeliveryRate())
                .append("%\n");

        report.append("\n");

        // DELIVERY PERFORMANCE
        report.append("DELIVERY PERFORMANCE\n");
        report.append("Type,Count\n");

        for (AnalyticsResponseDto.PerformanceData data
                : analytics.getDeliveryPerformance()) {

            report.append(data.getType())
                    .append(",")
                    .append(data.getCount())
                    .append("\n");
        }

        report.append("\n");

        // SHIPMENT ACTIVITY
        report.append("SHIPMENT ACTIVITY\n");
        report.append("Month,Shipments\n");

        for (AnalyticsResponseDto.ActivityData data
                : analytics.getShipmentActivity()) {

            report.append(data.getMonth())
                    .append(",")
                    .append(data.getShipments())
                    .append("\n");
        }

        report.append("\n");

        // STATUS DISTRIBUTION
        report.append("STATUS DISTRIBUTION\n");
        report.append("Status,Count\n");

        for (AnalyticsResponseDto.StatusData data
                : analytics.getStatusDistribution()) {

            report.append(data.getName())
                    .append(",")
                    .append(data.getValue())
                    .append("\n");
        }

        return report.toString();
    }
}