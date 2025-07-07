from rest_framework import permissions
from .models import AccessControl
from rest_framework.permissions import BasePermission

class RoleBasedPermission(BasePermission):
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Get user role
        user_role = getattr(request.user.accesscontrol, 'role', None)

        # Allow admin and counsellor full access to Enquiry endpoints
        if user_role in ['admin', 'counsellor']:
            return True

        # Get required_roles from the view
        required_roles = getattr(view, 'required_roles', [])
        # Allow if user's role is in required_roles
        return user_role in required_roles

    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user.accesscontrol, 'role', None)
        if user_role in ['admin', 'counsellor']:
            return True
        required_roles = getattr(view, 'required_roles', [])
        return user_role in required_roles