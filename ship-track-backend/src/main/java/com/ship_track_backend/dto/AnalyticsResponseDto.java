package com.ship_track_backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnalyticsResponseDto {

    // ================= SUMMARY =================

    private long totalShipments;

    private long delivered;

    private long inTransit;

    private long pending;

    private long cancelled;

    private double deliveryRate;


    // ================= CHART DATA =================

    private List<StatusData> statusDistribution;

    private List<ActivityData> shipmentActivity;

    private List<PerformanceData> deliveryPerformance;


    // =====================================================
    // STATUS DATA
    // =====================================================

    @Getter
    @Setter
    public static class StatusData {

        private String name;

        private long value;

        public StatusData(String name, long value) {
            this.name = name;
            this.value = value;
        }
    }


    // =====================================================
    // SHIPMENT ACTIVITY
    // =====================================================

    @Getter
    @Setter
    public static class ActivityData {

        private String month;

        private long shipments;

        public ActivityData(String month, long shipments) {
            this.month = month;
            this.shipments = shipments;
        }
    }


    // =====================================================
    // DELIVERY PERFORMANCE
    // =====================================================

    @Getter
    @Setter
    public static class PerformanceData {

        private String type;

        private long count;

        public PerformanceData(String type, long count) {
            this.type = type;
            this.count = count;
        }
    }
}