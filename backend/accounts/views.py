from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .permissions import IsEmployee
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import SignupSerializer

@api_view(["POST"])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsEmployee])
def employee_me(request):
    return Response({
        "id": request.user.id,
        "email": request.user.email,
        "username": request.user.username,
        "is_staff": request.user.is_staff,
    })
