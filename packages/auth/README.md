# @repo/auth

Reusable authentication UI and hooks for apps in the monorepo.

Exports:
- `LoginForm` - UI login form built on `@repo/ui` primitives
- `RegisterForm` - UI register form
- `AuthLayout` - centered auth layout wrapper
- `useAuth` - pluggable hook to connect to platform-specific adapters

Usage:
import { LoginForm } from "@repo/auth";
