# Project Title: Serverless Contact Form with Email Notification using AWS (Lambda + API Gateway + SES)

# Project Overview

This project is a fully serverless web application that allows users to submit a contact form from a frontend interface. The submitted data is processed by AWS Lambda through API Gateway and sent as an email using Amazon SES (Simple Email Service).

The system eliminates the need for traditional backend servers by using AWS managed services, ensuring scalability, low maintenance, and pay-per-use cost efficiency.

# Objective

The main objectives of this project are:

- To build a serverless backend system using AWS services
- To process user input securely via API Gateway and Lambda
- To send automated email notifications using Amazon SES
- To integrate a static frontend with cloud backend services
- To understand event-driven architecture in real-world applications

# Architecture Diagram (Logical Flow)

Frontend (contact.html)
↓
API Gateway (HTTP API Endpoint)
↓
AWS Lambda (Node.js backend logic)
↓
Amazon SES (Email Service)
↓
Recipient Email Inbox

# AWS Services Used

##### 1. AWS Lambda:

- Runs backend code without server management
- Handles request validation and email formatting
- Executes only when triggered

##### 2. Amazon API Gateway:

- Provides REST API endpoint (/contact)
- Acts as the entry point for frontend requests
- Handles HTTP methods (POST, OPTIONS)

###### 3. Amazon SES (Simple Email Service)

- Sends email notifications
- Requires verified sender and recipient emails
- Used for contact form message delivery

##### 4. IAM (Identity and Access Management)

Provides secure permissions for Lambda
Allows Lambda to access SES services
Ensures least privilege security model

##### 5. CloudWatch Logs

Used for monitoring Lambda execution
Helps in debugging errors and failures

##### 6. Project Workflow

Step-by-step execution flow:

- User fills the contact form in contact.html
- JavaScript sends data via POST request
- API Gateway receives request
- API Gateway triggers AWS Lambda
- Lambda:
  - Validates input
  - Formats email content
  - Calls SES service
- SES sends email to recipient inbox
- Response is returned to frontend

###### 7. Frontend (contact.html)

Features:

- Simple responsive UI
- Form validation (name, email, message)
- Loading spinner during request
- Success and error message handling

Functionality:

- Uses fetch() API to send data to AWS endpoint
- Displays real-time response from backend

##### 8. Backend (Lambda Function - Node.js)

Key responsibilities:

- Parse incoming JSON request
- Validate required fields
- Validate email format
- Escape HTML to prevent injection attacks
- Create email body (text + HTML format)
- Send email using AWS SES
- Return success/error response

##### 9. Deployment Steps Summary

1. SES Setup
   - Verified sender and receiver email addresses
2. IAM Role
   - Created Lambda execution role
   - Added permissions:
     - ses:SendEmail
     - ses:SendRawEmail
3. Lambda Deployment
   - Node.js function deployed
   - Environment variables configured:
     - SENDER_EMAIL
     - RECIPIENT_EMAIL
4. API Gateway Setup
   - REST API created
   - /contact resource added
   - POST + OPTIONS methods configured
   - Lambda proxy integration enabled
5. Frontend Integration
   - API endpoint added to contact.html
   - Form connected to backend via fetch API
