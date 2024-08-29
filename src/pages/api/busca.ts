import type { NextApiRequest, NextApiResponse } from "next";


const API_URL = "https://pncp.gov.br/api/consulta/v1/contratos";

export default async function busca(req: NextApiRequest, res: NextApiResponse) {
  const { cnpjOrgao, dataInicial, dataFinal, pagina } = req.query;
  const url = `${API_URL}?cnpjOrgao=${cnpjOrgao}&dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}`;

  try {
    
    const apiRes = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!apiRes.ok) {
      console.log(apiRes)
      throw new Error("Failed to fetch data");
    }

    const result = await apiRes.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(403).json({ error: "Acesso à API foi proibido" });
    res.status(500).json({ error: "Falha ao alcançar os dados" });
  }
}
