from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackUpdateSerializer
from .filters import FeedbackFilter
from django.conf import settings 
from rest_framework_simplejwt.authentication import JWTAuthentication
from authentication.utils import CookieJWTAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from googletrans import Translator
import google.generativeai as genai
import re
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from datetime import timedelta  # For time-based filtering
from difflib import SequenceMatcher  # For checking text similarity
from django.utils.timezone import now  # To get the current timestamp



# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        feedback = serializer.validated_data
        description = feedback.get("description", "")

        # Get sentiment score
        sentiment_score = self.get_sentiment_score(description)
        
         # Check if the user is sending too many feedbacks
        recent_feedbacks = Feedback.objects.filter(
            user=user,
            created_at__gte=now() - timedelta(hours=1)  # Last 1 hour
        )

        if recent_feedbacks.count() >= 5:  # More than 5 complaints in 1 hour
            raise PermissionDenied("Too many feedback submissions. Try again later.")

        # Check if the feedback is very similar to previous submissions
        for fb in recent_feedbacks:
            similarity = SequenceMatcher(None, fb.description.lower(), description.lower()).ratio()
            if similarity > 0.8:  # More than 80% similarity
                raise PermissionDenied("Duplicate or similar feedback detected!")
        
        
        print(f"User: {self.request.user}")  # Debugging
        print(f"Is Authenticated: {self.request.user.is_authenticated}")  # Debugging

        if not self.request.user or self.request.user.is_anonymous:
            raise PermissionDenied("Authentication required to submit feedback.")
        # Save feedback with sentiment score
        serializer.save(user=self.request.user, sentiment_score=sentiment_score)


    def get_sentiment_score(self, text):
        """Analyze sentiment score using the free Gemini model"""
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            model = genai.GenerativeModel("models/gemini-1.5-flash")  # FREE MODEL
            response = model.generate_content(
                f"Analyze the sentiment of this text and return only a numerical score between -1 (very negative) "
                f"and 1 (very positive), with 0 being neutral. No explanation, just the number:\n\n{text}"
            )

            # Extract response text
            response_text = response.text.strip()

            # Extract numerical score using regex
            match = re.search(r"-?\d+(\.\d+)?", response_text)
            if match:
                return float(match.group(0))  # Convert extracted number to float
            return 0.0  # Default neutral score if extraction fails

        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return 0.0  # Default score if API call fails
        
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


@method_decorator(cache_page(60 * 2), name="dispatch")  # cache for 2 minutes
class FeedbackListView(generics.ListAPIView):
    queryset = Feedback.objects.all().select_related("user")
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FeedbackFilter
    search_fields = ["keywords"]  # leverage precomputed keywords instead
    ordering_fields = ["created_at", "upvotes", "urgency"]
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        language = request.GET.get("lang", "en")

        if language != "en":  # Only translate if another language is requested
            translator = Translator()
            # Check if data is paginated (dict with "results")
            feedback_list = response.data.get("results", response.data)

            for feedback in feedback_list:
                feedback["title"] = translator.translate(
                    feedback["title"], dest=language
                ).text
                feedback["description"] = translator.translate(
                    feedback["description"], dest=language
                ).text
        else:
            return response
        return response



class FeedbackDetailView(generics.RetrieveAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        language = request.GET.get('lang', 'en')
        translator = Translator()

        response.data['title'] = translator.translate(response.data['title'], dest=language).text
        response.data['description'] = translator.translate(response.data['description'], dest=language).text

        return response
    

class FeedbackUpdateView(generics.UpdateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackUpdateSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({"message": "Feedback updated successfully", "status": response.data.get("status")})


class FeedbackDeleteView(generics.DestroyAPIView):
    queryset = Feedback.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user)


class UserFeedbackView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user  # Get logged-in user
        return Feedback.objects.filter(user=user)  # Return only the logged-in user's feedback

class AdminFeedbackView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    authentication_classes = [JWTAuthentication]  # If using Authorization header
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user  # Get logged-in user

        print(f"User Role: {user.role}")
        print(f"User Address: {user.address}")
        print(f"Feedback Locations: {Feedback.objects.values_list('location', flat=True)}")

        # Ensure the user is an admin
        if user.role == 'ADMIN':
            return Feedback.objects.filter(location__iexact=user.address).select_related('user')  # Optimize query
        else:
            return Feedback.objects.none()  # Return empty queryset if not admin

class UserFeedbackView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user  # Get logged-in user

        # if user.role == 'Authority':  # If the user is an admin
        #     return Feedback.objects.filter(location=user.address)
        
        # If not admin, return only the feedback created by the logged-in user
        return Feedback.objects.filter(user=user).select_related("user").order_by("-created_at") 
    
