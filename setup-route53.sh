#!/bin/bash

# Route 53 Setup Script for Gamarriando
PROFILE="personal"
CLOUDFRONT_DOMAIN="d3votu5y2kryc7.cloudfront.net"
CLOUDFRONT_ID="E1NHZQ2VJ5HE9D"

echo "🌐 Route 53 Setup for Gamarriando"
echo "=================================="
echo ""

# Function to check domain availability
check_domain_availability() {
    local domain=$1
    echo "🔍 Checking availability for: $domain"
    
    aws route53domains check-domain-availability --domain-name "$domain" --profile "$PROFILE" 2>/dev/null | jq -r '.Availability'
}

# Function to register domain
register_domain() {
    local domain=$1
    echo "📝 Registering domain: $domain"
    
    # Create registration request
    cat > domain-registration.json << EOF
{
    "DomainName": "$domain",
    "DurationInYears": 1,
    "AutoRenew": true,
    "AdminContact": {
        "FirstName": "Hugo",
        "LastName": "Angeles",
        "ContactType": "PERSON",
        "OrganizationName": "Gamarriando",
        "AddressLine1": "Lima",
        "City": "Lima",
        "State": "Lima",
        "CountryCode": "PE",
        "ZipCode": "15001",
        "PhoneNumber": "+51.123456789",
        "Email": "admin@gamarriando.com"
    },
    "RegistrantContact": {
        "FirstName": "Hugo",
        "LastName": "Angeles",
        "ContactType": "PERSON",
        "OrganizationName": "Gamarriando",
        "AddressLine1": "Lima",
        "City": "Lima",
        "State": "Lima",
        "CountryCode": "PE",
        "ZipCode": "15001",
        "PhoneNumber": "+51.123456789",
        "Email": "admin@gamarriando.com"
    },
    "TechContact": {
        "FirstName": "Hugo",
        "LastName": "Angeles",
        "ContactType": "PERSON",
        "OrganizationName": "Gamarriando",
        "AddressLine1": "Lima",
        "City": "Lima",
        "State": "Lima",
        "CountryCode": "PE",
        "ZipCode": "15001",
        "PhoneNumber": "+51.123456789",
        "Email": "admin@gamarriando.com"
    }
}
EOF

    aws route53domains register-domain --cli-input-json file://domain-registration.json --profile "$PROFILE"
    rm domain-registration.json
}

# Function to create hosted zone
create_hosted_zone() {
    local domain=$1
    echo "🏗️ Creating hosted zone for: $domain"
    
    aws route53 create-hosted-zone --name "$domain" --caller-reference "gamarriando-$(date +%s)" --profile "$PROFILE"
}

# Function to create DNS records
create_dns_records() {
    local domain=$1
    local hosted_zone_id=$2
    
    echo "📋 Creating DNS records for: $domain"
    
    # Get the hosted zone ID
    if [ -z "$hosted_zone_id" ]; then
        hosted_zone_id=$(aws route53 list-hosted-zones --profile "$PROFILE" --query "HostedZones[?Name=='$domain.'].Id" --output text | cut -d'/' -f3)
    fi
    
    # Create A record for CloudFront
    cat > dns-records.json << EOF
{
    "Comment": "Gamarriando DNS Records",
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$domain",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$CLOUDFRONT_DOMAIN",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        },
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "www.$domain",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$CLOUDFRONT_DOMAIN",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        }
    ]
}
EOF

    aws route53 change-resource-record-sets --hosted-zone-id "$hosted_zone_id" --change-batch file://dns-records.json --profile "$PROFILE"
    rm dns-records.json
}

# Main menu
echo "Choose an option:"
echo "1. Check domain availability"
echo "2. Register a new domain"
echo "3. Create hosted zone for existing domain"
echo "4. Setup DNS records for CloudFront"
echo "5. Full setup (register + configure)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        read -p "Enter domain name (e.g., gamarriando.com): " domain
        check_domain_availability "$domain"
        ;;
    2)
        read -p "Enter domain name to register: " domain
        register_domain "$domain"
        ;;
    3)
        read -p "Enter domain name: " domain
        create_hosted_zone "$domain"
        ;;
    4)
        read -p "Enter domain name: " domain
        create_dns_records "$domain"
        ;;
    5)
        read -p "Enter domain name to register: " domain
        echo "Starting full setup for: $domain"
        check_domain_availability "$domain"
        read -p "Continue with registration? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            register_domain "$domain"
            echo "Waiting for domain registration to complete..."
            sleep 30
            create_hosted_zone "$domain"
            sleep 10
            create_dns_records "$domain"
        fi
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo "Your website will be available at: https://$domain"

