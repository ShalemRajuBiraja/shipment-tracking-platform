package com.ship_track_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

@Service
public class PodPdfService {

    private static final String POD_DIRECTORY = "uploads/pods";

    public String generatePodPdf(
            String trackingNumber,
            String receiverName,
            String deliveryAddress,
            String packageDescription,
            String weight,
            String confirmedByName,
            String confirmedAt,
            String signaturePath,
            String deliveryImagePath) throws IOException {

        // Create POD directory
        Path directory = Paths.get(POD_DIRECTORY);
        Files.createDirectories(directory);

        // Create PDF file name
        String fileName = "POD-" + trackingNumber + ".pdf";
        Path pdfPath = directory.resolve(fileName);

        try (PDDocument document = new PDDocument()) {

            // Create first page
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content =
                         new PDPageContentStream(document, page)) {

                // =========================
                // TITLE
                // =========================

                content.beginText();

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        ),
                        20
                );

                content.newLineAtOffset(200, 760);
                content.showText("PROOF OF DELIVERY");

                content.endText();


                // =========================
                // SHIPMENT DETAILS
                // =========================

                content.beginText();

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        ),
                        14
                );

                content.newLineAtOffset(50, 710);
                content.showText("Shipment Details");

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        ),
                        11
                );

                content.newLineAtOffset(0, -25);
                content.showText(
                        "Tracking Number: " + safeText(trackingNumber)
                );

                content.newLineAtOffset(0, -20);
                content.showText(
                        "Receiver Name: " + safeText(receiverName)
                );

                content.newLineAtOffset(0, -20);
                content.showText(
                        "Delivery Address: " + safeText(deliveryAddress)
                );

                content.newLineAtOffset(0, -20);
                content.showText(
                        "Package: " + safeText(packageDescription)
                );

                content.newLineAtOffset(0, -20);
                content.showText(
                        "Weight: " + safeText(weight)
                );

                content.endText();


                // =========================
                // DELIVERY DETAILS
                // =========================

                content.beginText();

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        ),
                        14
                );

                content.newLineAtOffset(50, 570);
                content.showText("Delivery Details");

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        ),
                        11
                );

                content.newLineAtOffset(0, -25);
                content.showText("Status: DELIVERED");

                content.newLineAtOffset(0, -20);
                content.showText(
                        "Confirmed By: " + safeText(confirmedByName)
                );

                content.newLineAtOffset(0, -20);
                content.showText(
                        "Confirmed At: " + safeText(confirmedAt)
                );

                content.endText();


                // =========================
                // SIGNATURE
                // =========================

                content.beginText();

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        ),
                        14
                );

                content.newLineAtOffset(50, 460);
                content.showText("Customer Signature");

                content.endText();

                if (signaturePath != null
                        && !signaturePath.isBlank()
                        && Files.exists(Paths.get(signaturePath))) {

                    PDImageXObject signatureImage =
                            PDImageXObject.createFromFile(
                                    signaturePath,
                                    document
                            );

                    content.drawImage(
                            signatureImage,
                            50,
                            350,
                            180,
                            80
                    );
                }


                // =========================
                // DELIVERY IMAGE
                // =========================

                content.beginText();

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        ),
                        14
                );

                content.newLineAtOffset(50, 320);
                content.showText("Delivery Image");

                content.endText();

                if (deliveryImagePath != null
                        && !deliveryImagePath.isBlank()
                        && Files.exists(Paths.get(deliveryImagePath))) {

                    PDImageXObject deliveryImage =
                            PDImageXObject.createFromFile(
                                    deliveryImagePath,
                                    document
                            );

                    content.drawImage(
                            deliveryImage,
                            50,
                            80,
                            250,
                            220
                    );
                }


                // =========================
                // FOOTER
                // =========================

                content.beginText();

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        ),
                        9
                );

                content.newLineAtOffset(50, 40);
                content.showText("ShipTrack Pro - Proof of Delivery");

                content.endText();
            }

            // Save the PDF
            document.save(pdfPath.toFile());
        }

        // Return saved PDF path
        return pdfPath.toString();
    }


    // Prevent null values from causing PDF generation errors
    private String safeText(String value) {
        return value == null ? "" : value;
    }
}