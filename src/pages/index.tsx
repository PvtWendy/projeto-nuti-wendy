import { Alert, Button, Card, Col, DatePicker, Input, Row, Spin } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
const { RangePicker } = DatePicker;

export default function Home() {
  //States dos inputs
  const [cnpj, setCnpj] = useState<string>("");
  const [dateRange, setDateRange] = useState<(dayjs.Dayjs | null)[]>([]);

  //State da resposta da API
  const [data, setData] = useState<any>([]);

  //States utilitarios
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //Função para formatar o CNPJ ao digitar
  const formatCNPJ = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    let formattedCNPJ = numericValue;
    if (numericValue.length > 2) {
      formattedCNPJ = numericValue.replace(/^(\d{2})(\d)/, "$1.$2");
    }
    if (numericValue.length > 5) {
      formattedCNPJ = formattedCNPJ.replace(
        /^(\d{2})\.(\d{3})(\d)/,
        "$1.$2.$3"
      );
    }
    if (numericValue.length > 8) {
      formattedCNPJ = formattedCNPJ.replace(
        /^(\d{2})\.(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3/$4"
      );
    }
    if (numericValue.length > 12) {
      formattedCNPJ = formattedCNPJ.replace(
        /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
        "$1.$2.$3/$4-$5"
      );
    }

    return formattedCNPJ;
  };

  //Formata os valores financeiros
  const formattedCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  //Formata as datas
  function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}
  //Enviar o formulário
  const clickHandler = async () => {
    //Redefine os dados
    setLoading(true);
    setData([]);
    setError(null);

    //Formata os dados para a API
    const formattedRange = dateRange.map((date) =>
      date ? dayjs(date).format("YYYYMMDD") : null
    );

    const cleanCnpj = (formattedCNPJ: string) => {
      return formattedCNPJ.replace(/\D/g, "");
    };
    const [startDate, endDate] = formattedRange;
    const pageNumber = 1;

    try {
      //Faz a busca na API
      const res = await fetch(
        `/api/busca?&dataInicial=${startDate}&dataFinal=${endDate}&cnpjOrgao=${cleanCnpj(
          cnpj
        )}&pagina=${pageNumber}`
      );

      //Handling dos erros
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || "Failed to fetch data";
        throw new Error(errorMessage);
      }

      const result = await res.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const valorTotal = data.reduce(
    (total: number, item: any) => total + item.valorInicial,
    0
  );


  //Faz a grid usando o Ant com um maximo de duas colunas
  const rows = [];
  for (let i = 0; i < data.length; i += 2) {
    rows.push(data.slice(i, i + 2));
  }
  return (
    <main className="flex overflow-hidden">
      <div className="md:w-[30%] min-w-[25rem] md:px-4 py-10 h-[100vh] md:border-r-2 flex flex-col justify-around items-center">
        <div className="h-fit flex flex-col gap-2">
          <h1 className=" font-semibold text-center">
            Procure as informações pelo CNPJ
          </h1>
          <Input
            placeholder="Insira aqui o CNPJ da empresa"
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            maxLength={18}
          ></Input>
          <RangePicker
            format={"DD/MM/YYYY"}
            placeholder={["Data Inicial", "Data Final"]}
            onChange={(dates) => setDateRange(dates || [])}
          ></RangePicker>
          <Button onClick={clickHandler}>Buscar</Button>
        </div>
        <div>
          {data.length > 0 && (
            <Card title={data[0].unidadeOrgao.nomeUnidade}>
              <Card.Grid style={{ width: "50%" }} hoverable={false}>
                {data[0].unidadeOrgao.ufNome}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }} hoverable={false}>
                {data[0].unidadeOrgao.municipioNome}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }} hoverable={false}>
                Código da Unidade: {data[0].unidadeOrgao.codigoUnidade}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }} hoverable={false}>
                Código do IBGE: {data[0].unidadeOrgao.codigoIbge}
              </Card.Grid>
              <Card.Grid style={{ width: "100%" }} hoverable={false}>
                Valor Total: &nbsp;
                {formattedCurrency(valorTotal)}
              </Card.Grid>
            </Card>
          )}
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex flex-col flex-shrink w-full h-[100vh] justify-around items-around gap-y-2 p-2 overflow-auto">
          {rows.map((row, rowIndex) => (
            <Row key={rowIndex} gutter={6}>
              {row.map((item: any, index: number) => (
                <Col span={12} key={index}>
                  <Card
                    title={item.nomeRazaoSocialFornecedor}
                    style={{ height: "100%" }}
                  >
                    <Card.Grid style={{ width: "50%" }} hoverable={false}>
                      Vigência inicial: &nbsp;
                      {formatDate(item.dataVigenciaInicio)}
                    </Card.Grid>
                    <Card.Grid style={{ width: "50%" }} hoverable={false}>
                      Vigência Final: &nbsp;
                      {formatDate(item.dataVigenciaFim)}
                    </Card.Grid>
                    <Card.Grid
                      style={{
                        width: "100%",
                        height: "10rem",
                        overflow: "auto",
                      }}
                      hoverable={false}
                    >
                      {item.objetoContrato}
                    </Card.Grid>
                    <Card.Grid style={{ width: "100%" }} hoverable={false}>
                      Valor inicial: {formattedCurrency(item.valorInicial)}
                    </Card.Grid>
                  </Card>
                </Col>
              ))}
            </Row>
          ))}
        </div>
      )}
      {error && (
        <div className="flex flex-shrink w-full min-h-[100vh] justify-center items-center">
          <Alert showIcon type="error" message={error} />
        </div>
      )}
      {loading && (
        <div className="flex flex-shrink w-full min-h-[100vh] justify-center items-center">
          <Spin size="large">
            <p className="mt-16">Carregando...</p>
          </Spin>
        </div>
      )}
    </main>
  );
}
