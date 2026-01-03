# Multi-stage build for Go payment verification service
FROM golang:1.21-alpine AS builder

WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the Go application (build all files, not just main.go)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o payment-verification-service .

# Final stage - use lightweight alpine image
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /build/payment-verification-service .

# Create logs directory
RUN mkdir -p /app/logs && chmod -R 755 /app

# Set environment variables
ENV DB_CONNECTION_STRING=""
ENV SMS_API_URL=""
ENV SMS_TOKEN=""
ENV API_BASE_URL=""
ENV CHECK_INTERVAL_MINUTES=2

# Run the service
CMD ["./payment-verification-service"]

