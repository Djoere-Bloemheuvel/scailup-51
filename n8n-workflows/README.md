# n8n Workflows

Deze directory bevat alle n8n workflows voor de Scailup integratie. Workflows worden automatisch gedeployed via GitHub Actions.

## 📁 Directory Structuur

```
n8n-workflows/
├── workflows/           # JSON workflow bestanden
│   ├── validate-website.json
│   └── [andere workflows...]
├── templates/          # Herbruikbare workflow templates (optioneel)
└── README.md          # Deze documentatie
```

## 🚀 Workflow Toevoegen

### 1. Nieuwe Workflow Maken

1. **Maak een nieuw JSON bestand** in `workflows/`:
   ```bash
   touch n8n-workflows/workflows/mijn-workflow.json
   ```

2. **Exporteer workflow van n8n**:
   - Ga naar je n8n instance
   - Open de workflow die je wilt exporteren
   - Klik op "Export" (drie puntjes menu)
   - Kopieer de JSON content

3. **Plaats de JSON** in je nieuwe bestand

4. **Commit en push**:
   ```bash
   git add n8n-workflows/workflows/mijn-workflow.json
   git commit -m "Add new workflow: mijn-workflow"
   git push origin main
   ```

### 2. Workflow Vereisten

Elke workflow moet bevatten:
- ✅ **Webhook Trigger** - Voor ontvangst van data van Scailup
- ✅ **Webhook Response** - Voor response terug naar Scailup
- ✅ **Unieke naam** - Geen dubbele workflow namen
- ✅ **Geldige JSON** - Correcte JSON syntax

### 3. Workflow Naming Convention

- Gebruik kebab-case: `lead-conversion.json`
- Beschrijvende namen: `validate-website.json`
- Geen spaties of speciale karakters

## 🔄 Deployment Proces

### Automatische Deployment

Workflows worden automatisch gedeployed via GitHub Actions:

1. **Trigger**: Push naar `main` branch met wijzigingen in `n8n-workflows/workflows/*.json`
2. **Validatie**: JSON syntax wordt gecontroleerd
3. **Deployment**: Workflows worden geüpload naar `https://n8n.scailup.com`
4. **Authenticatie**: Via GitHub Secret `N8N_API_KEY`

### Deployment Status

- ✅ **Success**: Workflow is actief in n8n
- ❌ **Failed**: Check GitHub Actions logs voor details
- 🧪 **Testing**: Pull requests worden getest maar niet gedeployed

### Manual Deployment

Voor handmatige deployment:

```bash
# Deploy specifieke workflow
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d @n8n-workflows/workflows/mijn-workflow.json \
  https://n8n.scailup.com/api/v1/workflows
```

## 🔙 Rollback via Git

### Workflow Rollback

1. **Bekijk workflow geschiedenis**:
   ```bash
   git log --oneline n8n-workflows/workflows/mijn-workflow.json
   ```

2. **Revert naar vorige versie**:
   ```bash
   git checkout HEAD~1 -- n8n-workflows/workflows/mijn-workflow.json
   git commit -m "Revert workflow to previous version"
   git push origin main
   ```

3. **Automatische deployment** triggert de rollback

### Complete Rollback

Voor complete rollback van alle workflows:

```bash
# Revert alle workflows naar vorige commit
git checkout HEAD~1 -- n8n-workflows/workflows/
git commit -m "Rollback all workflows to previous version"
git push origin main
```

## 🔧 Workflow Development

### Development Workflow

1. **Maak feature branch**:
   ```bash
   git checkout -b feature/new-workflow
   ```

2. **Test workflow lokaal**:
   - Import workflow in n8n development instance
   - Test alle functionaliteit
   - Valideer JSON syntax

3. **Commit en push**:
   ```bash
   git add n8n-workflows/workflows/mijn-workflow.json
   git commit -m "Add new workflow with feature X"
   git push origin feature/new-workflow
   ```

4. **Pull Request**:
   - Maak PR naar `main` branch
   - GitHub Actions test de workflow
   - Review en merge

### Testing Workflows

- **JSON Validatie**: Automatisch in CI/CD
- **Workflow Structuur**: Controleert vereiste nodes
- **n8n Compatibiliteit**: Test in development instance

## 🔐 Security

### API Key Management

- **GitHub Secret**: `N8N_API_KEY` voor authenticatie
- **Environment**: Alleen production deployment bij `main` branch
- **Access Control**: Beperkte API key permissies

### Best Practices

- ✅ **No secrets in workflows** - Gebruik environment variables
- ✅ **Validate inputs** - Check webhook payload
- ✅ **Error handling** - Graceful error responses
- ✅ **Logging** - Audit trail voor debugging

## 📊 Monitoring

### Deployment Monitoring

- **GitHub Actions**: Bekijk deployment status
- **n8n Dashboard**: Controleer workflow status
- **Webhook Logs**: Monitor webhook calls

### Health Checks

```bash
# Check workflow status
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  https://n8n.scailup.com/api/v1/workflows

# Test webhook endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://n8n.scailup.com/webhook/validate-website
```

## 🆘 Troubleshooting

### Veelvoorkomende Problemen

1. **JSON Syntax Error**:
   - Valideer JSON met online validator
   - Check voor ontbrekende komma's/brackets

2. **Deployment Failed**:
   - Controleer `N8N_API_KEY` secret
   - Verifieer n8n instance URL
   - Check GitHub Actions logs

3. **Workflow Not Triggering**:
   - Controleer webhook URL
   - Valideer webhook payload
   - Check n8n workflow status

### Support

Voor vragen of problemen:
- Check GitHub Actions logs
- Controleer n8n dashboard
- Raadpleeg n8n documentatie
- Neem contact op met development team

---

**Laatste update**: 2024-01-15
**Versie**: 1.0.0 # Updated: Mon Jul 21 13:30:31 CEST 2025
