from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    Enquiry, StudentEnquiry, EnquiryList, DemoList,
    Course, BatchTiming, AccessControl
)
from .serializers import (
    EnquirySerializer, StudentEnquirySerializer,
    EnquiryListSerializer, DemoListSerializer,
    CourseSerializer, BatchTimingSerializer
)
from users.permissions import RoleBasedPermission

# -------------------- Auth & User Management --------------------

class SampleView(APIView):
    @swagger_auto_schema(operation_description="GET a sample message")
    def get(self, request):
        return Response({"message": "Success"}, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
            }
        )
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=user.username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        role = AccessControl.objects.get(user=user).role

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.id,
            'email': user.email,
            'role': role
        })


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
            }
        )
    )
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        role = AccessControl.objects.get(user=user).role

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.id,
            'email': user.email,
            'role': role
        })


class CreateUserView(APIView):
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    required_roles = ['admin']

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'username', 'password', 'role'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
                'username': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
                'role': openapi.Schema(type=openapi.TYPE_STRING,
                                       enum=[r[0] for r in AccessControl.USER_ROLES])
            }
        )
    )
    def post(self, request):
        data = request.data
        if User.objects.filter(username=data['username']).exists():
            return Response({'error': 'Username already exists'}, status=400)
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already exists'}, status=400)

        user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
        AccessControl.objects.create(user=user, role=data['role'])

        return Response({'email': user.email, 'username': user.username, 'role': data['role']}, status=201)


# -------------------- Enquiry APIs --------------------

class EnquiryListView(generics.ListCreateAPIView):
    serializer_class = EnquirySerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    required_roles = ['admin', 'counsellor', 'accounts', 'hr']

    def get_queryset(self):
        user_role = AccessControl.objects.get(user=self.request.user).role
        if user_role == 'admin':
            return Enquiry.objects.all()
        if user_role == 'accounts':
            return Enquiry.objects.filter(payment_status=True)
        if user_role == 'hr':
            return Enquiry.objects.exclude(follow_up_note="")
        return Enquiry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# -------------------- StudentEnquiry APIs --------------------

class StudentEnquiryListCreate(APIView):
    permission_classes = [IsAuthenticated , RoleBasedPermission]

    def get(self, request):
        data = StudentEnquiry.objects.all()
        return Response(StudentEnquirySerializer(data, many=True).data)

    def post(self, request):
        serializer = StudentEnquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class StudentEnquiryDetailView(APIView):
    permission_classes = [IsAuthenticated , RoleBasedPermission]

    def get(self, request, pk):
        obj = get_object_or_404(StudentEnquiry, pk=pk)
        return Response(StudentEnquirySerializer(obj).data)

    def put(self, request, pk):
        obj = get_object_or_404(StudentEnquiry, pk=pk)
        serializer = StudentEnquirySerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        obj = get_object_or_404(StudentEnquiry, pk=pk)
        obj.delete()
        return Response(status=204)


# -------------------- DemoList APIs --------------------

class DemoListListCreate(APIView):
    permission_classes = [IsAuthenticated , RoleBasedPermission]

    def get(self, request):
        data = DemoList.objects.all()
        return Response(DemoListSerializer(data, many=True).data)

    def post(self, request):
        serializer = DemoListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DemoListDetailView(APIView):
    permission_classes = [IsAuthenticated , RoleBasedPermission]

    def get(self, request, pk):
        obj = get_object_or_404(DemoList, pk=pk)
        return Response(DemoListSerializer(obj).data)

    def put(self, request, pk):
        obj = get_object_or_404(DemoList, pk=pk)
        serializer = DemoListSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        obj = get_object_or_404(DemoList, pk=pk)
        obj.delete()
        return Response(status=204)

# -------------------- Public Views --------------------

class CourseListView(APIView):
    permission_classes = [AllowAny, RoleBasedPermission]

    def get(self, request):
        return Response(CourseSerializer(Course.objects.all(), many=True).data)


class BatchTimingListView(APIView):
    permission_classes = [AllowAny, RoleBasedPermission]

    def get(self, request):
        course_id = request.query_params.get('course_id')
        timings = BatchTiming.objects.filter(course_id=course_id) if course_id else BatchTiming.objects.all()
        return Response(BatchTimingSerializer(timings, many=True).data)


# -------------------- Role Protected Sample Views --------------------

class AdminOnlyView(APIView):
    permission_classes = [RoleBasedPermission]
    required_roles = ['admin']
    def get(self, request): return Response({"message": "Admin access granted"})


class CounsellorOnlyView(APIView):
    permission_classes = [RoleBasedPermission]
    required_roles = ['counsellor']
    def get(self, request): return Response({"message": "Counsellor access granted"})


class AccountsOnlyView(APIView):
    permission_classes = [RoleBasedPermission]
    required_roles = ['accounts']
    def get(self, request): return Response({"message": "Accounts access granted"})


class HROnlyView(APIView):
    permission_classes = [RoleBasedPermission]
    required_roles = ['hr']
    def get(self, request): return Response({"message": "HR access granted"})


# class PublicView(APIView):
#     permission_classes = [AllowAny]
#     def get(self, request): return Response({"message": "Accessible to all"})
# --------------------------------------------------------

# from django.shortcuts import render
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
# from django.contrib.auth.models import User
# from rest_framework.authtoken.models import Token
# from users.permissions import RoleBasedPermission
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from .models import Enquiry, AccessControl, User, Course, BatchTiming, Course
# from .serializers import EnquirySerializer, CourseSerializer, BatchTimingSerializer
# from drf_yasg.utils import swagger_auto_schema
# from django.contrib.auth import authenticate
# from rest_framework import status, generics
# from drf_yasg import openapi


# class SampleView(APIView):
#     @swagger_auto_schema(
#         operation_description="GET a sample message",
#         responses={200: openapi.Response('Success')}
#     )
#     def get(self, request):
#         return Response({"message": "Success"}, status=status.HTTP_200_OK)

# class LoginView(APIView):
    
#     permission_classes = [AllowAny]
#     @swagger_auto_schema(
#         request_body=openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             required=['email', 'password'],
#             properties={
#                 'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
#                 'password': openapi.Schema(type=openapi.TYPE_STRING),
#             },
#         ),
#         responses={
#             200: openapi.Response('Login successful', openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'access': openapi.Schema(type=openapi.TYPE_STRING, description='Access token'),
#                     'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
#                     'role': openapi.Schema(type=openapi.TYPE_STRING),
#                     'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
#                     'email': openapi.Schema(type=openapi.TYPE_STRING),
#                 }
#             )),
#             401: 'Invalid credentials'
#         }
#     )
#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')
#         if not email or not password:
#             return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
#         # Fetch user by email
#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
#         # Authenticate using the user's username
#         user = authenticate(username=user.username, password=password)
#         if user:
#             refresh = RefreshToken.for_user(user)
#             access_control = AccessControl.objects.get(user=user)
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'role': access_control.role,
#                 'user_id': user.id,
#                 'email': user.email,
#             }, status=status.HTTP_200_OK)
#         return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# class TokenObtainPair(TokenObtainPairView):
#     permission_classes = [AllowAny]  # Allow unauthenticated access
#     @swagger_auto_schema(
#         request_body=openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             required=['username', 'password'],  # Changed to username for consistency
#             properties={
#                 'username': openapi.Schema(type=openapi.TYPE_STRING),
#                 'password': openapi.Schema(type=openapi.TYPE_STRING),
#             },
#         ),
#         responses={
#             200: openapi.Response('Tokens obtained', openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'access': openapi.Schema(type=openapi.TYPE_STRING, description='Access token'),
#                     'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
#                     'role': openapi.Schema(type=openapi.TYPE_STRING),
#                     'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
#                     'email': openapi.Schema(type=openapi.TYPE_STRING),
#                 }
#             )),
#             401: 'Invalid credentials'
#         }
#     )
#     def post(self, request, *args, **kwargs):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(username=username, password=password)
#         if user:
#             refresh = RefreshToken.for_user(user)  # Fixed: Use RefreshToken
#             access_control = AccessControl.objects.get(user=user)
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'role': access_control.role,
#                 'user_id': user.id,
#                 'email': user.email,
#             }, status=status.HTTP_200_OK)
#         return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# class TokenRefresh(TokenRefreshView):
#     @swagger_auto_schema(
#         request_body=openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             required=['refresh'],
#             properties={
#                 'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
#             },
#         ),
#         responses={
#             200: openapi.Response('Token refreshed', openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'access': openapi.Schema(type=openapi.TYPE_STRING, description='New access token'),
#                 }
#             )),
#             400: 'Invalid refresh token'
#         }
#     )
#     def post(self, request, *args, **kwargs):
#         return super().post(request, *args, **kwargs)

# class TokenVerify(TokenVerifyView):
#     permission_classes = [AllowAny]
#     @swagger_auto_schema(
#         request_body=openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             required=['token'],
#             properties={
#                 'token': openapi.Schema(type=openapi.TYPE_STRING, description='Token to verify (access or refresh)'),
#             },
#         ),
#         responses={
#             200: openapi.Response('Token is valid', openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={}
#             )),
#             401: 'Invalid token'
#         }
#     )
#     def post(self, request, *args, **kwargs):
#         return super().post(request, *args, **kwargs)


# class create_user(APIView):
#     permission_classes = [IsAuthenticated, RoleBasedPermission]
#     required_roles = ['admin']
#     @swagger_auto_schema(
#         request_body=openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             required=['email', 'username', 'password', 'role'],
#             properties={
#                 'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='User email'),
#                 'username': openapi.Schema(type=openapi.TYPE_STRING, description='Unique username'),
#                 'password': openapi.Schema(type=openapi.TYPE_STRING, description='User password'),
#                 'role': openapi.Schema(
#                     type=openapi.TYPE_STRING,
#                     enum=['accounts', 'hr', 'admin', 'counsellor'],
#                     description='User role'
#                 ),
#             },
#         ),
#         responses={
#             201: openapi.Response('User created', openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'email': openapi.Schema(type=openapi.TYPE_STRING),
#                     'username': openapi.Schema(type=openapi.TYPE_STRING),
#                     'role': openapi.Schema(type=openapi.TYPE_STRING),
#                 }
#             )),
#             400: 'Invalid input or user already exists',
#             403: 'Permission denied'
#         }
#     )
#     def post(self, request):
#         email = request.data.get('email')
#         username = request.data.get('username')
#         password = request.data.get('password')
#         role = request.data.get('role')
#         if not all([email, username, password, role]):
#             return Response({'error': 'All fields (email, username, password, role) are required'},
#                           status=status.HTTP_400_BAD_REQUEST)
#         if role not in dict(AccessControl.USER_ROLES).keys():
#             return Response({'error': f"Invalid role. Choose from {list(dict(AccessControl.USER_ROLES).keys())}"},
#                           status=status.HTTP_400_BAD_REQUEST)
#         if User.objects.filter(username=username).exists():
#             return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
#         if User.objects.filter(email=email).exists():
#             return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             user = User.objects.create(
#                 username=username,
#                 email=email,
#                 is_active=True
#             )
#             user.set_password(password)
#             user.save()
#             AccessControl.objects.create(
#                 user=user,
#                 role=role
#             )
#             return Response({
#                 'email': user.email,
#                 'username': user.username,
#                 'role': role
#             }, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class enquiry_list(generics.ListAPIView):
#     serializer_class = EnquirySerializer
#     permission_classes = [RoleBasedPermission]
#     required_roles = ['admin', 'counsellor', 'accounts', 'hr']

#     def get_queryset(self):
#         try:
#             user_role = AccessControl.objects.get(user=self.request.user).role
#         except AccessControl.DoesNotExist:
#             raise PermissionDenied("Access role not defined")

#         if user_role == 'admin':
#             return Enquiry.objects.all()
#         elif user_role == 'hr':
#             return Enquiry.objects.exclude(follow_up_note="")
#         elif user_role == 'accounts':
#             return Enquiry.objects.filter(payment_status=True)
#         else:
#             return Enquiry.objects.filter(user=self.request.user)

# class course_list(generics.ListAPIView):
#     queryset = Course.objects.all()
#     serializer_class = CourseSerializer
#     permission_classes = [RoleBasedPermission]
#     required_roles = []

# class enquiry_create(APIView):
#     permission_classes = [RoleBasedPermission]
#     required_roles = ['admin', 'counsellor']

#     @swagger_auto_schema(
#         request_body=EnquirySerializer,
#         responses={
#             201: EnquirySerializer,
#             400: 'Invalid input',
#             403: 'Permission denied'
#         }
#     )
#     def post(self, request):
#         serializer = EnquirySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(user=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    




# class CourseListView(APIView):
#     permission_classes = [AllowAny]

#     @swagger_auto_schema(responses={200: CourseSerializer(many=True)})
#     def get(self, request):
#         courses = Course.objects.all()
#         serializer = CourseSerializer(courses, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

# class BatchTimingListView(APIView):
#     permission_classes = [AllowAny]

#     @swagger_auto_schema(responses={200: BatchTimingSerializer(many=True)})
#     def get(self, request):
#         course_id = request.query_params.get('course_id')
#         if course_id:
#             batch_timings = BatchTiming.objects.filter(course_id=course_id)
#         else:
#             batch_timings = BatchTiming.objects.all()
#         serializer = BatchTimingSerializer(batch_timings, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404

# from .models import (
#     StudentEnquiry, EnquiryList, DemoList,
#     Course, BatchTiming, Enquiry
# )

# from .serializers import (
#     StudentEnquirySerializer, EnquiryListSerializer, DemoListSerializer,
#     CourseSerializer, BatchTimingSerializer, EnquirySerializer
# )





# class StudentEnquiryListCreate(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         enquiries = StudentEnquiry.objects.all()
#         serializer = StudentEnquirySerializer(enquiries, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = StudentEnquirySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class StudentEnquiryDetail(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         enquiry = get_object_or_404(StudentEnquiry, pk=pk)
#         serializer = StudentEnquirySerializer(enquiry)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         enquiry = get_object_or_404(StudentEnquiry, pk=pk)
#         serializer = StudentEnquirySerializer(enquiry, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         enquiry = get_object_or_404(StudentEnquiry, pk=pk)
#         enquiry.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class EnquiryListAPI(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         data = EnquiryList.objects.all()
#         serializer = EnquiryListSerializer(data, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = EnquiryListSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# class DemoListAPI(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         data = DemoList.objects.all()
#         serializer = DemoListSerializer(data, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DemoListSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class CourseAPI(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         courses = Course.objects.all()
#         serializer = CourseSerializer(courses, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = CourseSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class BatchTimingAPI(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         timings = BatchTiming.objects.all()
#         serializer = BatchTimingSerializer(timings, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = BatchTimingSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class EnquiryAPI(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         enquiries = Enquiry.objects.all()
#         serializer = EnquirySerializer(enquiries, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = EnquirySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(user=request.user)  # Automatically assign current user
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class AdminOnlyView(APIView):
#     permission_classes = [RoleBasedPermission]
#     required_roles = ['admin']
#     def get(self, request):
#         return Response({"message": "Welcome, Admin! Full access granted."})

# class Counsellor(APIView):
#     permission_classes = [RoleBasedPermission]
#     required_roles = ['counsellor']
#     def get(self, request):
#         return Response({"message": "counsellor view: Limited access."})

# class AccountsView(APIView):
#     permission_classes = [RoleBasedPermission]
#     required_roles = ['accounts']
#     def get(self, request):
#         return Response({"message": "Accounts view: Limited access."})

# class HRView(APIView):
#     permission_classes = [RoleBasedPermission]
#     required_roles = ['hr']
#     def get(self, request):
#         return Response({"message": "HR view: Limited access."})

# class PublicView(APIView):
#     permission_classes = [RoleBasedPermission]
#     required_roles = []
#     def get(self, request):
#         return Response({"message": "Public view: Accessible to all roles."})