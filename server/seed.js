const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CloudResource = require('./models/CloudResource');
const SecurityEvent = require('./models/SecurityEvent');
const Alert = require('./models/Alert');
const Incident = require('./models/Incident');
const AuditLog = require('./models/AuditLog');
const config = require('./config/config');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to database.');

    // Clear existing collections
    console.log('[Seed] Clearing existing demo data...');
    await Promise.all([
      User.deleteMany({}),
      CloudResource.deleteMany({}),
      SecurityEvent.deleteMany({}),
      Alert.deleteMany({}),
      Incident.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 1. Create Users
    console.log('[Seed] Seeding Users...');
    const adminUser = await User.create({
      name: 'Sarah Connor (CISO)',
      email: 'admin@cloudguard.io',
      password: 'Admin@123',
      role: 'Admin',
      department: 'Cloud Security Architecture',
      isActive: true,
      lastLogin: new Date()
    });

    const analystUser = await User.create({
      name: 'Alex Rivera (SOC Lead)',
      email: 'analyst@cloudguard.io',
      password: 'Analyst@123',
      role: 'Security Analyst',
      department: 'SOC Tier 2 Operations',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000)
    });

    // 2. Create Cloud Resources (10 resources)
    console.log('[Seed] Seeding Cloud Resources...');
    const resources = await CloudResource.create([
      {
        resourceId: 'res-ec2-prod-web-01',
        name: 'prod-web-frontend-01',
        type: 'EC2 Server',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Active',
        securityScore: 88,
        riskLevel: 'Low',
        lastChecked: new Date(),
        tags: { environment: 'Production', owner: 'Web Platform Team', criticality: 'High' },
        configurationDetails: {
          publicAccess: true,
          encryptionEnabled: true,
          mfaEnabled: true,
          backupEnabled: true,
          firewallRulesCount: 6,
          openPorts: [80, 443]
        },
        vulnerabilities: [
          { cve: 'CVE-2024-21626', title: 'Container runc privilege escalation', severity: 'Medium', status: 'Remediated' }
        ]
      },
      {
        resourceId: 'res-ec2-bastion-01',
        name: 'bastion-ssh-gateway',
        type: 'EC2 Server',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Warning',
        securityScore: 54,
        riskLevel: 'Medium',
        lastChecked: new Date(Date.now() - 1800000),
        tags: { environment: 'Production', owner: 'Infra Sec', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: true,
          encryptionEnabled: true,
          mfaEnabled: false,
          backupEnabled: true,
          firewallRulesCount: 2,
          openPorts: [22]
        },
        vulnerabilities: [
          { cve: 'CVE-2024-6387', title: 'regreSSHion OpenSSH RCE flaw', severity: 'High', status: 'Open' }
        ]
      },
      {
        resourceId: 'res-s3-cust-records',
        name: 'cloudguard-customer-records-bucket',
        type: 'S3 Bucket',
        provider: 'AWS',
        region: 'us-west-2',
        status: 'Critical',
        securityScore: 28,
        riskLevel: 'Critical',
        lastChecked: new Date(Date.now() - 600000),
        tags: { environment: 'Production', owner: 'Data Engineering', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: true, // Danger: public bucket!
          encryptionEnabled: true,
          mfaEnabled: false,
          backupEnabled: true,
          firewallRulesCount: 1,
          openPorts: []
        },
        vulnerabilities: [
          { cve: 'POLICY-ERR-01', title: 'S3 Bucket Policy Allows Principal: * Access', severity: 'Critical', status: 'Open' }
        ]
      },
      {
        resourceId: 'res-s3-app-assets',
        name: 'static-frontend-assets-cdn',
        type: 'S3 Bucket',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Active',
        securityScore: 95,
        riskLevel: 'Low',
        lastChecked: new Date(),
        tags: { environment: 'Production', owner: 'Web Platform Team', criticality: 'Medium' },
        configurationDetails: {
          publicAccess: false,
          encryptionEnabled: true,
          mfaEnabled: true,
          backupEnabled: true,
          firewallRulesCount: 4,
          openPorts: []
        }
      },
      {
        resourceId: 'res-rds-postgres-main',
        name: 'prod-aurora-postgres-cluster',
        type: 'RDS Database',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Active',
        securityScore: 92,
        riskLevel: 'Low',
        lastChecked: new Date(),
        tags: { environment: 'Production', owner: 'Database Admins', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: false,
          encryptionEnabled: true,
          mfaEnabled: true,
          backupEnabled: true,
          firewallRulesCount: 3,
          openPorts: [5432]
        }
      },
      {
        resourceId: 'res-rds-analytics-replica',
        name: 'analytics-read-replica-db',
        type: 'RDS Database',
        provider: 'AWS',
        region: 'eu-central-1',
        status: 'Warning',
        securityScore: 68,
        riskLevel: 'Medium',
        lastChecked: new Date(Date.now() - 7200000),
        tags: { environment: 'Analytics', owner: 'BI Team', criticality: 'Medium' },
        configurationDetails: {
          publicAccess: false,
          encryptionEnabled: false, // Danger: unencrypted at rest
          mfaEnabled: true,
          backupEnabled: false,
          firewallRulesCount: 2,
          openPorts: [5432]
        }
      },
      {
        resourceId: 'res-apigw-customer-api',
        name: 'cloudguard-public-api-gateway',
        type: 'API Gateway',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Critical',
        securityScore: 38,
        riskLevel: 'High',
        lastChecked: new Date(Date.now() - 900000),
        tags: { environment: 'Production', owner: 'API Platform', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: true,
          encryptionEnabled: true,
          mfaEnabled: true,
          backupEnabled: true,
          firewallRulesCount: 8,
          openPorts: [443]
        },
        vulnerabilities: [
          { cve: 'WAF-BYPASS-03', title: 'WAF rate limit threshold too lenient (1000 req/s)', severity: 'High', status: 'Open' }
        ]
      },
      {
        resourceId: 'res-vpc-core-network',
        name: 'vpc-production-east-1',
        type: 'Virtual Network',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Active',
        securityScore: 94,
        riskLevel: 'Low',
        lastChecked: new Date(),
        tags: { environment: 'Core', owner: 'Network Engineering', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: false,
          encryptionEnabled: true,
          mfaEnabled: true,
          backupEnabled: true,
          firewallRulesCount: 18,
          openPorts: []
        }
      },
      {
        resourceId: 'res-iam-role-deployer',
        name: 'cicd-github-actions-deployer-role',
        type: 'IAM Role',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Warning',
        securityScore: 60,
        riskLevel: 'High',
        lastChecked: new Date(Date.now() - 3600000),
        tags: { environment: 'CI/CD', owner: 'DevOps', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: false,
          encryptionEnabled: true,
          mfaEnabled: false,
          backupEnabled: true,
          firewallRulesCount: 1,
          openPorts: []
        },
        vulnerabilities: [
          { cve: 'IAM-OVERPERM-01', title: 'Over-permissive wildcard policy (Action: *) attached', severity: 'High', status: 'Open' }
        ]
      },
      {
        resourceId: 'res-cloudtrail-global',
        name: 'cloudtrail-multi-region-audit-trail',
        type: 'CloudTrail',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Active',
        securityScore: 98,
        riskLevel: 'Low',
        lastChecked: new Date(),
        tags: { environment: 'Audit', owner: 'Security Team', criticality: 'Critical' },
        configurationDetails: {
          publicAccess: false,
          encryptionEnabled: true,
          mfaEnabled: true,
          backupEnabled: true,
          firewallRulesCount: 1,
          openPorts: []
        }
      }
    ]);

    // 3. Create Security Events (26 events)
    console.log('[Seed] Seeding Security Events...');
    const now = Date.now();
    const securityEventsData = [
      {
        eventId: 'SEC-2026-1001',
        eventType: 'Suspicious API Request',
        userOrIp: '194.26.29.114',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        timestamp: new Date(now - 1000 * 60 * 5),
        severity: 'Critical',
        description: 'Unusual spike in API request rate: 940 req/min directed towards /api/v1/auth/token endpoint.',
        riskScore: 94,
        category: 'API',
        metadata: { location: 'Bucharest, RO', requestCount: 940, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1002',
        eventType: 'Multiple Authentication Failures',
        userOrIp: '45.155.205.89',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 18),
        severity: 'Critical',
        description: '52 consecutive failed SSH password attempts for user "ubuntu" within 3 minutes.',
        riskScore: 89,
        category: 'Authentication',
        metadata: { location: 'Amsterdam, NL', requestCount: 52, protocol: 'SSH-2.0' }
      },
      {
        eventId: 'SEC-2026-1003',
        eventType: 'Policy Violation',
        userOrIp: 'svc-data-sync@internal',
        resource: 'cloudguard-customer-records-bucket',
        resourceType: 'S3 Bucket',
        timestamp: new Date(now - 1000 * 60 * 35),
        severity: 'Critical',
        description: 'S3 Bucket policy updated with Principal: * allowing public unauthenticated read access.',
        riskScore: 96,
        category: 'Data Protection',
        metadata: { location: 'Internal VPC', requestCount: 1, protocol: 'AWS-API' }
      },
      {
        eventId: 'SEC-2026-1004',
        eventType: 'Privilege Change',
        userOrIp: 'deployer-bot-ci',
        resource: 'cicd-github-actions-deployer-role',
        resourceType: 'IAM Role',
        timestamp: new Date(now - 1000 * 60 * 60),
        severity: 'High',
        description: 'IAM inline policy AdministratorAccess attached to role cicd-github-actions-deployer-role.',
        riskScore: 78,
        category: 'Access Control',
        metadata: { location: 'GitHub Runner', requestCount: 1, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1005',
        eventType: 'Unusual Network Activity',
        userOrIp: '185.220.101.5',
        resource: 'prod-web-frontend-01',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 95),
        severity: 'High',
        description: 'Inbound port scan detected on non-standard ports [8080, 8443, 9000, 9200, 27017].',
        riskScore: 72,
        category: 'Network',
        metadata: { location: 'Frankfurt, DE', requestCount: 120, protocol: 'TCP' }
      },
      {
        eventId: 'SEC-2026-1006',
        eventType: 'Failed Login Attempt',
        userOrIp: '198.51.100.44',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 120),
        severity: 'Medium',
        description: 'Single failed login attempt for administrative username "root".',
        riskScore: 48,
        category: 'Authentication',
        metadata: { location: 'Dallas, US', requestCount: 1, protocol: 'SSH' }
      },
      {
        eventId: 'SEC-2026-1007',
        eventType: 'Unauthorized Access',
        userOrIp: '103.208.220.15',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        timestamp: new Date(now - 1000 * 60 * 180),
        severity: 'High',
        description: 'HTTP 403 Forbidden burst on restricted /admin/metrics endpoint with expired JWT.',
        riskScore: 68,
        category: 'Access Control',
        metadata: { location: 'Singapore, SG', requestCount: 34, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1008',
        eventType: 'Data Exfiltration Attempt',
        userOrIp: '172.31.44.12',
        resource: 'cloudguard-customer-records-bucket',
        resourceType: 'S3 Bucket',
        timestamp: new Date(now - 1000 * 60 * 240),
        severity: 'Critical',
        description: 'High egress data transfer rate of 42.8 GB in 20 minutes from S3 to unknown external IP.',
        riskScore: 92,
        category: 'Data Protection',
        metadata: { location: 'Zurich, CH', requestCount: 1840, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1009',
        eventType: 'Failed Login Attempt',
        userOrIp: '203.0.113.19',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 300),
        severity: 'Medium',
        description: 'Failed login attempt for user "admin" via SSH password authentication.',
        riskScore: 42,
        category: 'Authentication',
        metadata: { location: 'Tokyo, JP', requestCount: 2, protocol: 'SSH' }
      },
      {
        eventId: 'SEC-2026-1010',
        eventType: 'Suspicious API Request',
        userOrIp: '91.240.118.80',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        timestamp: new Date(now - 1000 * 60 * 360),
        severity: 'High',
        description: 'SQL Injection patterns detected in HTTP GET query parameters (?id=1%27%20OR%201=1).',
        riskScore: 76,
        category: 'API',
        metadata: { location: 'Kyiv, UA', requestCount: 15, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1011',
        eventType: 'Unusual Network Activity',
        userOrIp: '10.0.1.45',
        resource: 'vpc-production-east-1',
        resourceType: 'Virtual Network',
        timestamp: new Date(now - 1000 * 60 * 420),
        severity: 'Low',
        description: 'VPC Flow log recorded abnormal DNS queries to dynamic DNS lookup service.',
        riskScore: 28,
        category: 'Network',
        metadata: { location: 'Internal Subnet', requestCount: 8, protocol: 'UDP' }
      },
      {
        eventId: 'SEC-2026-1012',
        eventType: 'Failed Login Attempt',
        userOrIp: '198.18.0.72',
        resource: 'prod-aurora-postgres-cluster',
        resourceType: 'RDS Database',
        timestamp: new Date(now - 1000 * 60 * 500),
        severity: 'Medium',
        description: 'Postgres connection rejected: password authentication failed for user "readonly_app".',
        riskScore: 50,
        category: 'Authentication',
        metadata: { location: 'Internal EC2', requestCount: 4, protocol: 'Postgres-TLS' }
      },
      {
        eventId: 'SEC-2026-1013',
        eventType: 'Privilege Change',
        userOrIp: 'admin@cloudguard.io',
        resource: 'cloudtrail-multi-region-audit-trail',
        resourceType: 'CloudTrail',
        timestamp: new Date(now - 1000 * 60 * 600),
        severity: 'Low',
        description: 'CloudTrail logging configuration verified and KMS encryption key rotated.',
        riskScore: 18,
        category: 'Access Control',
        metadata: { location: 'New York, US', requestCount: 1, protocol: 'AWS Console' }
      },
      {
        eventId: 'SEC-2026-1014',
        eventType: 'Unauthorized Access',
        userOrIp: '162.247.74.200',
        resource: 'cloudguard-customer-records-bucket',
        resourceType: 'S3 Bucket',
        timestamp: new Date(now - 1000 * 60 * 720),
        severity: 'High',
        description: 'Anonymous GET requests reading customer database export archive files.',
        riskScore: 82,
        category: 'Data Protection',
        metadata: { location: 'Reykjavik, IS', requestCount: 48, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1015',
        eventType: 'Suspicious API Request',
        userOrIp: '185.191.171.12',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        timestamp: new Date(now - 1000 * 60 * 840),
        severity: 'Medium',
        description: 'Directory traversal payload (../../etc/passwd) intercepted by CloudGuard WAF rule.',
        riskScore: 58,
        category: 'API',
        metadata: { location: 'Warsaw, PL', requestCount: 6, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1016',
        eventType: 'Multiple Authentication Failures',
        userOrIp: '193.106.191.24',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 960),
        severity: 'High',
        description: '28 failed authentication attempts from single IP address targeting port 22.',
        riskScore: 75,
        category: 'Authentication',
        metadata: { location: 'Sofia, BG', requestCount: 28, protocol: 'SSH' }
      },
      {
        eventId: 'SEC-2026-1017',
        eventType: 'Policy Violation',
        userOrIp: 'dev-user-09@internal',
        resource: 'analytics-read-replica-db',
        resourceType: 'RDS Database',
        timestamp: new Date(now - 1000 * 60 * 1100),
        severity: 'Medium',
        description: 'New RDS storage volume created without KMS customer-managed encryption key.',
        riskScore: 46,
        category: 'Data Protection',
        metadata: { location: 'Frankfurt, DE', requestCount: 1, protocol: 'AWS-CLI' }
      },
      {
        eventId: 'SEC-2026-1018',
        eventType: 'Unusual Network Activity',
        userOrIp: '198.51.100.99',
        resource: 'vpc-production-east-1',
        resourceType: 'Virtual Network',
        timestamp: new Date(now - 1000 * 60 * 1250),
        severity: 'Low',
        description: 'NTP synchronization drift detected on VPC gateway peer router.',
        riskScore: 22,
        category: 'Network',
        metadata: { location: 'Internal', requestCount: 3, protocol: 'UDP' }
      },
      {
        eventId: 'SEC-2026-1019',
        eventType: 'Failed Login Attempt',
        userOrIp: '80.82.77.33',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 1400),
        severity: 'Low',
        description: 'Single SSH connection timeout from external scanning host.',
        riskScore: 25,
        category: 'Authentication',
        metadata: { location: 'Vilnius, LT', requestCount: 1, protocol: 'SSH' }
      },
      {
        eventId: 'SEC-2026-1020',
        eventType: 'Unauthorized Access',
        userOrIp: '203.0.113.88',
        resource: 'prod-web-frontend-01',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 1600),
        severity: 'Medium',
        description: 'Automated crawler attempting to query hidden /.env and /.git/config paths.',
        riskScore: 52,
        category: 'Access Control',
        metadata: { location: 'Dublin, IE', requestCount: 22, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1021',
        eventType: 'Suspicious API Request',
        userOrIp: '192.0.2.14',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        timestamp: new Date(now - 1000 * 60 * 1800),
        severity: 'Medium',
        description: 'Cross-Site Scripting (XSS) payload detected in HTTP request payload headers.',
        riskScore: 55,
        category: 'API',
        metadata: { location: 'London, UK', requestCount: 5, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1022',
        eventType: 'Privilege Change',
        userOrIp: 'analyst@cloudguard.io',
        resource: 'cicd-github-actions-deployer-role',
        resourceType: 'IAM Role',
        timestamp: new Date(now - 1000 * 60 * 2100),
        severity: 'Low',
        description: 'Analyst reviewed and tagged IAM deployment role with compliance metadata.',
        riskScore: 15,
        category: 'Access Control',
        metadata: { location: 'SOC Console', requestCount: 1, protocol: 'HTTPS' }
      },
      {
        eventId: 'SEC-2026-1023',
        eventType: 'Failed Login Attempt',
        userOrIp: '198.51.100.101',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        timestamp: new Date(now - 1000 * 60 * 2400),
        severity: 'Low',
        description: 'Failed SSH login attempt for invalid username "git".',
        riskScore: 24,
        category: 'Authentication',
        metadata: { location: 'Paris, FR', requestCount: 1, protocol: 'SSH' }
      },
      {
        eventId: 'SEC-2026-1024',
        eventType: 'Data Exfiltration Attempt',
        userOrIp: '10.0.3.18',
        resource: 'prod-aurora-postgres-cluster',
        resourceType: 'RDS Database',
        timestamp: new Date(now - 1000 * 60 * 2700),
        severity: 'High',
        description: 'SELECT * query executed returning over 500,000 customer database rows at 03:15 AM.',
        riskScore: 79,
        category: 'Data Protection',
        metadata: { location: 'Analytics Worker', requestCount: 1, protocol: 'Postgres' }
      },
      {
        eventId: 'SEC-2026-1025',
        eventType: 'Unusual Network Activity',
        userOrIp: '198.18.0.200',
        resource: 'vpc-production-east-1',
        resourceType: 'Virtual Network',
        timestamp: new Date(now - 1000 * 60 * 3000),
        severity: 'Medium',
        description: 'Sudden spike in outbound ICMP echo packets towards external test ranges.',
        riskScore: 40,
        category: 'Network',
        metadata: { location: 'VPC Gateway', requestCount: 45, protocol: 'ICMP' }
      },
      {
        eventId: 'SEC-2026-1026',
        eventType: 'Policy Violation',
        userOrIp: 'auto-remediator@cloudguard',
        resource: 'cloudguard-customer-records-bucket',
        resourceType: 'S3 Bucket',
        timestamp: new Date(now - 1000 * 60 * 3200),
        severity: 'High',
        description: 'Automated policy check flagged missing server-side encryption default configuration.',
        riskScore: 66,
        category: 'Data Protection',
        metadata: { location: 'CloudGuard Scanner', requestCount: 1, protocol: 'Internal' }
      }
    ];
    await SecurityEvent.create(securityEventsData);

    // 4. Create Alerts (12 alerts)
    console.log('[Seed] Seeding Alerts...');
    const alerts = await Alert.create([
      {
        alertId: 'ALT-2026-0001',
        title: 'High-Volume API Flooding / DoS Signature Detected',
        severity: 'Critical',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        detectedTime: new Date(now - 1000 * 60 * 5),
        riskScore: 94,
        status: 'New',
        source: 'AI Anomaly Detector',
        description: 'AI Anomaly detector registered 940 API req/min from IP 194.26.29.114 against auth endpoint (baseline 10-25 req/min).',
        recommendedAction: 'Engage AWS WAF IP rate limit rule and temporarily blacklist originating /24 subnet.',
        assignedTo: 'Alex Rivera (SOC Lead)'
      },
      {
        alertId: 'ALT-2026-0002',
        title: 'Critical S3 Bucket Public Access Policy Exposure',
        severity: 'Critical',
        resource: 'cloudguard-customer-records-bucket',
        resourceType: 'S3 Bucket',
        detectedTime: new Date(now - 1000 * 60 * 35),
        riskScore: 96,
        status: 'Investigating',
        source: 'CloudTrail Audit',
        description: 'Public read/list permissions enabled on sensitive customer data bucket. Active anonymous access observed in access logs.',
        recommendedAction: 'Apply S3 Block Public Access immediately and review recent access logs for data exfiltration.',
        assignedTo: 'Alex Rivera (SOC Lead)'
      },
      {
        alertId: 'ALT-2026-0003',
        title: 'Sustained SSH Brute-Force Password Spraying Attack',
        severity: 'Critical',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        detectedTime: new Date(now - 1000 * 60 * 18),
        riskScore: 89,
        status: 'New',
        source: 'IDS/IPS',
        description: 'Over 50 failed SSH authentication attempts detected from 45.155.205.89 targeting default service accounts.',
        recommendedAction: 'Update security group to restrict port 22 access exclusively to corporate VPN IP addresses.',
        assignedTo: 'Unassigned'
      },
      {
        alertId: 'ALT-2026-0004',
        title: 'Unauthorized IAM AdministratorAccess Permission Grant',
        severity: 'High',
        resource: 'cicd-github-actions-deployer-role',
        resourceType: 'IAM Role',
        detectedTime: new Date(now - 1000 * 60 * 60),
        riskScore: 78,
        status: 'Investigating',
        source: 'Rule Engine',
        description: 'Privilege escalation alert: Service role assigned broad AdministratorAccess without change request ticket.',
        recommendedAction: 'Detach AdministratorAccess managed policy and replace with scoped least-privilege role policy.',
        assignedTo: 'Sarah Connor (CISO)'
      },
      {
        alertId: 'ALT-2026-0005',
        title: 'Large-Scale Egress Data Transfer Spike',
        severity: 'Critical',
        resource: 'cloudguard-customer-records-bucket',
        resourceType: 'S3 Bucket',
        detectedTime: new Date(now - 1000 * 60 * 240),
        riskScore: 92,
        status: 'Investigating',
        source: 'AI Anomaly Detector',
        description: '42.8 GB egress data transferred to IP 172.31.44.12 outside normal operating business hours.',
        recommendedAction: 'Initiate Incident Response Playbook IR-04 (Data Leakage Response). Quarantine destination endpoint.',
        assignedTo: 'Alex Rivera (SOC Lead)'
      },
      {
        alertId: 'ALT-2026-0006',
        title: 'Multi-Port Port-Scanning Activity Detected',
        severity: 'High',
        resource: 'prod-web-frontend-01',
        resourceType: 'EC2 Server',
        detectedTime: new Date(now - 1000 * 60 * 95),
        riskScore: 72,
        status: 'New',
        source: 'IDS/IPS',
        description: 'Host scan probing ports 8080, 8443, 9000, 9200 from external scanner IP 185.220.101.5.',
        recommendedAction: 'Verify security group rules and confirm external ports are dropped at border firewall.',
        assignedTo: 'Unassigned'
      },
      {
        alertId: 'ALT-2026-0007',
        title: 'SQL Injection Signature in API Query Parameters',
        severity: 'High',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        detectedTime: new Date(now - 1000 * 60 * 360),
        riskScore: 76,
        status: 'Resolved',
        source: 'AI Anomaly Detector',
        description: 'WAF successfully blocked SQLi probe payload. IP added to automatic 24-hour rate limit jail.',
        recommendedAction: 'Maintain current WAF managed rule set for SQLi inspection.',
        assignedTo: 'Alex Rivera (SOC Lead)',
        resolutionNotes: 'Mitigated by WAF managed rule AWS-AWSManagedRulesSQLiRuleSet. Attacker IP jailed.',
        resolvedAt: new Date(now - 1000 * 60 * 200)
      },
      {
        alertId: 'ALT-2026-0008',
        title: 'RDS Storage Volume Created Without KMS Encryption',
        severity: 'Medium',
        resource: 'analytics-read-replica-db',
        resourceType: 'RDS Database',
        detectedTime: new Date(now - 1000 * 60 * 1100),
        riskScore: 46,
        status: 'Investigating',
        source: 'Rule Engine',
        description: 'Compliance policy CIS AWS 2.3.1 violated: Database storage volume created with unencrypted EBS.',
        recommendedAction: 'Take snapshot, encrypt snapshot with AWS KMS, and restore to encrypted replica instance.',
        assignedTo: 'Alex Rivera (SOC Lead)'
      },
      {
        alertId: 'ALT-2026-0009',
        title: 'Directory Traversal Attempt Intercepted by WAF',
        severity: 'Medium',
        resource: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        detectedTime: new Date(now - 1000 * 60 * 840),
        riskScore: 58,
        status: 'Resolved',
        source: 'Rule Engine',
        description: 'HTTP request containing ../../etc/passwd pattern blocked with HTTP 403 Forbidden.',
        recommendedAction: 'Confirm web root path traversal sanitization in application code.',
        assignedTo: 'Alex Rivera (SOC Lead)',
        resolutionNotes: 'WAF core rule set blocked request. No backend penetration occurred.',
        resolvedAt: new Date(now - 1000 * 60 * 500)
      },
      {
        alertId: 'ALT-2026-0010',
        title: 'Anomalous Off-Hours Massive Query Execution',
        severity: 'High',
        resource: 'prod-aurora-postgres-cluster',
        resourceType: 'RDS Database',
        detectedTime: new Date(now - 1000 * 60 * 2700),
        riskScore: 79,
        status: 'False Positive',
        source: 'AI Anomaly Detector',
        description: 'Query selecting 500k records at 03:15 AM flagged as potential exfiltration attempt.',
        recommendedAction: 'Check scheduled analytics cron job schedules.',
        assignedTo: 'Alex Rivera (SOC Lead)',
        resolutionNotes: 'Verified with Analytics lead: Scheduled monthly BI export job was running legitimately.',
        resolvedAt: new Date(now - 1000 * 60 * 1500)
      },
      {
        alertId: 'ALT-2026-0011',
        title: 'Repeated Invalid Username Authentication Attempts',
        severity: 'Low',
        resource: 'bastion-ssh-gateway',
        resourceType: 'EC2 Server',
        detectedTime: new Date(now - 1000 * 60 * 960),
        riskScore: 30,
        status: 'Resolved',
        source: 'IDS/IPS',
        description: 'Internet-wide automated bot scanning for open SSH keys with invalid usernames.',
        recommendedAction: 'Ensure PasswordAuthentication no is enforced in sshd_config.',
        assignedTo: 'Alex Rivera (SOC Lead)',
        resolutionNotes: 'Verified: Host uses Ed25519 public keys only. Password auth is globally disabled.',
        resolvedAt: new Date(now - 1000 * 60 * 700)
      },
      {
        alertId: 'ALT-2026-0012',
        title: 'NTP Synchronization Drift on VPC Border Router',
        severity: 'Low',
        resource: 'vpc-production-east-1',
        resourceType: 'Virtual Network',
        detectedTime: new Date(now - 1000 * 60 * 1250),
        riskScore: 22,
        status: 'New',
        source: 'Rule Engine',
        description: '1.4 second time drift registered between VPC gateway peer clock and Amazon Time Sync Service.',
        recommendedAction: 'Resync local chrony service to 169.254.169.123.',
        assignedTo: 'Unassigned'
      }
    ]);

    // 5. Create Incidents (6 incidents)
    console.log('[Seed] Seeding Incidents...');
    await Incident.create([
      {
        incidentId: 'INC-2026-0101',
        title: 'Suspected S3 Data Exfiltration & Public Bucket Exposure',
        description: 'Customer records bucket cloudguard-customer-records-bucket had public access policy enabled, followed by 42.8 GB egress data movement to an external IP address in Zurich.',
        severity: 'Critical',
        status: 'Investigating',
        priority: 'P1',
        assignedAnalyst: analystUser._id,
        assignedAnalystName: analystUser.name,
        affectedResources: ['cloudguard-customer-records-bucket', 'prod-aurora-postgres-cluster'],
        linkedAlerts: ['ALT-2026-0002', 'ALT-2026-0005'],
        rootCause: 'Under active forensic analysis. Accidental Terraform state drift or compromised IAM credential suspected.',
        mitigationSteps: '1. Enabled S3 Block Public Access on bucket.\n2. Revoked active IAM session tokens.\n3. Analyzing VPC flow logs and CloudTrail S3 Data Events.',
        timeline: [
          {
            action: 'Incident Created',
            performedBy: 'System (AI Anomaly Detector)',
            timestamp: new Date(now - 1000 * 60 * 230),
            notes: 'High severity alert correlation triggered automated P1 incident creation.'
          },
          {
            action: 'Investigation Update',
            performedBy: analystUser.name,
            timestamp: new Date(now - 1000 * 60 * 180),
            notes: 'Confirmed bucket policy allowed anonymous Read access. Enabled S3 Block Public Access immediately.'
          },
          {
            action: 'Status changed to Investigating',
            performedBy: analystUser.name,
            timestamp: new Date(now - 1000 * 60 * 120),
            notes: 'Coordinating with Legal and Compliance regarding data impact assessment.'
          }
        ]
      },
      {
        incidentId: 'INC-2026-0102',
        title: 'Distributed DoS Flooding Against CloudGuard API Gateway',
        description: 'Unusual spike of 940 API requests/minute originating from multiple European proxy IPs attempting to overwhelm the authentication microservice.',
        severity: 'High',
        status: 'Contained',
        priority: 'P2',
        assignedAnalyst: analystUser._id,
        assignedAnalystName: analystUser.name,
        affectedResources: ['cloudguard-public-api-gateway'],
        linkedAlerts: ['ALT-2026-0001'],
        rootCause: 'Botnet credential stuffing and HTTP flooding targeting login endpoint.',
        mitigationSteps: 'Configured AWS WAF Rate-Based rule to drop connections exceeding 100 req/5min per IP.',
        timeline: [
          {
            action: 'Incident Created',
            performedBy: 'System',
            timestamp: new Date(now - 1000 * 60 * 45),
            notes: 'High volume anomaly detected by CloudGuard AI engine.'
          },
          {
            action: 'Status changed to Contained',
            performedBy: analystUser.name,
            timestamp: new Date(now - 1000 * 60 * 15),
            notes: 'WAF rate limiting rule activated. Inbound flood traffic dropped to under 15 req/min.'
          }
        ]
      },
      {
        incidentId: 'INC-2026-0103',
        title: 'Automated Credential Spraying Attack on Bastion Host',
        description: 'Bastion host ssh gateway sustained over 80 failed SSH authentication attempts across multiple attacker IP addresses.',
        severity: 'High',
        status: 'Open',
        priority: 'P2',
        assignedAnalyst: analystUser._id,
        assignedAnalystName: analystUser.name,
        affectedResources: ['bastion-ssh-gateway'],
        linkedAlerts: ['ALT-2026-0003', 'ALT-2026-0006'],
        rootCause: 'Security group opened port 22 to 0.0.0.0/0 without VPN restriction.',
        mitigationSteps: 'Restrict security group ingress on port 22 exclusively to corporate transit gateway CIDR.',
        timeline: [
          {
            action: 'Incident Created',
            performedBy: 'System',
            timestamp: new Date(now - 1000 * 60 * 30),
            notes: 'Multiple authentication failure threshold breached.'
          }
        ]
      },
      {
        incidentId: 'INC-2026-0104',
        title: 'CI/CD Service Role Privilege Escalation to AdministratorAccess',
        description: 'GitHub Actions deployer role cicd-github-actions-deployer-role modified to attach AdministratorAccess policy.',
        severity: 'High',
        status: 'Contained',
        priority: 'P2',
        assignedAnalyst: adminUser._id,
        assignedAnalystName: adminUser.name,
        affectedResources: ['cicd-github-actions-deployer-role'],
        linkedAlerts: ['ALT-2026-0004'],
        rootCause: 'Developer attempted to bypass deployment failure by granting admin rights during emergency release.',
        mitigationSteps: 'Detached AdministratorAccess policy. Rolled back IAM role policy to version 3.',
        timeline: [
          {
            action: 'Incident Created',
            performedBy: adminUser.name,
            timestamp: new Date(now - 1000 * 60 * 55),
            notes: 'Discovered during routine CloudTrail IAM audit.'
          },
          {
            action: 'Status changed to Contained',
            performedBy: adminUser.name,
            timestamp: new Date(now - 1000 * 60 * 40),
            notes: 'Wildcard policy detached. IAM permissions boundary enforced.'
          }
        ]
      },
      {
        incidentId: 'INC-2026-0105',
        title: 'WAF SQL Injection Exploit Campaign Interception',
        description: 'Broad automated SQL injection probe intercepted by WAF across API Gateway endpoints.',
        severity: 'Medium',
        status: 'Resolved',
        priority: 'P3',
        assignedAnalyst: analystUser._id,
        assignedAnalystName: analystUser.name,
        affectedResources: ['cloudguard-public-api-gateway'],
        linkedAlerts: ['ALT-2026-0007', 'ALT-2026-0009'],
        rootCause: 'External vulnerability scanner attempting standard OWASP Top 10 injection vectors.',
        mitigationSteps: 'All payloads dropped at perimeter WAF. No database connections reached.',
        timeline: [
          {
            action: 'Incident Created',
            performedBy: 'System',
            timestamp: new Date(now - 1000 * 60 * 350),
            notes: 'Correlated SQLi alerts created incident ticket.'
          },
          {
            action: 'Status changed to Resolved',
            performedBy: analystUser.name,
            timestamp: new Date(now - 1000 * 60 * 180),
            notes: 'Verified that all attack vectors were stopped by WAF with zero backend leakage.'
          }
        ]
      },
      {
        incidentId: 'INC-2026-0106',
        title: 'Unencrypted Analytics Read Replica Database Volume Detected',
        description: 'New RDS Read Replica in eu-central-1 provisioned without KMS encryption at rest in violation of SOC2 compliance.',
        severity: 'Medium',
        status: 'Investigating',
        priority: 'P3',
        assignedAnalyst: analystUser._id,
        assignedAnalystName: analystUser.name,
        affectedResources: ['analytics-read-replica-db'],
        linkedAlerts: ['ALT-2026-0008'],
        rootCause: 'Default Terraform variable encryption_enabled was false in module staging release.',
        mitigationSteps: 'Snapshot replica, encrypt with KMS customer-managed key, and replace replica.',
        timeline: [
          {
            action: 'Incident Created',
            performedBy: 'System',
            timestamp: new Date(now - 1000 * 60 * 1050),
            notes: 'Compliance scanner flagged unencrypted database.'
          }
        ]
      }
    ]);

    // 6. Create Audit Logs (15 logs)
    console.log('[Seed] Seeding Audit Logs...');
    await AuditLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'User Login',
        resourceAffected: 'CloudGuard Portal',
        description: `User ${adminUser.name} authenticated successfully with multi-factor authentication`,
        ipAddress: '192.168.1.105',
        timestamp: new Date(now - 1000 * 60 * 15)
      },
      {
        user: analystUser._id,
        userName: analystUser.name,
        userEmail: analystUser.email,
        userRole: analystUser.role,
        action: 'Alert Status Changed',
        resourceAffected: 'cloudguard-public-api-gateway',
        description: 'Alert ALT-2026-0007 status updated to Resolved with resolution note: Mitigated by WAF',
        ipAddress: '192.168.1.112',
        timestamp: new Date(now - 1000 * 60 * 30)
      },
      {
        user: analystUser._id,
        userName: analystUser.name,
        userEmail: analystUser.email,
        userRole: analystUser.role,
        action: 'Incident Updated',
        resourceAffected: 'cloudguard-customer-records-bucket',
        description: 'Incident INC-2026-0101 status updated to Investigating. Forensic review underway.',
        ipAddress: '192.168.1.112',
        timestamp: new Date(now - 1000 * 60 * 45)
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'Security Policy Updated',
        resourceAffected: 'cicd-github-actions-deployer-role',
        description: 'Enforced IAM permissions boundary and revoked wildcard AdministratorAccess policy',
        ipAddress: '192.168.1.105',
        timestamp: new Date(now - 1000 * 60 * 65)
      },
      {
        user: analystUser._id,
        userName: analystUser.name,
        userEmail: analystUser.email,
        userRole: analystUser.role,
        action: 'Resource Checked',
        resourceAffected: 'bastion-ssh-gateway',
        description: 'Manual vulnerability check performed for bastion-ssh-gateway (EC2 Server)',
        ipAddress: '192.168.1.112',
        timestamp: new Date(now - 1000 * 60 * 90)
      },
      {
        user: null,
        userName: 'System AI Engine',
        userEmail: 'ai-detector@cloudguard.io',
        userRole: 'System',
        action: 'Anomaly Analyzed',
        resourceAffected: 'cloudguard-public-api-gateway',
        description: 'AI Anomaly evaluation: ANOMALY DETECTED (Risk: 94/100, Severity: Critical)',
        ipAddress: '127.0.0.1',
        timestamp: new Date(now - 1000 * 60 * 120)
      },
      {
        user: analystUser._id,
        userName: analystUser.name,
        userEmail: analystUser.email,
        userRole: analystUser.role,
        action: 'Alert Status Changed',
        resourceAffected: 'prod-aurora-postgres-cluster',
        description: 'Alert ALT-2026-0010 status updated to False Positive (Verified with Analytics lead)',
        ipAddress: '192.168.1.112',
        timestamp: new Date(now - 1000 * 60 * 150)
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'Resource Checked',
        resourceAffected: 'cloudguard-customer-records-bucket',
        description: 'Resource security posture assessed: Score 28/100 (Critical risk)',
        ipAddress: '192.168.1.105',
        timestamp: new Date(now - 1000 * 60 * 180)
      },
      {
        user: analystUser._id,
        userName: analystUser.name,
        userEmail: analystUser.email,
        userRole: analystUser.role,
        action: 'User Login',
        resourceAffected: 'CloudGuard Portal',
        description: `User ${analystUser.name} logged into SOC analyst workstation`,
        ipAddress: '192.168.1.112',
        timestamp: new Date(now - 1000 * 60 * 240)
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'Incident Created',
        resourceAffected: 'cicd-github-actions-deployer-role',
        description: 'Incident INC-2026-0104 created: CI/CD Service Role Privilege Escalation',
        ipAddress: '192.168.1.105',
        timestamp: new Date(now - 1000 * 60 * 300)
      },
      {
        user: null,
        userName: 'System Agent',
        userEmail: 'system@cloudguard.io',
        userRole: 'System',
        action: 'Security Policy Updated',
        resourceAffected: 'WAF Ruleset',
        description: 'Automated IP blacklist updated: Added 194.26.29.114 to drop jail',
        ipAddress: '127.0.0.1',
        timestamp: new Date(now - 1000 * 60 * 360)
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'User Registered',
        resourceAffected: 'IAM User Store',
        description: `New user account created: ${analystUser.name} (${analystUser.role})`,
        ipAddress: '192.168.1.105',
        timestamp: new Date(now - 1000 * 60 * 420)
      },
      {
        user: analystUser._id,
        userName: analystUser.name,
        userEmail: analystUser.email,
        userRole: analystUser.role,
        action: 'Alert Status Changed',
        resourceAffected: 'bastion-ssh-gateway',
        description: 'Alert ALT-2026-0011 marked as Resolved (Key-based authentication confirmed)',
        ipAddress: '192.168.1.112',
        timestamp: new Date(now - 1000 * 60 * 500)
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'Resource Checked',
        resourceAffected: 'prod-aurora-postgres-cluster',
        description: 'Automated compliance scan verified encryption at rest with AWS KMS',
        ipAddress: '192.168.1.105',
        timestamp: new Date(now - 1000 * 60 * 600)
      },
      {
        user: null,
        userName: 'Unknown Visitor',
        userEmail: 'attacker@unknown.net',
        userRole: 'System',
        action: 'User Login',
        resourceAffected: 'CloudGuard Auth Endpoint',
        description: 'Failed login attempt for email: admin@cloudguard.io (Invalid password)',
        ipAddress: '185.191.171.12',
        timestamp: new Date(now - 1000 * 60 * 700)
      }
    ]);

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log(`👤 Demo Admin Account:    admin@cloudguard.io   / Admin@123`);
    console.log(`👤 Demo Analyst Account:  analyst@cloudguard.io / Analyst@123`);
    console.log(`📦 Cloud Resources:       10`);
    console.log(`🚨 Security Events:       26`);
    console.log(`⚠️  Alerts:                12`);
    console.log(`🔥 Incidents:             6`);
    console.log(`📜 Audit Logs:            15`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
