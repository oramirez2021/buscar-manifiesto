import { Injectable, Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';

// Constantes del código Java original
const TIPO_COURIER_CN = 'CN';
const TIPO_COURIER_CT = 'CT';
const TIPO_COURIER_EXTERNO = 'EXTERNO';
const CONFORMADO_SI = 'SI';
const PEND_VISADO = 'PEND';
const VISADO_SI = 'SI';
const NCMP_VISADO = 'NCMP';
const TODOS_VISADO = 'TODOS';

// Constantes de configuración
const MAX_ROWS = 1000;
const MAX_TEST_ROWS = 10;
const DEFAULT_DATE = '31-12-2003';
const ORACLE_DATE_FORMAT = 'dd-mm-yyyy';

// Interfaces TypeScript
interface OracleRow {
  ID: number;
  NUMEROEXTERNO: string;
  EMISOR: string;
  NUMEROREFERENCIAORIGINAL?: string;
  FECHACREACION: Date;
  PUERTOEMBARQUE?: string;
  PUERTODESEMBARQUE?: string;
  FECHAACEPTACION: Date;
  FECHACONFORMADO?: Date;
  SFECHAACEPTACION?: string;
  TOTALGUIAS?: number;
  TOTALPESO?: number;
  TOTALMONTO?: number;
  TOTALGUIASMARCADAS?: number;
  TOTALGUIASMAS30?: number;
  ESCONFORMADO?: string;
  ESVISADO?: string;
  XML?: string;
  MADREREFERENCIADA?: string;
  MICREFERENCIADO?: string;
  CRTREFERENCIADO?: string;
  VIAJE?: string;
  // Campos adicionales para compatibilidad
  GUIA_NUMEROEXTERNO?: string;
  NUMEROACEPTACION?: string;
  fechaconformado?: string;
  esVisado?: string;
}

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);
  private oracleInitialized = false;

  constructor() {
    this.initializeOracle();
  }

  private initializeOracle() {
    if (this.oracleInitialized) return;

    try {
      // Configurar variables de entorno desde configuración
      const oracleHome = process.env.ORACLE_HOME;
      const ldLibraryPath = process.env.LD_LIBRARY_PATH;

      if (!oracleHome) {
        throw new Error('ORACLE_HOME environment variable is not set');
      }

      this.logger.log('🔧 Configuring Oracle environment variables:');
      this.logger.log(`  ORACLE_HOME: ${oracleHome}`);
      this.logger.log(`  LD_LIBRARY_PATH: ${ldLibraryPath || 'not set'}`);

      // Verificar que las librerías existen
      const fs = require('fs');
      const libPath = `${oracleHome}/libnnz21.so`;
      if (!fs.existsSync(libPath)) {
        throw new Error(`Oracle library not found at ${libPath}. Please ensure Oracle Instant Client is properly installed.`);
      }
      this.logger.log('✅ Oracle libraries found');

      // Forzar modo Thick con configuración completa
      oracledb.initOracleClient({
        libDir: oracleHome,
        configDir: oracleHome
      });
      this.oracleInitialized = true;
      this.logger.log('✅ Oracle client initialized in Thick mode during service construction');
    } catch (error) {
      if (error.message.includes('already initialized')) {
        this.oracleInitialized = true;
        this.logger.log('⚠️  Oracle client already initialized');
      } else {
        this.logger.error('❌ Failed to initialize Oracle client:', error.message);
        // Intentar de nuevo con configuración mínima
        try {
          const oracleHome = process.env.ORACLE_HOME;
          if (!oracleHome) {
            throw new Error('ORACLE_HOME environment variable is not set');
          }
          oracledb.initOracleClient({ libDir: oracleHome });
          this.oracleInitialized = true;
          this.logger.log('✅ Oracle client initialized with minimal config');
        } catch (retryError) {
          this.logger.error('❌ Failed to initialize Oracle client on retry:', retryError.message);
          this.logger.error('🔧 Please ensure Oracle Instant Client is installed and ORACLE_HOME is set');
          throw new Error(`Oracle initialization failed: ${retryError.message}`);
        }
      }
    }
  }

  private async getConnection(): Promise<oracledb.Connection> {
    // Verificar que Oracle esté inicializado en modo Thick
    if (!this.oracleInitialized) {
      this.logger.warn('Oracle not initialized, attempting to initialize now...');
      this.initializeOracle();
    }

    this.logger.log('Creating Oracle connection...');

    // Validar variables de entorno requeridas
    const dbUsername = process.env.DB_USERNAME;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || '1521';
    const dbName = process.env.DB_NAME;

    if (!dbUsername || !dbPassword || !dbHost || !dbName) {
      throw new Error('Missing required database environment variables: DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME');
    }

    try {
      const connection = await oracledb.getConnection({
        user: dbUsername,
        password: dbPassword,
        connectString: `${dbHost}:${dbPort}/${dbName}`
      });

      this.logger.log('✅ Successfully connected to Oracle database');
      this.logger.log(`   - Oracle version: ${connection.oracleServerVersionString}`);
      return connection;
    } catch (error) {
      this.logger.error('❌ Failed to connect to Oracle database:', error.message);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async consultaMftocGTIME(
    emisor?: number,
    fechaInicio?: string,
    fechaTermino?: string,
    visado?: string,
    tipoCourier?: string,
    nroManifiesto?: string,
    nroGuia?: string,
    nombrePersona?: string,
    pageCode?: string
  ) {
    try {
      this.logger.log('🔍 Usando consulta completa equivalente a Fisc_ConsultaMFTOC_GTIME');
      let result: any[] = [];
      const filteredRows = [];
      this.logger.log(`📊 Registros obtenidos de Oracle: ${result.length}`);

      // Si hay número de manifiesto específico, devolver directamente sin filtros adicionales
      if (nroManifiesto && nroManifiesto.trim() !== '') {

        // Usar el nuevo método completo que replica la función del PKB
        result = await this.consultaMftocGTIMECompleta(
          fechaInicio,
          fechaTermino,
          nroManifiesto,
          emisor,
          nroGuia,
          visado,
          tipoCourier,
          nombrePersona,
          pageCode
        );

        const processedRows = [];

        for (const row of result) {
          const processedRow = this.mapConsultaMFTOCDirect(
            row
          );
          const estaConformado = this.nvl((row as any).ESCONFORMADO || 'NO');
          const estaVisado = this.nvl((row as any).ESVISADO || 'PEND');
          const madrereferenciada = (row as any).MADREREFERENCIADA;
          const micreferenciado = (row as any).MICREFERENCIADO;
          const crtreferenciado = (row as any).CRTREFERENCIADO;

          // Aplicar filtros según el tipo de courier
          if ((tipoCourier === TIPO_COURIER_CN && micreferenciado) ||
            (tipoCourier === TIPO_COURIER_CT && madrereferenciada)) {
            continue;
          }
          // Aplicar filtros según el estado de visado
          if ((estaConformado !== CONFORMADO_SI && visado === NCMP_VISADO) ||
            (estaConformado === CONFORMADO_SI && visado === PEND_VISADO && estaVisado !== VISADO_SI) ||
            (estaVisado === VISADO_SI && visado === VISADO_SI) ||
            visado === TODOS_VISADO) {
            processedRows.push(processedRow);
          }
        }

        this.logger.log(`✅ Procesamiento directo completado: ${processedRows.length} registros finales`);
        return processedRows;
      } else {
        // Solo aplicar filtros cuando se busca por fechas

        for (const row of result) {
          const estaConformado = this.nvl((row as any).esConformado || 'NO');
          const estaVisado = this.nvl((row as any).esVisado || 'PEND');
          const madrereferenciada = (row as any).madrereferenciada;
          const micreferenciado = (row as any).micreferenciado;
          const crtreferenciado = (row as any).crtreferenciado;

          // Aplicar filtros según el tipo de courier
          if ((tipoCourier === TIPO_COURIER_CN && micreferenciado) ||
            (tipoCourier === TIPO_COURIER_CT && madrereferenciada)) {
            continue;
          }

          // Aplicar filtros según el estado de visado
          if ((estaConformado !== CONFORMADO_SI && visado === NCMP_VISADO) ||
            (estaConformado === CONFORMADO_SI && visado === PEND_VISADO && estaVisado !== VISADO_SI) ||
            (estaVisado === VISADO_SI && visado === VISADO_SI) ||
            visado === TODOS_VISADO) {

            const processedRow = this.mapConsultaMFTOCDirect(
              row
            );
            filteredRows.push(processedRow);
          }
        }
      }

      this.logger.log(`✅ Filtrado completado: ${filteredRows.length} registros finales`);
      return filteredRows;

    } catch (error) {
      this.logger.error('❌ Error in consultaMftocGTIME:', error);
      throw error;
    }
  }

  async testBasicQuery(numeroExterno?: string) {
    try {
      this.logger.log('Executing basic test query');

      const connection = await this.getConnection();

      if (!connection) {
        throw new Error('No se pudo establecer conexión con Oracle');
      }

      try {
        // Consulta simple a una tabla que sabemos que existe
        let query = `
          SELECT 
            m.ID,
            m.NUMEROEXTERNO,
            m.EMISOR,
            m.ACTIVO
          FROM DOCUMENTOS.DOCDOCUMENTOBASE m
          WHERE m.TIPODOCUMENTO = 'MFTOC'
            AND m.ACTIVO = 'S'
        `;

        // Agregar filtro por número externo si se proporciona
        if (numeroExterno && numeroExterno.trim() !== '') {
          query += ` AND UPPER(m.NUMEROEXTERNO) LIKE UPPER('%${numeroExterno}%')`;
        }

        query += ` AND ROWNUM <= 10`;

        const result = await connection.execute(query);
        const simpleData = [];

        for (const row of result.rows) {
          const rowData = {};
          result.metaData.forEach((col, index) => {
            rowData[col.name] = row[index];
          });
          console.log('XML omar: ', rowData['XML']);
          simpleData.push({
            id: (rowData as any).ID,
            numero: (rowData as any).NUMEROEXTERNO,
            emisor: (rowData as any).EMISOR,
            activo: (rowData as any).ACTIVO
          });
        }

        this.logger.log(`Returning ${simpleData.length} basic records from Oracle`);
        return simpleData;

      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (closeError) {
            this.logger.error('Error closing Oracle connection:', closeError);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error in testBasicQuery:', error);
      throw error;
    }
  }


  private buildDirectQuery(
    fechaInicio?: string,
    fechaTermino?: string,
    nroManifiesto?: string,
    emisor?: number,
    nroGuia?: string
  ): string {
    let query = `
      SELECT 
        m.ID,
        m.NUMEROEXTERNO,
        m.NUMEROACEPTACION,
        m.FECHACREACION,
        m.FECHAEMISION,
        m.ACTIVO,
        m.TIPODOCUMENTO,
        m.EMISOR,
        m.IDEMISOR,
        g.NUMEROEXTERNO as GUIA_NUMEROEXTERNO,
        g.NUMEROACEPTACION as GUIA_NUMEROACEPTACION,
        g.ID as GUIA_ID,
        f.IDDOCUMENTO,
        f.CODIGOOPFISCMOTIVOMARCA,
        f.FECHAMARCACION,
        f.ACTIVA as MARCA_ACTIVA,
        CASE 
          WHEN f.CODIGOOPFISCMOTIVOMARCA = 'F' THEN 'SI'
          ELSE 'NO'
        END as esConformado,
        CASE 
          WHEN f.ACTIVA = 'S' THEN 'SI'
          ELSE 'PEND'
        END as esVisado,
        '' as madrereferenciada,
        '' as micreferenciado,
        '' as crtreferenciado
      FROM DOCUMENTOS.DOCDOCUMENTOBASE m
      LEFT JOIN DOCUMENTOS.DOCDOCUMENTOBASE g ON g.NUMEROACEPTACION = m.NUMEROACEPTACION AND g.TIPODOCUMENTO = 'GTIME' AND g.ACTIVO = 'S'
      LEFT JOIN FISCALIZACIONES.OPFISCMARCA f ON f.IDDOCUMENTO = g.ID
      WHERE m.TIPODOCUMENTO = 'MFTOC'
        AND m.ACTIVO = 'S'
    `;

    // Agregar filtros según los parámetros
    if (nroManifiesto && nroManifiesto.trim() !== '') {
      query += ` AND UPPER(m.NUMEROEXTERNO) LIKE UPPER('%${nroManifiesto}%')`;
    } else if (fechaInicio && fechaTermino) {
      // Convertir fechas al formato correcto para Oracle
      const fechaInicioOracle = this.convertToOracleDate(fechaInicio);
      const fechaTerminoOracle = this.convertToOracleDate(fechaTermino);
      query += ` AND m.FECHACREACION >= TO_DATE('${fechaInicioOracle}', 'DD/MM/YYYY')`;
      query += ` AND m.FECHACREACION <= TO_DATE('${fechaTerminoOracle}', 'DD/MM/YYYY')`;
    }

    if (nroGuia && nroGuia.trim() !== '') {
      query += ` AND UPPER(g.NUMEROEXTERNO) LIKE UPPER('%${nroGuia}%')`;
    }

    if (emisor && emisor > 0) {
      query += ` AND m.IDEMISOR = ${emisor}`;
    }

    query += ` AND ROWNUM <= ${MAX_ROWS}`;

    return query;
  }

  private mapConsultaMFTOCDirect(
    row: OracleRow,

  ) {
    const micreferenciado = row.MICREFERENCIADO
    const madrereferenciada = row.MADREREFERENCIADA
    const crtreferenciado = row.CRTREFERENCIADO
    const tipoRef = micreferenciado ? 'Courier Terrestre' : 'Courier Normal';
    const master = micreferenciado || madrereferenciada;

    return {
      Oid: {
        Id: row.ID
      },
      NroReferencia: this.nvl(row.NUMEROEXTERNO),
      tipoRef: tipoRef,
      NroGuiaMaster: this.nvl(master),
      NroVuelo: this.nvl(row.VIAJE),
      CiaCourier: this.nvl(row.EMISOR),
      CiaTransporte: this.nvl(row.EMISOR),
      NroGuiasAsociadas: 0,
      PesoGuias: this.nvl(row.TOTALPESO),
      ValorTotal: this.nvl(row.TOTALMONTO),
      PuertoEmbarque: this.nvl(''), // No disponible en estas tablas
      PuertoDesembarque: this.nvl(''), // No disponible en estas tablas
      FechaAceptacion: row.FECHACREACION ? row.FECHACREACION.toISOString() : null,
      FechaAceptacionFormateada: this.formatDateString(row.FECHACREACION),
      FechaConformado: row.FECHACONFORMADO ? row.FECHACONFORMADO.toISOString() : null,
      FechaConformadoFormateada: this.formatDateString(row.FECHACONFORMADO),
      TotalGuias: parseInt(this.nvl(row.TOTALGUIAS)) || 0,
      TotalGuiasMarcadas: parseInt(this.nvl(row.TOTALGUIASMARCADAS)) || 0,
      TotalGuiasMas30: parseInt(this.nvl(row.TOTALGUIASMAS30)) || 0,
      EstaVisado: this.nvl(row.esVisado) || 'NO',
      NroRefOriginal: this.nvl(row.NUMEROACEPTACION),
      Consolidado: this.nvl(row.ESCONFORMADO),
      crtreferenciado: this.nvl(crtreferenciado),
      observacion: this.nvl('')
    };
  }

  private nvl(value: any): string {
    return value || '';
  }

  private formatDate(dateString: string): string {
    // Convertir de YYYY-MM-DD a DD/MM/YYYY
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private convertToOracleDate(dateString: string): string {
    if (!dateString) {
      throw new Error('Date string is required');
    }

    // Asegurar que la fecha esté en formato DD/MM/YYYY
    if (dateString.includes('/')) {
      return dateString; // Ya está en formato correcto
    }

    // Si está en formato YYYY-MM-DD, convertir a DD/MM/YYYY
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    return dateString;
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString) return false;

    // Validar formato DD/MM/YYYY o DD-MM-YYYY
    const dateRegex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) return false;

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.getFullYear() == parseInt(year) &&
      date.getMonth() == parseInt(month) - 1 &&
      date.getDate() == parseInt(day);
  }

  private formatDateString(date: any): string {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';

      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      this.logger.warn('Error formatting date:', error);
      return '';
    }
  }

  private buildDirectQueryFallback(numeroExterno: string): string {
    return `
      SELECT 
        m.ID,
        m.NUMEROEXTERNO,
        m.EMISOR,
        m.FECHACREACION,
        m.ACTIVO,
        m.TIPODOCUMENTO,
        m.IDEMISOR,
        NVL((SELECT dtm.numeroreferenciaoriginal
              FROM doctransporte.doctranmanifiesto dtm
             WHERE dtm.id = m.id), '') numeroreferenciaoriginal,
        NVL((SELECT dtm.viaje
              FROM doctransporte.doctranmanifiesto dtm
             WHERE dtm.id = m.id), '') viaje,
        NVL((SELECT locacion
              FROM documentos.doclocaciondocumento a
             WHERE a.documento = m.id
               AND a.activa = 'S'
               AND a.tipolocacion = 'PE'), '') puertoembarque,
        NVL((SELECT locacion
              FROM documentos.doclocaciondocumento a
             WHERE a.documento = m.id
               AND a.activa = 'S'
               AND a.tipolocacion = 'PD'), '') puertodesembarque,
        m.fechacreacion fechaaceptacion,
        TO_CHAR(m.fechacreacion, 'dd-mm-yyyy hh24:mi') sfechaaceptacion,
        NVL((SELECT 'SI'
              FROM documentos.docestados est
             WHERE m.tipodocumento = est.tipodocumento
               AND m.id = est.documento
               AND est.tipoestado = 'CMP'
               AND est.activa = 'S'
               AND ROWNUM = 1), 'NO') esConformado,
        NVL((SELECT 'SI'
              FROM documentos.docestados est
             WHERE m.tipodocumento = est.tipodocumento
               AND m.id = est.documento
               AND est.tipoestado = 'VIS'
               AND est.activa = 'S'
               AND ROWNUM = 1), 'NO') esVisado,
        '' as madrereferenciada,
        '' as micreferenciado,
        '' as crtreferenciado,
        0 as totalguias,
        0 as totalpeso,
        0 as totalmonto,
        0 as totalGuiasMarcadas,
        0 as totalguiasmas30,
        NULL as xml
      FROM documentos.docdocumentobase m
      WHERE m.tipodocumento = 'MFTOC'
        AND m.activo = 'S'
        AND UPPER(m.numeroexterno) LIKE UPPER('%${numeroExterno}%')
      AND ROWNUM <= ${MAX_TEST_ROWS}
    `;
  }

  async testBasicQuery3(numeroExterno?: string) {
    let connection;
    try {
      this.logger.log('🔍 Iniciando testBasicQuery3 con stored procedure nativo');
      connection = await this.getConnection();

      let query: string;
      let params: any[] = [];

      if (numeroExterno) {
        // Usar la función Oracle original Fisc_ConsultaMFTOC_GTIME
        query = `BEGIN :cursor := DOCUMENTOS.COURIER_CONSULTAS.Fisc_ConsultaMFTOC_GTIME(
        :fechaDesde, :fechaHasta, :numeroManifiesto, :idEmisor, :nroGuia
      ); END;`;

        const fechaHoy = new Date().toLocaleDateString('es-ES');
        params = [
          { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
          fechaHoy, // fechaDesde
          fechaHoy, // fechaHasta  
          numeroExterno, // numeroManifiesto
          0, // idEmisor
          null // nroGuia
        ];
      } else {
        // Query directa simple para obtener registros básicos
        query = `SELECT ID, NUMEROEXTERNO, EMISOR, FECHACREACION 
                 FROM DOCUMENTOS.DOCDOCUMENTOBASE 
                 WHERE ROWNUM <= 10`;
      }

      this.logger.log(`📝 Ejecutando query: ${query}`);
      this.logger.log(`📝 Parámetros: ${JSON.stringify(params)}`);

      let result;
      if (numeroExterno) {
        try {
          // Intentar usar la función Oracle original
          result = await connection.execute(query, params);
          const cursor = result.outBinds[0];
          const rows = await cursor.getRows(10);
          await cursor.close();

          // MANEJAR EL XMLTYPE PROBLEMÁTICO EN JAVASCRIPT
          const processedRows = rows.map(row => {
            const newRow = [...row];
            // El campo XMLTYPE está en la posición 17 (según el contexto)
            if (newRow[17] && typeof newRow[17].getStringVal === 'function') {
              try {
                // Convertir XMLTYPE a string
                newRow[17] = newRow[17].getStringVal();
              } catch (xmlError) {
                // Si falla la conversión, usar null
                newRow[17] = null;
              }
            }
            return newRow;
          });

          return processedRows;
        } catch (xmlError) {
          if (xmlError.code === 'ORA-00932') {
            // Si falla por XMLTYPE, usar consulta directa como fallback
            this.logger.warn('⚠️ XMLTYPE error detected, using direct query fallback');
            const fallbackQuery = this.buildDirectQueryFallback(numeroExterno);
            result = await connection.execute(fallbackQuery);
            return result.rows;
          }
          throw xmlError;
        }
      } else {
        // Query directa
        result = await connection.execute(query);
        return result.rows;
      }

    } catch (error) {
      this.logger.error('❌ Error en testBasicQuery3:', error);
      throw error;
    } finally {
      try {
        if (connection) {
          await connection.close();
          this.logger.log('✅ Conexión cerrada en testBasicQuery3');
        }
      } catch (closeError) {
        this.logger.warn('⚠️ Error cerrando conexión:', closeError);
      }
    }
  }

  async gtimeGetMarcasAsString(idgtime: number): Promise<string> {
    let connection;
    try {
      this.logger.log(`🔍 Ejecutando gtime_getmarcasasstring para idgtime: ${idgtime}`);
      connection = await this.getConnection();

      // Llamar directamente a la función Oracle
      const query = `SELECT DOCUMENTOS.COURIER_CONSULTAS.gtime_getmarcasasstring(:idgtime) as marcas FROM DUAL`;

      this.logger.log(`📝 Ejecutando query: ${query}`);
      this.logger.log(`📝 Parámetro idgtime: ${idgtime}`);

      const result = await connection.execute(query, [idgtime]);

      if (result.rows && result.rows.length > 0) {
        const marcas = result.rows[0][0];
        this.logger.log(`✅ Marcas obtenidas: ${marcas}`);
        return marcas || '';
      }

      return '';

    } catch (error) {
      this.logger.error('❌ Error en gtimeGetMarcasAsString:', error);
      throw error;
    } finally {
      try {
        if (connection) {
          await connection.close();
          this.logger.log('✅ Conexión cerrada en gtimeGetMarcasAsString');
        }
      } catch (closeError) {
        this.logger.warn('⚠️ Error cerrando conexión:', closeError);
      }
    }
  }

  async consultaMftocGTIMECompleta(
    fechaDesde?: string,
    fechaHasta?: string,
    nroManifiesto?: string,
    idEmisor?: number,
    nroGuia?: string,
    visado?: string,
    tipoCourier?: string,
    nombrePersona?: string,
    pageCode?: string
  ) {
    // Validar parámetros de entrada
    if (fechaDesde && !this.isValidDate(fechaDesde)) {
      throw new Error('Invalid fechaDesde format. Expected DD/MM/YYYY or DD-MM-YYYY');
    }
    if (fechaHasta && !this.isValidDate(fechaHasta)) {
      throw new Error('Invalid fechaHasta format. Expected DD/MM/YYYY or DD-MM-YYYY');
    }
    let connection;
    try {
      this.logger.log('🔍 Ejecutando consulta completa Fisc_ConsultaMFTOC_GTIME equivalente');
      connection = await this.getConnection();

      // Convertir fechas - usar parámetros bind para evitar SQL injection
      const v_fechadesde = fechaDesde || DEFAULT_DATE;
      const v_fechahasta = fechaHasta || null;

      // Query equivalente a Fisc_ConsultaMFTOC_GTIME sin XMLTYPE
      const query = `
        SELECT MFTOC.id,
               MFTOC.numeroexterno,
               MFTOC.emisor,
               MFTOC.numeroreferenciaoriginal,
               MFTOC.fechacreacion,
               MFTOC.puertoembarque,
               MFTOC.puertodesembarque,
               MFTOC.fechacreacion fechaaceptacion,
               MFTOC.fechaconformado,
               TO_CHAR(MFTOC.fechacreacion, 'dd-mm-yyyy hh24:mi') sfechaaceptacion,
               COALESCE(MFTOC.totalguias, 0) totalguias,
               COALESCE(MFTOC.totalpeso, 0) totalpeso,
               COALESCE(MFTOC.totalmonto, 0) totalmonto,
               COALESCE(MFTOC.totalGuiasMarcadas, 0) totalGuiasMarcadas,
               MFTOC.totalguiasmas30,
               MFTOC.esConformado,
               COALESCE(CASE
                 WHEN (select count(*)
                         from DOCUMENTOS.docestados
                        WHERE (documento = MFTOC.id AND
                              TIPODOCUMENTO = 'MFTOC' AND tipoestado = 'VIS')) > 0 THEN
                   'SI'
                 ELSE
                   'NO'
               END, 'NO') esVisado,
               -- Campos XML reemplazados por strings vacíos
               '' as xml,
               -- AQUI CAMBIÉ: Solo los campos extraídos, sin el XML completo
               EXTRACTVALUE(XMLTYPE(DI.xml), '//Referencias/referencia[tipo-documento=''GA'']/numero/text()') as madrereferenciada,
               EXTRACTVALUE(XMLTYPE(DI.xml), '//Referencias/referencia[tipo-documento=''MIC'']/numero/text()') as micreferenciado,
               EXTRACTVALUE(XMLTYPE(DI.xml), '//Referencias/referencia[tipo-documento=''CRT'']/numero/text()') as crtreferenciado,
               MFTOC.viaje,
               di.xml as xml
        FROM (SELECT DB.id,
                     DB.numeroexterno,
                     DB.emisor,
                     DB.idemisor,
                     DTM.numeroreferenciaoriginal,
                     DB.fechacreacion,
                     DLE.locacion puertoembarque,
                     DLD.locacion puertodesembarque,
                     COALESCE(SUM(CASE
                           WHEN GANU.documento IS NULL THEN
                            1
                           ELSE
                            0
                         END), 0) totalguias,
                     COALESCE(SUM(CASE
                           WHEN GANU.documento IS NULL THEN
                            DT.totalPeso
                           ELSE
                            0
                         END), 0) totalPeso,
                     COALESCE(SUM(CASE
                           WHEN GANU.documento IS NULL THEN
                            DT.valordeclarado
                           ELSE
                            0
                         END), 0) totalMonto,
                     COALESCE(SUM(CASE
                           WHEN GANU.documento IS NULL AND
                                DT.valordeclarado <= 500 AND EXISTS
                            (SELECT *
                                   FROM DOCUMENTOS.docestados E
                                  WHERE E.documento = DBG.id
                                    AND E.TIPODOCUMENTO = DBG.TIPODOCUMENTO
                                    AND E.tipoestado IN ('CON MARCA', 'VIS')) THEN
                            1
                           else
                            0
                         END), 0) totalGuiasMarcadas,
                     COALESCE(SUM(CASE
                           WHEN GANU.documento IS NULL AND
                                DT.valordeclarado > 500 THEN
                            1
                           else
                            0
                         END), 0) totalGuiasMas30,
                     (SELECT MAX(ECMP.fecha)
                        FROM DOCUMENTOS.docestados ECMP
                       WHERE ECMP.documento = DB.id
                         AND ECMP.tipoestado = 'CMP') fechaconformado,
                     COALESCE(CASE
                       WHEN EXISTS (SELECT *
                               FROM DOCUMENTOS.docestados ECMP
                              WHERE ECMP.documento = DB.id
                                AND ECMP.tipoestado = 'CMP') THEN
                        'SI'
                       ELSE
                        'NO'
                     END, 'NO') esConformado,
                     DTM.viaje viaje,
                     COALESCE(SUM(CASE
                           WHEN GANU.documento IS NULL AND
                                DBG.numeroexterno = :nroGuia THEN
                            1
                           ELSE
                            0
                         END), 0) existeGuia
                FROM (SELECT id,
                             numeroexterno,
                             idemisor,
                             emisor,
                             tipodocumento,
                             fechacreacion
                        FROM DOCUMENTOS.docdocumentobase
                       WHERE tipodocumento = 'MFTOC'
                         AND activo = 'S'
                         AND numeroexterno = :nroManifiesto
                      UNION
                      SELECT id,
                             numeroexterno,
                             idemisor,
                             emisor,
                             tipodocumento,
                             fechacreacion
                        FROM DOCUMENTOS.docdocumentobase
                       WHERE tipodocumento = 'MFTOC'
                         AND activo = 'S'
                         AND NVL(:nroManifiesto, '0') = '0'
                         AND fechaversion BETWEEN TO_DATE(:fechaDesde, '${ORACLE_DATE_FORMAT}') AND 
                             CASE WHEN :fechaHasta IS NOT NULL THEN TO_DATE(:fechaHasta, '${ORACLE_DATE_FORMAT}') + 0.99999 ELSE SYSDATE END
                         AND (NVL(:idEmisor, 0) = 0 OR idemisor = :idEmisor)
                          
                      ) DB
                LEFT JOIN DOCUMENTOS.docrelaciondocumento RD
                  ON (RD.tiporelacion = 'REF' AND RD.activo = 'S' AND
                     RD.docdestino = DB.id)
                LEFT JOIN DOCUMENTOS.docdocumentobase DBG
                  ON (DBG.id = RD.docorigen)
                LEFT JOIN DOCTRANSPORTE.doctrandoctransporte DT
                  ON (DT.id = DBG.id)
                LEFT JOIN DOCUMENTOS.docestados DANU
                  ON (DANU.documento = DB.id AND
                     DANU.TIPODOCUMENTO = DB.TIPODOCUMENTO AND
                     DANU.tipoestado = 'ANU')
                LEFT JOIN DOCTRANSPORTE.DOCTRANMANIFIESTO DTM
                  ON (DTM.id = DB.id)
                LEFT JOIN DOCUMENTOS.doclocaciondocumento DLE
                  ON (DLE.documento = DB.id AND DLE.activa = 'S' AND
                     DLE.tipolocacion = 'PE')
                LEFT JOIN DOCUMENTOS.doclocaciondocumento DLD
                  ON (DLD.documento = DB.id AND DLD.activa = 'S' AND
                     DLD.tipolocacion = 'PD')
                LEFT JOIN DOCUMENTOS.docestados GANU
                  ON (GANU.documento = DBG.id AND
                     GANU.TIPODOCUMENTO = DBG.TIPODOCUMENTO AND
                     GANU.tipoestado = 'ANU')
               WHERE DANU.documento IS NULL
                 AND (DBG.TIPODOCUMENTO IS NULL OR
                     (DBG.TIPODOCUMENTO = 'GTIME' AND DBG.activo = 'S'))
               GROUP BY DB.id,
                        DB.numeroexterno,
                        DB.emisor,
                        DB.idemisor,
                        DTM.numeroreferenciaoriginal,
                        DB.fechacreacion,
                        DLE.locacion,
                        DLD.locacion,
                        DTM.viaje) MFTOC
        LEFT JOIN DOCUMENTOS.DOCIMAGEN DI ON (DI.documento = MFTOC.id)
        WHERE (NVL(:nroManifiesto, '0') = '0' OR MFTOC.numeroexterno = :nroManifiesto)
          AND (NVL(:idEmisor, 0) = 0 OR MFTOC.idemisor = :idEmisor)
          AND (:nroGuia IS NULL OR MFTOC.existeGuia > 0)
        ORDER BY MFTOC.numeroexterno
      `;
      console.log("query: ", query);
      console.log("params: ", {
        nroManifiesto: nroManifiesto || '0',
        idEmisor: idEmisor || 0,
        nroGuia: nroGuia || null,
        fechaDesde: v_fechadesde,
        fechaHasta: v_fechahasta
      });
      this.logger.log(`📝 Ejecutando query completa equivalente a Fisc_ConsultaMFTOC_GTIME`);

      const result = await connection.execute(query, {
        nroManifiesto: nroManifiesto || '0',
        idEmisor: idEmisor || 0,
        nroGuia: nroGuia || null,
        fechaDesde: v_fechadesde,
        fechaHasta: v_fechahasta
      });

      const processedRows = [];

      for (const row of result.rows) {
        const rowData = {};
        result.metaData.forEach((col, index) => {
          rowData[col.name] = row[index];
        });
        processedRows.push(rowData);
      }

      this.logger.log(`✅ Consulta completa exitosa: ${processedRows.length} registros`);

      // Log de debug solo en desarrollo
      if (process.env.NODE_ENV === 'development' && processedRows.length > 0) {
        this.logger.debug(`🔍 Debug - esConformado: ${JSON.stringify(processedRows[0].ESCONFORMADO)}`);
        this.logger.debug(`🔍 Debug - esVisado: ${JSON.stringify(processedRows[0].ESVISADO)}`);
      }

      return processedRows;

    } catch (error) {
      this.logger.error('❌ Error en consultaMftocGTIMECompleta:', error);
      throw error;
    } finally {
      try {
        if (connection) {
          await connection.close();
          this.logger.log('✅ Conexión cerrada en consultaMftocGTIMECompleta');
        }
      } catch (closeError) {
        this.logger.warn('⚠️ Error cerrando conexión:', closeError);
      }
    }
  }

}