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
# -------------------- Enquiry Serializer --------------------
class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            'id', 'name', 'phone', 'email',
            'current_address', 'permanent_address',
            'father_name', 'blood_group',

            # 10th details
            's10_school', 's10_board', 's10_year', 's10_score',

            # 12th details
            's12_college', 's12_board', 's12_year', 's12_score',

            # Diploma details
            'dip_college', 'dip_board', 'dip_year', 'dip_score',

            # UG details
            'ug_college', 'ug_board', 'ug_year', 'ug_score',

            # PG details
            'pg_college', 'pg_board', 'pg_year', 'pg_score',

            # Placement fields
            'placement', 'data_link', 'data_updated',

            # Movement flags
            'move_to_hr', 'move_to_placements',
            'details_done',

            # Financial fields
            'packageCost', 'amountPaid', 'discount', 'balanceAmount',

            # Batch info
            'batch_code', 'batch_subject',

            # Meta
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        packageCost = validated_data.get('packageCost', instance.packageCost or 0)
        amountPaid = validated_data.get('amountPaid', instance.amountPaid or 0)
        discount = validated_data.get('discount', instance.discount or 0)

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
