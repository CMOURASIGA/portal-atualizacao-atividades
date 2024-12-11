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

