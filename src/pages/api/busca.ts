import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_URL = "https://pncp.gov.br/api/consulta/v1/contratos";

export default async function busca(req: NextApiRequest, res: NextApiResponse) {
  const { cnpjOrgao, dataInicial, dataFinal, pagina } = req.query;
  const url = `${API_URL}?cnpjOrgao=${cnpjOrgao}&dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}`;

  try {

    //Busca os ddados da API
    const apiRes = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!apiRes.ok) {
      throw new Error(`API request failed with status: ${apiRes.status}`);
    }

    //Receber resultado como JSON
    const result = await apiRes.json();
    if (!result || !Array.isArray(result.data)) {
      throw new Error("API response does not contain 'data' field or it's not an array");
    }

    
    const contracts = result.data;

    //Calcula o valor total
    const valorTotal = contracts.reduce(
      (total: number, item: any) => {
        if (typeof item.valorInicial !== "number") {
          throw new Error(`Unexpected value type for valorInicial: ${typeof item.valorInicial}`);
        }
        return total + item.valorInicial;
      },
      0
    );

    //Extrai a informação necessaria
    const unidadeOrgao = contracts[0].unidadeOrgao;
    const { ufNome, municipioNome, codigoUnidade, codigoIbge } = unidadeOrgao;

    //Formata a informação dos contratos
    const formattedContratos = contracts.map((item: any) => ({
      nomeRazaoSocialFornecedor: item.nomeRazaoSocialFornecedor,
      dataVigenciaInicio: new Date(item.dataVigenciaInicio),
      dataVigenciaFim: new Date(item.dataVigenciaFim),
      objetoContrato: item.objetoContrato,
      valorInicial: item.valorInicial,
    }));

    //Insere daddos no banco de dados
    let unidadeOrgaoRecord;
    try {
      unidadeOrgaoRecord = await prisma.unidadeOrgao.create({
        data: {
          ufNome,
          municipioNome,
          codigoUnidade,
          codigoIbge,
          valorTotal,
        },
      });
    } catch (error:any) {
      throw new Error(`Failed to create UnidadeOrgao record: ${error.message}`);
    }

    try {
      await prisma.contrato.createMany({
        data: formattedContratos.map((item: any) => ({
          nomeRazaoSocialFornecedor: item.nomeRazaoSocialFornecedor,
          dataVigenciaInicio: item.dataVigenciaInicio,
          dataVigenciaFim: item.dataVigenciaFim,
          objetoContrato: item.objetoContrato,
          valorInicial: item.valorInicial,
          unidadeOrgaoId: unidadeOrgaoRecord.id,
        })),
      });
    } catch (error:any) {
      throw new Error(`Failed to create Contrato records: ${error.message}`);
    }

    //Resposta de sucesso
    res.status(200).json(result);

    //Resposta de erro
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Falha ao alcançar os dados",
      message: err.message,
    });
  }
}
