from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile
from allauth.account.models import EmailAddress


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(
            user=instance,
            defaults={
                "useremail": instance.email,
                "name": instance.first_name or instance.username,
                "is_verified": True
            },
        )