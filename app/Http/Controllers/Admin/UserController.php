<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $role = $request->input('role', '');
        
        $users = User::when($search, function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        })
        ->when($role, function ($query) use ($role) {
            $query->where('role', $role);
        })
        ->orderBy('created_at', 'desc')
        ->paginate(10)
        ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(CreateUserRequest $request): RedirectResponse
    {
        try {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
                'role' => $request->validated('role'),
            ]);

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return to_route('admin.users.index')
                ->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create user', [
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to create user. Please try again.');
        }
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        try {
            $updateData = [
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'role' => $request->validated('role'),
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->validated('password'));
            }

            $user->update($updateData);

            Log::info('User updated successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return to_route('admin.users.index')
                ->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update user', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return back()->with('error', 'Failed to update user. Please try again.');
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        try {

            if ($user->id === auth()->id()) {
                return back()->with('error', 'You cannot delete your own account.');
            }

            $userEmail = $user->email;
            $user->delete();

            Log::info('User deleted successfully', [
                'email' => $userEmail,
            ]);

            return to_route('admin.users.index')
                ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return back()->with('error', 'Failed to delete user. Please try again.');
        }
    }
}
