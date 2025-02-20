import reporte_diario from "../../src/reports/reporte_diario";


export const handler = async (event) => {
  try {
    const data = await reporte_diario();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
