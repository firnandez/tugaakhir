<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            Log::info('CheckRole: No user found, redirecting to login');
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;
        Log::info('CheckRole check', [
            'user_email' => $request->user()->email,
            'user_role' => $userRole,
            'required_roles' => $roles,
            'allowed' => in_array($userRole, $roles),
        ]);

        if (!in_array($userRole, $roles)) {
            Log::error('CheckRole: Access denied');
            abort(403, 'Unauthorized access');
        }

        return $next($request);
    }
}