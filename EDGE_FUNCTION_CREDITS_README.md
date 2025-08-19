# Edge Function Credits Management System - ScailUp

## 🚀 Overzicht

Het Edge Function Credits Management System maakt het credits systeem extreem robuust met enterprise-grade features zoals rate limiting, superadmin privileges, transaction logging, en uitgebreide error handling. Alles blijft volledig compatibel met Lovable.

## 🏗️ Architectuur

### Edge Function: `credits-manager`
- **Runtime**: Deno
- **Framework**: Supabase Edge Functions
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT tokens
- **Rate Limiting**: In-memory cache (100 requests/minute per user)

### Client-Side Integration
- **Hooks**: React Query hooks voor state management
- **UI Components**: React components met TypeScript
- **Error Handling**: Toast notifications en error boundaries
- **Real-time Updates**: Automatic cache invalidation

## 🔧 Edge Function Features

### 1. **Rate Limiting**
```typescript
// 100 requests per minute per user
const rateLimitCache = new Map<string, { count: number, resetTime: number }>()
```

### 2. **Super Admin Detection**
```typescript
function isSuperAdmin(email: string): boolean {
  return email === 'djoere@scailup.io'
}
```

### 3. **Transaction Logging**
- Alle credit operaties worden gelogd
- Balance before/after tracking
- Related ID linking voor audit trails
- Timestamp en user tracking

### 4. **Error Handling**
- Comprehensive try-catch blocks
- Detailed error messages
- Graceful degradation
- Logging voor monitoring

### 5. **Authentication & Authorization**
- JWT token validation
- Row Level Security (RLS)
- Admin privilege checks
- Client isolation

## 📡 API Endpoints

### Base URL
```
https://dtpibyzmwgvoealsawlx.supabase.co/functions/v1/credits-manager
```

### Request Format
```typescript
interface CreditRequest {
  action: 'add' | 'use' | 'check' | 'get_balance' | 'set_unlimited' | 'get_transactions'
  module_id?: string
  credit_type?: string
  amount?: number
  description?: string
  related_id?: string
  expires_at?: string
  client_id?: string // Only for admin operations
}
```

### Response Format
```typescript
interface CreditResponse {
  success: boolean
  data?: any
  error?: string
  balance?: number
  is_unlimited?: boolean
}
```

## 🔌 Available Actions

### 1. **Add Credits**
```typescript
POST /functions/v1/credits-manager
{
  "action": "add",
  "module_id": "uuid",
  "credit_type": "leads",
  "amount": 100,
  "description": "Welcome credits",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

### 2. **Use Credits**
```typescript
POST /functions/v1/credits-manager
{
  "action": "use",
  "module_id": "uuid",
  "credit_type": "leads",
  "amount": 1,
  "description": "Lead enrichment",
  "related_id": "lead-uuid"
}
```

### 3. **Check Credits**
```typescript
POST /functions/v1/credits-manager
{
  "action": "check",
  "module_id": "uuid",
  "credit_type": "leads",
  "amount": 5
}
```

### 4. **Get Balance**
```typescript
POST /functions/v1/credits-manager
{
  "action": "get_balance",
  "module_id": "uuid",
  "credit_type": "leads"
}
```

### 5. **Set Unlimited Credits** (Admin Only)
```typescript
POST /functions/v1/credits-manager
{
  "action": "set_unlimited",
  "module_id": "uuid",
  "credit_type": "leads",
  "client_id": "uuid" // Optional, for admin operations on other clients
}
```

### 6. **Get Transactions**
```typescript
POST /functions/v1/credits-manager
{
  "action": "get_transactions",
  "amount": 50 // Limit number of transactions
}
```

## 🎣 React Hooks

### 1. **useEdgeCreditBalance**
```typescript
const { data: balance, isLoading } = useEdgeCreditBalance(moduleId, creditType);
// Returns: { balance: number, is_unlimited: boolean }
```

### 2. **useEdgeUseCredits**
```typescript
const useCredits = useEdgeUseCredits();
await useCredits.mutateAsync({
  moduleId: "uuid",
  creditType: "leads",
  amount: 1,
  description: "Lead enrichment"
});
```

### 3. **useEdgeAddCredits**
```typescript
const addCredits = useEdgeAddCredits();
await addCredits.mutateAsync({
  moduleId: "uuid",
  creditType: "leads",
  amount: 100,
  description: "Welcome credits"
});
```

### 4. **useEdgeSetUnlimitedCredits** (Admin Only)
```typescript
const setUnlimited = useEdgeSetUnlimitedCredits();
await setUnlimited.mutateAsync({
  moduleId: "uuid",
  creditType: "leads"
});
```

### 5. **useEdgeCreditAnalytics**
```typescript
const { data: analytics } = useEdgeCreditAnalytics();
// Returns: { todayUsage, thisWeekUsage, thisMonthUsage, totalTransactions }
```

### 6. **useEdgeBulkCreditOperations** (Admin Only)
```typescript
const bulkOps = useEdgeBulkCreditOperations();
await bulkOps.mutateAsync({
  operations: [
    { action: 'add', module_id: 'uuid', credit_type: 'leads', amount: 100 },
    { action: 'set_unlimited', module_id: 'uuid', credit_type: 'emails' }
  ]
});
```

## 🛡️ Security Features

### 1. **Rate Limiting**
- 100 requests per minute per user
- Automatic reset after 1 minute
- 429 status code when exceeded

### 2. **Authentication**
- JWT token validation
- Automatic session management
- Secure token handling

### 3. **Authorization**
- Super admin detection (djoere@scailup.io)
- Admin-only operations protection
- Client isolation

### 4. **Input Validation**
- Required field validation
- Type checking
- Amount validation (positive numbers)

### 5. **Error Handling**
- Comprehensive error messages
- Graceful degradation
- Detailed logging

## 📊 Monitoring & Analytics

### 1. **Transaction Logging**
```sql
-- All transactions are logged with:
- User ID
- Client ID
- Module ID
- Credit Type
- Amount
- Balance Before/After
- Description
- Related ID
- Timestamp
```

### 2. **Usage Analytics**
- Daily usage tracking
- Weekly usage aggregation
- Monthly usage reports
- Transaction history

### 3. **Performance Monitoring**
- Response time tracking
- Error rate monitoring
- Rate limit hit tracking
- Success/failure ratios

## 🚀 Deployment

### 1. **Deploy Edge Function**
```bash
# Make script executable
chmod +x deploy-edge-function.sh

# Deploy
./deploy-edge-function.sh
```

### 2. **Environment Variables**
```bash
SUPABASE_URL=https://dtpibyzmwgvoealsawlx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. **Verify Deployment**
```bash
# Check function status
supabase functions list

# Test function
curl -X POST https://dtpibyzmwgvoealsawlx.supabase.co/functions/v1/credits-manager \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"get_balance","module_id":"uuid","credit_type":"leads"}'
```

## 🎨 UI Components

### 1. **EdgeCreditSystemOverview**
- Real-time credit balance display
- Interactive credit management
- Transaction history
- Analytics dashboard
- Admin controls

### 2. **Features**
- Module selection dropdown
- Credit type selection
- Amount input with validation
- Description field
- Action buttons (Use/Add/Set Unlimited)
- Real-time balance updates
- Transaction history display
- Admin privilege indicators

## 🔄 Migration Strategy

### 1. **Backward Compatibility**
- All existing hooks blijven werken
- Gradual migration mogelijk
- No breaking changes

### 2. **Migration Steps**
```typescript
// 1. Deploy Edge Function
./deploy-edge-function.sh

// 2. Update components gradually
// Replace useUseCredits with useEdgeUseCredits

// 3. Test thoroughly
// Verify all functionality works

// 4. Monitor performance
// Check logs and analytics
```

### 3. **Rollback Plan**
- Keep existing hooks functional
- Edge Function can be disabled
- Database remains unchanged

## 🧪 Testing

### 1. **Unit Tests**
```typescript
// Test rate limiting
// Test admin detection
// Test error handling
// Test transaction logging
```

### 2. **Integration Tests**
```typescript
// Test with real database
// Test authentication flow
// Test admin operations
// Test bulk operations
```

### 3. **Load Testing**
```bash
# Test rate limiting
# Test concurrent requests
# Test error scenarios
```

## 📈 Performance

### 1. **Edge Function Benefits**
- Global distribution
- Low latency
- Automatic scaling
- Built-in caching

### 2. **Optimizations**
- Efficient database queries
- Minimal data transfer
- Smart caching strategies
- Rate limiting protection

### 3. **Monitoring**
- Response time tracking
- Error rate monitoring
- Usage analytics
- Performance alerts

## 🔮 Future Enhancements

### 1. **Advanced Features**
- Credit packages and bundles
- Automatic refill systems
- Credit sharing between modules
- Advanced analytics and reporting

### 2. **Integration**
- Webhook notifications
- Email alerts
- Slack integration
- Custom dashboards

### 3. **Scalability**
- Multi-region deployment
- Advanced caching
- Database optimization
- Load balancing

## 🛠️ Troubleshooting

### 1. **Common Issues**
```typescript
// Rate limit exceeded
if (error.message.includes('Rate limit exceeded')) {
  // Wait and retry
}

// Authentication failed
if (error.message.includes('Invalid authentication')) {
  // Refresh token
}

// Insufficient credits
if (error.message.includes('Insufficient credits')) {
  // Show upgrade prompt
}
```

### 2. **Debug Mode**
```typescript
// Enable debug logging
console.log('Edge function debug:', { request, response });
```

### 3. **Monitoring**
- Check Supabase logs
- Monitor function metrics
- Track error rates
- Analyze performance

## 📚 Lovable Compatibility

### 1. **API Compatibility**
- Same request/response format
- Same error handling
- Same authentication flow

### 2. **UI Compatibility**
- Same component structure
- Same styling approach
- Same user experience

### 3. **Data Compatibility**
- Same database schema
- Same data relationships
- Same business logic

## 🎉 Benefits

### 1. **Robustness**
- Enterprise-grade error handling
- Rate limiting protection
- Comprehensive logging
- Graceful degradation

### 2. **Security**
- JWT authentication
- Admin privilege checks
- Input validation
- Row Level Security

### 3. **Performance**
- Global edge distribution
- Low latency responses
- Efficient caching
- Automatic scaling

### 4. **Monitoring**
- Real-time analytics
- Transaction tracking
- Performance metrics
- Error monitoring

### 5. **Developer Experience**
- TypeScript support
- React hooks
- Error boundaries
- Toast notifications

Het Edge Function Credits Management System is nu extreem robuust, veilig, en schaalbaar terwijl het volledig compatibel blijft met Lovable! 🚀 