import jsPDF from 'jspdf';

export function generarPDF(img:any) {
    console.log('[PDF] Iniciando generación de PDF...');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' }); // Tamaño carta

    try {
        doc.setFont('helvetica');
        doc.setFontSize(12);

        // Título
        // Agregar imagen de fondo solo en la primera página
        // const imageUrl =
        //     "https://res.cloudinary.com/dvvhnrvav/image/upload/v1736174056/icathi/tsi14aynpqjer8fthxtz.png";
        // doc.addImage(
        //     imageUrl,
        //     "PNG",
        //     0,
        //     0,
        //     doc.internal.pageSize.width,
        //     doc.internal.pageSize.height
        // );
        // Agregar logo izquierdo (esquina superior izquierda)
        const logoIzquierdo = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179371/transporte/ydrefbxmpld29lrcskkt.png";
        doc.addImage(logoIzquierdo, "PNG", 15, 10, 40, 20);  // x, y, width, height

        // Agregar logo derecho (esquina superior derecha)
        const logoDerecho = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750179074/transporte/lamhdjofyqwajgu6rzno.png";
        doc.addImage(logoDerecho, "JPEG", 180, 10, 20, 20);  // x, y, width, height

        // Definir el margen superior
        // const topMargin = 50;

        // Establecer color rojo solo para "No:"
        doc.setTextColor(255, 0, 0);
        doc.text('No:', 185, 35); // Coordenada X ajustada a la izquierda

        // Restaurar color a negro para el valor
        doc.setTextColor(0, 0, 0);
        doc.text('80707', 195, 35); // Coordenada X ajustada a la derecha del "No:"


        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Información básica
        let y = 40;
        doc.text('FECHA DE INSPECCIÓN: 26/11/2023', 15, y);
        doc.text('NÚMERO DE AUTORIZACIÓN: 14800', 120, y);

        y += 6;
        doc.text('NOMBRE DEL PROPIETARIO: AURELIO ACIANO GARCIA', 15, y);
        doc.text('TELÉFONO: 7702351031', 120, y);

        y += 6;
        doc.text('PARA TRÁMITE DE: Cambio de Vehículo', 15, y);
        doc.text('MUNICIPIO: ATOTONILCO DE TULA', 120, y);

        y += 6;
        doc.text('TIPO DE SERVICIO (MODALIDAD): PÚBLICO', 15, y);

        // Características
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', 115, 70, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 10;
        doc.text('MARCA: NISSAN', 15, y);
        doc.text('TIPO DE VEHÍCULO: SEDAN', 120, y);

        y += 6;
        doc.text('No. DE MOTOR: HIERAMBIST', 15, y);
        doc.text('SUBMARCA: VERSA', 120, y);

        y += 6;
        doc.text('IMAGEN CROMÁTICA: SI', 15, y);
        doc.text('No. DE OCUPANTES: 5', 120, y);

        y += 6;
        doc.text('MODELO: 2018', 15, y);
        doc.text('PLACA DELANTERA:', 120, y);

        y += 6;
        doc.text('No. DE SERIE: SHICHYAOLIKHSIS', 15, y);
        doc.text('PLACA TRASERA: NO', 120, y);

        y += 6;
        doc.text('PLACAS ASIG.: A787UZ', 15, y);
        doc.text('CALCOMANÍA DE VERIFICACIÓN: NO', 120, y);

        y += 6;
        doc.text('CALCOMANÍA DE LA TENENCIA: NO', 120, y);

        // Tabla compacta
        y += 10;
        const elementos1 = [
            ['PINTURA Y CARROCERÍA', 'BEN', 'CLAXON', 'SI', 'EXTINTOR', 'SI'],
            ['ESTADO DE LLANTAS', 'BEN', 'LUZ BAJA', 'BEN', 'HERRAMIENTA', 'SI'],
            ['DEFENSAS', 'NO', 'LUZ ALTA', 'BEN', 'SISTEMA DE FRENADO', 'SI'],
            ['VIDRIOS', 'NO', 'CUARTOS', 'BEN', 'SISTEMA DE DIRECCIÓN', 'SI'],
            ['LIMPIADORES', 'NO', 'DIRECCIONALES', 'BEN', 'SISTEMA DE SUSPENSIÓN', 'SI'],
            ['ESPEJOS', 'NO', 'INTERMITENTES', 'SI', 'INTERIORES', 'SI'],
            ['LLANTA DE REFACCIÓN', 'NO', 'STOP', 'SI', 'BOTIQUÍN', 'SI'],
            ['PARABRISAS MEDALLÓN', 'NO', 'TIMBRE', 'SI', 'CINTURÓN DE SEGURIDAD', 'SI']
        ];
        // Tabla con columnas que respetan margen lateral de 5 mm
        elementos1.forEach((row) => {
            doc.text(row[0], 15, y);     // Etiqueta 1
            doc.text(row[1], 80, y);     // Valor 1

            doc.text(row[2], 95, y);     // Etiqueta 2
            doc.text(row[3], 130, y);    // Valor 2

            doc.text(row[4], 145, y);    // Etiqueta 3
            doc.text(row[5], 200, y);    // Valor 3

            y += 6;
        });


        y += 2;
        doc.text('CUENTA ASEGURADORA: Guillén', 15, y);
        doc.text('NÚMERO DE PÓLIZA: 780000210', 80, y);
        doc.text('VIGENCIA: 19/06/2022', 150, y);

        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('CARACTERÍSTICAS VEHICULARES', 115, 180, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        y += 7;
        doc.text('No. DE MOTOR', 15, y);
        doc.text('No. DE SERIE', 120, y);
        y += 22;
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text('Exp 12-11-15-001-C', 50, y);

        // y += 22;
        doc.text('APROBADO: SI', 110, 212, { align: 'center' });

        y += 10;
        doc.setFontSize(9);
        doc.text('NOTA: NO CUMPLIR CON CUALQUIERA DE LOS PUNTOS ANTERIORES IMPLICA LA NO APROBACIÓN DE LA INSPECCIÓN VEHICULAR', 15, y, {
            maxWidth: 180,
        });

        y += 12;
        doc.setFontSize(10);
        doc.text('INSPECTOR', 45, y);
        doc.text('Ing. Erick San Agustín Velasco', 30, y + 5);
        doc.text('INTERESADO', 140, y);
        doc.text('AURELIO ACIANO GARCIA', 130, y + 5);

        doc.line(30, y + 15, 80, y + 15);
        doc.text('NOMBRE Y FIRMA', 40, y + 20);
        doc.line(130, y + 15, 180, y + 15);
        doc.text('NOMBRE Y FIRMA', 140, y + 20);

        y += 30;
        doc.setFontSize(9);
        doc.text('Av. de la Prensa No. 205, Col. L. García', 150, y);
        doc.text('Pachuca de Soto, Hidalgo, México', 158, y + 5);
        doc.text('Tel: 01 (771) 717 8000 ext. 1755', 160, y + 10);

        console.log('[PDF] PDF generado en una sola hoja');
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
