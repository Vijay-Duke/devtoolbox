export class IAMPolicyVisualizer {
  constructor() {
    this.container = null;
    this.policyHistory = [];
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.loadExamplePolicy();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">AWS IAM Policy Visualizer</h1>
          <p class="text-gray-600 dark:text-gray-400">Analyze, visualize, and validate AWS IAM policies</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="analyze">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Analyze Policy
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="format">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 7 4 4 20 4 20 7"/>
              <line x1="9" y1="20" x2="15" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
            Format
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="validate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Validate
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Policy JSON</h3>
                <select id="example-policies" class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="">Load Example...</option>
                  <option value="s3-readonly">S3 Read-Only</option>
                  <option value="ec2-admin">EC2 Administrator</option>
                  <option value="lambda-basic">Lambda Basic Execution</option>
                  <option value="dynamodb-crud">DynamoDB CRUD</option>
                  <option value="iam-user">IAM User Permissions</option>
                  <option value="cloudwatch-logs">CloudWatch Logs</option>
                  <option value="vpc-admin">VPC Administrator</option>
                  <option value="custom-complex">Complex Custom Policy</option>
                </select>
              </div>
              <textarea 
                id="policy-input" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                placeholder='Enter IAM policy JSON here...'
                spellcheck="false"
                rows="20"
              ></textarea>
              
              <div class="mt-4 flex justify-between text-sm">
                <div id="json-status" class="text-gray-600 dark:text-gray-400"></div>
                <div id="char-count" class="text-gray-600 dark:text-gray-400">0 characters</div>
              </div>
            </div>
          </div>
          
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Policy Analysis</h3>
              <div id="analysis-results" class="space-y-4">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Enter or load an IAM policy to see analysis
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visual Breakdown</h3>
              <div id="visual-breakdown" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Policy visualization will appear here
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Recommendations</h3>
            <div id="security-recommendations" class="space-y-2">
              <div class="text-gray-500 dark:text-gray-400 text-sm">
                Analyze a policy to see security recommendations
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Effective Permissions</h3>
            <div id="effective-permissions" class="space-y-2">
              <div class="text-gray-500 dark:text-gray-400 text-sm">
                Analyze a policy to see effective permissions
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">IAM Policy Best Practices</h4>
          <div class="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <div>• Use least privilege principle</div>
            <div>• Avoid using wildcards (*) when possible</div>
            <div>• Use conditions for additional security</div>
            <div>• Regularly review and audit policies</div>
            <div>• Use policy variables when appropriate</div>
            <div>• Test policies before deployment</div>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Analyze button
    this.container.querySelector('[data-action="analyze"]').addEventListener('click', () => {
      this.analyzePolicy();
    });
    
    // Format button
    this.container.querySelector('[data-action="format"]').addEventListener('click', () => {
      this.formatPolicy();
    });
    
    // Validate button
    this.container.querySelector('[data-action="validate"]').addEventListener('click', () => {
      this.validatePolicy();
    });
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });
    
    // Example policies
    this.container.querySelector('#example-policies').addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadExample(e.target.value);
        e.target.value = '';
      }
    });
    
    // Policy input changes
    const policyInput = this.container.querySelector('#policy-input');
    policyInput.addEventListener('input', () => {
      this.updateCharCount();
      this.checkJSONValidity();
    });
    
    // Auto-analyze on valid JSON
    policyInput.addEventListener('blur', () => {
      if (this.isValidJSON()) {
        this.analyzePolicy();
      }
    });
  }
  
  loadExamplePolicy() {
    this.loadExample('s3-readonly');
  }
  
  loadExample(type) {
    const examples = {
      's3-readonly': {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'S3ReadOnlyAccess',
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:ListBucket',
              's3:GetBucketLocation',
              's3:GetObjectVersion',
              's3:GetLifecycleConfiguration'
            ],
            Resource: [
              'arn:aws:s3:::example-bucket',
              'arn:aws:s3:::example-bucket/*'
            ]
          }
        ]
      },
      'ec2-admin': {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'EC2FullAccess',
            Effect: 'Allow',
            Action: 'ec2:*',
            Resource: '*'
          },
          {
            Sid: 'ELBFullAccess',
            Effect: 'Allow',
            Action: 'elasticloadbalancing:*',
            Resource: '*'
          },
          {
            Sid: 'CloudWatchAccess',
            Effect: 'Allow',
            Action: [
              'cloudwatch:*',
              'autoscaling:*'
            ],
            Resource: '*'
          }
        ]
      },
      'lambda-basic': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents'
            ],
            Resource: 'arn:aws:logs:*:*:*'
          }
        ]
      },
      'dynamodb-crud': {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'DynamoDBTableAccess',
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:Query',
              'dynamodb:Scan'
            ],
            Resource: 'arn:aws:dynamodb:us-east-1:123456789012:table/MyTable',
            Condition: {
              StringEquals: {
                'dynamodb:LeadingKeys': ['${aws:username}']
              }
            }
          }
        ]
      },
      'iam-user': {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'ManageOwnAccessKeys',
            Effect: 'Allow',
            Action: [
              'iam:CreateAccessKey',
              'iam:DeleteAccessKey',
              'iam:ListAccessKeys',
              'iam:UpdateAccessKey'
            ],
            Resource: 'arn:aws:iam::*:user/${aws:username}'
          },
          {
            Sid: 'ManageOwnMFA',
            Effect: 'Allow',
            Action: [
              'iam:CreateVirtualMFADevice',
              'iam:DeleteVirtualMFADevice',
              'iam:EnableMFADevice',
              'iam:ResyncMFADevice'
            ],
            Resource: [
              'arn:aws:iam::*:user/${aws:username}',
              'arn:aws:iam::*:mfa/${aws:username}'
            ]
          }
        ]
      },
      'cloudwatch-logs': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
              'logs:DescribeLogStreams'
            ],
            Resource: [
              'arn:aws:logs:*:*:log-group:/aws/lambda/*'
            ]
          }
        ]
      },
      'vpc-admin': {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'VPCAdminAccess',
            Effect: 'Allow',
            Action: [
              'ec2:*Vpc*',
              'ec2:*Subnet*',
              'ec2:*Gateway*',
              'ec2:*Route*',
              'ec2:*SecurityGroup*',
              'ec2:*NetworkAcl*'
            ],
            Resource: '*',
            Condition: {
              StringEquals: {
                'ec2:Region': 'us-east-1'
              }
            }
          }
        ]
      },
      'custom-complex': {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'S3BucketAccess',
            Effect: 'Allow',
            Action: [
              's3:ListBucket',
              's3:GetBucketLocation'
            ],
            Resource: 'arn:aws:s3:::my-bucket',
            Condition: {
              IpAddress: {
                'aws:SourceIp': ['192.168.1.0/24', '10.0.0.0/8']
              }
            }
          },
          {
            Sid: 'S3ObjectAccess',
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject'
            ],
            Resource: 'arn:aws:s3:::my-bucket/*',
            Condition: {
              StringLike: {
                's3:x-amz-server-side-encryption': 'AES256'
              }
            }
          },
          {
            Sid: 'DenyUnencryptedObjectUploads',
            Effect: 'Deny',
            Principal: '*',
            Action: 's3:PutObject',
            Resource: 'arn:aws:s3:::my-bucket/*',
            Condition: {
              StringNotEquals: {
                's3:x-amz-server-side-encryption': 'AES256'
              }
            }
          }
        ]
      }
    };
    
    const policy = examples[type];
    if (policy) {
      this.container.querySelector('#policy-input').value = JSON.stringify(policy, null, 2);
      this.updateCharCount();
      this.checkJSONValidity();
      this.analyzePolicy();
    }
  }
  
  analyzePolicy() {
    const policyText = this.container.querySelector('#policy-input').value.trim();
    
    if (!policyText) {
      this.showError('Please enter a policy to analyze');
      return;
    }
    
    let policy;
    try {
      policy = JSON.parse(policyText);
    } catch (e) {
      this.showError('Invalid JSON: ' + e.message);
      return;
    }
    
    this.clearError();
    
    // Analyze the policy
    const analysis = this.performAnalysis(policy);
    this.displayAnalysis(analysis);
    this.displayVisualBreakdown(policy);
    this.displaySecurityRecommendations(analysis);
    this.displayEffectivePermissions(policy);
  }
  
  performAnalysis(policy) {
    const analysis = {
      version: policy.Version || 'Not specified',
      statementCount: policy.Statement ? policy.Statement.length : 0,
      effects: { allow: 0, deny: 0 },
      resources: new Set(),
      actions: new Set(),
      conditions: [],
      principals: new Set(),
      wildcardUsage: {
        actions: 0,
        resources: 0
      },
      securityIssues: []
    };
    
    if (policy.Statement) {
      policy.Statement.forEach(statement => {
        // Count effects
        if (statement.Effect === 'Allow') {
          analysis.effects.allow++;
        } else if (statement.Effect === 'Deny') {
          analysis.effects.deny++;
        }
        
        // Collect actions
        const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
        actions.forEach(action => {
          if (action) {
            analysis.actions.add(action);
            if (action.includes('*')) {
              analysis.wildcardUsage.actions++;
            }
          }
        });
        
        // Collect resources
        const resources = Array.isArray(statement.Resource) ? statement.Resource : [statement.Resource];
        resources.forEach(resource => {
          if (resource) {
            analysis.resources.add(resource);
            if (resource === '*') {
              analysis.wildcardUsage.resources++;
              analysis.securityIssues.push('Statement uses wildcard (*) for resources');
            }
          }
        });
        
        // Collect principals
        if (statement.Principal) {
          const principals = typeof statement.Principal === 'string' ? [statement.Principal] : 
                           Array.isArray(statement.Principal) ? statement.Principal : 
                           Object.values(statement.Principal).flat();
          principals.forEach(p => analysis.principals.add(p));
        }
        
        // Collect conditions
        if (statement.Condition) {
          analysis.conditions.push(statement.Condition);
        }
      });
    }
    
    // Check for security issues
    if (analysis.actions.has('*')) {
      analysis.securityIssues.push('Policy allows all actions (*)');
    }
    
    if (analysis.principals.has('*')) {
      analysis.securityIssues.push('Policy applies to all principals (*)');
    }
    
    if (analysis.conditions.length === 0 && analysis.effects.allow > 0) {
      analysis.securityIssues.push('No conditions applied to Allow statements');
    }
    
    return analysis;
  }
  
  displayAnalysis(analysis) {
    const resultsDiv = this.container.querySelector('#analysis-results');
    
    resultsDiv.innerHTML = `
      <div class="space-y-3">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Policy Overview</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">Version:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${analysis.version}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Statements:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${analysis.statementCount}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Allow:</span>
              <span class="ml-2 text-green-600 dark:text-green-400">${analysis.effects.allow}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Deny:</span>
              <span class="ml-2 text-red-600 dark:text-red-400">${analysis.effects.deny}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Actions Summary</h4>
          <div class="text-sm">
            <div class="text-gray-600 dark:text-gray-400 mb-1">
              Total unique actions: ${analysis.actions.size}
            </div>
            ${analysis.wildcardUsage.actions > 0 ? `
              <div class="text-yellow-600 dark:text-yellow-400">
                ⚠ ${analysis.wildcardUsage.actions} wildcard actions detected
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Resources</h4>
          <div class="text-sm">
            <div class="text-gray-600 dark:text-gray-400 mb-1">
              Total unique resources: ${analysis.resources.size}
            </div>
            ${analysis.wildcardUsage.resources > 0 ? `
              <div class="text-yellow-600 dark:text-yellow-400">
                ⚠ ${analysis.wildcardUsage.resources} wildcard resources detected
              </div>
            ` : ''}
          </div>
        </div>
        
        ${analysis.conditions.length > 0 ? `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Conditions</h4>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            ${analysis.conditions.length} condition${analysis.conditions.length > 1 ? 's' : ''} applied
          </div>
        </div>
        ` : ''}
        
        ${analysis.securityIssues.length > 0 ? `
        <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Security Concerns</h4>
          <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
            ${analysis.securityIssues.map(issue => `<li>• ${issue}</li>`).join('')}
          </ul>
        </div>
        ` : `
        <div class="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-green-800 dark:text-green-200">✓ No major security issues detected</h4>
        </div>
        `}
      </div>
    `;
  }
  
  displayVisualBreakdown(policy) {
    const breakdownDiv = this.container.querySelector('#visual-breakdown');
    
    if (!policy.Statement || policy.Statement.length === 0) {
      breakdownDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-center">No statements to visualize</div>';
      return;
    }
    
    breakdownDiv.innerHTML = policy.Statement.map((statement, index) => {
      const effect = statement.Effect;
      const effectColor = effect === 'Allow' ? 'green' : 'red';
      const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
      const resources = Array.isArray(statement.Resource) ? statement.Resource : [statement.Resource];
      
      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-${effectColor}-500">
          <div class="flex justify-between items-start mb-2">
            <h5 class="text-sm font-semibold text-gray-900 dark:text-white">
              Statement ${index + 1} ${statement.Sid ? `(${statement.Sid})` : ''}
            </h5>
            <span class="px-2 py-1 text-xs rounded-full bg-${effectColor}-100 text-${effectColor}-800 dark:bg-${effectColor}-900/20 dark:text-${effectColor}-300">
              ${effect}
            </span>
          </div>
          
          <div class="space-y-2 text-xs">
            <div>
              <span class="font-semibold text-gray-600 dark:text-gray-400">Actions:</span>
              <div class="mt-1 flex flex-wrap gap-1">
                ${actions.map(action => `
                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                    ${action}
                  </span>
                `).join('')}
              </div>
            </div>
            
            <div>
              <span class="font-semibold text-gray-600 dark:text-gray-400">Resources:</span>
              <div class="mt-1 space-y-1">
                ${resources.map(resource => `
                  <div class="font-mono text-gray-700 dark:text-gray-300 break-all">
                    ${resource}
                  </div>
                `).join('')}
              </div>
            </div>
            
            ${statement.Condition ? `
            <div>
              <span class="font-semibold text-gray-600 dark:text-gray-400">Conditions:</span>
              <div class="mt-1 font-mono text-gray-700 dark:text-gray-300">
                ${Object.keys(statement.Condition).join(', ')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  
  displaySecurityRecommendations(analysis) {
    const recsDiv = this.container.querySelector('#security-recommendations');
    const recommendations = [];
    
    // Generate recommendations based on analysis
    if (analysis.wildcardUsage.actions > 0) {
      recommendations.push({
        severity: 'high',
        message: 'Avoid using wildcard (*) in actions. Specify exact actions needed.'
      });
    }
    
    if (analysis.wildcardUsage.resources > 0) {
      recommendations.push({
        severity: 'high',
        message: 'Avoid using wildcard (*) for resources. Specify exact resource ARNs.'
      });
    }
    
    if (analysis.conditions.length === 0 && analysis.effects.allow > 0) {
      recommendations.push({
        severity: 'medium',
        message: 'Consider adding conditions to restrict access further (IP, MFA, time-based).'
      });
    }
    
    if (analysis.principals.has('*')) {
      recommendations.push({
        severity: 'high',
        message: 'Avoid using wildcard (*) for principals. Specify exact principals.'
      });
    }
    
    if (!analysis.version || analysis.version === 'Not specified') {
      recommendations.push({
        severity: 'low',
        message: 'Specify policy version (use "2012-10-17" for latest features).'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        severity: 'info',
        message: 'Policy follows basic security best practices.'
      });
    }
    
    recsDiv.innerHTML = recommendations.map(rec => {
      const colors = {
        high: 'red',
        medium: 'yellow',
        low: 'blue',
        info: 'green'
      };
      const color = colors[rec.severity];
      
      return `
        <div class="flex items-start gap-2 p-2 bg-${color}-50 dark:bg-${color}-900/20 rounded">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-${color}-600 dark:text-${color}-400 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span class="text-sm text-${color}-700 dark:text-${color}-300">${rec.message}</span>
        </div>
      `;
    }).join('');
  }
  
  displayEffectivePermissions(policy) {
    const permsDiv = this.container.querySelector('#effective-permissions');
    
    if (!policy.Statement) {
      permsDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-sm">No permissions defined</div>';
      return;
    }
    
    // Group permissions by service
    const servicePermissions = {};
    
    policy.Statement.forEach(statement => {
      if (statement.Effect === 'Allow') {
        const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
        actions.forEach(action => {
          if (action) {
            const [service] = action.split(':');
            if (!servicePermissions[service]) {
              servicePermissions[service] = new Set();
            }
            servicePermissions[service].add(action);
          }
        });
      }
    });
    
    permsDiv.innerHTML = Object.entries(servicePermissions).map(([service, actions]) => `
      <div class="bg-white dark:bg-gray-800 rounded p-2">
        <div class="font-semibold text-sm text-gray-900 dark:text-white mb-1">
          ${service.toUpperCase()}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">
          ${actions.size} permission${actions.size > 1 ? 's' : ''}
        </div>
      </div>
    `).join('') || '<div class="text-gray-500 dark:text-gray-400 text-sm">No effective permissions</div>';
  }
  
  formatPolicy() {
    const policyText = this.container.querySelector('#policy-input').value.trim();
    
    if (!policyText) {
      this.showError('Please enter a policy to format');
      return;
    }
    
    try {
      const policy = JSON.parse(policyText);
      this.container.querySelector('#policy-input').value = JSON.stringify(policy, null, 2);
      this.updateCharCount();
      this.clearError();
    } catch (e) {
      this.showError('Invalid JSON: ' + e.message);
    }
  }
  
  validatePolicy() {
    const policyText = this.container.querySelector('#policy-input').value.trim();
    
    if (!policyText) {
      this.showError('Please enter a policy to validate');
      return;
    }
    
    try {
      const policy = JSON.parse(policyText);
      
      // Validate policy structure
      const errors = [];
      
      if (!policy.Version) {
        errors.push('Missing "Version" field');
      }
      
      if (!policy.Statement) {
        errors.push('Missing "Statement" field');
      } else if (!Array.isArray(policy.Statement)) {
        errors.push('"Statement" must be an array');
      } else {
        policy.Statement.forEach((statement, index) => {
          if (!statement.Effect) {
            errors.push(`Statement ${index + 1}: Missing "Effect" field`);
          } else if (!['Allow', 'Deny'].includes(statement.Effect)) {
            errors.push(`Statement ${index + 1}: Invalid "Effect" value (must be Allow or Deny)`);
          }
          
          if (!statement.Action && !statement.NotAction) {
            errors.push(`Statement ${index + 1}: Missing "Action" or "NotAction" field`);
          }
          
          if (!statement.Resource && !statement.NotResource) {
            errors.push(`Statement ${index + 1}: Missing "Resource" or "NotResource" field`);
          }
        });
      }
      
      if (errors.length > 0) {
        this.showError('Validation errors:\n' + errors.join('\n'));
      } else {
        this.clearError();
        const successDiv = document.createElement('div');
        successDiv.className = 'p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded mt-4';
        successDiv.innerHTML = '✓ Policy is valid';
        this.container.querySelector('[data-error]').replaceWith(successDiv);
        setTimeout(() => {
          successDiv.remove();
        }, 3000);
      }
    } catch (e) {
      this.showError('Invalid JSON: ' + e.message);
    }
  }
  
  isValidJSON() {
    try {
      JSON.parse(this.container.querySelector('#policy-input').value);
      return true;
    } catch {
      return false;
    }
  }
  
  checkJSONValidity() {
    const statusDiv = this.container.querySelector('#json-status');
    if (this.container.querySelector('#policy-input').value.trim()) {
      if (this.isValidJSON()) {
        statusDiv.innerHTML = '<span class="text-green-600 dark:text-green-400">✓ Valid JSON</span>';
      } else {
        statusDiv.innerHTML = '<span class="text-red-600 dark:text-red-400">✗ Invalid JSON</span>';
      }
    } else {
      statusDiv.innerHTML = '';
    }
  }
  
  updateCharCount() {
    const text = this.container.querySelector('#policy-input').value;
    this.container.querySelector('#char-count').textContent = `${text.length} characters`;
  }
  
  clear() {
    this.container.querySelector('#policy-input').value = '';
    this.container.querySelector('#json-status').innerHTML = '';
    this.container.querySelector('#char-count').textContent = '0 characters';
    this.container.querySelector('#analysis-results').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Enter or load an IAM policy to see analysis
      </div>
    `;
    this.container.querySelector('#visual-breakdown').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Policy visualization will appear here
      </div>
    `;
    this.container.querySelector('#security-recommendations').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-sm">
        Analyze a policy to see security recommendations
      </div>
    `;
    this.container.querySelector('#effective-permissions').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-sm">
        Analyze a policy to see effective permissions
      </div>
    `;
    this.clearError();
  }
  
  showError(message) {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
  
  clearError() {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
  }
}