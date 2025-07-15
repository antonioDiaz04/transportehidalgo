// Asegúrate de que jsPDF esté instalado: npm install jspdf
// Asegúrate de que axios esté instalado: npm install axios
import jsPDF from 'jspdf';
import axios from 'axios';

// Helper function to format boolean values for display
const formatBoolean = (value: boolean | number | null | undefined) => {
    if (value === true || value === 1) return 'SI';
    if (value === false || value === 0) return 'NO';
    return 'N/A'; // Not Applicable or Unknown
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
        const response = await axios.get(`http://localhost:3000/api/revista/${idRV}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        if (!response.data || !response.data.data) {
            throw new Error('No se encontraron datos para la revista vehicular.');
        }

        const inspectionData = response.data.data;

        // 2. Fetch Images for Motor and Serie
        let motorImageBase64 = '';
        let serieImageBase64 = '';

        try {
            const imagesResponse = await axios.get(`http://localhost:3000/api/revista/${idRV}/imagenes`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            if (imagesResponse.data?.data && Array.isArray(imagesResponse.data.data)) {
                imagesResponse.data.data.forEach((img: any) => {
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

        // Logos
        const logoIzquierdo = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179371/transporte/ydrefbxmpld29lrcskkt.png";
        doc.addImage(logoIzquierdo, "PNG", 15, 10, 40, 20);

        const logoDerecho = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179074/transporte/lamhdjofyqwajgu6rzno.png";
        doc.addImage(logoDerecho, "JPEG", 180, 10, 20, 20);

        // Folio Dinámico
        doc.setTextColor(255, 0, 0);
        doc.text('No:', 185, 35);
        doc.setTextColor(0, 0, 0);
        doc.text(inspectionData.Folio || 'N/A', 195, 35); // Use dynamic folio

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Información básica dinámica
        let y = 40;
        doc.text(`FECHA DE INSPECCIÓN: ${inspectionData.FechaInspeccion ? new Date(inspectionData.FechaInspeccion).toLocaleDateString() : 'N/A'}`, 15, y);
        doc.text(`NÚMERO DE AUTORIZACIÓN: ${inspectionData.IdAutorizacion || 'N/A'}`, 120, y); // Assuming IdAutorizacion field

        y += 6;
        doc.text(`NOMBRE DEL PROPIETARIO: ${inspectionData.Propietario || 'N/A'}`, 15, y);
        doc.text(`TELÉFONO: ${inspectionData.TelefonoPropietario || 'N/A'}`, 120, y); // Assuming TelefonoPropietario field

        y += 6;
        doc.text(`PARA TRÁMITE DE: ${inspectionData.TipoTramite || 'N/A'}`, 15, y); // Assuming TipoTramite field
        doc.text(`MUNICIPIO: ${inspectionData.Municipio || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`TIPO DE SERVICIO (MODALIDAD): ${inspectionData.Modalidad || 'N/A'}`, 15, y);

        // Características Vehiculares
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', 115, 70, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 10;
        doc.text(`MARCA: ${inspectionData.Marca || 'N/A'}`, 15, y);
        doc.text(`TIPO DE VEHÍCULO: ${inspectionData.TipoVehiculo || 'N/A'}`, 120, y); // Assuming TipoVehiculo field

        y += 6;
        doc.text(`No. DE MOTOR: ${inspectionData.NoMotor || 'N/A'}`, 15, y);
        doc.text(`SUBMARCA: ${inspectionData.Submarca || 'N/A'}`, 120, y);

        y += 6;
        doc.text(`IMAGEN CROMÁTICA: ${formatBoolean(inspectionData.ImagenCromaticaVer)}`, 15, y);
        doc.text(`No. DE OCUPANTES: ${inspectionData.NoOcupantes || 'N/A'}`, 120, y); // Assuming NoOcupantes field

        y += 6;
        doc.text(`MODELO: ${inspectionData.Modelo || 'N/A'}`, 15, y);
        doc.text(`PLACA DELANTERA: ${formatBoolean(inspectionData.PlacaDelanteraVer)}`, 120, y);

        y += 6;
        doc.text(`No. DE SERIE: ${inspectionData.NoSerie || 'N/A'}`, 15, y);
        doc.text(`PLACA TRASERA: ${formatBoolean(inspectionData.PlacaTraseraVer)}`, 120, y);

        y += 6;
        doc.text(`PLACAS ASIG.: ${inspectionData.PlacasAsig || 'N/A'}`, 15, y); // Assuming PlacasAsig field
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
        checklistItems.forEach((row) => {
            doc.text(row[0], 15, y);
            doc.text(formatBoolean(inspectionData[row[1] as keyof typeof inspectionData]), 80, y); // Dynamic value 1

            doc.text(row[2], 95, y);
            doc.text(formatBoolean(inspectionData[row[3] as keyof typeof inspectionData]), 130, y); // Dynamic value 2

            doc.text(row[4], 145, y);
            doc.text(formatBoolean(inspectionData[row[5] as keyof typeof inspectionData]), 200, y); // Dynamic value 3

            y += 6;
        });
        doc.setFontSize(10); // Reset font size

        y += 2;
        doc.text(`CUENTA ASEGURADORA: ${inspectionData.CuentaAseguradora || 'N/A'}`, 15, y); // Assuming CuentaAseguradora
        doc.text(`NÚMERO DE PÓLIZA: ${inspectionData.NumeroPoliza || 'N/A'}`, 80, y); // Assuming NumeroPoliza
        doc.text(`VIGENCIA: ${inspectionData.VigenciaPoliza ? new Date(inspectionData.VigenciaPoliza).toLocaleDateString() : 'N/A'}`, 150, y); // Assuming VigenciaPoliza

        // Images for Motor and Serie (if found)
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('IMAGENES DE IDENTIFICACIÓN VEHICULAR', 115, y + 5, { align: 'center' }); // Adjusted Y for title
        doc.setFont('helvetica', 'normal');

        y += 15; // Move down for images
        doc.text('No. DE MOTOR:', 15, y);
        if (motorImageBase64) {
            try {
                // Adjust width/height as needed. Max width for a 85mm column is ~70mm
                // Scale image to fit, maintaining aspect ratio
                const imgProps = doc.getImageProperties(motorImageBase64);
                const imgWidth = 60; // Desired width for image
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                doc.addImage(motorImageBase64, 'JPEG', 15, y + 2, imgWidth, imgHeight);
                y += imgHeight + 5; // Adjust y after adding image
            } catch (e) {
                console.error("Error adding motor image to PDF:", e);
                doc.text('No se pudo cargar imagen de motor.', 15, y + 5);
                y += 10;
            }
        } else {
            doc.text('No se encontró imagen de motor.', 15, y + 5);
            y += 10;
        }

        y = y - (motorImageBase64 ? doc.getImageProperties(motorImageBase64).height : 0) - 5; // Reset y to align next image
        doc.text('No. DE SERIE:', 120, y);
        if (serieImageBase64) {
            try {
                const imgProps = doc.getImageProperties(serieImageBase64);
                const imgWidth = 60;
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                doc.addImage(serieImageBase64, 'JPEG', 120, y + 2, imgWidth, imgHeight);
                y += Math.max(imgHeight, (motorImageBase64 ? doc.getImageProperties(motorImageBase64).height : 0)) + 5; // Advance Y based on taller image
            } catch (e) {
                console.error("Error adding serie image to PDF:", e);
                doc.text('No se pudo cargar imagen de serie.', 120, y + 5);
                y += 10;
            }
        } else {
            doc.text('No se encontró imagen de serie.', 120, y + 5);
            y += 10;
        }
        y = Math.max(y, doc.internal.pageSize.height / 2 + 30); // Ensure Y is past the middle, adjust as needed


        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 15, y);
        doc.setFont('helvetica', 'normal');
        // Handle multi-line observations
        const observationsText = doc.splitTextToSize(inspectionData.Observaciones || 'Sin observaciones.', 180);
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
        doc.text('INSPECTOR', 45, y);
        doc.text(inspectionData.Inspector || 'N/A', 30, y + 5); // Dynamic Inspector name
        doc.text('INTERESADO', 140, y);
        doc.text(inspectionData.Propietario || 'N/A', 130, y + 5); // Dynamic Interesado name (using Propietario)

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