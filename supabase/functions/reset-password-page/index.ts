import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

console.log("🚀 Standalone Password Reset Page v1.0");

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - HisaabDost</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
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
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-1px);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .error {
            color: #dc3545;
            font-size: 14px;
            margin-top: 10px;
            display: none;
        }
        .success {
            color: #28a745;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .loading {
            display: none;
            margin-right: 8px;
        }
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .success-container {
            display: none;
        }
        .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 20px;
        }
        .app-instruction {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-top: 20px;
        }
        .app-instruction h4 {
            color: #333;
            margin-bottom: 10px;
        }
        .app-instruction p {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">HisaabDost</div>
        
        <!-- Reset Form -->
        <div id="resetForm">
            <h1 class="title">Reset Password</h1>
            <p class="subtitle">Enter your new password below</p>
            
            <form id="passwordForm">
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" required minlength="6" placeholder="Enter new password">
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" required minlength="6" placeholder="Confirm new password">
                </div>
                
                <button type="submit" class="btn" id="resetBtn">
                    <span class="loading" id="loadingSpinner">
                        <div class="spinner"></div>
                    </span>
                    <span id="btnText">Reset Password</span>
                </button>
                
                <div class="error" id="errorMessage"></div>
            </form>
        </div>
        
        <!-- Success Message -->
        <div class="success-container" id="successContainer">
            <div class="success-icon">✅</div>
            <h2 class="title">Password Reset Successful!</h2>
            <p class="success">Your password has been successfully updated.</p>
            
            <div class="app-instruction">
                <h4>Next Steps:</h4>
                <p>
                    <strong>1.</strong> Close this browser tab<br>
                    <strong>2.</strong> Open your HisaabDost mobile app<br>
                    <strong>3.</strong> Sign in with your new password
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button 
                    onclick="window.close(); setTimeout(() => window.location.href = 'about:blank', 100);" 
                    style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.3s;"
                    onmouseover="this.style.background='#5a6fd8'"
                    onmouseout="this.style.background='#667eea'"
                >
                    Return to App
                </button>
            </div>
        </div>
    </div>

    <script>
        console.log('Standalone password reset page loaded');
        
        let resetToken = '';
        let userEmail = '';
        
        function getUrlParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                token: params.get('token'),
                email: params.get('email')
            };
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        function hideError() {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.style.display = 'none';
        }
        
        function setLoading(loading) {
            const btn = document.getElementById('resetBtn');
            const spinner = document.getElementById('loadingSpinner');
            const btnText = document.getElementById('btnText');
            
            if (loading) {
                btn.disabled = true;
                spinner.style.display = 'inline-block';
                btnText.textContent = 'Resetting...';
            } else {
                btn.disabled = false;
                spinner.style.display = 'none';
                btnText.textContent = 'Reset Password';
            }
        }
        
        function showSuccess() {
            document.getElementById('resetForm').style.display = 'none';
            document.getElementById('successContainer').style.display = 'block';
        }
        
        async function verifyResetToken(token, email) {
            try {
                const response = await fetch('https://bklfolfivjonzpprytkz.supabase.co/functions/v1/verify-reset-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, email })
                });
                
                const data = await response.json();
                return data.valid === true;
            } catch (error) {
                console.error('Error verifying token:', error);
                return false;
            }
        }
        
        async function resetPassword(token, email, newPassword) {
            try {
                const response = await fetch('https://bklfolfivjonzpprytkz.supabase.co/functions/v1/update-password-with-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        token, 
                        email, 
                        newPassword 
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to reset password');
                }
                
                return data.success === true;
            } catch (error) {
                console.error('Error resetting password:', error);
                throw error;
            }
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('Initializing standalone password reset page');
            
            const { token, email } = getUrlParams();
            
            if (!token || !email) {
                showError('Invalid reset link. Missing token or email.');
                return;
            }
            
            resetToken = token;
            userEmail = email;
            
            console.log('Verifying reset token...');
            
            // Verify token
            const isValid = await verifyResetToken(token, email);
            
            if (!isValid) {
                showError('This reset link is invalid or has expired. Please request a new password reset.');
                return;
            }
            
            console.log('Reset token verified successfully');
        });
        
        // Handle form submission
        document.getElementById('passwordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            hideError();
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showError('Passwords do not match.');
                return;
            }
            
            if (newPassword.length < 6) {
                showError('Password must be at least 6 characters long.');
                return;
            }
            
            setLoading(true);
            
            try {
                const success = await resetPassword(resetToken, userEmail, newPassword);
                
                if (success) {
                    console.log('Password reset successful');
                    showSuccess();
                } else {
                    showError('Failed to reset password. Please try again.');
                }
            } catch (error) {
                console.error('Password reset error:', error);
                showError(error.message || 'An error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        });
        
        // Real-time password validation
        document.getElementById('confirmPassword').addEventListener('input', function() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = this.value;
            
            if (confirmPassword && newPassword !== confirmPassword) {
                showError('Passwords do not match.');
            } else {
                hideError();
            }
        });
    </script>
</body>
</html>`;

const handler = async (req: Request): Promise<Response> => {
  console.log(`🌐 ${req.method} ${req.url}`);
  
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

  console.log(`📄 Serving standalone password reset page`);

  return new Response(HTML_CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Content-Type-Options": "nosniff"
    }
  });
};

serve(handler);