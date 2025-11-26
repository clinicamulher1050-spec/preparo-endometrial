// app.js - Lógica de cálculo e geração de textos

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("planner-form");
  const resultadosSection = document.getElementById("resultados-section");
  const resultadosDiv = document.getElementById("resultados");
  const docsSection = document.getElementById("documentos-section");

  const taLH = document.getElementById("texto-lh");
  const taArt = document.getElementById("texto-artificial");
  const taCh = document.getElementById("texto-choriomon");
  const taDH = document.getElementById("texto-dh");
  const taUS = document.getElementById("texto-us");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Coleta de dados do formulário
    const paciente = document.getElementById("paciente").value.trim() || "XXX";
    const medico = document.getElementById("medico").value.trim() || "XXX";
    const preparo = document.getElementById("preparo").value;
    const estradiolTipo = document.getElementById("estradiol").value;
    const progesteronaTipo = document.getElementById("progesterona").value;

    const inicioPreparo = parseDate(document.getElementById("inicio-preparo").value);
    const dum = parseDate(document.getElementById("dum").value);

    const duracaoCiclo = Number(document.getElementById("duracao-ciclo").value || 28);
    const diasEmbriao = Number(document.getElementById("dias-embriao").value || 5);

    const realizarUS = document.getElementById("realizar-us").value === "sim";
    const dosarProg = document.getElementById("dosar-prog").value === "sim";
    const numEmbrioes = document.getElementById("num-embrioes").value || "XXX";

    const carinhaFeliz = parseDate(document.getElementById("carinha-feliz").value);
    const foliculo16 = parseDate(document.getElementById("foliculo-16").value);

    const hoje = new Date();

    // CÁLCULOS DE DATAS

    // Provável ovulação (baseado em DUM + duração do ciclo - 14)
    let provavelOvulacao = null;
    if (dum && duracaoCiclo) {
      provavelOvulacao = addDays(dum, duracaoCiclo - 14);
    }

    // TEC Artificial
    let tecArt = null;
    let tecArtMin = null;
    let tecArtMax = null;
    if (provavelOvulacao) {
      tecArt = addDays(provavelOvulacao, 3);
      tecArtMin = provavelOvulacao;
      tecArtMax = addDays(provavelOvulacao, 7);
    }

    // TEC Fita de LH
    let tecLH = null;
    let tecLHMin = null;
    let tecLHMax = null;
    if (carinhaFeliz) {
      tecLH = addDays(carinhaFeliz, diasEmbriao + 1);
      tecLHMin = addDays(carinhaFeliz, diasEmbriao - 1);
      tecLHMax = addDays(carinhaFeliz, diasEmbriao + 3);
    }

    // TEC Choriomon
    let tecCh = null;
    let tecChMin = null;
    let tecChMax = null;
    if (foliculo16) {
      tecCh = addDays(foliculo16, diasEmbriao + 2);
      tecChMin = addDays(foliculo16, diasEmbriao);
      tecChMax = addDays(foliculo16, diasEmbriao + 4);
    }

    // Datas auxiliares (exemplos - ajuste conforme seu protocolo)
    const dataInicioTesteLH = provavelOvulacao ? addDays(provavelOvulacao, -5) : null;
    const dataUS1 = provavelOvulacao ? addDays(provavelOvulacao, -2) : null;
    const dataInicioEstradiol = inicioPreparo ? addDays(inicioPreparo, 1) : null;
    const dataFimEstradiol = provavelOvulacao ? addDays(provavelOvulacao, 1) : null;
    const dataInicioProgesterona = provavelOvulacao ? addDays(provavelOvulacao, 1) : null;

    // MONTAGEM DO RESUMO
    let html = `<p><strong>Paciente:</strong> ${paciente}</p>`;
    html += `<p><strong>Médico:</strong> ${medico}</p>`;
    html += `<p><strong>Tipo de preparo:</strong> ${preparo === "1" ? "Fita de LH" : preparo === "2" ? "Artificial" : "Choriomon"}</p>`;
    html += `<p><strong>Provável ovulação:</strong> ${formatDate(provavelOvulacao)}</p>`;

    html += `<table>`;
    html += `<tr><th>Protocolo</th><th>Data TEC sugerida</th><th>Janela TEC</th></tr>`;
    html += `<tr><td>Artificial</td><td>${formatDate(tecArt)}</td><td>${formatDate(tecArtMin)} a ${formatDate(tecArtMax)}</td></tr>`;
    html += `<tr><td>Fita de LH</td><td>${formatDate(tecLH)}</td><td>${formatDate(tecLHMin)} a ${formatDate(tecLHMax)}</td></tr>`;
    html += `<tr><td>Choriomon</td><td>${formatDate(tecCh)}</td><td>${formatDate(tecChMin)} a ${formatDate(tecChMax)}</td></tr>`;
    html += `</table>`;

    resultadosDiv.innerHTML = html;
    resultadosSection.style.display = "block";

    // GERAÇÃO DOS TEXTOS DE RECEITUÁRIO

    // Texto LH
    taLH.value = `RECEITUÁRIO - PREPARO COM FITA DE LH

Paciente: ${paciente}
Médico: ${medico}

Iniciar teste de ovulação digital (fita de LH) em: ${formatDate(dataInicioTesteLH)}

Quando o teste ficar positivo ("carinha feliz"):
- Anotar a data
- Iniciar progesterona conforme prescrição

${realizarUS ? `Realizar ultrassom transvaginal em: ¨D{formatDate(dataUS1)}` : ""}
${dosarProg ? `Dosar progesterona em: ¨D{formatDate(dataInicioProgesterona)}` : ""}

Data prevista para TEC: ${formatDate(tecLH)}
(Janela: ${formatDate(tecLHMin)} a ${formatDate(tecLHMax)})

Número de embriões: ${numEmbrioes}

Retornar para TEC conforme agendamento.

___________________________
${medico}
CRM: [PREENCHER]
Data: ${formatDate(hoje)}
`;

    // Texto Artificial
    taArt.value = `RECEITUÁRIO - PREPARO ARTIFICIAL

Paciente: ${paciente}
Médico: ${medico}

${estradiolTipo !== "0" ? `Iniciar estradiol (¨D{estradiolTipo === "1" ? "Oestrogel" : estradiolTipo === "2" ? "Valerato de Estradiol" : "Oestrogel + Progesterona"}) em: ¨D{formatDate(dataInicioEstradiol)}
Manter até: ¨D{formatDate(dataFimEstradiol)}` : "Sem suplementação de estradiol"}

Iniciar progesterona (${progesteronaTipo === "1" ? "Duphaston" : progesteronaTipo === "2" ? "Utrogestan" : "Duphaston + Utrogestan"}) em: ${formatDate(dataInicioProgesterona)}

${realizarUS ? `Realizar ultrassom transvaginal em: ¨D{formatDate(dataUS1)}` : ""}
${dosarProg ? `Dosar progesterona em: ¨D{formatDate(dataInicioProgesterona)}` : ""}

Data prevista para TEC: ${formatDate(tecArt)}
(Janela: ${formatDate(tecArtMin)} a ${formatDate(tecArtMax)})

Número de embriões: ${numEmbrioes}

Retornar para TEC conforme agendamento.

___________________________
${medico}
CRM: [PREENCHER]
Data: ${formatDate(hoje)}
`;

    // Texto Choriomon
    taCh.value = `RECEITUÁRIO - PREPARO COM CHORIOMON

Paciente: ${paciente}
Médico: ${medico}

Realizar ultrassom transvaginal para avaliar folículo dominante.

Quando folículo atingir ≥ 16mm:
- Aplicar Choriomon 5000 UI (IM ou SC)
- Anotar data da aplicação

Iniciar progesterona 36-48h após Choriomon.

${dosarProg ? `Dosar progesterona em: [DATA APÓS APLICAÇÃO]` : ""}

Data prevista para TEC: ${formatDate(tecCh)}
(Janela: ${formatDate(tecChMin)} a ${formatDate(tecChMax)})

Número de embriões: ${numEmbrioes}

Retornar para TEC conforme agendamento.

___________________________
${medico}
CRM: [PREENCHER]
Data: ${formatDate(hoje)}
`;

    // Solicitação de hormônios
    taDH.value = `SOLICITAÇÃO DE EXAMES LABORATORIAIS

Paciente: ${paciente}
Médico: ${medico}

Solicito dosagem hormonal:
- Estradiol
- Progesterona

Data sugerida para coleta: ${formatDate(dataInicioProgesterona)}

Motivo: Preparo endometrial para transferência embrionária

___________________________
${medico}
CRM: [PREENCHER]
Data: ${formatDate(hoje)}
`;

    // Solicitação de US
    taUS.value = `SOLICITAÇÃO DE ULTRASSOM

Paciente: ${paciente}
Médico: ${medico}

Solicito:
ULTRASSOM TRANSVAGINAL

Data sugerida: ${formatDate(dataUS1)}

Motivo: Avaliação endometrial para preparo de transferência embrionária

Observações: Avaliar espessura endometrial, padrão trilaminar e presença de folículos.

___________________________
${medico}
CRM: [PREENCHER]
Data: ${formatDate(hoje)}
`;

    docsSection.style.display = "block";
    window.scrollTo({ top: resultadosSection.offsetTop - 20, behavior: "smooth" });
  });
});
