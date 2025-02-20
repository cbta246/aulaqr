/**
 * TODO: Verificar valores de tarea/tareaOtrodia
 * TODO: Verificar si se puede enviar el pdf en Blob
 */
import { configMessage } from "../config/configMessage.js";
import { supabase } from "./../config/clientSupabase.js";
import general from "../mocks/general.js";
import estudiante from "../mocks/estudiante.js";
import { generatePdf } from "./pdfmake.js";
import uploadPdfToSupabase from "../config/uploadPdfToSupabase.js";
// Enviar 'true' para mockear y no hacer llamadas innecesarias a supabase.
const MOCK = true;

const mockSupabase = async (mock, type, args) => {
  if (!mock) {
    let { data, error } = await supabase.rpc(type, args);
    return { data, error };
  }
  const response = {
    get_datos_generales: general,
    get_datos_detallados: estudiante,
  };
  return { data: response[type], error: null };
};

const validarKey = (obj, key) => {
  if (obj[key]) return obj[key];
  return `${key} no disponible`;
};

const getMaterias = ({ materias }) => {
  return materias.data.reduce((acc, curr) => {
    acc[curr.horario] = {
      docente: validarKey(curr, "docente"),
      materia: validarKey(curr, "materia"),
      alumno: {
        asistencia: validarKey(curr, "asistencia"),
        tarea: validarKey(curr, "entrega_tarea"),
        tareasOtroDia: validarKey(curr, "asignacion_tarea"),
      },
    };
    return acc;
  }, {});
};

// Función para limpiar el nombre del archivo y evitar caracteres inválidos en Supabase
const sanitizeFileName = (name) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
};

const handleGenerales = async (p_fecha) => {
  try {
    let { data, error } = await mockSupabase(MOCK, "get_datos_generales", {
      p_fecha,
    });

    if (error) console.error(error);
    else console.log(data);

    for (const student of data) {
      const detailedData = await mockSupabase(MOCK, "get_datos_detallados", {
        p_fecha,
        p_matricula: student?.matricula,
      });
      const estudiante = {
        escuela: validarKey(detailedData.data, "escuela"),
        estudiante: validarKey(student, "alumno"),
        grupo: validarKey(student, "grupo"),
        materia: validarKey(detailedData.data, "materia"),
        matricula: validarKey(student, "matricula"),
        general: {
          total: validarKey(student, "total_asistencias"),
          asistencias: validarKey(student, "asistencias"),
          faltas: validarKey(student, "faltas"),
          tareasEntregadas: validarKey(student, "tareas_entregadas"),
          tareasNoEntregadas: validarKey(student, "tareas_no_entregadas"),
          tareasOtroDia: validarKey(student, "total_tareas"),
        },
        materias: getMaterias(detailedData.data),
      };

      const pdfDoc = await generatePdf(estudiante);
      pdfDoc.getBlob(async (blob) => {
        const fileName = sanitizeFileName(`${estudiante.estudiante}.pdf`);
        const pdfFile = new File([blob], fileName, { type: "application/pdf" });

        const pdfUrl = await uploadPdfToSupabase(pdfFile, fileName);

        if (pdfUrl) {
          // configMessage("3111350563", estudiante.estudiante, pdfUrl, p_fecha)
          // configMessage("3117436503", estudiante.estudiante, pdfUrl, p_fecha)
          configMessage("3114000218", estudiante.estudiante, pdfUrl, p_fecha)
            .then((response) => console.log("Reporte enviado:", response))
            .catch((error) => console.error("Error al enviar reporte", error));
        } else {
          console.error("No se pudo obtener la URL del PDF");
        }
      });
    }
  } catch (error) {
    console.error("Error en handleGenerales:", error);
    return null;
  }
};

const reporte_diario = () => {
  const p_fecha = "2025-01-01";

  handleGenerales(p_fecha);
};

export default reporte_diario;
