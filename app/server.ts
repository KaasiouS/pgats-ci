import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.use(express.json());

const relatorios = [
  { id: 1, nome: 'Relatório Mensal',  status: 'aprovado', criadoEm: '2024-01-15' },
  { id: 2, nome: 'Dashboard KPI',     status: 'pendente', criadoEm: '2024-01-20' },
  { id: 3, nome: 'Análise de Risco',  status: 'aprovado', criadoEm: '2024-01-22' },
];

app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Sistema Interno — CI/CD Demo</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #f8f9fa; }
    .card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
    h1 { margin-top: 0; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .aprovado { background: #d4edda; color: #155724; }
    .pendente  { background: #fff3cd; color: #856404; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #dee2e6; padding: 10px 14px; text-align: left; }
    th { background: #f1f3f5; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1 id="title">Sistema Interno</h1>
    <p>Status: <span id="status" class="badge aprovado">Online</span></p>
    <h2>Relatórios</h2>
    <table id="tabela-relatorios">
      <thead>
        <tr><th>ID</th><th>Nome</th><th>Status</th><th>Criado em</th></tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>
  <script>
    fetch('/api/relatorios')
      .then(r => r.json())
      .then(items => {
        const tbody = document.getElementById('tbody');
        items.forEach(item => {
          const tr = document.createElement('tr');
          tr.setAttribute('data-id', item.id);
          tr.innerHTML =
            '<td>' + item.id + '</td>' +
            '<td>' + item.nome + '</td>' +
            '<td><span class="badge ' + item.status + '">' + item.status + '</span></td>' +
            '<td>' + item.criadoEm + '</td>';
          tbody.appendChild(tr);
        });
      });
  </script>
</body>
</html>`);
});

app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok', versao: '1.0.0', uptime: process.uptime() });
});

app.get('/api/relatorios', (_req, res) => {
  res.json(relatorios);
});

app.get('/api/relatorios/:id', (req, res) => {
  const item = relatorios.find(r => r.id === parseInt(req.params.id, 10));
  if (!item) {
    res.status(404).json({ erro: 'Relatório não encontrado' });
    return;
  }
  res.json(item);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
