import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getContratos(req: NextApiRequest, res: NextApiResponse) {
  try {

    const unidadeOrgaos = await prisma.unidadeOrgao.findMany({
      include: {
        contratos: true, 
      },
    });

    res.status(200).json(unidadeOrgaos);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Failed to retrieve data",
      message: err.message,
    });
  }
}
