# Security Architecture

## Security Measures Implemented

### 1. **SQL Injection Protection**
- ✅ All database queries use parameterized statements with `.bind()`
- ✅ No string concatenation in SQL queries
- ✅ Input sanitization before database operations

### 2. **Rate Limiting**
- ✅ IP-based rate limiting: 1 submission per 5 minutes per IP
- ✅ IP addresses are hashed (SHA-256) before storage for privacy
- ✅ Database indexes for efficient rate limit checks

### 3. **Input Validation**
- ✅ Days: Must be integer between 1-36500
- ✅ Username: Max 50 characters, trimmed
- ✅ Request size: Limited to 1KB
- ✅ Content-Type validation: Must be `application/json`
- ✅ Type checking for all inputs

### 4. **Username Validation**
- ✅ Case-insensitive duplicate detection (Alice = alice = ALICE)
- ✅ Length limits enforced
- ✅ Trimmed before storage
- ✅ Optional field (can be null)

### 5. **XSS (Cross-Site Scripting) Protection**
- ✅ Frontend uses `.textContent` instead of `.innerHTML`
- ✅ No user input rendered as HTML
- ✅ All data sanitized before display

### 6. **Error Handling**
- ✅ Generic error messages to clients (no stack traces)
- ✅ Detailed errors only in server logs
- ✅ Proper HTTP status codes

### 7. **CORS Configuration**
- ⚠️ Currently permissive (`*`) for development
- 🔧 TODO: Restrict to `https://hastheaibubblepoppedyet.com` in production

### 8. **Database Security**
- ✅ Indexes for performance (prevents DoS via slow queries)
- ✅ Prepared statements throughout
- ✅ IP hashing for privacy

## Attack Vectors Mitigated

| Attack Type | Mitigation |
|-------------|------------|
| SQL Injection | Parameterized queries with `.bind()` |
| XSS | `.textContent` usage, no HTML rendering of user input |
| Rate Limiting Bypass | IP-based tracking with 5-minute cooldown |
| Username Squatting | Case-insensitive duplicate detection |
| DoS (Large Requests) | 1KB request size limit |
| DoS (Database) | Indexed queries, rate limiting |
| Information Leakage | Generic error messages |
| Spam Submissions | IP rate limiting, username uniqueness |

## Known Limitations

1. **CORS is permissive** - Change `Access-Control-Allow-Origin: *` to specific domain
2. **No CAPTCHA** - Automated bots can still spam (within rate limits)
3. **IP spoofing** - Rate limiting relies on `CF-Connecting-IP` header (Cloudflare-specific)
4. **No email verification** - Usernames are not verified
5. **No admin interface** - Can't remove spam/abusive entries easily

## Recommendations for Production

### High Priority
1. Restrict CORS to your domain only
2. Consider adding Cloudflare Turnstile (CAPTCHA) for bot protection
3. Monitor database size and set up alerts

### Medium Priority
4. Add admin API for content moderation
5. Implement logging and monitoring
6. Add honeypot fields for bot detection

### Low Priority
7. Consider email verification for usernames
8. Add analytics to detect abuse patterns
9. Implement exponential backoff for repeat offenders

## Running Security Migration

To apply security indexes to existing database:

```bash
npx wrangler d1 execute bubble-predictions --remote --file=./schema/migration_001_security.sql
```

## Security Testing Checklist

- [ ] Verify rate limiting works (try 2 submissions in < 5 minutes)
- [ ] Test case-insensitive usernames (Alice, alice, ALICE)
- [ ] Try SQL injection payloads (should be blocked)
- [ ] Test XSS payloads in username (should be safe)
- [ ] Send oversized requests (should return 413)
- [ ] Test invalid input types (strings for numbers, etc.)
- [ ] Verify error messages don't leak sensitive info

## Reporting Security Issues

If you find a security vulnerability, please report it responsibly by emailing the repository owner directly rather than opening a public issue.
