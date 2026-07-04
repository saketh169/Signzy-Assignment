# Signzy Flow - API Verification Test Guide

This document lists 6 practical verification test examples to test your dynamic configurations and mock integrations. Ensure the backend server is running on `http://localhost:5000` before running these requests.

---

## 1. POST - User Identity Validation (Chained Execution)
* **Route Path**: `/api/run/verify-identity`
* **Description**: Chains Step 1 (`step1` Mock A) to clean a username and Step 2 (`step2` Mock B) to fetch a credit rating using the clean username.
* **cURL Request**:
  ```bash
  curl -X POST http://localhost:5000/api/run/verify-identity \
       -H "Content-Type: application/json" \
       -d '{"inputValue": "ref123", "username": "saketh"}'
  ```
* **Expected JSON Response**:
  ```json
  {
    "status": "COMPLETED",
    "firstStepSuccess": "",
    "processedString": "SAKETH",
    "creditLevel": 780
  }
  ```

---

## 2. GET - User Profile Search (Query Fallback)
* **Route Path**: `/api/run/search-profile`
* **Description**: Takes a query-string input parameter `inputValue`, triggers Mock A to process the lookup, and returns query telemetry.
* **cURL Request**:
  ```bash
  curl -X GET "http://localhost:5000/api/run/search-profile?inputValue=saketh"
  ```
* **Expected JSON Response**:
  ```json
  {
    "searchQuery": "saketh",
    "processedUpper": "SAKETH",
    "issuingTime": "2026-07-04T15:41:54.348Z"
  }
  ```

---

## 3. PUT - Update Registration
* **Route Path**: `/api/run/update-user`
* **Description**: Triggers a PUT operation directly to Mock B to update registration reference details.
* **cURL Request**:
  ```bash
  curl -X PUT http://localhost:5000/api/run/update-user \
       -H "Content-Type: application/json" \
       -d '{"referenceValue": "saketh"}'
  ```
* **Expected JSON Response**:
  ```json
  {
    "updated": true,
    "registrationState": "REGISTERED",
    "scoreCode": "CODE-SAKETH"
  }
  ```

---

## 4. POST - Standard User Validation
* **Route Path**: `/api/run/validate-user`
* **Description**: Validates a single incoming user token input and cleans the value.
* **cURL Request**:
  ```bash
  curl -X POST http://localhost:5000/api/run/validate-user \
       -H "Content-Type: application/json" \
       -d '{"inputValue": "token_saketh"}'
  ```
* **Expected JSON Response**:
  ```json
  {
    "success": true,
    "userName": "TOKEN_SAKETH"
  }
  ```

---

## 5. Direct GET - Downstream Mock Service A
* **Route Path**: `/api/mock/first`
* **Description**: Directly calls downstream Mock Service A via GET to verify isolated parameter responses.
* **cURL Request**:
  ```bash
  curl -X GET "http://localhost:5000/api/mock/first?inputValue=ping"
  ```
* **Expected JSON Response**:
  ```json
  {
    "vendor": "Downstream Service A",
    "methodUsed": "GET",
    "status": "VERIFIED",
    "processedValue": "PING",
    "timestamp": "2026-07-04T15:41:54.348Z"
  }
  ```

---

## 6. Direct POST - Downstream Mock Service B
* **Route Path**: `/api/mock/second`
* **Description**: Directly calls downstream Mock Service B via POST to verify isolated payload calculations.
* **cURL Request**:
  ```bash
  curl -X POST http://localhost:5000/api/mock/second \
       -H "Content-Type: application/json" \
       -d '{"referenceValue": "saketh"}'
  ```
* **Expected JSON Response**:
  ```json
  {
    "vendor": "Downstream Service B",
    "methodUsed": "POST",
    "status": "ACTIVE",
    "creditScore": 780,
    "activeRegistration": "REGISTERED",
    "lookupCode": "CODE-SAKETH"
  }
  ```
