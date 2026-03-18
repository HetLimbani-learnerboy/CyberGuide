# terminal/views.py

import subprocess
from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['POST'])
def control_lab(request):
    action = request.data.get('action')

    docker_path = "/usr/local/bin/docker"  
    containers = ["attacker", "victim"]

    if action not in ["start", "stop"]:
        return Response({"error": "Invalid action"}, status=400)

    try:
        results = {}

        for container in containers:
            try:
                if action == "start":
                    result = subprocess.run(
                        [docker_path, "start", container],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                else:
                    result = subprocess.run(
                        [docker_path, "stop", container],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )

                results[container] = result.stdout.strip() or result.stderr.strip()

            except subprocess.TimeoutExpired:
                results[container] = "Timeout error"

        return Response({
            "status": "success",
            "action": action,
            "details": results
        })

    except FileNotFoundError:
        return Response({
            "error": "Docker not found. Check docker_path."
        }, status=500)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)