import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

console.log("🚀 Password Reset Page v3.0 - EMERGENCY FIX");

const handler = async (req: Request): Promise<Response> => {
  console.log(`🌐 Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      }
    });
  }

  // Create HTML content without BOM or extra formatting
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - HisaabDost</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .logo {
            color: #667eea;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #6b7280;
            margin-bottom: 32px;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-weight: 500;
        }
        .input-container {
            position: relative;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .toggle-password {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            font-size: 14px;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background: #5a6fd8;
        }
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .error {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
        }
        .success {
            background: #d1fae5;
            color: #059669;
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .loading {
            display: none;
            text-align: center;
            color: #6b7280;
        }
        .spinner {
            border: 2px solid #f3f4f6;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>    
    <div class="container">
        <div class="logo">HisaabDost</div>
        <div class="subtitle">Reset your password</div>
        
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <div>Verifying reset link...</div>
        </div>

        <div id="invalidToken" style="display: none;">
            <div class="error" style="display: block;">
                <strong>Invalid or expired reset link</strong><br>
                This password reset link is no longer valid.
            </div>
            <a href="/auth" class="btn" style="display: inline-block; text-decoration: none;">Back to Sign In</a>
        </div>

        <div id="resetForm" style="display: none;">
            <form id="passwordForm">
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <div class="input-container">
                        <input type="password" id="newPassword" required minlength="6">
                        <button type="button" class="toggle-password" onclick="togglePassword('newPassword')">Show</button>
                    </div>
                    <div id="newPasswordError" class="error"></div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <div class="input-container">
                        <input type="password" id="confirmPassword" required minlength="6">
                        <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword')">Show</button>
                    </div>
                    <div id="confirmPasswordError" class="error"></div>
                </div>

                <button type="submit" class="btn" id="submitBtn">Reset Password</button>
            </form>
        </div>

        <div id="successMessage" style="display: none;">
            <div class="success">
                <strong>Password Reset Successful!</strong><br>
                Your password has been updated successfully.
            </div>
            <a href="/auth" class="btn" style="display: inline-block; text-decoration: none;">Sign In Now</a>
        </div>
    </div>

    <script>
        console.log('Password reset page v3.0 loaded');
        
        function getUrlParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                token: params.get('token'),
                email: params.get('email')
            };
        }

        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = 'Hide';
            } else {
                input.type = 'password';
                button.textContent = 'Show';
            }
        }

        function showError(elementId, message) {
            const errorEl = document.getElementById(elementId);
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }

        function hideError(elementId) {
            const errorEl = document.getElementById(elementId);
            errorEl.style.display = 'none';
        }

        function validateForm() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            let isValid = true;

            hideError('newPasswordError');
            hideError('confirmPasswordError');

            if (newPassword.length < 6) {
                showError('newPasswordError', 'Password must be at least 6 characters long.');
                isValid = false;
            }

            if (newPassword !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match.');
                isValid = false;
            }

            return isValid;
        }

        async function updatePassword(email, token, newPassword) {
            const response = await fetch('https://bklfolfivjonzpprytkz.supabase.co/functions/v1/update-password-with-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token, newPassword })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update password');
            }
            
            return data;
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('Initializing password reset page');
            
            const { token, email } = getUrlParams();
            
            if (!token || !email) {
                console.error('Missing token or email parameters');
                document.getElementById('loading').style.display = 'none';
                document.getElementById('invalidToken').style.display = 'block';
                return;
            }

            document.getElementById('loading').style.display = 'block';

            try {
                const response = await fetch('https://bklfolfivjonzpprytkz.supabase.co/functions/v1/verify-reset-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, email })
                });

                const data = await response.json();
                
                document.getElementById('loading').style.display = 'none';
                
                if (data.valid) {
                    document.getElementById('resetForm').style.display = 'block';
                    console.log('Reset token verified successfully');
                } else {
                    document.getElementById('invalidToken').style.display = 'block';
                    console.log('Invalid reset token');
                }
            } catch (error) {
                console.error('Token verification error:', error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('invalidToken').style.display = 'block';
            }
        });

        // Form submission
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('passwordForm');
            if (form) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    if (!validateForm()) {
                        return;
                    }

                    const submitBtn = document.getElementById('submitBtn');
                    const newPassword = document.getElementById('newPassword').value;
                    const { token, email } = getUrlParams();

                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Resetting Password...';

                    try {
                        await updatePassword(email, token, newPassword);
                        
                        document.getElementById('resetForm').style.display = 'none';
                        document.getElementById('successMessage').style.display = 'block';
                        console.log('Password reset successful');
                    } catch (error) {
                        showError('confirmPasswordError', error.message);
                        console.error('Password reset failed:', error);
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Reset Password';
                    }
                });
            }
        });

        // Real-time validation
        document.addEventListener('DOMContentLoaded', function() {
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            
            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', function() {
                    hideError('newPasswordError');
                    if (this.value.length > 0 && this.value.length < 6) {
                        showError('newPasswordError', 'Password must be at least 6 characters long.');
                    }
                });
            }
            
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', function() {
                    hideError('confirmPasswordError');
                    const newPassword = document.getElementById('newPassword').value;
                    if (this.value.length > 0 && this.value !== newPassword) {
                        showError('confirmPasswordError', 'Passwords do not match.');
                    }
                });
            }
        });
    </script>
</body>
</html>`;

  console.log(`Serving HTML page (length: ${htmlContent.length})`);

  // Return simple response with only essential headers
  return new Response(htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
};

serve(handler);
};

serve(handler);