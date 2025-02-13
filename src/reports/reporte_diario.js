/**
 * TODO: Verificar valores de tarea/tareaOtrodia
 * TODO: Verificar si se puede enviar el pdf en Blob
 */
import { configMessage } from "../config/configMessage.js";
import { supabase } from "./../config/clientSupabase.js";
import general from '../mocks/general.js';
import estudiante from "../mocks/estudiante.js";
import { generatePdf } from "./pdfmake.js";
// Enviar 'true' para mockear y no hacer llamadas innecesarias a supabase.
const MOCK = true;

const mockSupabase = async (mock, type, args) => {
  if (!mock) {
    let { data, error } = await supabase.rpc(type, args);
    return { data, error }
  }
  const response = {
    get_datos_generales: general,
    get_datos_detallados: estudiante
  }
  return { data: response[type], error: null }
}

const mostrarDocs = async (doc) => {
  doc.getBlob(blob => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.innerText = 'descargar';
    a.download = "example.pdf";
    document.body.appendChild(a);
    document.querySelector('#links').appendChild(a);
  });

}

const validarKey = (obj, key) => {
  if (obj[key]) return obj[key];
  return `${key} no disponible`;
}

const getMaterias = ({ materias }) => {
  return materias.data.reduce((acc, curr) => {
    acc[curr.horario] = {
      docente: validarKey(curr, 'docente'),
      materia: validarKey(curr, 'materia'),
      alumno: {
        asistencia: validarKey(curr, 'asistencia'),
        tarea: validarKey(curr, 'entrega_tarea'),
        tareasOtroDia: validarKey(curr, 'asignacion_tarea')
      }
    }
    return acc;
  }, {})
}

const handleGenerales = async (p_fecha) => {
  const urlPDF = "https://www.colonialtours.com/ebook/ebooks/ElPrincipito.pdf";
  try {
    let { data, error } = await mockSupabase(MOCK, "get_datos_generales", { p_fecha });

    if (error) console.error(error);
    else console.log(data);

    for (const student of data) {
      const detailedData = await mockSupabase(MOCK, "get_datos_detallados", { p_fecha, p_matricula: student?.matricula });
      const estudiante = {
        escuela: validarKey(detailedData.data, 'escuela'),
        estudiante: validarKey(student, 'alumno'),
        grupo: validarKey(student, 'grupo'),
        materia: validarKey(detailedData.data, 'materia'),
        general: {
          total: validarKey(student, 'total_asistencias'),
          asistencias: validarKey(student, 'asistencias'),
          faltas: validarKey(student, 'faltas'),
          tareasEntregadas: validarKey(student, 'tareas_entregadas'),
          tareasNoEntregadas: validarKey(student, 'tareas_no_entregadas'),
          tareasOtroDia: validarKey(student, 'total_tareas')
        },
        materias: getMaterias(detailedData.data)
      }
      const pdfDoc = await generatePdf(estudiante);
      pdfDoc.getBlob((blob) => {
        const pdfFile = new File([blob], `${estudiante.estudiante.replace(' ', '_').toLowerCase()}.pdf`, { type: "application/pdf" });
        console.log(pdfFile)
        // configMessage(student.celular, student.alumno, urlPDF, p_fecha); --> Envio de whatsapp con información de la bd
        // configMessage('3114000218', "Carlos Amezcua", urlPDF, p_fecha);
      })
    }
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

const reporte_diario = () => {
  const p_fecha = "2025-01-01";

  handleGenerales(p_fecha);
};

export default reporte_diario;
