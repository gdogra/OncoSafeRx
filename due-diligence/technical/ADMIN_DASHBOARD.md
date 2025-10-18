# OncoSafeRx Admin Dashboard

The OncoSafeRx Admin Dashboard provides system administrators with comprehensive tools for managing users, monitoring system health, and controlling data synchronization operations.

## Features

### 1. Dashboard Overview
- **User Statistics**: Total users, active/inactive counts, role distribution
- **System Health**: Database connection status, service availability
- **Recent Activity**: Latest sync operations and system events

### 2. User Management
- **User Listing**: Paginated view of all registered users
- **User Details**: Individual user information and activity
- **Role Management**: Update user roles and permissions
- **Account Status**: Activate/deactivate user accounts

### 3. System Monitoring
- **Activity Logs**: System sync operations and their status
- **Configuration View**: Current system settings and environment
- **Performance Metrics**: System health indicators

### 4. Data Synchronization
- **RxNorm Sync**: Synchronize drug information from RxNorm API
- **CPIC Guidelines**: Update pharmacogenomic guidelines
- **Clinical Trials**: Refresh clinical trial data
- **Sync Status**: Monitor ongoing operations

### 5. Data Export
- **User Export**: Download user data in JSON format
- **System Logs**: Export activity logs for analysis
- **Statistics Export**: System usage and performance data

## Access and Authentication

### Prerequisites
- Admin role user account
- Valid authentication token
- Admin privileges verification

### Login Process
1. Navigate to `/admin.html`
2. Enter admin email and password
3. System verifies admin role
4. Access granted to dashboard features

## API Endpoints

### Authentication Required
All admin endpoints require:
- Valid JWT token in Authorization header
- Admin role verification
- Active user account

### Core Endpoints

#### Dashboard
```
GET /api/admin/dashboard
```
Returns system statistics and overview data.

#### User Management
```
GET /api/admin/users              # List all users
GET /api/admin/users/:userId      # Get user details
PUT /api/auth/users/:userId/role  # Update user role
PUT /api/auth/users/:userId/activate    # Activate user
PUT /api/auth/users/:userId/deactivate  # Deactivate user
```

#### System Monitoring
```
GET /api/admin/logs    # System activity logs
GET /api/admin/config  # System configuration
```

#### Data Operations
```
POST /api/admin/sync/rxnorm   # Sync RxNorm data
POST /api/admin/sync/cpic     # Sync CPIC guidelines
POST /api/admin/sync/trials   # Sync clinical trials
```

#### Data Export
```
GET /api/admin/export/users   # Export user data
GET /api/admin/export/logs    # Export system logs
GET /api/admin/export/stats   # Export statistics
```

## Security Features

### Role-Based Access Control
- Only users with 'admin' role can access admin endpoints
- JWT token validation on every request
- Session management and logout functionality

### Request Validation
- Input sanitization and validation
- Rate limiting applied to all endpoints
- CORS and security headers configured

### Data Protection
- Sensitive data (passwords) excluded from responses
- Secure token handling and storage
- Audit logging for admin actions

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for token signing
- `JWT_EXPIRES_IN`: Token expiration time
- `SUPABASE_URL`: Database connection URL
- `SUPABASE_SERVICE_ROLE_KEY`: Database service key

### Database Requirements
- Supabase or compatible PostgreSQL database
- Required tables: users, sync_logs, genes, drugs, etc.
- Proper Row Level Security (RLS) policies

## Usage Examples

### Creating Admin User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oncosaferx.com",
    "password": "securepassword123",
    "full_name": "System Administrator",
    "role": "admin"
  }'
```

### Accessing Dashboard Data
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Triggering Data Sync
```bash
curl -X POST http://localhost:3000/api/admin/sync/rxnorm \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Verify user has admin role
   - Check JWT token validity
   - Ensure token is properly formatted

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

3. **Sync Operation Failures**
   - Check external API availability
   - Verify rate limiting settings
   - Review error logs

### Monitoring and Logs
- Check browser console for frontend errors
- Review server logs for API issues
- Monitor sync operation status in dashboard

## Development and Testing

### Running Tests
```bash
npm test -- tests/integration/admin.test.js
```

### Local Development
1. Start the server: `npm run dev`
2. Navigate to `http://localhost:3000/admin.html`
3. Use test admin credentials for development

### API Testing
Use tools like Postman or curl to test admin endpoints with proper authentication headers.

## Future Enhancements

### Planned Features
- Real-time system monitoring
- Advanced user analytics
- Automated data sync scheduling
- Enhanced security auditing
- Multi-factor authentication
- Custom dashboard widgets

### Integration Opportunities
- Electronic Health Record (EHR) systems
- Clinical decision support tools
- Pharmacy management systems
- Research databases

---

For technical support or feature requests, please refer to the main project documentation or contact the development team.