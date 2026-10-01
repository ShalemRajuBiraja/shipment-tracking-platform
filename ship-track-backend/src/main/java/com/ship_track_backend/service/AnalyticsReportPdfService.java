package com.ship_track_backend.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import com.ship_track_backend.dto.AnalyticsResponseDto;

@Service
public class AnalyticsReportPdfService {

    private static final float MARGIN = 50;

    private static final float PAGE_WIDTH =
            PDRectangle.A4.getWidth();

    private static final float PAGE_HEIGHT =
            PDRectangle.A4.getHeight();

    private final AnalyticsService analyticsService;

    public AnalyticsReportPdfService(
            AnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }

    public byte[] generateReport() {

        System.out.println(
                "Analytics report generation started"
        );

        try {

            AnalyticsResponseDto analytics =
                    analyticsService.getAdminAnalytics();

            if (analytics == null) {
                throw new RuntimeException(
                        "Analytics data is null"
                );
            }

            try (
                    PDDocument document = new PDDocument();
                    ByteArrayOutputStream outputStream =
                            new ByteArrayOutputStream()
            ) {

                // =====================================================
                // PAGE 1
                // =====================================================

                PDPage page1 =
                        new PDPage(PDRectangle.A4);

                document.addPage(page1);

                try (
                        PDPageContentStream content =
                                new PDPageContentStream(
                                        document,
                                        page1
                                )
                ) {

                    drawHeader(
                            content,
                            "Shipment Analytics Report"
                    );

                    float y =
                            PAGE_HEIGHT - 120;

                    // =================================================
                    // SUMMARY
                    // =================================================

                    writeSectionTitle(
                            content,
                            "SUMMARY",
                            y
                    );

                    y -= 30;

                    float cardWidth = 150;
                    float cardHeight = 55;
                    float gap = 12;

                    drawSummaryCard(
                            content,
                            MARGIN,
                            y,
                            cardWidth,
                            cardHeight,
                            "Total Shipments",
                            String.valueOf(
                                    analytics.getTotalShipments()
                            )
                    );

                    drawSummaryCard(
                            content,
                            MARGIN + cardWidth + gap,
                            y,
                            cardWidth,
                            cardHeight,
                            "Delivered",
                            String.valueOf(
                                    analytics.getDelivered()
                            )
                    );

                    drawSummaryCard(
                            content,
                            MARGIN + (cardWidth + gap) * 2,
                            y,
                            cardWidth,
                            cardHeight,
                            "In Transit",
                            String.valueOf(
                                    analytics.getInTransit()
                            )
                    );

                    y -= 75;

                    drawSummaryCard(
                            content,
                            MARGIN,
                            y,
                            cardWidth,
                            cardHeight,
                            "Pending",
                            String.valueOf(
                                    analytics.getPending()
                            )
                    );

                    drawSummaryCard(
                            content,
                            MARGIN + cardWidth + gap,
                            y,
                            cardWidth,
                            cardHeight,
                            "Cancelled",
                            String.valueOf(
                                    analytics.getCancelled()
                            )
                    );

                    drawSummaryCard(
                            content,
                            MARGIN + (cardWidth + gap) * 2,
                            y,
                            cardWidth,
                            cardHeight,
                            "Delivery Rate",
                            analytics.getDeliveryRate() + "%"
                    );

                    y -= 85;

                    // =================================================
                    // SHIPMENT STATUS
                    // =================================================

                    writeSectionTitle(
                            content,
                            "SHIPMENT STATUS",
                            y
                    );

                    y -= 25;

                    drawTableHeader(
                            content,
                            MARGIN,
                            y,
                            new String[]{
                                    "Status",
                                    "Count"
                            },
                            new float[]{
                                    350,
                                    100
                            }
                    );

                    y -= 22;

                    List<AnalyticsResponseDto.StatusData>
                            statusData =
                                    analytics.getStatusDistribution();

                    if (statusData == null) {
                        statusData =
                                Collections.emptyList();
                    }

                    for (
                            AnalyticsResponseDto.StatusData data
                            : statusData
                    ) {

                        drawTableRow(
                                content,
                                MARGIN,
                                y,
                                new String[]{
                                        safeText(
                                                data.getName()
                                        ),
                                        String.valueOf(
                                                data.getValue()
                                        )
                                },
                                new float[]{
                                        350,
                                        100
                                }
                        );

                        y -= 22;
                    }

                    // =================================================
                    // PAGE 1 FOOTER
                    // =================================================

                    drawFooter(
                            content,
                            "Page 1 of 2"
                    );
                }

                // =====================================================
                // PAGE 2
                // =====================================================

                PDPage page2 =
                        new PDPage(PDRectangle.A4);

                document.addPage(page2);

                try (
                        PDPageContentStream content =
                                new PDPageContentStream(
                                        document,
                                        page2
                                )
                ) {

                    drawHeader(
                            content,
                            "Shipment Analytics Report - Continued"
                    );

                    float y =
                            PAGE_HEIGHT - 120;

                    // =================================================
                    // SHIPMENT ACTIVITY
                    // =================================================

                    writeSectionTitle(
                            content,
                            "SHIPMENT ACTIVITY",
                            y
                    );

                    y -= 25;

                    drawTableHeader(
                            content,
                            MARGIN,
                            y,
                            new String[]{
                                    "Month",
                                    "Shipments"
                            },
                            new float[]{
                                    350,
                                    100
                            }
                    );

                    y -= 22;

                    List<AnalyticsResponseDto.ActivityData>
                            activityData =
                                    analytics.getShipmentActivity();

                    if (activityData == null) {
                        activityData =
                                Collections.emptyList();
                    }

                    for (
                            AnalyticsResponseDto.ActivityData data
                            : activityData
                    ) {

                        drawTableRow(
                                content,
                                MARGIN,
                                y,
                                new String[]{
                                        safeText(
                                                data.getMonth()
                                        ),
                                        String.valueOf(
                                                data.getShipments()
                                        )
                                },
                                new float[]{
                                        350,
                                        100
                                }
                        );

                        y -= 22;
                    }

                    y -= 45;

                    // =================================================
                    // DELIVERY PERFORMANCE
                    // =================================================

                    writeSectionTitle(
                            content,
                            "DELIVERY PERFORMANCE",
                            y
                    );

                    y -= 25;

                    drawTableHeader(
                            content,
                            MARGIN,
                            y,
                            new String[]{
                                    "Type",
                                    "Count"
                            },
                            new float[]{
                                    350,
                                    100
                            }
                    );

                    y -= 22;

                    List<AnalyticsResponseDto.PerformanceData>
                            performanceData =
                                    analytics.getDeliveryPerformance();

                    if (performanceData == null) {
                        performanceData =
                                Collections.emptyList();
                    }

                    for (
                            AnalyticsResponseDto.PerformanceData data
                            : performanceData
                    ) {

                        drawTableRow(
                                content,
                                MARGIN,
                                y,
                                new String[]{
                                        safeText(
                                                data.getType()
                                        ),
                                        String.valueOf(
                                                data.getCount()
                                        )
                                },
                                new float[]{
                                        350,
                                        100
                                }
                        );

                        y -= 22;
                    }

                    // =================================================
                    // PAGE 2 FOOTER
                    // =================================================

                    drawFooter(
                            content,
                            "Page 2 of 2"
                    );
                }

                // =====================================================
                // SAVE PDF
                // =====================================================

                document.save(outputStream);

                byte[] pdf =
                        outputStream.toByteArray();

                System.out.println(
                        "Analytics report generated successfully. Size: "
                                + pdf.length
                                + " bytes"
                );

                return pdf;
            }

        } catch (Exception ex) {

            System.err.println(
                    "Analytics report generation failed:"
            );

            ex.printStackTrace();

            throw new RuntimeException(
                    "Unable to generate analytics report",
                    ex
            );
        }
    }

    // =========================================================
    // HEADER
    // =========================================================

    private void drawHeader(
            PDPageContentStream content,
            String subtitle
    ) throws Exception {

        content.setNonStrokingColor(
                new Color(16, 185, 129)
        );

        content.addRect(
                0,
                PAGE_HEIGHT - 90,
                PAGE_WIDTH,
                90
        );

        content.fill();

        writeText(
                content,
                "SHIPTRACK PRO",
                MARGIN,
                PAGE_HEIGHT - 40,
                20,
                boldFont(),
                Color.WHITE
        );

        writeText(
                content,
                subtitle,
                MARGIN,
                PAGE_HEIGHT - 62,
                11,
                regularFont(),
                Color.WHITE
        );

        String generatedDate =
                LocalDateTime.now()
                        .format(
                                DateTimeFormatter.ofPattern(
                                        "dd MMM yyyy, hh:mm a"
                                )
                        );

        String generatedText =
                "Generated: " + generatedDate;

        float generatedTextWidth =
                regularFont()
                        .getStringWidth(
                                generatedText
                        )
                        / 1000
                        * 9;

        writeText(
                content,
                generatedText,
                PAGE_WIDTH
                        - MARGIN
                        - generatedTextWidth,
                PAGE_HEIGHT - 55,
                9,
                regularFont(),
                Color.WHITE
        );
    }

    // =========================================================
    // FOOTER
    // =========================================================

    private void drawFooter(
            PDPageContentStream content,
            String pageText
    ) throws Exception {

        content.setStrokingColor(
                new Color(220, 220, 220)
        );

        content.moveTo(
                MARGIN,
                48
        );

        content.lineTo(
                PAGE_WIDTH - MARGIN,
                48
        );

        content.stroke();

        writeText(
                content,
                "ShipTrack Pro - Admin Analytics",
                MARGIN,
                30,
                8,
                regularFont(),
                Color.GRAY
        );

        float pageTextWidth =
                regularFont()
                        .getStringWidth(pageText)
                        / 1000
                        * 8;

        writeText(
                content,
                pageText,
                PAGE_WIDTH
                        - MARGIN
                        - pageTextWidth,
                30,
                8,
                regularFont(),
                Color.GRAY
        );
    }

    // =========================================================
    // FONTS
    // =========================================================

    private PDType1Font regularFont() {

        return new PDType1Font(
                Standard14Fonts.FontName.HELVETICA
        );
    }

    private PDType1Font boldFont() {

        return new PDType1Font(
                Standard14Fonts.FontName.HELVETICA_BOLD
        );
    }

    // =========================================================
    // SECTION TITLE
    // =========================================================

    private void writeSectionTitle(
            PDPageContentStream content,
            String text,
            float y
    ) throws Exception {

        writeText(
                content,
                text,
                MARGIN,
                y,
                13,
                boldFont(),
                Color.DARK_GRAY
        );
    }

    // =========================================================
    // SUMMARY CARD
    // =========================================================

    private void drawSummaryCard(
            PDPageContentStream content,
            float x,
            float y,
            float width,
            float height,
            String title,
            String value
    ) throws Exception {

        content.setStrokingColor(
                new Color(210, 210, 210)
        );

        content.addRect(
                x,
                y,
                width,
                height
        );

        content.stroke();

        writeText(
                content,
                title,
                x + 10,
                y + height - 18,
                8,
                regularFont(),
                Color.GRAY
        );

        writeText(
                content,
                value,
                x + 10,
                y + 15,
                16,
                boldFont(),
                new Color(5, 150, 105)
        );
    }

    // =========================================================
    // TABLE HEADER
    // =========================================================

    private void drawTableHeader(
            PDPageContentStream content,
            float x,
            float y,
            String[] values,
            float[] widths
    ) throws Exception {

        float currentX = x;

        content.setNonStrokingColor(
                new Color(240, 253, 250)
        );

        float totalWidth = 0;

        for (float width : widths) {
            totalWidth += width;
        }

        content.addRect(
                x,
                y - 5,
                totalWidth,
                20
        );

        content.fill();

        for (int i = 0; i < values.length; i++) {

            writeText(
                    content,
                    values[i],
                    currentX + 8,
                    y,
                    9,
                    boldFont(),
                    Color.DARK_GRAY
            );

            currentX += widths[i];
        }
    }

    // =========================================================
    // TABLE ROW
    // =========================================================

    private void drawTableRow(
            PDPageContentStream content,
            float x,
            float y,
            String[] values,
            float[] widths
    ) throws Exception {

        float currentX = x;

        for (int i = 0; i < values.length; i++) {

            writeText(
                    content,
                    safeText(values[i]),
                    currentX + 8,
                    y,
                    9,
                    regularFont(),
                    Color.DARK_GRAY
            );

            currentX += widths[i];
        }
    }

    // =========================================================
    // WRITE TEXT
    // =========================================================

    private void writeText(
            PDPageContentStream content,
            String text,
            float x,
            float y,
            float fontSize,
            PDType1Font font,
            Color color
    ) throws Exception {

        content.beginText();

        content.setFont(
                font,
                fontSize
        );

        content.setNonStrokingColor(
                color
        );

        content.newLineAtOffset(
                x,
                y
        );

        content.showText(
                safeText(text)
        );

        content.endText();
    }

    // =========================================================
    // SAFE TEXT
    // =========================================================

    private String safeText(String text) {

        if (text == null) {
            return "";
        }

        return text;
    }
}