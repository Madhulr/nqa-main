from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    StudentEnquiry, EnquiryList, DemoList,
    Course, BatchTiming, Enquiry
)


# -------------------- Course Serializer --------------------
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


# -------------------- BatchTiming Serializer --------------------
class BatchTimingSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    # course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)

    class Meta:
        model = BatchTiming
        fields = ['id', 'name', 'time_range', 'course']


# -------------------- StudentEnquiry Serializer --------------------
class StudentEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentEnquiry
        fields = '__all__'


# -------------------- EnquiryList Serializer --------------------
class EnquiryListSerializer(serializers.ModelSerializer):
    student_enquiry = StudentEnquirySerializer(read_only=True)
    student_enquiry_id = serializers.PrimaryKeyRelatedField(queryset=StudentEnquiry.objects.all(), source='student_enquiry', write_only=True)

    class Meta:
        model = EnquiryList
        fields = [
            'id', 'student_enquiry', 'student_enquiry_id',
            'subject_module', 'training_mode', 'training_timing', 'start_time',
            'calling1', 'calling2', 'calling3', 'calling4', 'calling5',
            'move_to_demo', 'created_at', 'updated_at' , 
        ]


# -------------------- DemoList Serializer --------------------
class DemoListSerializer(serializers.ModelSerializer):
    student_enquiry = StudentEnquirySerializer(read_only=True)
    student_enquiry_id = serializers.PrimaryKeyRelatedField(queryset=StudentEnquiry.objects.all(), source='student_enquiry', write_only=True, required=False, allow_null=True)

    class Meta:
        model = DemoList
        fields = [
            'id', 'student_enquiry', 'student_enquiry_id',
            'full_name', 'phone_number', 'email',
            'package_code', 'package', 'demo_class_status',
            'created_at', 'updated_at'
        ]


# -------------------- Enquiry Serializer --------------------
class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'  # Or list them explicitly
        read_only_fields = ['user', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Use existing values if not provided in the update
        packageCost = validated_data.get('packageCost', instance.packageCost or 0)
        amountPaid = validated_data.get('amountPaid', instance.amountPaid or 0)
        discount = validated_data.get('discount', instance.discount or 0)

        # Calculate the new balanceAmount
        validated_data['balanceAmount'] = packageCost - amountPaid - discount

        return super().update(instance, validated_data)


class MinimalEnquirySerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='name')
    location = serializers.CharField(source='current_location')
    trainingMode = serializers.CharField(source='timing')
    trainingTimings = serializers.CharField(source='trainingTime')
    previousInteraction = serializers.CharField(source='previous_interaction')
    batch_code = serializers.CharField()
    batch_subject = serializers.CharField()

    class Meta:
        model = Enquiry
        fields = [
            'id', 'fullName', 'phone', 'email', 'location', 'module',
            'trainingMode', 'trainingTimings', 'startTime',
            'calling1', 'calling2', 'calling3', 'calling4', 'calling5', 'previousInteraction',
            'batch_code', 'batch_subject'
        ]


# , 'address'

# # yourapp/serializers.py
# from rest_framework import serializers
# from .models import Course, BatchTiming, Enquiry

# class BatchTimingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BatchTiming
#         fields = ['id', 'name', 'time_range']

# class CourseSerializer(serializers.ModelSerializer):
#     batch_timings = BatchTimingSerializer(many=True, read_only=True)
#     class Meta:
#         model = Course
#         fields = ['id', 'name', 'description', 'batch_timings']

# class EnquirySerializer(serializers.ModelSerializer):
#     course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
#     batch_timing = serializers.PrimaryKeyRelatedField(queryset=BatchTiming.objects.all())
#     class Meta:
#         model = Enquiry
#         fields = [
#             'id', 'user', 'name', 'email', 'phone', 'address', 'current_location',
#             'course', 'training_mode', 'batch_timing', 'reason_for_slot',
#             'employment_status', 'highest_qualification', 'experience_years',
#             'source_of_info', 'consent_to_contact', 'message', 'status',
#             'payment_status', 'follow_up_note', 'created_at'
#         ]
#         read_only_fields = ['user', 'status', 'payment_status', 'follow_up_note', 'created_at']