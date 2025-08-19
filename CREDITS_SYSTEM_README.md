# Nieuw Credits Systeem - ScailUp

## Overzicht

Het nieuwe credits systeem is volledig opnieuw opgezet met een hoofd tabel genaamd `credits` en alles blijft compatibel met Lovable. Het systeem is ontworpen voor schaalbaarheid, transparantie en gebruiksgemak.

## Hoofd Tabel: `credits`

### Schema
```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,        -- Totaal toegevoegde credits
  balance INTEGER NOT NULL DEFAULT 0,       -- Huidige beschikbare credits
  expires_at TIMESTAMP WITH TIME ZONE,      -- Verloopdatum (optioneel)
  is_unlimited BOOLEAN DEFAULT false,       -- Onbeperkte credits flag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, module_id, credit_type)
);
```

### Belangrijke Kenmerken

1. **Unieke Combinatie**: Elke client kan maar één credit record hebben per module + credit type combinatie
2. **Balance Tracking**: `amount` = totaal toegevoegd, `balance` = huidige beschikbaar
3. **Onbeperkte Credits**: `is_unlimited` flag voor admin accounts
4. **Verloopdatum**: Credits kunnen een vervaldatum hebben
5. **Automatische Timestamps**: `created_at` en `updated_at` worden automatisch bijgehouden

## Ondersteunende Tabellen

### 1. `credit_transactions`
Logt alle credit activiteiten voor transparantie en auditing.

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID REFERENCES credits(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add', 'subtract', 'expire', 'refill')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_id UUID, -- Voor koppeling aan specifieke acties
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `credit_usage_logs` (Backward Compatibility)
Behouden voor bestaande code compatibiliteit.

```sql
CREATE TABLE credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `credit_balances` (View)
Een view voor backward compatibility met bestaande code.

```sql
CREATE VIEW credit_balances AS
SELECT 
  c.id,
  c.client_id,
  c.module_id,
  c.credit_type,
  c.balance as amount,
  c.expires_at,
  c.created_at,
  c.updated_at
FROM credits c;
```

## Database Functies

### 1. `add_credits()`
Voegt credits toe aan een client.

```sql
SELECT add_credits(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT,
  p_amount INTEGER,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_description TEXT DEFAULT NULL
);
```

### 2. `use_credits()`
Gebruikt credits van een client.

```sql
SELECT use_credits(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
);
```

### 3. `check_and_use_credits()` (Backward Compatibility)
Gebruikt credits voor de huidige gebruiker (backward compatibility).

```sql
SELECT check_and_use_credits(
  p_credit_type TEXT,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL
);
```

### 4. `get_credit_balance()`
Haalt het huidige credit saldo op.

```sql
SELECT get_credit_balance(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT
);
```

### 5. `set_unlimited_credits()`
Stelt onbeperkte credits in voor een client.

```sql
SELECT set_unlimited_credits(
  p_client_id UUID,
  p_module_id UUID,
  p_credit_type TEXT
);
```

## Automatische Triggers

### Nieuwe Client Credits
Wanneer een nieuwe client wordt aangemaakt, worden automatisch credits toegevoegd:

- **Lead Engine**: 100 leads credits
- **Marketing Engine**: 1000 emails + 50 LinkedIn credits
- **Analytics**: 10 reports credits
- **Overige**: 100 standard credits

### Super Admin
De super admin (djoere@scailup.io) krijgt automatisch onbeperkte credits voor alle modules.

## TypeScript Hooks

### Nieuwe Hooks

```typescript
// Hoofd hook voor credits
const { data: credits, isLoading } = useCredits();

// Credit transacties
const { data: transactions } = useCreditTransactions();

// Credits toevoegen
const addCredits = useAddCredits();

// Credits gebruiken (nieuwe versie)
const useCreditsNew = useUseCreditsNew();
```

### Backward Compatibility Hooks

```typescript
// Bestaande hooks blijven werken
const { data: creditBalances } = useCreditBalances();
const { data: usageLogs } = useCreditUsageLogs();
const useCredits = useUseCredits(); // Backward compatibility
```

## Credit Types

Het systeem ondersteunt verschillende credit types per module:

### Lead Engine
- `leads` - Lead generatie
- `contacts` - Contact conversie
- `enrichment` - Lead verrijking

### Marketing Engine
- `emails` - Email campagnes
- `linkedin` - LinkedIn activiteiten
- `campaigns` - Marketing campagnes

### Analytics
- `reports` - Rapportage
- `insights` - Data insights

### Overige
- `standard` - Algemene credits

## Row Level Security (RLS)

Alle tabellen hebben RLS ingeschakeld:

- Gebruikers kunnen alleen hun eigen credits zien
- Het systeem kan alle credits beheren
- Transacties worden automatisch gelogd

## Indexes voor Performance

```sql
-- Credits table indexes
CREATE INDEX idx_credits_client_module_type ON credits(client_id, module_id, credit_type);
CREATE INDEX idx_credits_expires_at ON credits(expires_at);
CREATE INDEX idx_credits_balance ON credits(balance);
CREATE INDEX idx_credits_is_unlimited ON credits(is_unlimited);

-- Transaction table indexes
CREATE INDEX idx_credit_transactions_credit_id ON credit_transactions(credit_id);
CREATE INDEX idx_credit_transactions_client_id ON credit_transactions(client_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

## Migratie Uitvoeren

```bash
# Voer de migratie uit
node apply-new-credits-system.js
```

## Lovable Compatibiliteit

Het nieuwe systeem is volledig compatibel met Lovable:

1. **Bestaande Code**: Alle bestaande hooks en componenten blijven werken
2. **API Compatibiliteit**: Dezelfde endpoints en responses
3. **Data Structuur**: Views zorgen voor backward compatibility
4. **UI Componenten**: Bestaande componenten werken zonder wijzigingen

## Voordelen van het Nieuwe Systeem

1. **Eén Hoofd Tabel**: Alle credits in één overzichtelijke tabel
2. **Transparantie**: Volledige transactie logging
3. **Performance**: Geoptimaliseerde indexes en queries
4. **Schaalbaarheid**: Ondersteunt onbeperkte groei
5. **Flexibiliteit**: Ondersteunt verschillende credit types en modules
6. **Backward Compatibility**: Bestaande code blijft werken
7. **Lovable Compatible**: Volledig compatibel met Lovable

## Monitoring en Analytics

Het systeem biedt uitgebreide monitoring mogelijkheden:

- Credit gebruik per dag/week/maand
- Transactie geschiedenis per client
- Module-specifieke analytics
- Expiratie tracking
- Unlimited credits monitoring

## Toekomstige Uitbreidingen

Het systeem is ontworpen voor toekomstige uitbreidingen:

- Credit packages en bundles
- Automatische refill systemen
- Credit sharing tussen modules
- Advanced analytics en reporting
- Credit marketplace 