## Console Deployment

#### 1. Verify Email in Amazon SES

- Go to AWS Console → SES → Verified identities
- Click Create identity → select Email address
- Enter your email address → click Create identity
- Check your inbox for a verification email from AWS and click the link
  Note: In SES sandbox mode both the sender and recipient addresses must be verified.

#### 2. Create IAM Role for Lambda

- Go to IAM → Roles → Create role
- Trusted entity type: AWS service → Use case: Lambda → click Next
- Search and attach AWSLambdaBasicExecutionRole → click Next
- Role name: ContactFormLambdaRole → click Create role
- Open the role → Add permissions → Create inline policy → switch to JSON tab and paste:

```
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ses:SendEmail", "ses:SendRawEmail"],
    "Resource": "*"
  }]
}
```

- Policy name: SESSendPolicy → click Create policy

#### 3. Create the Lambda Function

- Go to Lambda → Create function → Author from scratch
- Function name: ContactFormHandler
- Runtime: Node.js 16.x
- Under Permissions → Change default execution role → Use an existing role → select ContactFormLambdaRole
- Click Create function
- In the Code source editor, delete the default code and paste the full contents of lambda/index.js
- Click Deploy
- Click Configuration → Environment variables → Edit and add:
  - SENDER_EMAIL = your verified email
  - RECIPIENT_EMAIL = your verified email
- Click Save

#### 4. Create API Gateway

- Go to API Gateway → Create API → REST API (not private) → click Build
- API name: ContactFormAPI → click Create API
- Click Create resource → Resource name: contact → check CORS → click Create resource
- With /contact selected, click Create method
- Method type: POST | Integration type: Lambda function | Lambda proxy integration: ON
- Lambda function: ContactFormHandler → click Create method → click OK to grant permission
- With /contact selected, click Enable CORS → check POST and OPTIONS → click Save

#### 5. Deploy the API

- Click Deploy API (top right) → Stage: [New stage] → Stage name: prod → click Deploy
- Copy the Invoke URL — your full contact endpoint is <Invoke URL>/contact
- Open frontend/contact.html and replace YOUR_API_GATEWAY_ENDPOINT_HERE with your endpoint URL

#### Console Cleanup

- API Gateway → select ContactFormAPI → Actions → Delete API
- Lambda → select ContactFormHandler → Actions → Delete
- IAM → Roles → delete ContactFormLambdaRole (detach/delete policies first)
- SES → Verified identities → delete your verified email identity
