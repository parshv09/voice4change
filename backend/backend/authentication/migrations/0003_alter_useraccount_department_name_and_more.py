# Generated by Django 5.1.7 on 2025-03-27 06:32

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_alter_useraccount_id_proof_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccount',
            name='department_name',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AlterField(
            model_name='useraccount',
            name='id_proof_file',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, verbose_name='id_proofs'),
        ),
        migrations.AlterField(
            model_name='useraccount',
            name='id_proof_type',
            field=models.CharField(blank=True, choices=[('AADHAAR', 'Aadhaar Card'), ('VOTER_ID', 'Voter ID'), ('PAN', 'PAN Card'), ('DRIVING_LICENSE', 'Driving License'), ('PASSPORT', 'Passport'), ('RATION_CARD', 'Ration Card'), ('OTHER', 'Other')], max_length=20),
        ),
        migrations.AlterField(
            model_name='useraccount',
            name='work_location',
            field=models.CharField(blank=True, max_length=150),
        ),
    ]
