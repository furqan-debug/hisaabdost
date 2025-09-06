import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Move HTML content outside handler for better performance
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - HisaabDost</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1.6;
        }

        .container {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 1rem;
        }

        h1 {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
        }

        .subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .password-container {
            position: relative;
        }

        input[type="password"], input[type="text"] {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s;
            outline: none;
            padding-right: 3rem;
        }

        input:focus {
            border-color: #667eea;
        }

        .toggle-password {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-size: 1.2rem;
        }

        .error-message {
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            display: none;
        }

        .success-message {
            color: #27ae60;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            padding: 1rem;
            background: #d5f4e6;
            border-radius: 8px;
            display: none;
        }

        .reset-btn {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            margin-bottom: 1rem;
        }

        .reset-btn:hover:not(:disabled) {
            transform: translateY(-2px);
        }

        .reset-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .loading {
            display: none;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #666;
            margin-top: 1rem;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .back-link {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s;
        }

        .back-link:hover {
            color: #764ba2;
        }

        .success-content {
            display: none;
        }

        .success-content.show {
            display: block;
        }

        .checkmark {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #27ae60;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 1.5rem;
        }

        @media (max-width: 480px) {
            .container {
                padding: 2rem;
                margin: 1rem;
            }
        }

        .invalid-token {
            color: #e74c3c;
            text-align: center;
            padding: 2rem;
        }

        .invalid-token h2 {
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">HisaabDost</div>
        
        <div id="loadingState">
            <div class="loading" style="display: flex;">
                <div class="spinner"></div>
                <span>Verifying reset link...</span>
            </div>
        </div>

        <div id="invalidToken" class="invalid-token" style="display: none;">
            <h2>Invalid or Expired Link</h2>
            <p>This password reset link is invalid or has expired. Please request a new password reset.</p>
            <a href="#" class="back-link" onclick="window.close();">Close this window</a>
        </div>

        <div id="resetForm" style="display: none;">
            <h1>Reset Your Password</h1>
            <p class="subtitle">Enter your new password below</p>
            
            <form id="passwordResetForm">
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <div class="password-container">
                        <input type="password" id="newPassword" placeholder="Enter new password" required minlength="6">
                        <button type="button" class="toggle-password" onclick="togglePassword('newPassword')">👁️</button>
                    </div>
                    <div id="newPasswordError" class="error-message"></div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <div class="password-container">
                        <input type="password" id="confirmPassword" placeholder="Confirm new password" required minlength="6">
                        <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword')">👁️</button>
                    </div>
                    <div id="confirmPasswordError" class="error-message"></div>
                </div>

                <button type="submit" class="reset-btn" id="resetButton">
                    Reset Password
                </button>
            </form>

            <div class="loading" id="loadingIndicator">
                <div class="spinner"></div>
                <span>Updating your password...</span>
            </div>
        </div>

        <div id="successMessage" class="success-content">
            <div class="checkmark">✓</div>
            <h1>Password Updated!</h1>
            <div class="success-message" style="display: block;">
                Your password has been successfully updated. You can now sign in with your new password.
            </div>
            <a href="#" class="back-link" onclick="window.close();">Close this window</a>
        </div>
    </div>

    <script>
        // Get URL parameters
        function getUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            return {
                token: urlParams.get('token'),
                email: urlParams.get('email')
            };
        }

        // Toggle password visibility
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '🙈';
            } else {
                input.type = 'password';
                button.textContent = '👁️';
            }
        }

        // Show/hide error messages
        function showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function hideError(elementId) {
            const errorElement = document.getElementById(elementId);
            errorElement.style.display = 'none';
        }

        // Validate form
        function validateForm() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            let isValid = true;

            hideError('newPasswordError');
            hideError('confirmPasswordError');

            if (newPassword.length < 6) {
                showError('newPasswordError', 'Password must be at least 6 characters long');
                isValid = false;
            }

            if (newPassword !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }

            return isValid;
        }

        // Update password
        async function updatePassword(email, token, newPassword) {
            const response = await fetch('https://bklfolfivjonzpprytkz.supabase.co/functions/v1/update-password-with-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    newPassword: newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update password');
            }

            return await response.json();
        }

        // Handle form submission
        document.addEventListener('DOMContentLoaded', async function() {
            const params = getUrlParams();
            const { token, email } = params;

            if (!token || !email) {
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('invalidToken').style.display = 'block';
                return;
            }

            // Verify the reset token
            try {
                const verifyResponse = await fetch('https://bklfolfivjonzpprytkz.supabase.co/functions/v1/verify-reset-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        token: token
                    })
                });

                const verifyData = await verifyResponse.json();

                if (!verifyData.valid) {
                    document.getElementById('loadingState').style.display = 'none';
                    document.getElementById('invalidToken').style.display = 'block';
                    return;
                }

                // Token is valid, show the reset form
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('resetForm').style.display = 'block';

            } catch (error) {
                console.error('Error verifying token:', error);
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('invalidToken').style.display = 'block';
                return;
            }

            // Handle form submission
            const form = document.getElementById('passwordResetForm');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                if (!validateForm()) {
                    return;
                }

                const newPassword = document.getElementById('newPassword').value;
                const resetButton = document.getElementById('resetButton');
                const loadingIndicator = document.getElementById('loadingIndicator');

                try {
                    resetButton.disabled = true;
                    loadingIndicator.style.display = 'flex';

                    await updatePassword(email, token, newPassword);

                    // Show success message
                    document.getElementById('resetForm').style.display = 'none';
                    document.getElementById('successMessage').classList.add('show');

                } catch (error) {
                    console.error('Error updating password:', error);
                    showError('confirmPasswordError', error.message || 'Failed to update password. Please try again.');
                } finally {
                    resetButton.disabled = false;
                    loadingIndicator.style.display = 'none';
                }
            });

            // Real-time validation
            document.getElementById('newPassword').addEventListener('input', function() {
                if (this.value.length >= 6) {
                    hideError('newPasswordError');
                }
            });

            document.getElementById('confirmPassword').addEventListener('input', function() {
                const newPassword = document.getElementById('newPassword').value;
                if (this.value === newPassword && newPassword.length > 0) {
                    hideError('confirmPasswordError');
                }
            });
        });
    </script>
</body>
</html>`;

const handler = async (req: Request): Promise<Response> => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 Reset password page handler started at ${timestamp}`);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("User-Agent:", req.headers.get("User-Agent"));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("🔄 Handling CORS preflight request");
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      }
    });
  }

  console.log("📄 Serving HTML page with robust headers");

  // Calculate content length for explicit header
  const contentLength = new TextEncoder().encode(HTML_CONTENT).length;
  
  const headers = {
    // Primary content type - most important!
    "Content-Type": "text/html; charset=utf-8",
    
    // Explicit content length
    "Content-Length": contentLength.toString(),
    
    // Security headers to prevent browser misinterpretation
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    
    // CORS headers
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    
    // Cache control for debugging
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    
    // Debugging headers
    "X-Function-Response": "html-page",
    "X-Timestamp": timestamp,
    "X-Content-Length": contentLength.toString(),
    
    // Vary header for proper caching
    "Vary": "Accept-Encoding, User-Agent",
  };

  console.log("📊 Response headers being sent:", JSON.stringify(headers, null, 2));
  console.log("📏 Content length:", contentLength);

  try {
    const response = new Response(HTML_CONTENT, {
      status: 200,
      headers,
    });
    
    console.log("✅ HTML response created successfully");
    return response;
    
  } catch (error) {
    console.error("❌ Error creating response:", error);
    
    // Fallback response
    return new Response("Error serving page", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Error": "Response creation failed",
      },
    });
  }
};

console.log("🚀 Reset password page edge function initialized");
serve(handler);