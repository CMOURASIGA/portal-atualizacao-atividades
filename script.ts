// Autenticação e configurações do Jira
const jiraUsername = //adicionar o email da conta;
const jiraApiToken = //adicionar o token;
const jiraBaseUrl = //adicionar o link do jira da conta;

const headers = {
  Authorization: "Basic " + Utilities.base64Encode(jiraUsername + ":" + jiraApiToken),
  "Content-Type": "application/json",
};

// Função para servir o HTML (entrada principal)
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setTitle('Formulário Dinâmico com Jira');
}

// 1. Buscar projetos do Jira
function buscarProjetos() {
  try {
    const url = `${jiraBaseUrl}/project`;
    const options = { method: "GET", headers: headers };
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    const projetosIgnorar = [
      "[Integra]","[Integra] ", "Automacao RPA", "Desenvolvimentos Inspira", "DriveThru", "Férias Equipe",
      "INCORPORACAO - TI", "Incorporação R2/24", "Incorporação R3/24", "Incorporação R4/24",
      "Infra-TI", "Integração - Prd / Homologação de cenários",
      "Integração/Incorporação - Operação Assistida", "TAREFAS EXTRAS - INTEGRAÇÃO", "teste 4",
    ];

    // Filtrar e retornar projetos válidos
    const projetos = data
      .filter(projeto => projeto.name && projeto.key)
      .filter(projeto => !projetosIgnorar.includes(projeto.name))
      .map(projeto => ({ name: projeto.name.trim(), key: projeto.key.trim() }));

    Logger.log("Projetos retornados: " + JSON.stringify(projetos));
    return projetos;
  } catch (error) {
    Logger.log(`Erro ao buscar projetos: ${error.message}`);
    return [];
  }
}

// 2. Buscar categorias com base no projeto
function buscarCategoriasPorProjeto(projectKey) {
  try {
    const url = `${jiraBaseUrl}/issue/createmeta?projectKeys=${projectKey}&expand=projects.issuetypes.fields`;
    const options = { method: "GET", headers: headers };
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    const projectData = data.projects[0];

    if (!projectData) {
      Logger.log(`Nenhum dado encontrado para o projeto: ${projectKey}`);
      return [];
    }

    const categorias = new Set();
    projectData.issuetypes.forEach(issueType => {
      const field = issueType.fields["customfield_10036"];
      if (field && field.allowedValues) {
        field.allowedValues.forEach(value => categorias.add(value.value));
      }
    });

    return Array.from(categorias); // Converter o Set para Array
  } catch (error) {
    Logger.log(`Erro ao buscar categorias: ${error.message}`);
    return [];
  }
}

// 3. Buscar tarefas com base no projeto e na categoria
// Busca o último comentário de uma tarefa
function buscarUltimoComentario(tarefaKey) {
  try {
    const url = `${jiraBaseUrl}/issue/${tarefaKey}/comment`;
    const options = { method: "GET", headers: headers };
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    const comentarios = data.comments;
    if (comentarios && comentarios.length > 0) {
      const ultimoComentario = comentarios[comentarios.length - 1]; // Último comentário
      const autor = ultimoComentario.author.displayName; // Autor do comentário
      const texto = ultimoComentario.body.split("\n").slice(1).join("\n"); // Ignora a primeira linha

      // Formata o comentário ignorando a data de atualização
      return `Autor: ${autor}\nComentário: ${texto}`;
    }

    return "Sem comentários";
  } catch (error) {
    Logger.log(`Erro ao buscar comentários para a tarefa ${tarefaKey}: ${error.message}`);
    return "Erro ao carregar comentários";
  }
}



// Modificar a função de busca de tarefas para incluir o último comentário
function buscarTarefasPorProjetoECategoria(projectKey, categoria) {
  try {
    const url = `${jiraBaseUrl}/search`;
    const jql = `project=${projectKey} AND "Categoria"="${categoria}"`;
    const options = {
      method: "POST",
      headers: headers,
      payload: JSON.stringify({
        jql: jql,
        maxResults: 50,
        fields: ["summary", "status", "assignee"],
      }),
    };

    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    return data.issues.map(issue => {
      const lastComment = buscarUltimoComentario(issue.key); // Chama a função para buscar o último comentário
      return {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : "Não atribuído",
        lastComment: lastComment,
      };
    });
  } catch (error) {
    Logger.log(`Erro ao buscar tarefas: ${error.message}`);
    return [];
  }
}


// Função para atualizar a tarefa no Jira
function atualizarTarefa(dados) {
  try {
    const { tarefaKey, comentario, dataAtualizacao, dataConclusao } = dados;

    // Formatar o comentário
    let comentarioFormatado = `Autor: ${Session.getActiveUser().getEmail()}\n` +
                              `Comentário: ${comentario}\n` +
                              `Data de Atualização: ${dataAtualizacao}`;

    // Adicionar a data de conclusão, se disponível
    if (dataConclusao) {
      comentarioFormatado += `\nData de Conclusão: ${dataConclusao}`;
    }

    // Atualizar o comentário na tarefa
    const commentUrl = `${jiraBaseUrl}/issue/${tarefaKey}/comment`;
    const commentOptions = {
      method: "POST",
      headers: headers,
      payload: JSON.stringify({ body: comentarioFormatado }),
    };

    const commentResponse = UrlFetchApp.fetch(commentUrl, commentOptions);
    Logger.log(`Comentário da tarefa ${tarefaKey} atualizado com sucesso. Resposta: ${commentResponse.getContentText()}`);

    // Atualizar o campo "Data de Entrega Final" (customfield_10094) se houver data de conclusão
    if (dataConclusao) {
      const updateUrl = `${jiraBaseUrl}/issue/${tarefaKey}`;
      const updatePayload = {
        fields: {
          customfield_10094: dataConclusao, // Atualiza o campo com a data de conclusão
        },
      };

      const updateOptions = {
        method: "PUT",
        headers: headers,
        payload: JSON.stringify(updatePayload),
      };

      const updateResponse = UrlFetchApp.fetch(updateUrl, updateOptions);
      Logger.log(`Campo "Data de Entrega Final" da tarefa ${tarefaKey} atualizado com sucesso. Resposta: ${updateResponse.getContentText()}`);
    }

    return true;
  } catch (error) {
    Logger.log(`Erro ao atualizar a tarefa ${tarefaKey}: ${error.message}`);
    return false;
  }
}


// Função para adicionar anexo na tarefa no Jira
function enviarAnexo(anexoData) {
  try {
    Logger.log("Iniciando o envio do anexo...");

    const { tarefaKey, nomeArquivo, conteudoBase64 } = anexoData;

    Logger.log(`Tarefa Key: ${tarefaKey}`);
    Logger.log(`Nome do Arquivo: ${nomeArquivo}`);
    Logger.log(`Conteúdo Base64 (primeiros 50 caracteres): ${conteudoBase64.substring(0, 50)}`);

    // URL do endpoint
    const url = `${jiraBaseUrl}/issue/${tarefaKey}/attachments`;
    Logger.log(`URL: ${url}`);

    // Configuração do Authorization Token
    const tokenBase64 = Utilities.base64Encode(`${jiraUsername}:${jiraApiToken}`);
    
    // Criando o payload com o arquivo
    const boundary = "-------BoundaryString";
    const blob = Utilities.newBlob(
      Utilities.base64Decode(conteudoBase64), // Decodifica o Base64
      "application/octet-stream",
      nomeArquivo
    );

    const payload = `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${nomeArquivo}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n` +
      blob.getBytes() + // Conteúdo do arquivo em bytes
      `\r\n--${boundary}--`;

    Logger.log(`Payload gerado (primeiros 100 caracteres): ${payload.substring(0, 100)}`);

    // Configurando as opções da requisição
    const options = {
      method: "POST",
      contentType: `multipart/form-data; boundary=${boundary}`,
      headers: {
        Authorization: `Basic ${tokenBase64}`,
        "X-Atlassian-Token": "no-check"
      },
      payload: payload,
      muteHttpExceptions: true,
    };

    // Fazendo a requisição
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log(`Código de resposta: ${responseCode}`);
    Logger.log(`Resposta: ${responseText}`);

    if (responseCode === 200 || responseCode === 201) {
      Logger.log("Arquivo anexado com sucesso!");
      return true;
    } else {
      Logger.log("Erro ao anexar arquivo: " + responseText);
      return false;
    }
  } catch (error) {
    Logger.log("Erro ao executar a função enviarAnexo: " + error.message);
    return false;
  }
}