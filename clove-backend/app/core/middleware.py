from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
import logging
from typing import Callable
import asyncio
from app.core.config import settings

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.requests = {}
        self.lock = asyncio.Lock()
        
        # Industry standard: Different limits for different endpoints
        self.endpoint_limits = {
            "/health": 1000,  # Health checks: high limit
            "/pre_assessments": 500,  # Assessments: medium limit
            "/post_assessments": 500,
            "/assessment_questions": 300,  # Question fetching: medium limit
            "/user_subtopics": 200,  # Progress updates: lower limit
            "/user_topics": 300,  # User topic data: medium limit
        }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get appropriate rate limit for this endpoint
        endpoint_limit = self.rate_limit
        for endpoint, limit in self.endpoint_limits.items():
            if request.url.path.startswith(endpoint):
                endpoint_limit = limit
                break
        
        client_ip = request.client.host
        
        async with self.lock:
            current_time = time.time()
            if client_ip in self.requests:
                last_request_time, count = self.requests[client_ip]
                if current_time - last_request_time < 60:  # Within 1 minute
                    if count >= endpoint_limit:
                        logger.warning(f"Rate limit exceeded for {client_ip} on {request.url.path}: {count}/{endpoint_limit}")
                        response = JSONResponse(
                            status_code=429,
                            content={"detail": f"Too many requests. Please try again later."}
                        )
                        # Ensure CORS headers are set for rate limit responses
                        origin = request.headers.get("origin")
                        if origin and origin in settings.cors_origins_clean:
                            response.headers["Access-Control-Allow-Origin"] = origin
                            response.headers["Access-Control-Allow-Credentials"] = "true"
                        return response
                    self.requests[client_ip] = (last_request_time, count + 1)
                    logger.debug(f"Request {count + 1}/{endpoint_limit} for {client_ip} on {request.url.path}")
                else:
                    self.requests[client_ip] = (current_time, 1)
                    logger.debug(f"New request window for {client_ip} on {request.url.path}")
            else:
                self.requests[client_ip] = (current_time, 1)
                logger.debug(f"First request for {client_ip} on {request.url.path}")

        return await call_next(request)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log CORS-related headers for debugging
        origin = request.headers.get("origin")
        if origin:
            logger.info(f"Request origin: {origin}")
        
        response = await call_next(request)
        
        # Log CORS response headers
        cors_origin = response.headers.get("access-control-allow-origin")
        if cors_origin:
            logger.info(f"Response CORS origin: {cors_origin}")
        
        process_time = time.time() - start_time
        logger.info(
            f"Method: {request.method} Path: {request.url.path} "
            f"Status: {response.status_code} Duration: {process_time:.2f}s"
        )
        
        return response

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Add security headers
        response = await call_next(request)
        
        # Security headers (but don't override CORS headers)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Different CSP for development and production
        if settings.ENV == "development":
            response.headers["Content-Security-Policy"] = "default-src 'self' blob:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net blob:; worker-src 'self' blob:"
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self'; style-src 'self'; script-src 'self'"
        
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Debug: Log what headers we're setting
        logger.debug(f"Security headers set for {request.url.path}")
        
        return response

def setup_middleware(app):
    # Debug: Log CORS settings
    logger.info(f"Setting up CORS middleware with origins: {settings.cors_origins_clean}")
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_clean,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Content-Length", "X-Request-ID"],
        max_age=3600
    )
    
    # Add a custom CORS debugging middleware
    class CORSDebugMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next: Callable) -> Response:
            # Log the request details
            origin = request.headers.get("origin")
            method = request.method
            path = request.url.path
            
            logger.info(f"CORS Debug - Request: {method} {path}, Origin: {origin}")
            
            response = await call_next(request)
            
            # Log the response CORS headers
            cors_origin = response.headers.get("access-control-allow-origin")
            cors_methods = response.headers.get("access-control-allow-methods")
            cors_headers = response.headers.get("access-control-allow-headers")
            
            logger.info(f"CORS Debug - Response: {response.status_code}, CORS Origin: {cors_origin}, Methods: {cors_methods}, Headers: {cors_headers}")
            
            return response
    
    app.add_middleware(CORSDebugMiddleware)
    
    # Debug: Log CORS configuration
    logger.info(f"CORS middleware configured with:")
    logger.info(f"  - allow_origins: {settings.cors_origins_clean}")
    logger.info(f"  - allow_credentials: True")
    logger.info(f"  - allow_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']")
    logger.info(f"  - allow_headers: ['*']")
    
    # Rate limiting middleware
    app.add_middleware(
        RateLimitMiddleware,
        rate_limit=settings.RATE_LIMIT_PER_MINUTE
    )
    
    # Logging middleware
    app.add_middleware(LoggingMiddleware)
    
    # Security middleware
    app.add_middleware(SecurityMiddleware) 