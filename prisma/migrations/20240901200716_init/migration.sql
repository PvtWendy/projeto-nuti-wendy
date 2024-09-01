-- CreateTable
CREATE TABLE "UnidadeOrgao" (
    "id" SERIAL NOT NULL,
    "ufNome" TEXT NOT NULL,
    "municipioNome" TEXT NOT NULL,
    "codigoUnidade" TEXT NOT NULL,
    "codigoIbge" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UnidadeOrgao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "nomeRazaoSocialFornecedor" TEXT NOT NULL,
    "dataVigenciaInicio" TIMESTAMP(3) NOT NULL,
    "dataVigenciaFim" TIMESTAMP(3) NOT NULL,
    "objetoContrato" TEXT NOT NULL,
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "unidadeOrgaoId" INTEGER NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_unidadeOrgaoId_fkey" FOREIGN KEY ("unidadeOrgaoId") REFERENCES "UnidadeOrgao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
