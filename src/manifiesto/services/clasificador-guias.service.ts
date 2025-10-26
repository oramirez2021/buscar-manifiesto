import { Injectable } from '@nestjs/common';
import { ClasificacionResult } from '../dto/clasificacion-result.dto';

@Injectable()
export class ClasificadorGuiasService {
    private static readonly topeMaximo_Fiscalizable = 41.0;

    static clasificarGuia(
        guia: any,
        sumaValores: number,
        sobreTopePorRut: number,
        rutconsignatario: string
    ): ClasificacionResult {
        const tipoRutConsignatario = guia.tipoRutConsignatario;
        const indicadorColor: ClasificacionResult = {
            rojo: '',
            amarillo: '',
            verde: '',
            naranjo: '',
            propuesta: '',
            observacion: ''
        };
        const valorLimite = this.topeMaximo_Fiscalizable;

        if (tipoRutConsignatario === 'rutEmbajada') {
            indicadorColor.observacion = 'RUTS_EMBAJADAS';
            indicadorColor.verde = '<span class="color-box verde" title="Rut Embajada"></span>';
            indicadorColor.propuesta = 'LIBRE';
            return indicadorColor;
        }

        if (tipoRutConsignatario === 'rutBuzon') {
            indicadorColor.observacion = 'rutBuzon';
            indicadorColor.naranjo = '<span class="color-box naranjo" title="Rut Genérico"></span>';
            indicadorColor.propuesta = 'RETENCIÓN';
            return indicadorColor;
        }

        if (!rutconsignatario || rutconsignatario.trim() === '') {
            indicadorColor.observacion = 'Obs: Rut consignatario no indicado en la guía..!!';
            return indicadorColor;
        }

        if (tipoRutConsignatario === 'rutEmpresa') {
            indicadorColor.observacion = 'rutEmpresa';
            indicadorColor.amarillo = '<span class="color-box amarillo" title="Rut Empresa"></span>';
            indicadorColor.propuesta = 'DECLARACIÓN';
        }

        if (sumaValores > valorLimite) {
            indicadorColor.observacion = 'sobreTopeMaximo';
            indicadorColor.naranjo = '<span class="color-box naranjo" title="Consignatario totaliza Guías >41 USD en este Manifiesto"></span>';
            indicadorColor.propuesta = 'DECLARACIÓN';
        }

        if (sobreTopePorRut > 0) {
            indicadorColor.observacion = 'tieneGuiasSobre41';
            indicadorColor.rojo = '<span class="color-box rojo" title="Consignatario tiene Guías >41 USD en este Manifiesto"></span>';
            indicadorColor.propuesta = 'DECLARACIÓN';
        }

        if (!indicadorColor.observacion || indicadorColor.observacion.trim() === '') {
            indicadorColor.observacion = '-';
            indicadorColor.propuesta = 'LIBRE';
            indicadorColor.verde = '<span class="color-box verde" title="LIBRE"></span>';
        }

        return indicadorColor;
    }
}
