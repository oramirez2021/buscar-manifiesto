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

  private async getConnection() {
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

    const connection = await oracledb.getConnection({
      user: dbUsername,
      password: dbPassword,
      connectString: `${dbHost}:${dbPort}/${dbName}`
    });
    
    this.logger.log('✅ Successfully connected to Oracle database');
    this.logger.log(`   - Oracle version: ${connection.oracleServerVersionString}`);
    return connection;
  }

  async consultaMftocGTIME(
    emisor?: number,
    fechaInicio?: string,
    fechaTermino?: string,
    visado?: string,
    tipoCourier?: string,
    nroManifiesto?: string,
    nroGuia?: string
  ) {
    try {
      // Validar parámetros
      if ((!nroManifiesto || nroManifiesto.trim() === '') && 
          (!fechaInicio || !fechaTermino)) {
        return [];
      }

      // Si se proporciona número de manifiesto, ignorar fechas
      if (nroManifiesto && nroManifiesto.trim() !== '') {
        fechaInicio = null;
        fechaTermino = null;
      }

      // Formatear fechas si se proporcionan
      const fechaInicioFormateada = fechaInicio ? this.formatDate(fechaInicio) : null;
      const fechaTerminoFormateada = fechaTermino ? this.formatDate(fechaTermino) : null;

      // Configurar emisor
      const emisorValue = (tipoCourier === TIPO_COURIER_EXTERNO && emisor) ? emisor : 0;

      // Usar el procedimiento almacenado real
      const connection = await this.getConnection();
      
      if (!connection) {
        throw new Error('No se pudo establecer conexión con Oracle');
      }

      try {
        this.logger.log('Executing direct query to Oracle tables');
        
        // Consulta directa a las tablas reales
        const query = this.buildDirectQuery(fechaInicioFormateada, fechaTerminoFormateada, nroManifiesto, emisorValue, nroGuia);
        
        const result = await connection.execute(query);
        const processedRows = [];
        
        for (const row of result.rows) {
          const rowData = {};
          result.metaData.forEach((col, index) => {
            rowData[col.name] = row[index];
          });

          // Aplicar lógica de filtrado del código Java
          const estaConformado = this.nvl((rowData as any).esConformado || 'NO');
          const estaVisado = this.nvl((rowData as any).esVisado || 'PEND');
          const madrereferenciada = (rowData as any).madrereferenciada;
          const micreferenciado = (rowData as any).micreferenciado;
          const crtreferenciado = (rowData as any).crtreferenciado;

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
              rowData, 
              estaVisado, 
              estaConformado, 
              madrereferenciada, 
              micreferenciado, 
              crtreferenciado
            );
            processedRows.push(processedRow);
          }
        }

        this.logger.log(`Returning ${processedRows.length} real records from Oracle direct query`);
        return processedRows;
        
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
      this.logger.error('Error in consultaMftocGTIME:', error);
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

    query += ` AND ROWNUM <= 1000`;

    return query;
  }

  private mapConsultaMFTOCDirect(
    row: any,
    estaVisado: string,
    estaConformado: string,
    madrereferenciada: string,
    micreferenciado: string,
    crtreferenciado: string
  ) {
    const tipoRef = micreferenciado ? 'Courier Terrestre' : 'Courier Normal';
    const master = micreferenciado || madrereferenciada;

    return {
      Oid: {
        Id: parseInt(row.ID)
      },
      NroReferencia: this.nvl(row.NUMEROEXTERNO),
      tipoRef: tipoRef,
      NroGuiaMaster: this.nvl(row.GUIA_NUMEROEXTERNO),
      NroVuelo: this.nvl(''), // No disponible en estas tablas
      CiaCourier: this.nvl(row.EMISOR),
      CiaTransporte: this.nvl(row.EMISOR),
      NroGuiasAsociadas: 0, // No disponible en estas tablas
      PesoGuias: 0, // No disponible en estas tablas
      ValorTotal: 0, // No disponible en estas tablas
      PuertoEmbarque: this.nvl(''), // No disponible en estas tablas
      PuertoDesembarque: this.nvl(''), // No disponible en estas tablas
      FechaAceptacion: row.FECHACREACION ? row.FECHACREACION.toISOString() : null,
      FechaAceptacionFormateada: this.formatDateString(row.FECHACREACION),
      FechaConformado: this.nvl(row.FECHAMARCACION),
      TotalGuiasMarcadas: 0, // No disponible en estas tablas
      TotalGuiasMas30: 0, // No disponible en estas tablas
      EstaVisado: estaVisado,
      NroRefOriginal: this.nvl(row.NUMEROACEPTACION),
      Consolidado: estaConformado,
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

}