import axios from "axios";

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
const PHONE_NUMBER_ID = process.env.REACT_APP_META_PHONENUMBER_ID;
const ACCESS_TOKEN = process.env.REACT_APP_META_ACCESS_TOKEN;

export const configMessage = async (
  recipientPhone,
  studentName,
  urlPDF,
  date
) => {
  const messageData = {
    messaging_product: "whatsapp",
    to: `52${recipientPhone}`,
    type: "template",
    template: {
      name: "reporte_diario",
      language: {
        code: "es_MX",
      },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: `${urlPDF}`,
                filename: `${studentName}_${date}`,
              },
            },
          ],
        },
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: `${studentName}`,
            },
            {
              type: "text",
              text: `${date}`,
            },
          ],
        },
      ],
    },
  };

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      messageData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    console.log("Mensaje enviado:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error enviando mensaje de WhatsApp:",
      error.response?.data || error.message
    );
    throw new Error("No se pudo enviar el mensaje");
  }
};