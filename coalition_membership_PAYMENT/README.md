# Payment Service

This is the payment service for the coalition membership system, handling ArifPay integration.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Base URL for the application
BASE_URL=https://eplffc.et

# Default ArifPay API Key (fallback)
DEFAULT_ARIFPAY_KEY=GtzNUYg9vislc0DyYdPZlN1KjeoK4Gtj
```

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## Features

- Dynamic API key support for different associations
- Configurable base URL via environment variables
- ArifPay payment processing
- Donation processing
- Payment verification