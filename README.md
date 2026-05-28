# Portfolio Website

A static portfolio website hosted on AWS S3 with CloudFront CDN distribution. No local server; it runs only in the cloud after deployment.

## Features

- Static site hosting on S3
- CloudFront CDN for global delivery
- Automated deployment via GitHub Actions
- Infrastructure as Code with Terraform
- HTTPS enabled by default

## Prerequisites

- AWS Account
- Terraform installed
- GitHub Account
- AWS CLI configured

## Quick Start

### 1. Deploy Infrastructure

```bash
cd terraform
```

Create `terraform.tfvars`:

```hcl
bucket_name = "your-unique-bucket-name"
aws_region  = "us-east-1"
```

Deploy:

```bash
terraform init
terraform plan
terraform apply
```

Get the CloudFront URL:

```bash
terraform output cloudfront_url
```

### 2. Configure GitHub Secrets

Under **Settings → Secrets and variables → Actions**, add:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` (from `terraform output s3_bucket_name`)
- `CLOUDFRONT_DISTRIBUTION_ID` (from `terraform output cloudfront_distribution_id`)

### 3. Deploy Site

Push to `main` branch. GitHub Actions will sync files to S3 and invalidate CloudFront cache.

## Project Structure

```
portfolio-website/
├── src/                    # Website files
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── terraform/              # Infrastructure
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── .github/workflows/      # CI/CD
    └── deploy.yml
```

## Cleanup

```bash
cd terraform
terraform destroy
```
