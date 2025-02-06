import { supabase } from "./../config/clientSupabase.js";

const handleGenerales = async (p_fecha) => {
  try {
    let { data, error } = await supabase
    .rpc("get_datos_generales", {
      p_fecha,
    });

    if (error) console.error(error);
    else console.log(data);

    for (const student of data) {
      const detailedData = await handleDetallados(p_fecha, student?.matricula);
      const pdfData = {
        escuela: "CETMAR 6",
        estudiante: student.alumno,
        grupo: student.grupo,
        materia: "Ofimática",
        general: {
          total: student.total_asistencias,
          asistencias: student.asistencias,
          faltas: student.faltas,
          tareasEntregadas: student.tareas_entregadas,
          tareasNoEntregadas: student.tareas_no_entregadas,
          tareasOtroDia: student.total_tareas,
        },
        materias: detailedData,
      };
      
      console.log(pdfData);
      
    }
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

const handleDetallados = async (p_fecha, p_matricula) => {
  try {
    let { data, error } = await supabase
    .rpc("get_datos_detallados", {
      p_fecha,
      p_matricula,
    });

    if (error) {
      console.error(error);
      return null;
    }

    const materias = {};
    data.forEach((item) => {
      materias[item.horario] = {
        MATERIA: item.materia,
        DOCENTE: item.docente,
        alumno: {
          asistencia: item.asistencia,
          tarea: item.entrega_tarea,
          tareasOtroDia: item.asignacion_tarea,
        },
      };
    });

    return materias;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const reporte_diario = () => {
  const p_fecha = "2025-01-01";

  handleGenerales(p_fecha);
};

export default reporte_diario;
