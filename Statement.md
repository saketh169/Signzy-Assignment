# SDE-1 Weekend Assignment – Low-Code API Orchestration Platform

---

## 🎯 Objective

Modern enterprises integrate with multiple third-party APIs (banks, government systems, payment gateways, KYC providers, etc.). Developing and maintaining custom integration code for every provider is expensive and difficult to scale.

Your task is to build a **configuration-driven API orchestration platform** that allows users to expose their own REST APIs without writing business logic for each integration. The platform should allow a user to define an API using configuration (JSON/YAML/Database/UI), map request and response fields, invoke one or more downstream APIs, transform data, and return the final response.

The goal is to demonstrate how software can be made configurable, reusable, and extensible rather than hardcoding every integration.

---

## 📋 Problem Statement

Build a platform that enables users to:
1. Define an API endpoint using configuration.
2. Accept incoming REST requests.
3. Validate incoming payloads.
4. Map request fields to downstream vendor APIs.
5. Invoke one or more external/mock APIs.
6. Transform or combine responses.
7. Return a standardized response.
8. Configure the workflow without changing application code.

### 💡 Example Scenario
Client calls:
`POST /verify-pan`

Your platform should determine (from configuration):
* Which vendor API(s) to invoke
* How to map incoming fields
* How to authenticate
* Which headers to send
* How to transform the vendor response
* What final response should be returned

*All of this must be executed dynamically without requiring code changes.*

---

## ⚙️ Functional Requirements

Your solution should support:
* **Dynamic API creation** through configuration
* **Request validation** of incoming payloads
* **Request/response field mapping** (variable matching)
* **HTTP API invocation** to external/mock endpoints
* **Multiple API orchestration** (chained downstream executions)
* **Conditional execution** (conditional rules for step runs)
* **Error handling & Retry mechanisms**
* **Standardized response format**
* **Execution logging & telemetry**

---

## 🧬 Example Use Cases

### 1️⃣ Simple Single-Step Flow
```text
Client ➔ Verify PAN ➔ Vendor A API ➔ Transform Response ➔ Return Result
```

### 2️⃣ Conditional Two-Step Flow
```text
Client ➔ Validate Aadhaar (Vendor A)
             └── If Success ➔ Verify Fraud Score (Vendor B) ➔ Merge Responses ➔ Return Final Response
```

### 3️⃣ Chained Multi-Step Flow
```text
Client ➔ Upload Document ➔ OCR API ➔ Fraud Detection API ➔ Face Match API ➔ Aggregate Result ➔ Return Response
```

---

## 🛠️ Technical Expectations & Deliverables

Your solution should demonstrate:
* **Clean Architecture** & Extensible design
* **Good Coding Practices**
* **Proper API Design & Error Handling**
* **Execution Logging**

### 📦 Deliverables
1. **Source Code**: Clean, well-structured, and modular.
2. **README**: Documenting setup and structure.
3. **Sample Configurations**: Demonstrating operational configurations.
4. **API Documentation**: Architectural diagram and testing cases.

---

## 🌟 Bonus Features (Optional)
* Visual workflow editor
* Authentication (JWT/API Key)
* Rate limiting
* Versioned APIs & workflow versioning
* Metrics telemetry endpoint
* Docker & Kubernetes support
* OpenAPI / Swagger portal
* Parallel execution & webhook support
* Caching & plugin architectures

---

## 🤖 Agentic AI Bonus
Additional bonus points will be awarded if your solution includes an AI Agent. Example capabilities:
* **Natural Language to Configuration**: Convert English prompts to dynamic configurations.
  * *Example prompt:* `"Create an API that validates a PAN using Vendor A and, if successful, fetches GST details from Vendor B."`
* **Automated Mappings**: Generate request/response mappings.
* **Orchestration Recommendations**: Detect invalid configurations or suggest workflow improvements.
* **Test Case Generation**: Generate test cases for configured endpoints.

---

## ⚖️ Evaluation Criteria
We are primarily evaluating:
* Engineering fundamentals & problem solving
* Software design & extensibility
* Code quality & proper API designs
* Documentation quality & creativity
* AI-assisted engineering (Bonus)

*We value thoughtful engineering decisions over the number of features implemented.*