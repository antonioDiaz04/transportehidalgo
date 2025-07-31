// Asegúrate de que jsPDF esté instalado: npm install jspdf
// Asegúrate de que axios esté instalado: npm install axios
import jsPDF from 'jspdf';
import axios from 'axios';
import apiClient from "@/lib/apiClient";

// Helper function to format boolean values for display
const formatBoolean = (value: boolean | number | null | undefined) => {
    if (value === true || value === 1) return 'SI';
    if (value === false || value === 0) return 'NO';
    return 'N/A'; // Not Applicable or Unknown
};

// Helper function to truncate text and add ellipsis if it exceeds max width
const truncateText = (
    doc: jsPDF,
    text: string | null | undefined,
    maxWidth: number, // in mm
    fontSize: number
): string => {
    if (!text) return 'N/A';

    // jsPDF's getStringUnitWidth returns units, convert to mm
    // fontSize is in points, 1 point = 1/72 inch, 1 inch = 25.4 mm
    // The scaleFactor is usually 1, but it's good practice to use it.
    doc.setFontSize(fontSize); // Ensure the font size is set for accurate measurement
    const textMeasurement = text; // Text to measure

    let textWidth = doc.getStringUnitWidth(textMeasurement) * fontSize / doc.internal.scaleFactor;
    textWidth = textWidth * doc.internal.scaleFactor; // Convert back to mm based on internal scale

    if (textWidth <= maxWidth) {
        return text;
    }

    const ellipsis = '...';
    let truncatedText = text;
    let newWidth = textWidth;

    // Calculate ellipsis width once
    const ellipsisWidth = doc.getStringUnitWidth(ellipsis) * fontSize / doc.internal.scaleFactor * doc.internal.scaleFactor;

    // Keep removing characters until it fits, leaving space for ellipsis
    while (newWidth >= maxWidth - ellipsisWidth && truncatedText.length > 0) {
        truncatedText = truncatedText.slice(0, -1);
        newWidth = doc.getStringUnitWidth(truncatedText) * fontSize / doc.internal.scaleFactor * doc.internal.scaleFactor;
    }

    return truncatedText + ellipsis;
};


// Function to generate the PDF dynamically
export async function generarPDF(idRV: string) { // Accept idRV as parameter
    if (!idRV) {
        console.error('[PDF] ID de Revista (idRV) no proporcionado.');
        throw new Error('ID de Revista (idRV) es requerido para generar el PDF.');
    }

    console.log(`[PDF] Iniciando generación de PDF para IdRevistaVehicular: ${idRV}...`);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' }); // Tamaño carta

    try {
        // 1. Fetch Inspection Data
        const response = await apiClient(`http://localhost:3000/api/revista/${idRV}`, {
            method: 'GET',
            withCredentials: true,
        });
        console.log(response)
        if (!response.data) {
            throw new Error('No se encontraron datos para la revista vehicular.');
        }

        const inspectionData = response.data;
        console.log(inspectionData)
        // 2. Fetch Images for Motor and Serie
        let motorImageBase64 = '';
        let serieImageBase64 = '';

        try {
            const imagesResponse = await apiClient(`http://localhost:3000/api/revista/${idRV}/imagenes`, {
                method: 'GET',
                withCredentials: true,
            });

            if (imagesResponse.data && Array.isArray(imagesResponse.data)) {
                imagesResponse.data.forEach((img: any) => {
                    // Assuming IdTipoImagen 1 is 'Serie' and 2 is 'Motor' based on your defaultImageTypes
                    if (String(img.IdTipoImagen) === '2') { // Motor
                        motorImageBase64 = `data:${img.MimeType};base64,${img.ImagenBase64}`;
                    } else if (String(img.IdTipoImagen) === '1') { // Serie
                        serieImageBase64 = `data:${img.MimeType};base64,${img.ImagenBase64}`;
                    }
                });
            }
        } catch (imageError) {
            console.warn('[PDF] No se pudieron cargar las imágenes de motor/serie:', imageError);
            // Continue PDF generation even if images fail
        }


        doc.setFont('helvetica');
        doc.setFontSize(12);

        // Logos (uncomment if you have these images accessible)
        // const logoIzquierdo = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179371/transporte/ydrefbxmpld29lrcskkt.png";
        // doc.addImage(logoIzquierdo, "PNG", 15, 10, 40, 20);

        // const logoDerecho = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179074/transporte/lamhdjofyqwajgu6rzno.png";
        // doc.addImage(logoDerecho, "JPEG", 180, 10, 20, 20);

        // Folio Dinámico
        doc.setTextColor(255, 0, 0);
        doc.text('No:', 185, 35);
        doc.setTextColor(0, 0, 0);
        doc.text(inspectionData.Folio || 'N/A', 195, 35); // Use dynamic folio

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Información básica dinámica
        let y = 40;
        // Apply truncateText to relevant fields
        doc.text(`FECHA DE INSPECCIÓN: ${inspectionData.FechaInspeccion ? new Date(inspectionData.FechaInspeccion).toLocaleDateString() : 'N/A'}`, 15, y);
        doc.text(`NÚMERO DE AUTORIZACIÓN: ${truncateText(doc, inspectionData.IdAutorizacion, 70, 10) || 'N/A'}`, 120, y); // Example width: 70mm

        y += 6;
        doc.text(`NOMBRE DEL PROPIETARIO: ${truncateText(doc, inspectionData.Propietario, 90, 10) || 'N/A'}`, 15, y); // Example width: 90mm
        doc.text(`TELÉFONO: ${truncateText(doc, inspectionData.TelefonoPropietario, 60, 10) || 'N/A'}`, 120, y); // Example width: 60mm

        y += 6;
        doc.text(`PARA TRÁMITE DE: ${truncateText(doc, inspectionData.TipoTramite, 90, 10) || 'N/A'}`, 15, y); // Example width: 90mm
        doc.text(`MUNICIPIO: ${truncateText(doc, inspectionData.Municipio, 60, 10) || 'N/A'}`, 120, y); // Example width: 60mm

        y += 6;
        doc.text(`TIPO DE SERVICIO (MODALIDAD): ${truncateText(doc, inspectionData.Modalidad, 90, 10) || 'N/A'}`, 15, y); // Example width: 90mm

        // Características Vehiculares
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', 115, 70, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 10;
        doc.text(`MARCA: ${truncateText(doc, inspectionData.Marca, 60, 10) || 'N/A'}`, 15, y); // Example width: 60mm
        doc.text(`TIPO DE VEHÍCULO: ${truncateText(doc, inspectionData.TipoVehiculo, 70, 10) || 'N/A'}`, 120, y); // Example width: 70mm

        y += 6;
        doc.text(`No. DE MOTOR: ${truncateText(doc, inspectionData.NoMotor, 60, 10) || 'N/A'}`, 15, y);
        doc.text(`SUBMARCA: ${truncateText(doc, inspectionData.Submarca, 70, 10) || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`IMAGEN CROMÁTICA: ${formatBoolean(inspectionData.ImagenCromaticaVer)}`, 15, y);
        doc.text(`No. DE OCUPANTES: ${inspectionData.NoOcupantes || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`MODELO: ${truncateText(doc, String(inspectionData.Modelo), 60, 10) || 'N/A'}`, 15, y); // Assuming Modelo can be a number
        doc.text(`PLACA DELANTERA: ${formatBoolean(inspectionData.PlacaDelanteraVer)}`, 120, y);

        y += 6;
        doc.text(`No. DE SERIE: ${truncateText(doc, inspectionData.NoSerie, 60, 10) || 'N/A'}`, 15, y);
        doc.text(`PLACA TRASERA: ${formatBoolean(inspectionData.PlacaTraseraVer)}`, 120, y);

        y += 6;
        doc.text(`PLACAS ASIG.: ${truncateText(doc, inspectionData.PlacasAsig, 60, 10) || 'N/A'}`, 15, y);
        doc.text(`CALCOMANÍA DE VERIFICACIÓN: ${formatBoolean(inspectionData.CalcaVerificacionVer)}`, 120, y);

        y += 6;
        doc.text(`CALCOMANÍA DE LA TENENCIA: ${formatBoolean(inspectionData.CalcaTenenciaVer)}`, 120, y);

        // Tabla compacta dinámica (Ponderación)
        y += 10;
        const checklistItems = [
            // [Label1, DataField1, Label2, DataField2, Label3, DataField3]
            ['PINTURA Y CARROCERÍA', 'PinturaCarroceriaVer', 'CLAXON', 'ClaxonVer', 'EXTINTOR', 'EstinguidorVer'],
            ['ESTADO DE LLANTAS', 'EstadoLlantasVer', 'LUZ BAJA', 'LuzBajaVer', 'HERRAMIENTA', 'HerramientasVer'],
            ['DEFENSAS', 'DefensasVer', 'LUZ ALTA', 'LuzAltaVer', 'SISTEMA DE FRENADO', 'SistemaFrenadoVer'],
            ['VIDRIOS', 'VidriosVer', 'CUARTOS', 'CuartosVer', 'SISTEMA DE DIRECCIÓN', 'SistemaDireccionVer'],
            ['LIMPIADORES', 'LimpiadoresVer', 'DIRECCIONALES', 'DireccionalesVer', 'SISTEMA DE SUSPENSIÓN', 'SistemaSuspensionVer'],
            ['ESPEJOS', 'EspejosVer', 'INTERMITENTES', 'IntermitentesVer', 'INTERIORES', 'InterioresVer'],
            ['LLANTA DE REFACCIÓN', 'LlantaRefaccionVer', 'STOP', 'StopVer', 'BOTIQUÍN', 'BotiquinVer'],
            ['PARABRISAS MEDALLÓN', 'ParabrisasMedallonVer', 'TIMBRE', 'TimbreVer', 'CINTURÓN DE SEGURIDAD', 'CinturonSeguridadVer']
        ];

        doc.setFontSize(9); // Smaller font for checklist
        const col1Width = 60; // Max width for first column labels
        const col2Width = 30; // Max width for boolean values
        const col3Width = 30; // Max width for second column labels
        const col4Width = 30; // Max width for boolean values
        const col5Width = 40; // Max width for third column labels
        const col6Width = 20; // Max width for boolean values

        checklistItems.forEach((row) => {
            doc.text(truncateText(doc, row[0], col1Width, 9), 15, y);
            doc.text(formatBoolean(inspectionData[row[1] as keyof typeof inspectionData]), 80, y);

            doc.text(truncateText(doc, row[2], col3Width, 9), 95, y);
            doc.text(formatBoolean(inspectionData[row[3] as keyof typeof inspectionData]), 130, y);

            doc.text(truncateText(doc, row[4], col5Width, 9), 145, y);
            doc.text(formatBoolean(inspectionData[row[5] as keyof typeof inspectionData]), 200, y);

            y += 6;
        });
        doc.setFontSize(10); // Reset font size

        y += 2;
        doc.text(`CUENTA ASEGURADORA: ${truncateText(doc, inspectionData.CuentaAseguradora, 60, 10) || 'N/A'}`, 15, y);
        doc.text(`NÚMERO DE PÓLIZA: ${truncateText(doc, inspectionData.NumeroPoliza, 50, 10) || 'N/A'}`, 80, y);
        doc.text(`VIGENCIA: ${inspectionData.VigenciaPoliza ? new Date(inspectionData.VigenciaPoliza).toLocaleDateString() : 'N/A'}`, 150, y);

        // Images for Motor and Serie (if found)
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('IMAGENES DE IDENTIFICACIÓN VEHICULAR', 115, y + 5, { align: 'center' }); // Adjusted Y for title
        doc.setFont('helvetica', 'normal');

        y += 15; // Move down for images
        doc.text('No. DE MOTOR:', 15, y);
        // Uncomment and test these blocks when you have actual images and want to add them
        // if (motorImageBase64) {
        //     try {
        //         const imgProps = doc.getImageProperties(motorImageBase64);
        //         const imgWidth = 60; // Desired width for image
        //         const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        //         doc.addImage(motorImageBase64, imgProps.fileType, 15, y + 2, imgWidth, imgHeight); // Use imgProps.fileType
        //         y += imgHeight + 5;
        //     } catch (e) {
        //         console.error("Error adding motor image to PDF:", e);
        //         doc.text('No se pudo cargar imagen de motor.', 15, y + 5);
        //         y += 10;
        //     }
        // } else {
        //     doc.text('No se encontró imagen de motor.', 15, y + 5);
        //     y += 10;
        // }

        // y = y - (motorImageBase64 ? doc.getImageProperties(motorImageBase64).height : 0) - 5; // This line might need adjustment or removal depending on exact image placement
        // To handle two images side-by-side, you'd place the second one at a different X coordinate.
        // A simpler approach for now is to let them flow vertically if you uncomment both image blocks.
        // If you want them side-by-side, calculate the max height of the two images and advance Y based on that.

        doc.text('No. DE SERIE:', 120, y);
        // if (serieImageBase64) {
        //     try {
        //         const imgProps = doc.getImageProperties(serieImageBase64);
        //         const imgWidth = 60;
        //         const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        //         doc.addImage(serieImageBase64, imgProps.fileType, 120, y + 2, imgWidth, imgHeight); // Use imgProps.fileType
        //         y += Math.max(imgHeight, (motorImageBase64 ? doc.getImageProperties(motorImageBase64).height * 60 / doc.getImageProperties(motorImageBase64).width : 0)) + 5; // Advance Y based on taller image
        //     } catch (e) {
        //         console.error("Error adding serie image to PDF:", e);
        //         doc.text('No se pudo cargar imagen de serie.', 120, y + 5);
        //         y += 10;
        //     }
        // } else {
        //     doc.text('No se encontró imagen de serie.', 120, y + 5);
        //     y += 10;
        // }
        // The y calculation here is tricky with side-by-side. If images are going to be side-by-side,
        // you'd advance `y` *after* both are placed, based on the taller image.
        // For now, I've commented out the image placement to focus on text.
        // Assuming images won't excessively push `y` down for the rest of the content:
        y = Math.max(y, doc.internal.pageSize.height / 2 + 30); // Ensure Y is past the middle, adjust as needed

        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 15, y);
        doc.setFont('helvetica', 'normal');
        // Handle multi-line observations with a specific max width for the split
        const observationsText = doc.splitTextToSize(inspectionData.Observaciones || 'Sin observaciones.', 140); // Max width for observations text
        doc.text(observationsText, 50, y);
        y += (observationsText.length - 1) * doc.getLineHeight() / doc.internal.scaleFactor + 5; // Adjust y based on observation lines

        y = Math.max(y, 212); // Ensure APROBADO starts at least at 212 if observations are short

        doc.text(`APROBADO: ${formatBoolean(inspectionData.Aprobado)}`, 110, y, { align: 'center' }); // Dynamic Aprobado

        y += 10;
        doc.setFontSize(9);
        doc.text('NOTA: NO CUMPLIR CON CUALQUIERA DE LOS PUNTOS ANTERIORES IMPLICA LA NO APROBACIÓN DE LA INSPECCIÓN VEHICULAR', 15, y, {
            maxWidth: 180,
        });

        y += 12;
        doc.setFontSize(10);
        // Inspector and Interesado names can also be truncated if they are very long
        doc.text('INSPECTOR', 45, y);
        doc.text(truncateText(doc, inspectionData.Inspector, 60, 10) || 'N/A', 30, y + 5); // Example width: 60mm
        doc.text('INTERESADO', 140, y);
        doc.text(truncateText(doc, inspectionData.Propietario, 60, 10) || 'N/A', 130, y + 5); // Example width: 60mm (using Propietario)

        doc.line(30, y + 15, 80, y + 15);
        doc.text('NOMBRE Y FIRMA', 40, y + 20);
        doc.line(130, y + 15, 180, y + 15);
        doc.text('NOMBRE Y FIRMA', 140, y + 20);

        y += 30;
        doc.setFontSize(9);
        doc.text('Av. de la Prensa No. 205, Col. L. García', 150, y);
        doc.text('Pachuca de Soto, Hidalgo, México', 158, y + 5);
        doc.text('Tel: 01 (771) 717 8000 ext. 1755', 160, y + 10);

        console.log('[PDF] PDF generado dinámicamente.');
        return doc;
    } catch (error) {
        console.error('[PDF] Error al generar el PDF:', error);
        throw error;
    }
}

export function savePDF(doc: jsPDF, filename: string) {
    try {
        console.log(`[PDF] Guardando PDF como: ${filename}.pdf`);
        doc.save(`${filename}.pdf`);
        console.log('[PDF] Archivo guardado correctamente');
    } catch (error) {
        console.error('[PDF] Error al guardar el PDF:', error);
    }
}