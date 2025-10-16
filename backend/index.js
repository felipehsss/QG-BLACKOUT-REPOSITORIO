const express = require('express');
const app = express();
const port = 3001; // Porta que o servidor vai rodar

// Middleware para permitir que o Express entenda JSON no corpo das requisições
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor rota teste funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});