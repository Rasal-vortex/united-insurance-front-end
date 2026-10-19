# Insurance CRM API — Collection Run Results

> **Purpose:** API test report for developers and coding agents. Use this document to understand the observed endpoint behavior, identify failed requests, and correct request configuration or route usage. Do not assume a failed test proves a backend defect; several failures in the source report are caused by missing credentials, incorrect roles, or incomplete URL parameters.

## Run Summary

- **Collection:** Insurance CRM API
- **Run date:** 2026-10-17
- **Total requests:** 53
- **Passed (reported in source summary):** 35
- **Failed (reported in source summary):** 18
- **Total time:** 2518 ms
- **Important discrepancy:** Counting the individual endpoint sections in the supplied report yields **29 Pass** and **24 Fail**, not the 35 Pass / 18 Fail stated in its summary. The endpoint-level results are preserved as written; verify the original collection run before treating either total as authoritative.

## Result Overview

The table below reflects the individual endpoint entries. Its tally is **29 Pass / 24 Fail**; this conflicts with the source report's headline summary of **35 Passed / 18 Failed**.

| # | Request | Method | Endpoint | HTTP status | Result |
|---:|---|---|---|---|---|
| 1 | Health check | GET | `/health` | 200 OK | **Pass** |
| 2 | Admin login | POST | `/api/auth/admin/login` | 200 OK | **Pass** |
| 3 | Branch login | POST | `/api/auth/branch/login` | 400 Bad Request | **Fail** |
| 4 | List branches | GET | `/api/branches?page=1&limit=10` | 200 OK | **Pass** |
| 5 | Create branches | POST | `/api/branches` | 409 Conflict | **Fail** |
| 6 | Get branches | GET | `/api/branches/` | 200 OK | **Pass** |
| 7 | Update branches | PATCH | `/api/branches/{id}` | 200 OK | **Pass** |
| 8 | List staff | GET | `/api/staff` | 200 OK | **Pass** |
| 9 | Create staff | POST | `/api/staff` | 401 Unauthorized | **Fail** |
| 10 | Get staff | GET | `/api/staff/{id}` | 200 OK | **Pass** |
| 11 | Update staff | PATCH | `/api/staff/{id}` | 403 Forbidden | **Fail** |
| 12 | List customers | GET | `/api/customers?page=1&limit=10` | 200 OK | **Pass** |
| 13 | Create customers | POST | `/api/customers` | 403 Forbidden | **Fail** |
| 14 | Get customers | GET | `/api/customers/` | 200 OK | **Pass** |
| 15 | Update customers | PATCH | `/api/customers/` | 404 Not Found | **Fail** |
| 16 | Delete customers | DELETE | `/api/customers/` | 404 Not Found | **Fail** |
| 17 | List leads | GET | `/api/leads?page=1&limit=10` | 200 OK | **Pass** |
| 18 | Create leads | POST | `/api/leads` | 403 Forbidden | **Fail** |
| 19 | Get leads | GET | `/api/leads/` | 200 OK | **Pass** |
| 20 | Update leads | PATCH | `/api/leads/` | 404 Not Found | **Fail** |
| 21 | Delete leads | DELETE | `/api/leads/` | 404 Not Found | **Fail** |
| 22 | Convert lead to customer | POST | `/api/leads//convert` | 404 Not Found | **Fail** |
| 23 | List policies | GET | `/api/policies?page=1&limit=10` | 200 OK | **Pass** |
| 24 | Create policies | POST | `/api/policies` | 403 Forbidden | **Fail** |
| 25 | Get policies | GET | `/api/policies/` | 200 OK | **Pass** |
| 26 | Update policies | PATCH | `/api/policies/` | 404 Not Found | **Fail** |
| 27 | List renewals | GET | `/api/renewals?page=1&limit=10` | 200 OK | **Pass** |
| 28 | Get renewals | GET | `/api/renewals/` | 200 OK | **Pass** |
| 29 | Update renewals | PATCH | `/api/renewals/` | 404 Not Found | **Fail** |
| 30 | List claims | GET | `/api/claims?page=1&limit=10` | 200 OK | **Pass** |
| 31 | Create claims | POST | `/api/claims` | 403 Forbidden | **Fail** |
| 32 | Get claims | GET | `/api/claims/` | 200 OK | **Pass** |
| 33 | Update claims | PATCH | `/api/claims/` | 404 Not Found | **Fail** |
| 34 | List follow-ups | GET | `/api/follow-ups?page=1&limit=10` | 200 OK | **Pass** |
| 35 | Create follow-ups | POST | `/api/follow-ups` | 403 Forbidden | **Fail** |
| 36 | Get follow-ups | GET | `/api/follow-ups/` | 200 OK | **Pass** |
| 37 | Update follow-ups | PATCH | `/api/follow-ups/` | 404 Not Found | **Fail** |
| 38 | Delete follow-ups | DELETE | `/api/follow-ups/` | 404 Not Found | **Fail** |
| 39 | List documents | GET | `/api/documents?page=1&limit=10` | 200 OK | **Pass** |
| 40 | Upload document | POST | `/api/documents/upload` | 403 Forbidden | **Fail** |
| 41 | Get document | GET | `/api/documents/` | 200 OK | **Pass** |
| 42 | Download document | GET | `/api/documents//content` | 404 Not Found | **Fail** |
| 43 | Delete document | DELETE | `/api/documents/` | 404 Not Found | **Fail** |
| 44 | List activities | GET | `/api/activities` | 200 OK | **Pass** |
| 45 | Get activity | GET | `/api/activities/` | 200 OK | **Pass** |
| 46 | List commissions | GET | `/api/commissions?page=1&limit=10` | 200 OK | **Pass** |
| 47 | Create commissions | POST | `/api/commissions` | 403 Forbidden | **Fail** |
| 48 | Get commissions | GET | `/api/commissions/` | 200 OK | **Pass** |
| 49 | Update commissions | PATCH | `/api/commissions/` | 404 Not Found | **Fail** |
| 50 | Dashboard KPIs | GET | `/api/dashboard` | 200 OK | **Pass** |
| 51 | Summary report | GET | `/api/reports/summary` | 200 OK | **Pass** |
| 52 | Renewals report | GET | `/api/reports/renewals` | 200 OK | **Pass** |
| 53 | Commissions report | GET | `/api/reports/commissions` | 200 OK | **Pass** |

## Endpoint Details

Each section below records the request and response observed in the supplied collection run. Response bodies are reproduced from the source report.

### 1. Health check

- **Method:** `GET`
- **Endpoint:** `/health`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":{"status":"ok"}}
```

### 2. Admin login

- **Method:** `POST`
- **Endpoint:** `/api/auth/admin/login`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"message":"Admin signed in successfully","data":{"user":{"id":"393e125d-be41-43cd-9181-64accc109707","name":"System Administrator","userType":"ADMIN"}}}
```

### 3. Branch login

- **Method:** `POST`
- **Endpoint:** `/api/auth/branch/login`
- **HTTP status:** `400 Bad Request`
- **Test result:** **Fail**
- **Suggested fix from source report:** Fill in valid branch username and password in the request body

**Response body:**

```json
{"success":false,"message":"Validation failed","errors":[{"field":"username","message":"String must contain at least 1 character(s)"},{"field":"password","message":"String must contain at least 1 character(s)"}]}
```

### 4. List branches

- **Method:** `GET`
- **Endpoint:** `/api/branches?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"6bc87276-26c4-42f2-9035-1c8d52dfc2f7","name":"South Branch","code":"SOUTH-01","status":"ACTIVE"},{"id":"f6f6c063-9c7d-463a-b1b4-735597c88ac0","name":"North Branch","code":"NORTH-01","status":"ACTIVE"}],"meta":{"page":1,"limit":10,"total":2,"totalPages":1}}
```

### 5. Create branches

- **Method:** `POST`
- **Endpoint:** `/api/branches`
- **HTTP status:** `409 Conflict`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a different branch name or code — this branch already exists in the DB

**Response body:**

```json
{"success":false,"message":"A record with this value already exists"}
```

### 6. Get branches

- **Method:** `GET`
- **Endpoint:** `/api/branches/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"6bc87276-26c4-42f2-9035-1c8d52dfc2f7","name":"South Branch","code":"SOUTH-01","status":"ACTIVE"},{"id":"f6f6c063-9c7d-463a-b1b4-735597c88ac0","name":"North Branch","code":"NORTH-01","status":"ACTIVE"}]}
```

### 7. Update branches

- **Method:** `PATCH`
- **Endpoint:** `/api/branches/{id}`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"message":"Branch updated successfully","data":{"id":"6bc87276-26c4-42f2-9035-1c8d52dfc2f7","name":"South Branch","code":"SOUTH-01","status":"ACTIVE"}}
```

### 8. List staff

- **Method:** `GET`
- **Endpoint:** `/api/staff`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"ef12fda9-58f6-4558-8bd7-e7a96f830698","name":"Abhiram","designation":"Advisor","status":"ACTIVE"},{"id":"9f6c1c61-0115-4d75-836b-4a15eb06a2b9","name":"Abhiram","designation":"Advisor","status":"ACTIVE"},{"id":"7413c7f6-8b6c-4c5c-9664-ef47ed3506f1","name":"Abhiram","designation":"Advisor","status":"ACTIVE"}],"meta":{"total":3}}
```

### 9. Create staff

- **Method:** `POST`
- **Endpoint:** `/api/staff`
- **HTTP status:** `401 Unauthorized`
- **Test result:** **Fail**
- **Suggested fix from source report:** Token variable was not set — ensure Admin login saves the token to a collection variable

**Response body:**

```json
{"success":false,"message":"Invalid or expired token"}
```

### 10. Get staff

- **Method:** `GET`
- **Endpoint:** `/api/staff/{id}`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":{"id":"ef12fda9-58f6-4558-8bd7-e7a96f830698","name":"Abhiram","phone":"36968522","email":"abi@gmail.com","designation":"Advisor","status":"ACTIVE"}}
```

### 11. Update staff

- **Method:** `PATCH`
- **Endpoint:** `/api/staff/{id}`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token for this request

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 12. List customers

- **Method:** `GET`
- **Endpoint:** `/api/customers?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"42d89de7-a12f-4e8a-b40d-320844ddb1b0","name":"lead member 01","phone":"86060362600","email":"sample@gmail.com","status":"ACTIVE"},{"id":"8c5ed1c4-6755-498d-ac30-a5d4faf53ca5","name":"John Doe","phone":"+1234567890","email":"john.doe@example.com","status":"ACTIVE"}],"meta":{"total":8}}
```

### 13. Create customers

- **Method:** `POST`
- **Endpoint:** `/api/customers`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 14. Get customers

- **Method:** `GET`
- **Endpoint:** `/api/customers/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"42d89de7-a12f-4e8a-b40d-320844ddb1b0","name":"lead member 01","status":"ACTIVE"},{"id":"8c5ed1c4-6755-498d-ac30-a5d4faf53ca5","name":"John Doe","status":"ACTIVE"}],"meta":{"total":8}}
```

### 15. Update customers

- **Method:** `PATCH`
- **Endpoint:** `/api/customers/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a customer ID to the URL: /api/customers/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/customers/"}


Fix: Add a customer ID to the URL: /api/customers/{id}
```

### 16. Delete customers

- **Method:** `DELETE`
- **Endpoint:** `/api/customers/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a customer ID to the URL: /api/customers/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: DELETE /api/customers/"}


Fix: Add a customer ID to the URL: /api/customers/{id}
```

### 17. List leads

- **Method:** `GET`
- **Endpoint:** `/api/leads?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"c4867ed5-a095-4e70-9def-eab82f717d2a","name":"lead member 01","source":"Referral","interest":"Motor insurance","status":"NEW"},{"id":"7a196a52-1be0-4440-a200-e6741cce843c","name":"lead member 01","status":"NEW"}],"meta":{"total":7}}
```

### 18. Create leads

- **Method:** `POST`
- **Endpoint:** `/api/leads`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 19. Get leads

- **Method:** `GET`
- **Endpoint:** `/api/leads/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"c4867ed5-a095-4e70-9def-eab82f717d2a","name":"lead member 01","source":"Referral","interest":"Motor insurance","status":"NEW"}],"meta":{"total":7}}
```

### 20. Update leads

- **Method:** `PATCH`
- **Endpoint:** `/api/leads/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a lead ID to the URL: /api/leads/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/leads/"}


Fix: Add a lead ID to the URL: /api/leads/{id}
```

### 21. Delete leads

- **Method:** `DELETE`
- **Endpoint:** `/api/leads/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a lead ID to the URL: /api/leads/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: DELETE /api/leads/"}


Fix: Add a lead ID to the URL: /api/leads/{id}
```

### 22. Convert lead to customer

- **Method:** `POST`
- **Endpoint:** `/api/leads//convert`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a lead ID to the URL: /api/leads/{id}/convert

**Response body:**

```json
{"success":false,"message":"Route not found: POST /api/leads//convert"}


Fix: Add a lead ID to the URL: /api/leads/{id}
```

### 23. List policies

- **Method:** `GET`
- **Endpoint:** `/api/policies?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"7b69700e-5398-4948-b4d2-a21b827a0d52","policyNumber":"POL-10001","status":"ACTIVE"}],"meta":{"total":1}}
```

### 24. Create policies

- **Method:** `POST`
- **Endpoint:** `/api/policies`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 25. Get policies

- **Method:** `GET`
- **Endpoint:** `/api/policies/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"7b69700e-5398-4948-b4d2-a21b827a0d52","policyNumber":"POL-10001","status":"ACTIVE"}]}
```

### 26. Update policies

- **Method:** `PATCH`
- **Endpoint:** `/api/policies/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a policy ID to the URL: /api/policies/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/policies/"}


Fix: Add a policy ID to the URL: /api/policies/{id}
```

### 27. List renewals

- **Method:** `GET`
- **Endpoint:** `/api/renewals?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"6c4b195c-028f-4575-9883-710c1cef819e","policyId":"7b69700e-5398-4948-b4d2-a21b827a0d52","dueDate":"2027-10-06","status":"UPCOMING"}],"meta":{"total":1}}
```

### 28. Get renewals

- **Method:** `GET`
- **Endpoint:** `/api/renewals/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"6c4b195c-028f-4575-9883-710c1cef819e","status":"UPCOMING"}]}
```

### 29. Update renewals

- **Method:** `PATCH`
- **Endpoint:** `/api/renewals/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a renewal ID to the URL: /api/renewals/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/renewals/"}


Fix: Add a renewal ID to the URL: /api/renewals/{id}
```

### 30. List claims

- **Method:** `GET`
- **Endpoint:** `/api/claims?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"c4744364-3f4b-4b48-a6d2-5c39b4ab44e6","policyId":"7b69700e-5398-4948-b4d2-a21b827a0d52","status":"OPEN"}],"meta":{"total":1}}
```

### 31. Create claims

- **Method:** `POST`
- **Endpoint:** `/api/claims`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 32. Get claims

- **Method:** `GET`
- **Endpoint:** `/api/claims/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"c4744364-3f4b-4b48-a6d2-5c39b4ab44e6","status":"OPEN"}]}
```

### 33. Update claims

- **Method:** `PATCH`
- **Endpoint:** `/api/claims/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a claim ID to the URL: /api/claims/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/claims/"}


Fix: Add a claim ID to the URL: /api/claims/{id}
```

### 34. List follow-ups

- **Method:** `GET`
- **Endpoint:** `/api/follow-ups?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"6139039e-c9f5-477e-95fe-874c27d24c5c","customerId":"c6c24b98-83dc-4173-a158-17ad69eb9580","status":"PENDING"}],"meta":{"total":1}}
```

### 35. Create follow-ups

- **Method:** `POST`
- **Endpoint:** `/api/follow-ups`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 36. Get follow-ups

- **Method:** `GET`
- **Endpoint:** `/api/follow-ups/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"6139039e-c9f5-477e-95fe-874c27d24c5c","status":"PENDING"}]}
```

### 37. Update follow-ups

- **Method:** `PATCH`
- **Endpoint:** `/api/follow-ups/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a follow-up ID to the URL: /api/follow-ups/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/follow-ups/"}


Fix: Add a follow-up ID to the URL: /api/follow-ups/{id}
```

### 38. Delete follow-ups

- **Method:** `DELETE`
- **Endpoint:** `/api/follow-ups/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a follow-up ID to the URL: /api/follow-ups/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: DELETE /api/follow-ups/"}


Fix: Add a follow-up ID to the URL: /api/follow-ups/{id}
```

### 39. List documents

- **Method:** `GET`
- **Endpoint:** `/api/documents?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"5784f93a-c680-4545-9c8d-c9858bdda328","customerId":"c6c24b98-83dc-4173-a158-17ad69eb9580","fileName":"sample.pdf","fileType":"application/pdf"}],"meta":{"total":1}}
```

### 40. Upload document

- **Method:** `POST`
- **Endpoint:** `/api/documents/upload`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 41. Get document

- **Method:** `GET`
- **Endpoint:** `/api/documents/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"5784f93a-c680-4545-9c8d-c9858bdda328","fileName":"sample.pdf"}]}
```

### 42. Download document

- **Method:** `GET`
- **Endpoint:** `/api/documents//content`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a document ID to the URL: /api/documents/{id}/content

**Response body:**

```json
{"success":false,"message":"Route not found: GET /api/documents//content"}


Fix: Add a document ID to the URL: /api/documents/{id}
```

### 43. Delete document

- **Method:** `DELETE`
- **Endpoint:** `/api/documents/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a document ID to the URL: /api/documents/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: DELETE /api/documents/"}


Fix: Add a document ID to the URL: /api/documents/{id}
```

### 44. List activities

- **Method:** `GET`
- **Endpoint:** `/api/activities`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"3d358c32-e927-4142-9116-6416c951a17a","customerId":"c6c24b98-83dc-4173-a158-17ad69eb9580","type":"POLICY_CREATED"}]}
```

### 45. Get activity

- **Method:** `GET`
- **Endpoint:** `/api/activities/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"3d358c32-e927-4142-9116-6416c951a17a","type":"POLICY_CREATED"}]}
```

### 46. List commissions

- **Method:** `GET`
- **Endpoint:** `/api/commissions?page=1&limit=10`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"8c8ba066-5c8c-4acc-876e-6bbb36e916ac","policyId":"7b69700e-5398-4948-b4d2-a21b827a0d52","amount":"150","status":"PENDING"}],"meta":{"total":1}}
```

### 47. Create commissions

- **Method:** `POST`
- **Endpoint:** `/api/commissions`
- **HTTP status:** `403 Forbidden`
- **Test result:** **Fail**
- **Suggested fix from source report:** Use a branch-level token

**Response body:**

```json
{"success":false,"message":"You do not have permission to perform this action"}
```

### 48. Get commissions

- **Method:** `GET`
- **Endpoint:** `/api/commissions/`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"id":"8c8ba066-5c8c-4acc-876e-6bbb36e916ac","amount":"150","status":"PENDING"}]}
```

### 49. Update commissions

- **Method:** `PATCH`
- **Endpoint:** `/api/commissions/`
- **HTTP status:** `404 Not Found`
- **Test result:** **Fail**
- **Suggested fix from source report:** Add a commission ID to the URL: /api/commissions/{id}

**Response body:**

```json
{"success":false,"message":"Route not found: PATCH /api/commissions/"}


Fix: Add a commission ID to the URL: /api/commissions/{id}
```

### 50. Dashboard KPIs

- **Method:** `GET`
- **Endpoint:** `/api/dashboard`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":{"branches":2,"staff":3,"customers":8,"openLeads":5,"policies":1,"claims":1,"openFollowUps":1,"commissionsPendingAmount":"150"}}
```

### 51. Summary report

- **Method:** `GET`
- **Endpoint:** `/api/reports/summary`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":{"customers":8,"leads":7,"policies":1,"claims":1}}
```

### 52. Renewals report

- **Method:** `GET`
- **Endpoint:** `/api/reports/renewals`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"status":"UPCOMING","count":1}]}
```

### 53. Commissions report

- **Method:** `GET`
- **Endpoint:** `/api/reports/commissions`
- **HTTP status:** `200 OK`
- **Test result:** **Pass**

**Response body:**

```json
{"success":true,"data":[{"status":"PENDING","count":1,"amount":"150"}]}
```

## Failure Triage — Grouped by Likely Cause

The groupings below are derived from the failed request responses and the source report's own suggested fixes. Verify each against the actual API implementation before changing backend behavior.

### 1. Missing or invalid request inputs

- **3. Branch login** — `400 Bad Request`. Fill in valid branch username and password in the request body
- **5. Create branches** — `409 Conflict`. Use a different branch name or code — this branch already exists in the DB

### 2. Authentication token or role/permission mismatch

- **9. Create staff** — `401 Unauthorized`. Token variable was not set — ensure Admin login saves the token to a collection variable
- **11. Update staff** — `403 Forbidden`. Use a branch-level token for this request
- **13. Create customers** — `403 Forbidden`. Use a branch-level token
- **18. Create leads** — `403 Forbidden`. Use a branch-level token
- **24. Create policies** — `403 Forbidden`. Use a branch-level token
- **31. Create claims** — `403 Forbidden`. Use a branch-level token
- **35. Create follow-ups** — `403 Forbidden`. Use a branch-level token
- **40. Upload document** — `403 Forbidden`. Use a branch-level token
- **47. Create commissions** — `403 Forbidden`. Use a branch-level token

### 3. Missing resource IDs in URL paths

- **15. Update customers** — `404 Not Found`. Add a customer ID to the URL: /api/customers/{id}
- **16. Delete customers** — `404 Not Found`. Add a customer ID to the URL: /api/customers/{id}
- **20. Update leads** — `404 Not Found`. Add a lead ID to the URL: /api/leads/{id}
- **21. Delete leads** — `404 Not Found`. Add a lead ID to the URL: /api/leads/{id}
- **22. Convert lead to customer** — `404 Not Found`. Add a lead ID to the URL: /api/leads/{id}/convert
- **26. Update policies** — `404 Not Found`. Add a policy ID to the URL: /api/policies/{id}
- **29. Update renewals** — `404 Not Found`. Add a renewal ID to the URL: /api/renewals/{id}
- **33. Update claims** — `404 Not Found`. Add a claim ID to the URL: /api/claims/{id}
- **37. Update follow-ups** — `404 Not Found`. Add a follow-up ID to the URL: /api/follow-ups/{id}
- **38. Delete follow-ups** — `404 Not Found`. Add a follow-up ID to the URL: /api/follow-ups/{id}
- **42. Download document** — `404 Not Found`. Add a document ID to the URL: /api/documents/{id}/content
- **43. Delete document** — `404 Not Found`. Add a document ID to the URL: /api/documents/{id}
- **49. Update commissions** — `404 Not Found`. Add a commission ID to the URL: /api/commissions/{id}

## Recommended Codex Workflow

1. Read this report before modifying the Insurance CRM frontend or API integration.
2. Inspect the repository's API client, environment variables, auth/session handling, route definitions, and request payload schemas.
3. Verify the intended API contract from the backend source or API documentation; do not infer missing fields or permissions from this report alone.
4. Fix request configuration first: valid branch credentials, token persistence, correct user role, and resource IDs in URL paths.
5. Re-run the collection and compare the results with this baseline.
6. Do not hard-code tokens, passwords, or other secrets. Use environment variables or the project's existing secure configuration pattern.

## Important Notes

- A `403 Forbidden` response indicates the request was understood but the caller was not authorized for that action in this run. Confirm the correct role and permission policy before changing backend authorization.
- A `404 Route not found` response in this report often corresponds to a URL with a missing resource ID, such as `/api/customers/` instead of `/api/customers/{id}`.
- The branch-login failure reports empty `username` and `password` fields; the source does not provide valid branch credentials.
- The branch-creation conflict indicates the submitted value already exists. Use a unique test record or clean up test data according to the project's rules.
- This report contains observed test results, not a complete API specification. Request bodies, query parameters, and undocumented response fields may need to be verified from the codebase.
