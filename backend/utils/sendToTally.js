import axios from "axios";

export const sendToTally = async (xml) => {
  const response = await axios.post(
    "http://localhost:9000",
    xml,
    {
      headers: { "Content-Type": "text/xml" },
    }
  );

  return response.data;
};
