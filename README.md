# Portal de Atualização de Atividades dos Projetos de Integração e Incorporação

Este projeto é uma solução web para atualização e acompanhamento de atividades de projetos, com funcionalidades integradas ao Jira, incluindo upload de anexos e gerenciamento de tarefas.

---

## Funcionalidades

- **Listagem de Tarefas**: Consulta e exibição de tarefas associadas a projetos.
- **Atualização de Comentários**: Atualize os comentários diretamente no Jira.
- **Upload de Arquivos**: Adicione anexos às tarefas.
- **Filtros Avançados**: Pesquisa e seleção por projeto e categoria.

---

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Google Apps Script
- **Integração**: API do Jira

---

## Configuração

### Requisitos
- Conta no Jira com permissões para criar e editar tarefas.
- API Key do Jira configurada para autenticação.
- Acesso ao Google Apps Script para implantação.

### Passos de Configuração
1. **Configurar o Google Apps Script**:
   - Faça login no [Google Apps Script](https://script.google.com/).
   - Crie um novo projeto e cole o código do backend fornecido no repositório.

2. **Autenticação do Jira**:
   - Configure as variáveis `jiraUsername` e `jiraApiToken` no arquivo principal do Apps Script.
   - Atualize a URL base do Jira com o domínio da sua conta (`https://<sua-empresa>.atlassian.net`).

3. **Deploy do Web App**:
   - No Apps Script, clique em `Deploy` > `Novo deploy`.
   - Escolha "Aplicativo da Web" e configure os níveis de acesso.

4. **Carregar o Frontend**:
   - Faça upload dos arquivos HTML para o Google Apps Script.
   - Teste a interface web acessando o link do Web App.

---

## Estrutura do Projeto

---

## Documentação Técnica

### Endpoints Utilizados
- **Listar Tarefas**: `/rest/api/3/search`
- **Atualizar Comentários**: `/rest/api/3/issue/{issueIdOrKey}/comment`
- **Adicionar Anexo**: `/rest/api/3/issue/{issueIdOrKey}/attachments`

### Campos Personalizados
- `customfield_10064`: Campo utilizado para a data de conclusão no Jira.

### Fluxo de Atualização
1. Usuário seleciona projeto e tarefa na interface.
2. Preenche o comentário e (opcionalmente) anexa um arquivo.
3. Clica em "Enviar Atualização".
4. O sistema realiza:
   - Atualização do comentário via API.
   - Upload de anexo (se houver).
   - Confirmação visual da conclusão.

---

## Licença

Este projeto está licenciado sob a licença [MIT](LICENSE).

---

## Contribuição

1. Faça um fork do repositório.
2. Crie um branch para sua feature (`git checkout -b minha-feature`).
3. Commit suas alterações (`git commit -m 'Adicionando minha feature'`).
4. Submeta um pull request.

