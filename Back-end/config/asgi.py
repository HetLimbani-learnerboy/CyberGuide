"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""


import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import path

# 1. Set the settings module BEFORE importing consumers or routing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from terminal.consumer import TerminalConsumer

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter([
        path("ws/attacker/", TerminalConsumer.as_asgi()),
        path("ws/victim/", TerminalConsumer.as_asgi()),
    ])
})

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# application = get_asgi_application()