# Generated by Django 5.2.3 on 2025-07-02 07:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_enquiry_course_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='enquiry',
            name='batch_timing',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.batchtiming'),
        ),
    ]
