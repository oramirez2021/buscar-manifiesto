import { Injectable, Logger } from '@nestjs/common';
import { parseString } from 'xml2js';

interface GtimeDocument {
    tipo: string;
    version: string;
    valorDeclarado?: number;
    monedaValor?: string;
    parcial?: string;
    numeroReferencia?: string;
    unidadPeso?: string;
    tipoOperacion?: string;
    totalPeso?: number;
    tipoAccion?: string;
    totalBultos?: number;
    totalItem?: number;
    totalVolumen?: number;
    unidadVolumen?: string;
    participantes?: Participante[];
    fechas?: Fecha[];
    locaciones?: Locacion[];
    items?: Item[];
    referencias?: Referencia[];
}

interface Participante {
    nacionId?: string;
    valorId?: string;
    codigoPais?: string;
    direccion?: string;
    nombres?: string;
    nombre?: string;
    tipoId?: string;
    comuna?: string;
}

interface Fecha {
    valor: string;
    nombre: string;
}

interface Locacion {
    descripcion?: string;
    nombre?: string;
    codigo?: string;
}

interface Item {
    marcas?: string;
    numeroItem?: number;
    pesoBruto?: number;
    cantidad?: number;
    unidadPeso?: string;
    tipoBulto?: string;
    prodItem?: ProdItem[];
}

interface ProdItem {
    descripcion?: string;
    unidadMedida?: string;
    moneda?: string;
    cantidad?: number;
    valorDeclarado?: number;
}

interface Referencia {
    numero?: string;
    fecha?: string;
    tipoReferencia?: string;
    valorIdEmisor?: string;
    nacIdEmisor?: string;
    tipoIdEmisor?: string;
    emisor?: string;
    tipoDocumento?: string;
}

@Injectable()
export class PdfGeneratorService {
    private readonly logger = new Logger(PdfGeneratorService.name);

    async generatePdf(numeroReferencia: string, xml: string): Promise<Buffer> {
        try {
            this.logger.log(`Generando PDF para documento: ${numeroReferencia}`);

            const document = await this.parseXmlToDocument(xml);

            if (!this.isValidDocument(document)) {
                throw new Error('Documento no válido');
            }

            const html = this.generateHtml(document);
            const pdf = await this.htmlToPdf(html);

            this.logger.log(`PDF generado exitosamente para: ${numeroReferencia}`);
            return pdf;

        } catch (error) {
            this.logger.error('Error generando PDF:', error);
            throw error;
        }
    }

    private async parseXmlToDocument(xml: string): Promise<GtimeDocument> {
        return new Promise((resolve, reject) => {
            parseString(xml, { explicitArray: false }, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

        const doc = result.Documento || {};
        const attrs = doc.$ || {};
        const document: GtimeDocument = {
          tipo: attrs.tipo,
          version: attrs.version,
          valorDeclarado: this.parseNumber(doc['valor-declarado']),
          monedaValor: doc['moneda-valor'],
          parcial: doc.parcial,
          numeroReferencia: doc['numero-referencia'],
          unidadPeso: doc['unidad-peso'],
          tipoOperacion: doc['tipo-operacion'],
          totalPeso: this.parseNumber(doc['total-peso']),
          tipoAccion: doc['tipo-accion'],
          totalBultos: this.parseNumber(doc['total-bultos']),
          totalItem: this.parseNumber(doc['total-item']),
          totalVolumen: this.parseNumber(doc['total-volumen']),
          unidadVolumen: doc['unidad-volumen']
        };

                this.cargaParticipantes(result, document);
                this.cargaFechas(result, document);
                this.cargaLocaciones(result, document);
                this.cargaItems(result, document);
                this.cargaReferencias(result, document);

                console.log('Raw XML doc:', JSON.stringify(doc, null, 2));
                console.log('Document parsed:', JSON.stringify(document, null, 2));
                resolve(document);
            });
        });
    }

    private cargaParticipantes(result: any, document: GtimeDocument): void {
        try {
            if (result.Documento.Participaciones?.participacion) {
                const participaciones = Array.isArray(result.Documento.Participaciones.participacion)
                    ? result.Documento.Participaciones.participacion
                    : [result.Documento.Participaciones.participacion];

                document.participantes = participaciones.map((p: any) => {
                    const participante: any = {};

                    if (p.nombre) {
                        participante.nombre = p.nombre.trim();
                    }

                    if (p.nombres) {
                        participante.nombres = p.nombres.trim();
                    }

                    if (p['tipo-id']) {
                        participante.tipoId = p['tipo-id'].trim();
                    }

                    if (p['valor-id']) {
                        participante.valorId = p['valor-id'].trim();
                    }

                    if (p['nacion-id']) {
                        participante.nacionId = p['nacion-id'].trim();
                    }

                    if (p['codigo-pais']) {
                        participante.codigoPais = p['codigo-pais'].trim();
                    }

                    if (p.direccion) {
                        participante.direccion = p.direccion.trim();
                    }

                    if (p.comuna) {
                        participante.comuna = p.comuna.trim();
                    }

                    return participante;
                });
            }
        } catch (error) {
            this.logger.error('Error cargando participantes:', error);
        }
    }

    private cargaFechas(result: any, document: GtimeDocument): void {
        try {
            if (result.Documento.Fechas?.fecha) {
                const fechas = Array.isArray(result.Documento.Fechas.fecha)
                    ? result.Documento.Fechas.fecha
                    : [result.Documento.Fechas.fecha];

                document.fechas = fechas.map((f: any) => {
                    const fecha: any = {};

                    if (f.valor) {
                        fecha.valor = f.valor.trim();
                    }

                    if (f.nombre) {
                        fecha.nombre = f.nombre.trim();
                    }

                    return fecha;
                });
            }
        } catch (error) {
            this.logger.error('Error cargando fechas:', error);
        }
    }

    private cargaLocaciones(result: any, document: GtimeDocument): void {
        try {
            if (result.Documento.Locaciones?.locacion) {
                const locaciones = Array.isArray(result.Documento.Locaciones.locacion)
                    ? result.Documento.Locaciones.locacion
                    : [result.Documento.Locaciones.locacion];

                document.locaciones = locaciones.map((l: any) => {
                    const locacion: any = {};

                    if (l.descripcion) {
                        locacion.descripcion = l.descripcion.trim();
                    }

                    if (l.nombre) {
                        locacion.nombre = l.nombre.trim();
                    }

                    if (l.codigo) {
                        locacion.codigo = l.codigo.trim();
                    }

                    return locacion;
                });
            }
        } catch (error) {
            this.logger.error('Error cargando locaciones:', error);
        }
    }

    private cargaItems(result: any, document: GtimeDocument): void {
        try {
            if (result.Documento.Items?.item) {
                const items = Array.isArray(result.Documento.Items.item)
                    ? result.Documento.Items.item
                    : [result.Documento.Items.item];

                document.items = items.map((i: any) => {
                    const item: any = {};

                    if (i.marcas) {
                        item.marcas = i.marcas.trim();
                    }

                    if (i['numero-item']) {
                        try {
                            const numeroItem = i['numero-item'];
                            if (numeroItem != null) {
                                item.numeroItem = parseInt(numeroItem.trim());
                            } else {
                                item.numeroItem = null;
                            }
                        } catch (error) {
                            item.numeroItem = null;
                        }
                    }

                    if (i['peso-bruto']) {
                        try {
                            const pesoBruto = i['peso-bruto'];
                            if (pesoBruto != null) {
                                item.pesoBruto = parseFloat(pesoBruto.trim());
                            } else {
                                item.pesoBruto = null;
                            }
                        } catch (error) {
                            item.pesoBruto = null;
                        }
                    }

                    if (i.cantidad) {
                        try {
                            const cantidad = i.cantidad;
                            if (cantidad != null) {
                                item.cantidad = parseInt(cantidad.trim());
                            } else {
                                item.cantidad = null;
                            }
                        } catch (error) {
                            item.cantidad = null;
                        }
                    }

                    if (i['unidad-peso']) {
                        item.unidadPeso = i['unidad-peso'].trim();
                    }

                    if (i['tipo-bulto']) {
                        item.tipoBulto = i['tipo-bulto'].trim();
                    }

                    if (i.ProdItem?.proditem) {
                        const prodItems = Array.isArray(i.ProdItem.proditem)
                            ? i.ProdItem.proditem
                            : [i.ProdItem.proditem];

                        item.prodItem = prodItems.map((p: any) => {
                            const prodItem: any = {};

                            if (p.descripcion) {
                                prodItem.descripcion = p.descripcion.trim();
                            }

                            if (p['unidad-medida']) {
                                prodItem.unidadMedida = p['unidad-medida'].trim();
                            }

                            if (p.moneda) {
                                prodItem.moneda = p.moneda.trim();
                            }

                            if (p.cantidad) {
                                try {
                                    const cantidad = p.cantidad;
                                    if (cantidad != null) {
                                        prodItem.cantidad = parseInt(cantidad.trim());
                                    } else {
                                        prodItem.cantidad = null;
                                    }
                                } catch (error) {
                                    prodItem.cantidad = null;
                                }
                            }

                            if (p['valor-declarado']) {
                                try {
                                    const valorDeclarado = p['valor-declarado'];
                                    if (valorDeclarado != null) {
                                        prodItem.valorDeclarado = parseFloat(valorDeclarado.trim());
                                    } else {
                                        prodItem.valorDeclarado = null;
                                    }
                                } catch (error) {
                                    prodItem.valorDeclarado = null;
                                }
                            }

                            return prodItem;
                        });
                    }

                    return item;
                });
            }
        } catch (error) {
            this.logger.error('Error cargando items:', error);
        }
    }

    private cargaReferencias(result: any, document: GtimeDocument): void {
        try {
            if (result.Documento.Referencias?.referencia) {
                const referencias = Array.isArray(result.Documento.Referencias.referencia)
                    ? result.Documento.Referencias.referencia
                    : [result.Documento.Referencias.referencia];

                document.referencias = referencias.map((r: any) => {
                    const referencia: any = {};

                    if (r.numero) {
                        referencia.numero = r.numero.trim();
                    }

                    if (r.fecha) {
                        referencia.fecha = r.fecha.trim();
                    }

                    if (r['tipo-referencia']) {
                        referencia.tipoReferencia = r['tipo-referencia'].trim();
                    }

                    if (r['valor-id-emisor']) {
                        referencia.valorIdEmisor = r['valor-id-emisor'].trim();
                    }

                    if (r['nac-id-emisor']) {
                        referencia.nacIdEmisor = r['nac-id-emisor'].trim();
                    }

                    if (r['tipo-id-emisor']) {
                        referencia.tipoIdEmisor = r['tipo-id-emisor'].trim();
                    }

                    if (r.emisor) {
                        referencia.emisor = r.emisor.trim();
                    }

                    if (r['tipo-documento']) {
                        referencia.tipoDocumento = r['tipo-documento'].trim();
                    }

                    return referencia;
                });
            }
        } catch (error) {
            this.logger.error('Error cargando referencias:', error);
        }
    }

    private parseNumber(value: string): number | undefined {
        if (!value || value.trim() === '') return undefined;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
    }

    private isValidDocument(document: GtimeDocument): boolean {
        console.log('Validating document:', {
            tipo: document.tipo,
            tipoAccion: document.tipoAccion,
            numeroReferencia: document.numeroReferencia
        });

        const isValid = document.tipo === 'GTIME' &&
            document.tipoAccion !== 'N' &&
            document.numeroReferencia !== undefined;

        console.log('Document is valid:', isValid);
        return isValid;
    }

    private generateHtml(document: GtimeDocument): string {
        const fechaActual = new Date().toLocaleString('es-CL');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            font-size: 8pt; 
            margin: 0; 
            padding: 10px; 
            line-height: 1.2;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 15px; 
        }
        .title { 
            text-align: center; 
            font-size: 12pt; 
            font-weight: bold; 
        }
        .main-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 10px; 
        }
        .main-table td { 
            border: 1px solid #000; 
            padding: 3px; 
            vertical-align: top; 
        }
        .header-cell { 
            background-color: #CDCDCD; 
            font-weight: bold; 
            text-align: center; 
        }
        .section-title { 
            background-color: #CDCDCD; 
            font-weight: bold; 
            text-align: center; 
            font-size: 9pt; 
        }
        .nested-table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        .nested-table td { 
            border: 1px solid #000; 
            padding: 2px; 
            vertical-align: top; 
        }
        .no-border { 
            border: none !important; 
        }
        .text-bold { 
            font-weight: bold; 
        }
        .text-center { 
            text-align: center; 
        }
        .small-text { 
            font-size: 7pt; 
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">GUÍA TIME</div>
        <div class="small-text">Fecha: ${fechaActual}</div>
    </div>

    <table class="main-table">
        <tr>
            <td class="header-cell" style="width: 50%;">EMISOR</td>
            <td class="header-cell" style="width: 50%;">GUÍA COURIER</td>
        </tr>
        <tr>
            <td class="no-border">
                <table class="nested-table">
                    <tr>
                        <td class="header-cell">Emisor</td>
                    </tr>
                    <tr>
                        <td>${this.getEmisor(document)}</td>
                    </tr>
                </table>
            </td>
            <td class="no-border">
                <table class="nested-table">
                    <tr>
                        <td class="header-cell">Guía Courier</td>
                        <td class="header-cell">Manifiesto</td>
                    </tr>
                    <tr>
                        <td class="text-bold">${document.numeroReferencia}</td>
                        <td class="text-bold">${this.getManifiesto(document)}</td>
                    </tr>
                    <tr>
                        <td class="header-cell">Fecha Emisión</td>
                        <td class="header-cell">Fecha Zarpe</td>
                    </tr>
                    <tr>
                        <td>${this.getFechaEmision(document)}</td>
                        <td>${this.getFechaZarpe(document)}</td>
                    </tr>
                    <tr>
                        <td class="header-cell">Sentido</td>
                        <td class="header-cell">Vuelo</td>
                    </tr>
                    <tr>
                        <td>${this.getSentido(document)}</td>
                        <td>${this.getVuelo(document)}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="main-table">
        <tr>
            <td class="section-title" colspan="4">PARTICIPANTES:</td>
        </tr>
        <tr>
            <td class="header-cell" style="width: 25%;">Emisor Documento</td>
            <td class="header-cell" style="width: 25%;">Consignante</td>
            <td class="header-cell" style="width: 25%;">Consignatario</td>
            <td class="header-cell" style="width: 25%;">Almacenista</td>
        </tr>
        <tr>
            <td>${this.getEmisorData(document)}</td>
            <td>${this.getConsignanteData(document)}</td>
            <td>${this.getConsignatarioData(document)}</td>
            <td>${this.getAlmacenistaData(document)}</td>
        </tr>
    </table>

    <table class="main-table">
        <tr>
            <td class="section-title" colspan="6">LOCACIONES</td>
        </tr>
        <tr>
            <td class="header-cell">Puerto Embarque</td>
            <td class="header-cell">Puerto Desembarque</td>
            <td class="header-cell">Fecha Emisión</td>
            <td class="header-cell">Fecha Zarpe</td>
            <td class="header-cell">Sentido</td>
            <td class="header-cell">Vuelo</td>
        </tr>
        <tr>
            <td>${this.getPuertoEmbarque(document)}</td>
            <td>${this.getPuertoDesembarque(document)}</td>
            <td>${this.getFechaEmision(document)}</td>
            <td>${this.getFechaZarpe(document)}</td>
            <td>${this.getSentido(document)}</td>
            <td>${this.getVuelo(document)}</td>
        </tr>
    </table>

    <table class="main-table">
        <tr>
            <td class="section-title" colspan="6">ITEMS</td>
        </tr>
        <tr>
            <td class="header-cell">Item</td>
            <td class="header-cell">Marcas</td>
            <td class="header-cell">Descripción</td>
            <td class="header-cell">Cantidad</td>
            <td class="header-cell">Peso</td>
            <td class="header-cell">Valor</td>
        </tr>
        ${this.getItemsRows(document)}
    </table>

    <table class="main-table">
        <tr>
            <td class="header-cell">TOTAL BULTOS</td>
            <td class="header-cell">TOTAL PESO</td>
            <td class="header-cell">TOTAL VALOR</td>
        </tr>
        <tr>
            <td class="text-center text-bold">${document.totalBultos || 0}</td>
            <td class="text-center text-bold">${document.totalPeso || 0} ${document.unidadPeso || ''}</td>
            <td class="text-center text-bold">${document.valorDeclarado || 0} ${document.monedaValor || ''}</td>
        </tr>
    </table>
</body>
</html>`;
    }

    private getEmisor(document: GtimeDocument): string {
        const emisor = document.participantes?.find(p => p.nombre === 'EMI');
        return emisor ? `${emisor.nombres || ''}\n[${emisor.tipoId || ''}] ${emisor.valorId || ''}` : '';
    }

    private getManifiesto(document: GtimeDocument): string {
        const manifiesto = document.referencias?.find(r => r.tipoDocumento === 'MFTOC');
        return manifiesto?.numero || '';
    }

    private getEmisorData(document: GtimeDocument): string {
        const emisor = document.participantes?.find(p => p.nombre === 'EMI');
        return emisor ? `${emisor.codigoPais ? `[${emisor.codigoPais}] ` : ''}${emisor.nombres || ''}\n[${emisor.tipoId || ''}] ${emisor.valorId || ''}` : '';
    }

    private getConsignanteData(document: GtimeDocument): string {
        const consignante = document.participantes?.find(p => p.nombre === 'CNTE');
        return consignante ? `${consignante.codigoPais ? `[${consignante.codigoPais}] ` : ''}${consignante.nombres || ''}\n[${consignante.tipoId || ''}] ${consignante.valorId || ''}` : '';
    }

    private getConsignatarioData(document: GtimeDocument): string {
        const consignatario = document.participantes?.find(p => p.nombre === 'CONS');
        return consignatario ? `${consignatario.codigoPais ? `[${consignatario.codigoPais}] ` : ''}${consignatario.nombres || ''}\n[${consignatario.tipoId || ''}] ${consignatario.valorId || ''}` : '';
    }

    private getAlmacenistaData(document: GtimeDocument): string {
        const almacenista = document.participantes?.find(p => p.nombre === 'TRA');
        return almacenista ? `${almacenista.codigoPais ? `[${almacenista.codigoPais}] ` : ''}${almacenista.nombres || ''}\n[${almacenista.tipoId || ''}] ${almacenista.valorId || ''}` : '';
    }

    private getPuertoEmbarque(document: GtimeDocument): string {
        const puerto = document.locaciones?.find(l => l.nombre === 'PE');
        return puerto ? `${puerto.codigo || ''}, ${puerto.descripcion || ''}` : '';
    }

    private getPuertoDesembarque(document: GtimeDocument): string {
        const puerto = document.locaciones?.find(l => l.nombre === 'PD');
        return puerto ? `${puerto.codigo || ''}, ${puerto.descripcion || ''}` : '';
    }

    private getFechaEmision(document: GtimeDocument): string {
        const fecha = document.fechas?.find(f => f.nombre === 'FEM');
        return fecha?.valor || '';
    }

    private getFechaZarpe(document: GtimeDocument): string {
        const fecha = document.fechas?.find(f => f.nombre === 'FZARPE');
        return fecha?.valor || '';
    }

    private getSentido(document: GtimeDocument): string {
        const sentido = document.tipoOperacion === 'I' ? 'IMPORTACIÓN' : 'EXPORTACIÓN';
        return `[${document.tipoOperacion || ''}] ${sentido}`;
    }

    private getVuelo(document: GtimeDocument): string {
        return document.referencias?.[0]?.numero || '';
    }

    private getItemsRows(document: GtimeDocument): string {
        if (!document.items) return '';

        return document.items.map(item => `
      <tr>
        <td>${item.numeroItem || ''}</td>
        <td>${item.marcas || ''}</td>
        <td>${item.prodItem?.[0]?.descripcion || ''}</td>
        <td class="text-center">${item.cantidad || 0}</td>
        <td class="text-center">${item.pesoBruto || 0} ${item.unidadPeso || ''}</td>
        <td class="text-center">${item.prodItem?.[0]?.valorDeclarado || 0} ${item.prodItem?.[0]?.moneda || ''}</td>
      </tr>
    `).join('');
    }

    private async htmlToPdf(html: string): Promise<Buffer> {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        return pdf;
    }
}
