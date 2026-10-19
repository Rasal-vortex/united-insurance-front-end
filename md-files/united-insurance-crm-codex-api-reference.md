
### Admin login

`POST /api/auth/admin/login`

``` json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### Branch login

`POST /api/auth/branch/login`

``` json
{
  "username": "north-branch",
  "password": "branch-password"
}
```

Successful login returns a token and user data. The documented branch
user includes `id`, `name`, `userType: "BRANCH"`, `branchId`, and
`code`.

### Create a branch

`POST /api/branches` --- Admin token required.

``` json
{
  "name": "North Branch",
  "code": "NORTH",
  "username": "north-branch",
  "password": "change-this-password",
  "phone": "+1-555-0100",
  "email": "north@example.com",
  "address": "North district"
}
```

Creating a branch does **not** sign the user in as that branch. After
branch creation, log in with that branch's credentials and use its token
before creating staff or operational CRM records. Branch passwords are
never returned by the API.

## 3. Roles and authorization

-   `ADMIN`: Can create/manage branches and read CRM records across
    branches, subject to API permissions.
-   `BRANCH`: Works within its own branch and can perform branch-level
    write operations listed below.
-   After branch login, data is scoped by the API to that branch. Do not
    let a branch user select or change another branch.
-   The backend is the final authority. Hiding a button does not replace
    handling `401` and `403`.
-   Use IDs returned by the API for route parameters and related fields.
    Never invent UUIDs.

## 4. Endpoint reference

All paths are relative to the API origin.

  ------------------------------------------------------------------------------------
  Feature           Method            Endpoint                       Access / notes
  ----------------- ----------------- ------------------------------ -----------------
  Health            GET               `/health`                      Public

  Admin login       POST              `/api/auth/admin/login`        Public

  Branch login      POST              `/api/auth/branch/login`       Public

  Branches          GET               `/api/branches`                Collection run
                                                                     succeeded

  Branch list       GET               `/api/branches/`               Returned a list
  observed                                                           in the collection
                                                                     run; confirm
                                                                     contract

  Branches          POST              `/api/branches`                Admin; no DELETE
                                                                     documented

  Branches          PATCH             `/api/branches/:id`            Observed
                                                                     successful in the
                                                                     report; verify
                                                                     against backend

  Staff             GET               `/api/staff`, `/api/staff/:id` Admin, Branch

  Staff             POST, PATCH,      `/api/staff`, `/api/staff/:id` Branch
                    DELETE                                           

  Customers         GET               `/api/customers`,              Admin, Branch
                                      `/api/customers/:id`           

  Customers         POST, PATCH,      `/api/customers`,              Branch
                    DELETE            `/api/customers/:id`           

  Leads             GET               `/api/leads`, `/api/leads/:id` Admin, Branch

  Leads             POST, PATCH,      `/api/leads`, `/api/leads/:id` Branch
                    DELETE                                           

  Convert lead      POST              `/api/leads/:id/convert`       Branch

  Policies          GET               `/api/policies`,               Admin, Branch
                                      `/api/policies/:id`            

  Policies          POST, PATCH       `/api/policies`,               Branch; no DELETE
                                      `/api/policies/:id`            documented

  Renewals          GET               `/api/renewals`,               Admin, Branch
                                      `/api/renewals/:id`            

  Renewals          PATCH             `/api/renewals/:id`            Branch; no DELETE
                                                                     documented

  Claims            GET               `/api/claims`,                 Admin, Branch
                                      `/api/claims/:id`              

  Claims            POST, PATCH       `/api/claims`,                 Branch; no DELETE
                                      `/api/claims/:id`              documented

  Follow-ups        GET               `/api/follow-ups`,             Admin, Branch
                                      `/api/follow-ups/:id`          

  Follow-ups        POST, PATCH,      `/api/follow-ups`,             Branch
                    DELETE            `/api/follow-ups/:id`          

  Documents         GET               `/api/documents`,              Admin, Branch
                                      `/api/documents/:id`,          
                                      `/api/documents/:id/content`   

  Documents         POST              `/api/documents/upload`        Branch; multipart
                                                                     upload

  Documents         DELETE            `/api/documents/:id`           Branch

  Activities        GET               `/api/activities`,             Admin, Branch;
                                      `/api/activities/:id`          read-only

  Commissions       GET               `/api/commissions`,            Admin, Branch
                                      `/api/commissions/:id`         

  Commissions       POST, PATCH       `/api/commissions`,            Branch; no DELETE
                                      `/api/commissions/:id`         documented

  Dashboard         GET               `/api/dashboard`               Admin, Branch

  Reports           GET               `/api/reports/summary`         Admin, Branch

  Reports           GET               `/api/reports/renewals`        Admin, Branch

  Reports           GET               `/api/reports/commissions`     Admin, Branch
  ------------------------------------------------------------------------------------

Do not implement DELETE actions for branches, policies, renewals,
claims, activities, or commissions unless the backend contract changes.

## 5. Create request fields

Only send documented fields. Optional fields may be omitted. Send dates
as ISO-8601 strings when appropriate.

### Staff --- `POST /api/staff`

Required: `name`, `phone`

Optional: `email`, `designation`, `status` (`ACTIVE` or `INACTIVE`),
`joiningDate`

Create staff while signed in as the branch.

### Customer --- `POST /api/customers`

Required: `name`, `phone`

Optional: `email`, `dob`, `gender`, `address`, `notes`, `status`
(`ACTIVE` or `INACTIVE`), `staffId`

If provided, `staffId` must belong to this branch.

### Lead --- `POST /api/leads`

Required: `name`, `phone`

Optional: `email`, `source`, `interest`, `status` (`NEW`, `CONTACTED`,
`QUALIFIED`, `CONVERTED`, `LOST`), `nextFollowUpAt`, `notes`, `staffId`

### Policy --- `POST /api/policies`

Required: `customerId`, `policyNumber`, `insurer`, `product`,
`policyType`, `premium`, `startDate`, `expiryDate`

Optional: `status` (`ACTIVE`, `EXPIRED`, `CANCELLED`)

The customer must belong to this branch. Creating a policy also creates
a renewal and an activity record.

### Claim --- `POST /api/claims`

Required: `customerId`, `claimDate`

Optional: `policyId`, `claimNumber`, `status` (`REPORTED`,
`UNDER_REVIEW`, `APPROVED`, `REJECTED`, `SETTLED`), `amount`, `notes`

If `policyId` is provided, it must belong to the selected customer.

### Follow-up --- `POST /api/follow-ups`

Required: `title`, `dueAt`

Optional: `customerId`, `leadId`, `staffId`, `status` (`PENDING`,
`COMPLETED`, `CANCELLED`), `notes`, `completedAt`

Link the follow-up to the relevant customer or lead.

### Commission --- `POST /api/commissions`

Required: `amount`

Optional: `policyId`, `customerId`, `status` (`PENDING`, `PAID`,
`CANCELLED`), `earnedAt`, `paidAt`

Related IDs must belong to the same branch.

## 6. Document uploads

`POST /api/documents/upload`

-   Authenticate as a Branch user.
-   Use `multipart/form-data`.
-   File field name: `file`.
-   Text field: `type`.
-   Include at least one of `customerId`, `policyId`, or `claimId`.
-   Allowed formats: PDF, JPEG, PNG.
-   Default maximum size: 5 MB.
-   The API checks file signature and declared MIME type.
-   When using browser `FormData`, let the browser set the multipart
    content-type boundary.
-   Authenticated content endpoint: `/api/documents/:id/content`.
-   Content responses are file bytes, not a JSON envelope.
-   Do not expose uploaded files as public files.

## 7. Pagination and filters

Supported where applicable:

  Parameter     Behavior
  ------------- ---------------------------------------------------
  `page`        1-based; default `1`
  `limit`       Default `10`; valid range `1–100`
  `search`      Text search where supported
  `status`      Filter supported statuses; values vary by feature
  `sortBy`      Feature-specific sortable field
  `sortOrder`   `asc` or `desc`; default `desc`

Example:

`GET /api/policies?page=1&limit=10&status=ACTIVE&sortBy=expiryDate&sortOrder=asc`

Typical paginated response:

``` json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Do not assume every endpoint supports every query parameter. Verify
uncertain behavior against the backend.

## 8. Response and error handling

Typical success response:

``` json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "meta": {}
}
```

Validation error:

``` json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Required"
    }
  ]
}
```

  -------------------------------------------------------------------------
  Status                  Meaning                   Frontend behavior
  ----------------------- ------------------------- -----------------------
  `200` / `201`           Success                   Use returned `data`;
                                                    creates commonly return
                                                    `201`

  `400`                   Invalid                   Show field errors when
                          input/query/relation or   provided
                          upload                    

  `401`                   Missing/invalid/expired   Clear stale session and
                          token or invalid login    prompt sign-in

  `403`                   Role not permitted        Show a clear permission
                                                    message

  `404`                   Record missing or outside Show
                          caller scope              not-found/access-safe
                                                    message

  `409`                   Duplicate value or lead   Show conflict message
                          already converted         

  `500`                   Unexpected server error   Show a generic error;
                                                    do not expose internals
  -------------------------------------------------------------------------

Handle network failures and unexpected response shapes safely.

## 9. API collection test report

Run date: `2026-10-17`.

The report summary says 53 requests, 35 passed, 18 failed. Counting its
individual endpoint entries yields 29 Pass and 24 Fail. **The totals
conflict; rerun the collection before treating either tally as
authoritative.**

### Successful in the recorded run

-   `GET /health`
-   Admin login
-   `GET /api/branches`
-   `GET /api/branches/` (returned a list)
-   `PATCH /api/branches/:id`
-   List/detail reads for staff, customers, leads, policies, renewals,
    claims, follow-ups, documents, activities, and commissions. Some
    supposed "detail" requests omitted IDs and returned a list instead.
-   `GET /api/dashboard`
-   `GET /api/reports/summary`
-   `GET /api/reports/renewals`
-   `GET /api/reports/commissions`

### Observed dashboard response

``` json
{
  "success": true,
  "data": {
    "branches": 2,
    "staff": 3,
    "customers": 8,
    "openLeads": 5,
    "policies": 1,
    "claims": 1,
    "openFollowUps": 1,
    "commissionsPendingAmount": "150"
  }
}
```

### Observed report responses

Summary:

``` json
{
  "success": true,
  "data": {
    "customers": 8,
    "leads": 7,
    "policies": 1,
    "claims": 1
  }
}
```

Renewals:

``` json
{
  "success": true,
  "data": [
    {
      "status": "UPCOMING",
      "count": 1
    }
  ]
}
```

Commissions:

``` json
{
  "success": true,
  "data": [
    {
      "status": "PENDING",
      "count": 1,
      "amount": "150"
    }
  ]
}
```

### Failed requests and likely causes

1.  Branch login returned `400` because the request's `username` and
    `password` were empty. Valid branch credentials were not supplied in
    the report.
2.  Create branch returned `409` because the submitted branch name/code
    already existed.
3.  Create staff returned `401` (`Invalid or expired token`); the report
    says the collection token variable was missing.
4.  Several write requests returned `403` when the test used a role
    without permission. Retry with the intended Branch token, but verify
    authorization before changing backend code.
5.  Many update/delete/detail requests returned `404` because the URL
    omitted the resource ID, e.g. `/api/customers/` instead of
    `/api/customers/:id`.
6.  Lead conversion used `/api/leads//convert`; the lead ID was missing.
    Correct route shape: `/api/leads/:id/convert`.
7.  Document content download used `/api/documents//content`; the
    document ID was missing.
8.  Duplicate branch creation should be tested using a unique name/code
    or controlled test data.

These are reported explanations, not independent proof that every route
and permission has been verified.

## 10. Codex implementation rules

1.  Read this document before changing API integration.
2.  Inspect the repository, API client, environment variables,
    authentication/session handling, and routes before editing.
3.  Preserve the existing CRM UI and components; do not replace them
    with a generic template.
4.  Use the configured backend origin.
5.  Attach the current Bearer token to protected requests.
6.  Keep Admin and Branch sessions/roles clear. After branch creation,
    explicitly log in as that branch before creating staff and
    operational records.
7.  Use returned resource IDs for detail, update, delete, conversion,
    and relation requests.
8.  Follow documented permissions. Do not add unsupported endpoints or
    delete buttons.
9.  Do not fake successful API responses or silently replace real API
    data with mock data when requests fail.
10. Never hard-code credentials, JWTs, or secrets.
11. Implement clear loading, empty, validation, unauthorized, forbidden,
    not-found, conflict, network-error, and server-error states.
12. Run relevant tests and report actual results, not assumed results.

## 11. Contract gaps to verify

The supplied documents do not fully establish:

-   Token expiry or refresh behavior.
-   Complete response schemas for all resources.
-   Every supported filter and sort field per endpoint.
-   Whether `GET /api/branches/:id` is supported; the collection's
    `GET /api/branches/` returned a list.
-   Full dashboard/report query parameters.
-   Any endpoint not explicitly listed above.

When uncertain, inspect the backend source or ask for clarification. Do
not invent API behavior.
